import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
          <AlertTriangle className="w-12 h-12 text-error mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-neutral-400 text-center mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.handleReset}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;