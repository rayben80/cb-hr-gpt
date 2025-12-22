import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { ToastType } from '../components/Toast';

interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
  details?: string;
  stack?: string;
  componentStack?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
}

interface ErrorContextType {
  errors: ErrorInfo[];
  showError: (message: string, details?: string, error?: Error) => void;
  showWarning: (message: string, details?: string) => void;
  showInfo: (message: string, details?: string) => void;
  showSuccess: (message: string, details?: string) => void;
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
  // 토스트 전용 메서드들
  showToastError: (title: string, message?: string) => void;
  showToastSuccess: (title: string, message?: string) => void;
  showToastWarning: (title: string, message?: string) => void;
  showToastInfo: (title: string, message?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  
  const { 
    toasts, 
    showError: showToastErrorInternal, 
    showSuccess: showToastSuccessInternal, 
    showWarning: showToastWarningInternal, 
    showInfo: showToastInfoInternal 
  } = useToast();

  const createError = useCallback((message: string, type: ErrorInfo['type'], details?: string, error?: Error): ErrorInfo => {
    const errorInfo: ErrorInfo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now(),
      ...(details !== undefined && { details }),
    };

    // 에러 객체가 제공된 경우 추가 정보 추출
    if (error) {
      errorInfo.stack = error.stack;
      
      // 스택 트레이스에서 파일 정보 추출
      if (error.stack) {
        const stackLines = error.stack.split('\n');
        // 첫 번째 스택 라인은 에러 메시지이므로 두 번째 라인부터 확인
        for (let i = 1; i < stackLines.length; i++) {
          const line = stackLines[i].trim();
          // 일반적인 스택 트레이스 형식: at functionName (file:line:column)
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
  }, []);

  const dismissError = useCallback((id: string) => {
    // 해당 ID의 타이머가 있다면 정리
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const showError = useCallback((message: string, details?: string, error?: Error) => {
    const errorInfo = createError(message, 'error', details, error);
    setErrors(prev => [...prev, errorInfo]);
    
    // 에러 로깅
    console.error('Application Error:', { message, details, timestamp: errorInfo.timestamp, error });
  }, [createError]);

  const showWarning = useCallback((message: string, details?: string) => {
    const warning = createError(message, 'warning', details);
    setErrors(prev => [...prev, warning]);
    console.warn('Application Warning:', { message, details });
  }, [createError]);

  const showInfo = useCallback((message: string, details?: string) => {
    const info = createError(message, 'info', details);
    setErrors(prev => [...prev, info]);
  }, [createError]);

  const showSuccess = useCallback((message: string, details?: string) => {
    const success = createError(message, 'success', details);
    setErrors(prev => [...prev, success]);
    
    // 성공 메시지는 3초 후 자동 제거 - useCallback과 함께 안전하게 처리
    const timeoutId = setTimeout(() => {
      dismissError(success.id);
    }, 3000);
    
    timeoutRefs.current.set(success.id, timeoutId);
  }, [createError, dismissError]);

  // 토스트 전용 메서드들
  const showToastError = useCallback((title: string, message?: string) => {
    showToastErrorInternal(title, message);
    console.error('Toast Error:', { title, message });
  }, [showToastErrorInternal]);

  const showToastSuccess = useCallback((title: string, message?: string) => {
    showToastSuccessInternal(title, message);
  }, [showToastSuccessInternal]);

  const showToastWarning = useCallback((title: string, message?: string) => {
    showToastWarningInternal(title, message);
    console.warn('Toast Warning:', { title, message });
  }, [showToastWarningInternal]);

  const showToastInfo = useCallback((title: string, message?: string) => {
    showToastInfoInternal(title, message);
  }, [showToastInfoInternal]);

  const clearAllErrors = useCallback(() => {
    // 모든 타이머 정리
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    setErrors([]);
  }, []);

  // 에러가 5개 이상 쌓이면 가장 오래된 것부터 제거
  React.useEffect(() => {
    if (errors.length > 5) {
      setErrors(prev => prev.slice(-5));
    }
  }, [errors.length]);

  // Context value를 memoize하여 불필요한 리렌더링 방지
  const value: ErrorContextType = useMemo(() => ({
    errors,
    showError,
    showWarning,
    showInfo,
    showSuccess,
    dismissError,
    clearAllErrors,
    showToastError,
    showToastSuccess,
    showToastWarning,
    showToastInfo,
  }), [
    errors,
    showError,
    showWarning,
    showInfo,
    showSuccess,
    dismissError,
    clearAllErrors,
    showToastError,
    showToastSuccess,
    showToastWarning,
    showToastInfo,
  ]);

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position="top-right" />
    </ErrorContext.Provider>
  );
};