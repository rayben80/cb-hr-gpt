export interface ErrorInfo {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info' | 'success';
    timestamp: number;
    details?: string | undefined;
    stack?: string | undefined;
    componentStack?: string | undefined;
    fileName?: string | undefined;
    lineNumber?: number | undefined;
    columnNumber?: number | undefined;
}

export const createErrorInfo = (
    message: string,
    type: ErrorInfo['type'],
    details?: string,
    error?: Error
): ErrorInfo => {
    const errorInfo: ErrorInfo = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: Date.now(),
        ...(details !== undefined && { details }),
    };

    if (error) {
        errorInfo.stack = error.stack;
        if (error.stack) {
            const stackLines = error.stack.split('\n');
            for (let i = 1; i < stackLines.length; i++) {
                const line = stackLines[i].trim();
                const match = line.match(/at\s+.*?\s*[(\s]*([^(]+?):(\d+):(\d+)[)]?/);
                if (match) {
                    errorInfo.fileName = match[1];
                    errorInfo.lineNumber = parseInt(match[2], 10);
                    errorInfo.columnNumber = parseInt(match[3], 10);
                    break;
                }
            }
        }
    }
    return errorInfo;
};
