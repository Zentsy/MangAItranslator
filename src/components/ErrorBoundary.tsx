import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-6 rounded-[2.5rem] border border-rose-500/20 bg-rose-500/5 p-12 text-center backdrop-blur-md">
          <div className="rounded-full bg-rose-500/10 p-4 text-rose-500 shadow-lg shadow-rose-500/10">
            <AlertCircle size={48} />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-rose-400">
              Ops! Algo quebrou no Editor.
            </h2>
            <p className="text-sm leading-relaxed text-app-text-secondary/70">
              Ocorreu um erro inesperado na interface. Você pode tentar recarregar esta parte do app ou voltar ao dashboard.
            </p>
            {this.state.error && (
              <pre className="mt-4 overflow-hidden text-ellipsis rounded-lg bg-black/40 p-3 text-left font-mono text-[10px] text-rose-300/60">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
            >
              <RefreshCcw size={16} className="mr-2" /> Tentar novamente
            </Button>
            <Button
               onClick={() => window.location.reload()}
               className="bg-app-text-primary text-app-bg"
            >
              Recarregar App
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
