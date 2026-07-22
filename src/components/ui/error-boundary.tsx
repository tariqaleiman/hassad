"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./button";

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

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-border/50 bg-paper-sunken p-8 text-center animate-in fade-in zoom-in-95">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger-bg text-danger shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold text-ink">
            عذراً، حدث خطأ غير متوقع!
          </h2>
          <p className="mb-8 max-w-md text-sm text-ink-muted">
            {this.state.error?.message || "حدثت مشكلة أثناء محاولة عرض هذه الصفحة. الرجاء المحاولة مرة أخرى."}
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="gap-2 rounded-full px-6 shadow-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              إعادة تحميل الصفحة
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.href = "/dashboard";
              }}
              className="rounded-full px-6 shadow-sm"
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
