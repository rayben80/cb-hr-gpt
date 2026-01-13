import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

// 1. Initialize Firebase Admin
// We expect the service account JSON to be in the FIREBASE_SERVICE_ACCOUNT env var
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null;

if (!serviceAccount) {
    console.error('Error: FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
    process.exit(1);
}

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

// Helper to determine next campaign dates
const calculateCampaignPeriod = (today, durationDays) => {
    // today is 00:00:00 KST (from the runner's perspective or logic)
    // The GitHub Runner is UTC. We need to be careful.
    // However, the user request says "Every midnight KST".
    // 15:00 UTC = 00:00 KST (next day).
    // So if this runs at 15:00 UTC on Jan 1st, it is Jan 2nd 00:00 KST.
    // We should probably explicitly use KST time.

    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(today.getTime() + kstOffset);

    const startDate = new Date(kstDate);
    const endDate = new Date(kstDate);
    endDate.setDate(endDate.getDate() + (durationDays - 1));

    // Format YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
        // We use the formatted string for the DB
        startDateStr: formatDate(startDate),
        endDateStr: formatDate(endDate),
        currentDay: startDate.getDate(), // KST Day
        currentMonth: startDate.getMonth() + 1, // KST Month
        currentYear: startDate.getFullYear(), // KST Year
    };
};

async function runScheduler() {
    console.log('Starting Recurring Campaign Scheduler...');

    // Check Date
    const now = new Date();
    // Assuming the action triggers at 15:00 UTC (00:00 KST)
    const { startDateStr, endDateStr, currentDay, currentMonth, currentYear } = calculateCampaignPeriod(now, 14);

    console.log(`Target Date (KST): ${startDateStr} (Day: ${currentDay})`);

    try {
        // 2. Query Recurring Campaigns
        const campaignsRef = db.collection('evaluation_campaigns');
        const snapshot = await campaignsRef
            .where('period.isRecurring', '==', true)
            // Note: If 'period' is a map, we can query nested fields if indexed.
            // If not indexed, we might need to fetch more and filter.
            // Let's assume user structure: period: { isRecurring: true, recurringStartDay: 1 }
            .get();

        const recurringCampaigns = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Check status and start day
            // We loosely match recurringStartDay.
            if (data.status === 'ACTIVE' && data.period?.recurringStartDay == currentDay) {
                recurringCampaigns.push({ id: doc.id, ...data });
            }
        });

        console.log(`Found ${recurringCampaigns.length} active recurring campaigns for day ${currentDay}.`);

        const createdCampaigns = [];

        // 3. Process each matching campaign
        for (const parentCampaign of recurringCampaigns) {
            console.log(`Processing campaign: ${parentCampaign.title}`);

            const duration = parentCampaign.period?.recurringDurationDays || 14;
            // Recalculate end date based on specific campaign duration
            const specificPeriod = calculateCampaignPeriod(now, duration);

            const newTitle = `${parentCampaign.title} (${currentYear}-${String(currentMonth).padStart(2, '0')})`;

            // Copy Campaign Data
            const newCampaignData = {
                ...parentCampaign,
                title: newTitle,
                startDate: specificPeriod.startDateStr,
                endDate: specificPeriod.endDateStr,
                status: 'ACTIVE',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                id: undefined,
            };
            delete newCampaignData.id;

            // Create New Campaign
            const newCampaignRef = db.collection('evaluation_campaigns').doc();
            await newCampaignRef.set(newCampaignData);
            console.log(` - Created new campaign: ${newTitle} (${newCampaignRef.id})`);

            // Copy Assignments
            const assignmentsSnap = await db
                .collection('evaluation_assignments')
                .where('campaignId', '==', parentCampaign.id)
                .get();

            if (!assignmentsSnap.empty) {
                const batch = db.batch();
                let opCount = 0;

                assignmentsSnap.forEach((assignDoc) => {
                    const assignData = assignDoc.data();
                    const newAssignRef = db.collection('evaluation_assignments').doc();
                    batch.set(newAssignRef, {
                        ...assignData,
                        id: newAssignRef.id,
                        campaignId: newCampaignRef.id,
                        campaignTitle: newTitle,
                        dueDate: specificPeriod.endDateStr,
                        status: 'PENDING',
                        progress: 0,
                        createdAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                        reviewRequestedAt: null,
                        reviewRequestedBy: null,
                        resubmissionRequestedAt: null,
                        resubmissionRequestedBy: null,
                    });
                    opCount++;
                });

                await batch.commit();
                console.log(` - Copied ${opCount} assignments.`);
            }
        }

        console.log('Scheduler completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Scheduler Error:', error);
        process.exit(1);
    }
}

runScheduler();
