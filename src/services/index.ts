// Service Layer Exports

// Dashboard Service - stats, charts, performance calculations
export {
    calculateCapabilityRadar,
    calculateDashboardStats,
    calculateGradeDistribution,
    calculateTeamPerformance,
    calculateTopPerformers,
} from './dashboardService';

// Insights Service - rule-based insights generation
export {
    analyzeCapabilityChanges,
    analyzeGradeDistribution,
    analyzeProgressRate,
    generateInsights,
    identifyPerformers,
    type InsightResult,
    type PerformanceData,
    type ScoringType,
} from './insightsService';

// Notification Service - webhooks and alerts
export {
    getNotificationLogs,
    getWebhookUrl,
    isWebhookUrlManagedByEnv,
    saveWebhookUrl,
    scheduleAutoReminder,
    sendDeadlineWarning,
    sendEvaluationCompletion,
    sendEvaluationReminder,
    sendGoogleChatNotification,
    sendTestNotification,
    type NotificationLog,
    type NotificationPayload,
    type NotificationType,
} from './notificationService';

// PDF Export Service
export { exportDashboardToPDF, exportEvaluationResultToPDF } from './pdfExportService';
