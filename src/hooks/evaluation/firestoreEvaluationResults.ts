import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import {
    EvaluationAdjustment,
    EvaluationAdjustmentEntry,
    EvaluationResult,
} from './firestoreEvaluationTypes';

export const submitEvaluationRequest = async (
    assignmentId: string,
    resultData: Omit<EvaluationResult, 'id' | 'submittedAt'>
) => {
    const batch = writeBatch(db);

    const existingQuery = query(collection(db, 'evaluation_results'), where('assignmentId', '==', assignmentId));
    const existingSnapshot = await getDocs(existingQuery);
    const resultRef = existingSnapshot.empty ? doc(collection(db, 'evaluation_results')) : existingSnapshot.docs[0].ref;
    const newResult: EvaluationResult = {
        ...resultData,
        id: resultRef.id,
        assignmentId,
        submittedAt: serverTimestamp(),
    };
    if (existingSnapshot.empty) {
        batch.set(resultRef, newResult);
    } else {
        batch.set(resultRef, newResult, { merge: true });
    }

    const assignmentRef = doc(db, 'evaluation_assignments', assignmentId);
    batch.update(assignmentRef, {
        status: 'SUBMITTED',
        progress: 100,
        submittedAt: serverTimestamp(),
        resultId: resultRef.id,
    });

    await batch.commit();
    return resultRef.id;
};

export const fetchEvaluationResultRequest = async (assignmentId: string) => {
    const q = query(collection(db, 'evaluation_results'), where('assignmentId', '==', assignmentId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as EvaluationResult;
};

export const fetchResultsByCampaignAndEvaluateeRequest = async (campaignId: string, evaluateeId: string) => {
    try {
        const q = query(
            collection(db, 'evaluation_results'),
            where('campaignId', '==', campaignId),
            where('evaluateeId', '==', evaluateeId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => docSnap.data() as EvaluationResult);
    } catch (error) {
        console.error('Failed to fetch results by campaign/evaluatee:', error);
        const fallbackQuery = query(collection(db, 'evaluation_results'), where('campaignId', '==', campaignId));
        const fallbackSnapshot = await getDocs(fallbackQuery);
        return fallbackSnapshot.docs
            .map((docSnap) => docSnap.data() as EvaluationResult)
            .filter((result) => result.evaluateeId === evaluateeId);
    }
};

export const fetchResultsByCampaignRequest = async (campaignId: string) => {
    const q = query(collection(db, 'evaluation_results'), where('campaignId', '==', campaignId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as EvaluationResult);
};

export const fetchAdjustmentsByCampaignRequest = async (campaignId: string) => {
    const q = query(collection(db, 'evaluation_adjustments'), where('campaignId', '==', campaignId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as EvaluationAdjustment);
};

export const fetchAdjustmentByCampaignAndEvaluateeRequest = async (campaignId: string, evaluateeId: string) => {
    const docId = `${campaignId}_${evaluateeId}`;
    const ref = doc(db, 'evaluation_adjustments', docId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data() as EvaluationAdjustment;
};

export const upsertEvaluationAdjustmentRequest = async (
    campaignId: string,
    evaluateeId: string,
    payload: {
        managerAdjustment?: EvaluationAdjustmentEntry;
        hqAdjustment?: EvaluationAdjustmentEntry;
    }
) => {
    const docId = `${campaignId}_${evaluateeId}`;
    const ref = doc(db, 'evaluation_adjustments', docId);
    const snapshot = await getDoc(ref);
    const basePayload: EvaluationAdjustment = {
        id: docId,
        campaignId,
        evaluateeId,
        updatedAt: serverTimestamp(),
        ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() }),
        ...payload,
    };
    await setDoc(ref, basePayload, { merge: true });
    return true;
};
