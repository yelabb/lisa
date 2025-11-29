'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LisaCompanion } from '@/components/lisa';
import { RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">😢</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Don't worry, even the best readers make mistakes sometimes!
              </p>
            </div>

            <LisaCompanion
              mood="sad"
              message="I'm sorry! Something unexpected happened. Let's try again together!"
              size="lg"
            />

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-mono text-red-800">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                className="flex-1"
                onClick={this.handleGoHome}
              >
                <Home className="mr-2" size={16} />
                Go Home
              </Button>
              <Button
                className="flex-1"
                onClick={this.handleReset}
              >
                <RefreshCw className="mr-2" size={16} />
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
