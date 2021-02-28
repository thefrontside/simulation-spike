import { Component, ErrorInfo } from 'react';

type Props = Record<string, unknown>;

export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: true } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.dir(error);
    console.dir(errorInfo);
  }

  render(): JSX.Element {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return <>{this.props.children}</>;
  }
}
