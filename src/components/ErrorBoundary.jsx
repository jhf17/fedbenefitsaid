import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.1)', padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Something went wrong</h1>
            <p style={{ fontSize: 16, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>We encountered an unexpected error. Please try reloading the page.</p>
            <button onClick={() => window.location.reload()} style={{ background: '#7b1c2e', color: '#fff', border: 'none', padding: '12px 32px', fontSize: 16, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Reload Page</button>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 28 }}>FedBenefitsAid</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
