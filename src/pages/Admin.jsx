import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'jhf17@icloud.com';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('leads');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [addingNote, setAddingNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [tokenReady, setTokenReady] = useState(false);
  const [tokenError, setTokenError] = useState(null);

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check token readiness before fetching
  useEffect(() => {
    const checkTokenReady = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          setTokenReady(true);
          setTokenError(null);
        } else {
          setTokenError('No authentication token available');
        }
      } catch (err) {
        console.error('Token check error:', err);
        setTokenError('Failed to load authentication token');
      }
    };

    if (user?.email === ADMIN_EMAIL) {
      checkTokenReady();
    }
  }, [user]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setError('Authentication token is not available. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/.netlify/functions/get-leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setCampaigns(data.campaigns || []);
      setConsultations(data.consultations || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load leads. Please ensure you are properly authenticated.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL && tokenReady) {
      fetchData();
    } else if (user?.email === ADMIN_EMAIL && tokenError) {
      setLoading(false);
    }
  }, [user, tokenReady, tokenError]);

  // Handle Escape key to close detail panel
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && selectedLead) {
        setSelectedLead(null);
      }
    };

    if (selectedLead) {
      window.addEventListener('keydown', handleEscapeKey);
      return () => window.removeEventListener('keydown', handleEscapeKey);
    }
  }, [selectedLead]);

  // Filter leads based on source and status
  const getFilteredLeads = () => {
    let filtered = leads;

    if (sourceFilter === 'signups') {
      filtered = filtered.filter(l => l.fields?.['Source'] === 'Website Signup');
    } else if (sourceFilter === 'assessment') {
      filtered = filtered.filter(l => ['Retirement Checklist', 'Assessment'].includes(l.fields?.['Source']));
    } else if (sourceFilter === 'calculator') {
      filtered = filtered.filter(l => l.fields?.['Source'] === 'Calculator');
    } else if (sourceFilter === 'consultations') {
      filtered = filtered.filter(l => l.fields?.['Source'] === 'Calendly Booking');
    } else if (sourceFilter === 'apollo') {
      filtered = filtered.filter(l => l.fields?.['Source'] === 'Apollo Outbound');
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => l.fields?.['Status'] === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(l => {
        const name = (l.fields?.['Name'] || '').toLowerCase();
        const email = (l.fields?.['Email'] || '').toLowerCase();
        const agency = (l.fields?.['Federal Agency'] || '').toLowerCase();
        return name.includes(term) || email.includes(term) || agency.includes(term);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const fa = a.fields || {};
      const fb = b.fields || {};
      if (sortBy === 'newest') {
        return new Date(fb['Signed Up'] || 0) - new Date(fa['Signed Up'] || 0);
      } else if (sortBy === 'oldest') {
        return new Date(fa['Signed Up'] || 0) - new Date(fb['Signed Up'] || 0);
      } else if (sortBy === 'name') {
        return (fa.Name || '').localeCompare(fb.Name || '');
      } else if (sortBy === 'status') {
        const order = { 'New': 0, 'Contacted': 1, 'Consultation Booked': 2, 'Added to CRM': 3, 'Not Interested': 4 };
        return (order[fa.Status] ?? 99) - (order[fb.Status] ?? 99);
      } else if (sortBy === 'score') {
        return (fb['Assessment Score'] || 0) - (fa['Assessment Score'] || 0);
      }
      return 0;
    });

    return filtered;
  };

  // Get stat values
  const getStats = () => {
    const total = leads.length;
    const accountSignups = leads.filter(l => l.fields?.['Source'] === 'Website Signup').length;
    const assessmentLeads = leads.filter(l => ['Retirement Checklist', 'Assessment'].includes(l.fields?.['Source'])).length;
    const calculatorLeads = leads.filter(l => l.fields?.['Source'] === 'Calculator').length;
    const consultationBooked = leads.filter(l => l.fields?.['Consultation Booked']).length;
    const apolloLeads = leads.filter(l => l.fields?.['Source'] === 'Apollo Outbound').length;
    return { total, accountSignups, assessmentLeads, calculatorLeads, consultationBooked, apolloLeads };
  };

  // Update lead field
  const updateLeadField = async (leadId, fieldName, value) => {
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/.netlify/functions/update-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          id: leadId,
          fields: { [fieldName]: value }
        })
      });

      if (!response.ok) throw new Error('Failed to update');

      // Update local state
      const updatedLeads = leads.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            fields: { ...l.fields, [fieldName]: value }
          };
        }
        return l;
      });
      setLeads(updatedLeads);

      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({
          ...selectedLead,
          fields: { ...selectedLead.fields, [fieldName]: value }
        });
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  // Save edit
  const saveEdit = async (fieldName) => {
    await updateLeadField(selectedLead.id, fieldName, editValue);
    setEditingField(null);
    setEditValue('');
  };

  // Add note
  const addNote = async () => {
    if (!addingNote.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const existingNotes = selectedLead.fields?.['Notes'] || '';
    const newNotes = `[${today}] ${addingNote.trim()}\n${existingNotes}`;

    await updateLeadField(selectedLead.id, 'Notes', newNotes);
    setAddingNote('');
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get source badge styles
  const getSourceBadgeStyle = (source) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      whiteSpace: 'nowrap'
    };

    if (source === 'Website Signup') {
      return { ...baseStyle, backgroundColor: '#dbeafe', color: '#0c4a6e' };
    } else if (source === 'Retirement Checklist') {
      return { ...baseStyle, backgroundColor: '#ccfbf1', color: '#134e4a' };
    } else if (source === 'Calendly Booking') {
      return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
    } else if (source === 'Apollo Outbound') {
      return { ...baseStyle, backgroundColor: '#fed7aa', color: '#92400e' };
    }
    return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
  };

  // Get status badge styles
  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      whiteSpace: 'nowrap'
    };

    if (status === 'New') {
      return { ...baseStyle, backgroundColor: '#dbeafe', color: '#0c4a6e' };
    } else if (status === 'Contacted') {
      return { ...baseStyle, backgroundColor: '#cffafe', color: '#06414f' };
    } else if (status === 'Consultation Booked') {
      return { ...baseStyle, backgroundColor: '#fed7aa', color: '#92400e' };
    } else if (status === 'Added to CRM') {
      return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
    } else if (status === 'Not Interested') {
      return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
    return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
  };

  // Get activity pill styles
  const getActivityPillStyle = (activity) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '3px 6px',
      borderRadius: '3px',
      fontSize: '11px',
      fontWeight: '500',
      marginRight: '4px',
      marginBottom: '4px',
      whiteSpace: 'nowrap'
    };

    if (activity === 'Account Created') {
      return { ...baseStyle, backgroundColor: '#dbeafe', color: '#0c4a6e' };
    } else if (activity === 'Assessment Completed') {
      return { ...baseStyle, backgroundColor: '#ccfbf1', color: '#134e4a' };
    } else if (activity === 'Consultation Booked') {
      return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
    } else if (activity === 'AI Chat Used') {
      return { ...baseStyle, backgroundColor: '#e9d5ff', color: '#6b21a8' };
    }
    return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
  };

  const stats = getStats();
  const filteredLeads = getFilteredLeads();

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
          padding: isMobile ? '16px' : '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '12px' : '0'
        }}
      >
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: isMobile ? '20px' : '28px', fontWeight: '700', flex: isMobile ? '1 1 100%' : 'auto' }}>
          Lead Command Center
        </h1>
        <button
          onClick={() => {
            fetchData();
          }}
          style={{
            backgroundColor: '#7b1c2e',
            color: '#ffffff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#5f1622')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#7b1c2e')}
        >
          Refresh
        </button>
      </div>

      {/* Main Content */}
      <div style={{ padding: isMobile ? '16px' : '32px' }}>
        {activeTab === 'leads' ? (
          <>
            {/* Stat Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '140px' : '200px'}, 1fr))`,
                gap: '16px',
                marginBottom: isMobile ? '16px' : '32px',
                padding: isMobile ? '0 8px' : '0'
              }}
            >
              {[
                { label: 'Total Leads', value: stats.total, color: '#0f172a' },
                { label: 'Account Signups', value: stats.accountSignups, color: '#1e3a5f' },
                { label: 'Assessment Leads', value: stats.assessmentLeads, color: '#1e3a5f' },
                { label: 'Calculator Leads', value: stats.calculatorLeads, color: '#7b1c2e' },
                { label: 'Consultations Booked', value: stats.consultationBooked, color: '#1e3a5f' },
                { label: 'Apollo Outbound', value: stats.apolloLeads, color: '#1e3a5f' }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: isMobile ? '14px' : '20px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <p style={{ color: '#6b7280', margin: '0 0 8px 0', fontSize: isMobile ? '11px' : '13px', fontWeight: '500' }}>
                    {stat.label}
                  </p>
                  <p style={{ color: stat.color, margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: '700' }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Source Tabs */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '0' }} role="tablist">
              {[
                { label: 'All', value: 'all' },
                { label: 'Account Signups', value: 'signups' },
                { label: 'Assessment', value: 'assessment' },
                { label: 'Calculator', value: 'calculator' },
                { label: 'Consultations', value: 'consultations' },
                { label: 'Apollo Outbound', value: 'apollo' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={sourceFilter === tab.value}
                  onClick={() => setSourceFilter(tab.value)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: sourceFilter === tab.value ? '#7b1c2e' : '#6b7280',
                    borderBottom: sourceFilter === tab.value ? '2px solid #7b1c2e' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (sourceFilter !== tab.value) e.target.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    if (sourceFilter !== tab.value) e.target.style.color = '#6b7280';
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Pipeline Stage Pills */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'New', 'Contacted', 'Consultation Booked', 'Added to CRM'].map((stage) => {
                const value = stage === 'All' ? 'all' : stage;
                return (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: statusFilter === value ? `2px solid #7b1c2e` : '2px solid #d1d5db',
                      backgroundColor: statusFilter === value ? '#fef2f2' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: statusFilter === value ? '#7b1c2e' : '#6b7280',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#7b1c2e';
                      e.target.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      if (statusFilter !== value) {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>

            {/* Search + Sort */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by name, email, or federal agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search leads by name, email, or agency"
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort leads"
                style={{
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  backgroundColor: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                  minWidth: '160px'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A–Z</option>
                <option value="status">Pipeline Stage</option>
                <option value="score">Assessment Score</option>
              </select>
            </div>

            {/* Leads Table */}
            {loading || tokenError ? (
              <div style={{ textAlign: 'center', padding: '40px', color: tokenError ? '#ef4444' : '#6b7280' }}>
                {tokenError ? tokenError : 'Loading leads...'}
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                {error}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: isMobile ? '12px' : '14px',
                      minWidth: isMobile ? '800px' : 'auto'
                    }}
                  >
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                        Name
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                        Email
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                        Phone
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                        Source
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                        Activities
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                        Status
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        tabIndex={0}
                        role="button"
                        onClick={() => setSelectedLead(lead)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedLead(lead);
                          }
                        }}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                      >
                        <td style={{ padding: '12px 16px', color: '#111827' }}>
                          {lead.fields?.['Name'] || '-'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                          {lead.fields?.['Email'] || '-'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                          {lead.fields?.['Phone'] || '-'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={getSourceBadgeStyle(lead.fields?.['Source'])}>
                            {lead.fields?.['Source'] || '-'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {lead.fields?.['Activities'] && Array.isArray(lead.fields['Activities']) ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                              {lead.fields['Activities'].map((activity, idx) => (
                                <div key={idx} style={getActivityPillStyle(activity)}>
                                  {activity}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={getStatusBadgeStyle(lead.fields?.['Status'])}>
                            {lead.fields?.['Status'] || '-'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                          {formatDate(lead.fields?.['Signed Up'])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                {filteredLeads.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No leads found
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Campaigns Tab */
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              color: '#6b7280'
            }}
          >
            <h2 style={{ color: '#374151', marginBottom: '16px' }}>Campaigns</h2>
            <p>Campaigns data: {campaigns.length} campaigns</p>
          </div>
        )}
      </div>

      {/* Detail Panel Overlay */}
      {selectedLead && (
        <div
          onClick={() => setSelectedLead(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 999
          }}
        />
      )}

      {/* Detail Panel */}
      {selectedLead && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: isMobile ? '100%' : '400px',
            backgroundColor: '#ffffff',
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              padding: isMobile ? '16px' : '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2 style={{ margin: 0, color: '#111827', fontSize: isMobile ? '18px' : '20px', fontWeight: '700' }}>
              {selectedLead.fields?.['Name'] || 'Lead Details'}
            </h2>
            <button
              onClick={() => setSelectedLead(null)}
              aria-label="Close lead details"
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '24px',
                color: '#6b7280',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => (e.target.style.color = '#111827')}
              onMouseLeave={(e) => (e.target.style.color = '#6b7280')}
            >
              ×
            </button>
          </div>

          {/* Panel Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>
            {/* Contact Info Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                Contact Information
              </h3>
              {['Name', 'Email', 'Phone', 'Federal Agency'].map((field) => (
                <div key={field} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                    {field}
                  </label>
                  {editingField === field ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'inherit'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(field)}
                        disabled={isSaving}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#111827', fontSize: '14px' }}>
                        {selectedLead.fields?.[field] || '-'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingField(field);
                          setEditValue(selectedLead.fields?.[field] || '');
                        }}
                        aria-label={`Edit ${field.toLowerCase()}`}
                        style={{
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          color: '#9ca3af',
                          padding: '4px'
                        }}
                        onMouseEnter={(e) => (e.target.style.color = '#6b7280')}
                        onMouseLeave={(e) => (e.target.style.color = '#9ca3af')}
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19H4v-3L16.5 3.5z"></path></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Status & Source Row */}
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                  Source
                </label>
                <div style={getSourceBadgeStyle(selectedLead.fields?.['Source'])}>
                  {selectedLead.fields?.['Source'] || '-'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  value={selectedLead.fields?.['Status'] || 'New'}
                  onChange={(e) => updateLeadField(selectedLead.id, 'Status', e.target.value)}
                  disabled={isSaving}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Consultation Booked</option>
                  <option>Added to CRM</option>
                  <option>Not Interested</option>
                </select>
              </div>
            </div>

            {/* Activities Section */}
            {selectedLead.fields?.['Activities'] && Array.isArray(selectedLead.fields['Activities']) && selectedLead.fields['Activities'].length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                  Activities
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedLead.fields['Activities'].map((activity, idx) => (
                    <div key={idx} style={getActivityPillStyle(activity)}>
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment Score */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                Assessment Score
              </h3>
              {selectedLead.fields?.['Assessment Score'] ? (
                <div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Score</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                      {selectedLead.fields['Assessment Score']}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={selectedLead.fields['Assessment Score']}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="Assessment score"
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${selectedLead.fields['Assessment Score']}%`,
                        height: '100%',
                        backgroundColor: '#7b1c2e',
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>No assessment taken</p>
              )}
            </div>

            {/* Key Dates */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                Key Dates
              </h3>
              {['Signed Up', 'Last Contacted', 'Follow Up Date'].map((field) => (
                <div key={field} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                    {field}
                  </label>
                  {editingField === field ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="date"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'inherit'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(field)}
                        disabled={isSaving}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#111827', fontSize: '14px' }}>
                        {formatDate(selectedLead.fields?.[field]) || '-'}
                      </span>
                      {(field === 'Last Contacted' || field === 'Follow Up Date') && (
                        <button
                          onClick={() => {
                            setEditingField(field);
                            setEditValue(selectedLead.fields?.[field] || '');
                          }}
                          aria-label={`Edit ${field.toLowerCase()}`}
                          style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: '#9ca3af',
                            padding: '4px'
                          }}
                          onMouseEnter={(e) => (e.target.style.color = '#6b7280')}
                          onMouseLeave={(e) => (e.target.style.color = '#9ca3af')}
                        >
                          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19H4v-3L16.5 3.5z"></path></svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Notes Section */}
            <div>
              <h3 style={{ color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                Notes
              </h3>
              {selectedLead.fields?.['Notes'] && (
                <textarea
                  value={selectedLead.fields['Notes']}
                  readOnly
                  aria-label="Lead notes"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    height: '120px',
                    resize: 'none',
                    marginBottom: '12px',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    boxSizing: 'border-box'
                  }}
                />
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={addingNote}
                  onChange={(e) => setAddingNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addNote();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={addNote}
                  disabled={isSaving || !addingNote.trim()}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#7b1c2e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    opacity: !addingNote.trim() ? 0.5 : 1
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
