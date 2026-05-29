import React from 'react';
import { brand } from '../constants/brand';
import { colors } from '../constants/theme';

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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.cream, padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.1)', padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.primary, marginBottom: 16 }}>Something went wrong.</h1>
            <p style={{ fontSize: 16, color: colors.slate500, marginBottom: 28, lineHeight: 1.6 }}>We hit an unexpected error. Reloading the page usually fixes it.</p>
            <button onClick={() => window.location.reload()} style={{ background: colors.accent, color: '#fff', border: 'none', padding: '12px 32px', fontSize: 16, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Reload page</button>
            <p style={{ fontSize: 13, color: colors.slate500, marginTop: 28 }}>{brand.name}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
