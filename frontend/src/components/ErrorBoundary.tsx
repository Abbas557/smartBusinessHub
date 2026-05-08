import React, { Component, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary
 * Catches unhandled JavaScript errors in the component tree below it.
 * Prevents a blank white screen by showing a recovery UI instead.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/marketplace';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
          <div className="w-full max-w-md rounded-lg border border-brand-100 bg-white p-8 text-center shadow-soft">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="mt-5 text-xl font-semibold text-brand-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm leading-6 text-brand-800/60">
              An unexpected error occurred while loading this page. You can try
              refreshing or go back to the marketplace.
            </p>
            {this.state.error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleRetry}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-4 py-2.5 text-sm font-medium text-brand-800 shadow-sm transition hover:bg-brand-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Try again
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
              >
                <Home className="h-4 w-4" />
                Marketplace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
