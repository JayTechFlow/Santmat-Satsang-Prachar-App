import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error Boundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/admin';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-6 font-['Mukta'] select-none">
          <div className="bg-stone-800/90 border border-stone-700/80 rounded-xl p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 bg-red-950/60 border border-red-800/50 rounded-lg flex items-center justify-center mx-auto text-red-400 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">त्रुटि उत्पन्न हुई (Application Error)</h2>
              <p className="text-xs text-stone-300 font-semibold leading-relaxed">
                एप्लिकेशन निष्पादित करते समय अप्रत्याशित त्रुटि आई है। ऐप पुनः लोड करने का प्रयास करें।
              </p>
              {this.state.error?.message && (
                <p className="p-3 bg-black/40 rounded-xl text-[0.7rem] font-mono text-amber-300/90 text-left overflow-x-auto border border-stone-700/50">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 font-bold text-xs pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-md transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>पुनः लोड करें</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>डैशबोर्ड जाएं</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
