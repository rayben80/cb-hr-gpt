import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Icon } from '../components/common';
import { ICONS } from '../constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Icon path={ICONS.xCircle} className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">오류가 발생했습니다</h1>
                <p className="text-slate-600 text-sm">예상치 못한 오류로 인해 페이지를 표시할 수 없습니다.</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-slate-800 mb-2">오류 정보</h3>
              <p className="text-sm text-slate-600 mb-2">
                <strong>메시지:</strong> {this.state.error?.message || '알 수 없는 오류'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="text-xs text-slate-500">
                  <summary className="cursor-pointer hover:text-slate-700">스택 트레이스 보기</summary>
                  <pre className="mt-2 whitespace-pre-wrap bg-slate-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                페이지 새로고침
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Icon path={ICONS.checkCircle} className="w-4 h-4 inline mr-1" />
                문제가 지속되면 관리자에게 문의하세요.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook을 사용한 간단한 에러 바운더리
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;