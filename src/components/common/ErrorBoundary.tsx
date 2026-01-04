import { Button } from '@/components/ui/button';
import { WarningCircle } from '@phosphor-icons/react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl shadow-sm border border-border text-center">
                    <div className="p-3 rounded-full bg-destructive/10 mb-4">
                        <WarningCircle className="w-8 h-8 text-destructive" weight="fill" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">오류가 발생했습니다</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        {this.state.error?.message || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
                    </p>
                    <Button onClick={this.handleRetry} variant="outline" className="rounded-xl">
                        다시 시도
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
