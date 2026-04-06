import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const ADMIN_EMAIL = 'jhf17@icloud.com'

const statusColors = {
  'New': { bg: '#e0f2fe', text: '#0369a1' },
  'Contacted': { bg: '#fef3c7', text: '#92400e' },
  'Qualified': { bg: '#d1fae5', text: '#065f46' },
  'Booked': { bg: '#ede9fe', text: '#5b21b6' },
  'Closed': { bg: '#dcfce7', text: '#15803d' },
  'Not Interested': { bg: '#fee2e2', text: '#991b1b' },
}

function StatusBadge({ status }) {
  const colors = statusColors[status] || { bg: '#f1f5f9', text: '#475569' }
  return (
    <span style={{
      background: colors.bg, color: colors.text,
      padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600
    }}>
      {status || 'New'}
    </span>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', flex: 1, minWidth: 160
    }}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: color || '#0f172a' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('leads')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/.netlify/functions/get-leads')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.email !== ADMIN_EMAIL) return null

  const leads = data?.leads || []
  const campaigns = data?.campaigns || []
  const consultations = data?.consultations || []

  const totalLeads = leads.length
  const newLeads = leads.filter(l => (l.fields.Status || 'New') === 'New').length
  const bookedLeads = leads.filter(l => l.fields.Status === 'Booked').length
  const websiteLeads = leads.filter(l => l.fields.Source === 'Website Signup').length
  const outboundLeads = leads.filter(l => l.fields.Source === 'Apollo Outbound').length

  const statuses = ['All', ...Object.keys(statusColors)]
  const filteredLeads = leads.filter(l => {
    const fields = l.fields
    const matchesSearch = !search ||
      (fields.Name || '').toLowerCase().includes(search.toLowerCase()) ||
      (fields.Email || '').toLowerCase().includes(search.toLowerCase()) ||
      (fields['Federal Agency'] || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || (fields.Status || 'New') === statusFilter
    return matchesSearch && matchesStatus
  })

  const navy = '#0f172a'
  const maroon = '#7b1c2e'

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(160deg, ${navy} 0%, #1e3a5f 100%)`, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>FedBenefitsAid</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>Lead Command Center</div>
        </div>
        <button
          onClick={fetchData}
          style={{ background: maroon, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', color: '#991b1b', marginBottom: 20 }}>
            Error loading data: {error}
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="Total Leads" value={totalLeads} sub="All time" color={navy} />
          <StatCard label="New Leads" value={newLeads} sub="Awaiting contact" color={maroon} />
          <StatCard label="Consultations Booked" value={bookedLeads} sub="Ready to close" color="#065f46" />
          <StatCard label="Website Signups" value={websiteLeads} sub="Inbound" color="#1d4ed8" />
          <StatCard label="Outbound (Apollo)" value={outboundLeads} sub="Prospected" color="#92400e" />
        </div>

        {/* Tab Nav */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 0 }}>
          {['leads', 'campaigns'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                color: activeTab === tab ? maroon : '#64748b',
                borderBottom: activeTab === tab ? `2px solid ${maroon}` : '2px solid transparent',
                marginBottom: -1
              }}
            >
              {tab === 'leads' ? `Leads (${totalLeads})` : `Campaigns (${campaigns.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'leads' && (
          <div>
            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                placeholder="Search name, email, agency..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 200, border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', fontSize: 14, outline: 'none' }}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', fontSize: 14, outline: 'none', background: '#fff' }}
              >
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Leads Table */}
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading leads...</div>
              ) : filteredLeads.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No leads found</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['Name', 'Email', 'Phone', 'Agency', 'Source', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead, i) => {
                      const f = lead.fields
                      const date = f['Signed Up'] ? new Date(f['Signed Up']).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
                      return (
                        <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: navy }}>{f.Name || '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{f.Email || '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{f.Phone || '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{f['Federal Agency'] || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: f.Source === 'Website Signup' ? '#dbeafe' : '#fef3c7', color: f.Source === 'Website Signup' ? '#1d4ed8' : '#92400e', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                              {f.Source || 'Direct'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}><StatusBadge status={f.Status} /></td>
                          <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12 }}>{date}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {campaigns.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No campaigns yet. Start your first Apollo outbound campaign.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['Campaign', 'Agency', 'Leads Sent', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => {
                    const f = c.fields
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: navy }}>{f.Name || f['Campaign Name'] || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{f.Agency || f['Federal Agency'] || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{f['Leads Sent'] || f['Total Leads'] || '—'}</td>
                        <td style={{ padding: '12px 16px' }}><StatusBadge status={f.Status || 'Active'} /></td>
                        <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12 }}>{f.Created ? new Date(f.Created).toLocaleDateString() : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
