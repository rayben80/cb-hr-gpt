import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { resolveReportingCategory } from '../../utils/reportingCategoryUtils';
import { EvaluationAssignment, EvaluationCampaign } from './firestoreEvaluationTypes';

const isE2EMock = import.meta.env.VITE_E2E_MOCK_DATA === 'true';

export const createCampaignRequest = async (
    campaignData: Omit<EvaluationCampaign, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalTargets'>,
    assignments: Omit<EvaluationAssignment, 'id' | 'campaignId' | 'status' | 'progress'>[]
) => {
    if (isE2EMock) return 'mock-campaign-id';
    const batch = writeBatch(db);
    const campaignRef = doc(collection(db, 'evaluation_campaigns'));
    const campaignId = campaignRef.id;

    const newCampaign: EvaluationCampaign = {
        ...campaignData,
        id: campaignId,
        status: 'ACTIVE',
        totalTargets: assignments.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    batch.set(campaignRef, newCampaign);

    const batchLimit = 450;
    const chunks = [];
    for (let i = 0; i < assignments.length; i += batchLimit) {
        chunks.push(assignments.slice(i, i + batchLimit));
    }

    const firstChunk = chunks[0] || [];
    firstChunk.forEach((assignment) => {
        const assignmentRef = doc(collection(db, 'evaluation_assignments'));
        batch.set(assignmentRef, {
            ...assignment,
            id: assignmentRef.id,
            campaignId: campaignId,
            status: 'PENDING',
            progress: 0,
        });
    });
    await batch.commit();

    for (let i = 1; i < chunks.length; i++) {
        const chunkBatch = writeBatch(db);
        chunks[i].forEach((assignment) => {
            const assignmentRef = doc(collection(db, 'evaluation_assignments'));
            chunkBatch.set(assignmentRef, {
                ...assignment,
                id: assignmentRef.id,
                campaignId: campaignId,
                status: 'PENDING',
                progress: 0,
            });
        });
        await chunkBatch.commit();
    }

    return campaignId;
};

export const fetchAllCampaignsRequest = async () => {
    if (isE2EMock) return [];
    const q = query(collection(db, 'evaluation_campaigns'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const campaigns = snapshot.docs.map((docSnap) => docSnap.data() as EvaluationCampaign);
    const normalizedCampaigns = campaigns.map((campaign) => {
        const resolvedCategory = resolveReportingCategory(
            {
                reportingCategory: campaign.reportingCategory,
                templateCategory: campaign.templateSnapshot?.category,
                templateType: campaign.templateSnapshot?.type,
                type: campaign.type,
                title: campaign.title,
            },
            { fallback: '기타' }
        );
        if (campaign.reportingCategory === resolvedCategory) return campaign;
        return { ...campaign, reportingCategory: resolvedCategory };
    });

    const pendingUpdates = normalizedCampaigns.filter(
        (campaign, index) => campaign.reportingCategory !== campaigns[index]?.reportingCategory
    );
    if (pendingUpdates.length > 0) {
        const batch = writeBatch(db);
        pendingUpdates.forEach((campaign) => {
            const campaignRef = doc(db, 'evaluation_campaigns', campaign.id);
            batch.update(campaignRef, {
                reportingCategory: campaign.reportingCategory,
                updatedAt: serverTimestamp(),
            });
        });
        await batch.commit();
    }

    return normalizedCampaigns;
};

export const fetchMyAssignmentsRequest = async (userId: string) => {
    if (isE2EMock) return [];
    if (!userId) return [];
    const q = query(collection(db, 'evaluation_assignments'), where('evaluatorId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as EvaluationAssignment);
};

export const fetchCampaignStatisticsRequest = async (campaignId: string) => {
    if (isE2EMock) return { total: 0, submitted: 0, progress: 0 };
    const q = query(collection(db, 'evaluation_assignments'), where('campaignId', '==', campaignId));
    const snapshot = await getDocs(q);
    const total = snapshot.size;
    const submitted = snapshot.docs.filter((docSnap) => docSnap.data().status === 'SUBMITTED').length;

    return {
        total,
        submitted,
        progress: total === 0 ? 0 : Math.round((submitted / total) * 100),
    };
};

export const fetchCampaignAssignmentsRequest = async (campaignId: string) => {
    if (isE2EMock) return [];
    const q = query(collection(db, 'evaluation_assignments'), where('campaignId', '==', campaignId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as EvaluationAssignment);
};

export const fetchAssignmentByIdRequest = async (assignmentId: string) => {
    if (isE2EMock) return null;
    const ref = doc(db, 'evaluation_assignments', assignmentId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data() as EvaluationAssignment;
};

export const fetchCampaignByIdRequest = async (campaignId: string) => {
    if (isE2EMock) return null;
    const ref = doc(db, 'evaluation_campaigns', campaignId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data() as EvaluationCampaign;
};

export const updateAssignmentStatusRequest = async (
    assignmentId: string,
    status: EvaluationAssignment['status'],
    progress?: number,
    metadata?: Record<string, unknown>
) => {
    if (isE2EMock) return true;
    const ref = doc(db, 'evaluation_assignments', assignmentId);
    const payload: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp(),
    };
    if (typeof progress === 'number') {
        payload.progress = progress;
    }
    if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
            if (value !== undefined) {
                payload[key] = value;
            }
        });
    }
    await updateDoc(ref, payload);
    return true;
};
