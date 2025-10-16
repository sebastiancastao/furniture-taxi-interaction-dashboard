"use client";

import React, { useEffect, useState, useMemo } from "react";

interface CodeOpen {
  code: string;
  opened_at: string;
}

interface CodeInputEvent {
  id: string;
  code: string;
  field_name: string;
  input_value: string;
  changed_at: string;
}

interface CodeAllFieldsFilled {
  id: string;
  code: string;
  filled_at: string;
  field_snapshot: Record<string, unknown>;
}

interface FormSubmission {
  id: string;
  code: string;
  submitted_at: string;
  submission_data: Record<string, unknown>;
}

interface Discount {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
}

interface Referral {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
}

const Dashboard: React.FC = () => {
  const [codeOpens, setCodeOpens] = useState<CodeOpen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inputEvents, setInputEvents] = useState<CodeInputEvent[]>([]);
  const [inputLoading, setInputLoading] = useState(true);
  const [inputError, setInputError] = useState<string|null>(null);

  const [fieldsFilled, setFieldsFilled] = useState<CodeAllFieldsFilled[]>([]);
  const [filledLoading, setFilledLoading] = useState(true);
  const [filledError, setFilledError] = useState<string|null>(null);

  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [submissionLoading, setSubmissionLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState<string|null>(null);

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discountLoading, setDiscountLoading] = useState(true);
  const [discountError, setDiscountError] = useState<string|null>(null);

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLoading, setReferralLoading] = useState(true);
  const [referralError, setReferralError] = useState<string|null>(null);

  // Metrics calculations
  const metrics = useMemo(() => {
    const uniqueCodes = new Set([...codeOpens.map(o => o.code)]).size;
    const totalOpens = codeOpens.length;
    const totalInputEvents = inputEvents.length;
    const totalFieldsFilled = fieldsFilled.length;
    const totalSubmissions = formSubmissions.length;
    const totalDiscounts = discounts.length;
    const totalReferrals = referrals.length;
    
    // Conversion rates
    const openToFilledRate = totalOpens > 0 ? ((totalFieldsFilled / totalOpens) * 100).toFixed(1) : '0.0';
    const filledToSubmitRate = totalFieldsFilled > 0 ? ((totalSubmissions / totalFieldsFilled) * 100).toFixed(1) : '0.0';
    const openToSubmitRate = totalOpens > 0 ? ((totalSubmissions / totalOpens) * 100).toFixed(1) : '0.0';
    
    // Engagement metrics
    const avgEventsPerCode = uniqueCodes > 0 ? (totalInputEvents / uniqueCodes).toFixed(1) : '0.0';
    
    // Most active codes
    const codeActivity = inputEvents.reduce((acc, event) => {
      acc[event.code] = (acc[event.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCodes = Object.entries(codeActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Recent activity (last 24h)
    const now = new Date().getTime();
    const day = 24 * 60 * 60 * 1000;
    const recentOpens = codeOpens.filter(o => {
      const openTime = new Date(o.opened_at).getTime();
      return now - openTime < day;
    }).length;

    return {
      uniqueCodes,
      totalOpens,
      totalInputEvents,
      totalFieldsFilled,
      totalSubmissions,
      totalDiscounts,
      totalReferrals,
      openToFilledRate,
      filledToSubmitRate,
      openToSubmitRate,
      avgEventsPerCode,
      topCodes,
      recentOpens
    };
  }, [codeOpens, inputEvents, fieldsFilled, formSubmissions, discounts, referrals]);

  useEffect(() => {
    const fetchOpens = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/code_opens');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setCodeOpens(data);
      } catch (e: unknown) {
        let errMsg = 'Unknown Error';
        if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as {message?: unknown}).message === 'string') {
          errMsg = (e as {message: string}).message;
        }
        setError(errMsg);
        setCodeOpens([]);
      }
      setLoading(false);
    };
    fetchOpens();

    const fetchInputEvents = async () => {
      setInputLoading(true);
      setInputError(null);
      try {
        const res = await fetch('/api/code_input_events');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setInputEvents(data);
      } catch (e: unknown) {
        let errMsg = 'Unknown Error';
        if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as {message?: unknown}).message === 'string') {
          errMsg = (e as {message: string}).message;
        }
        setInputError(errMsg);
        setInputEvents([]);
      }
      setInputLoading(false);
    };
    fetchInputEvents();

    const fetchFieldsFilled = async () => {
      setFilledLoading(true);
      setFilledError(null);
      try {
        const res = await fetch('/api/code_all_fields_filled');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setFieldsFilled(data);
      } catch (e: unknown) {
        let errMsg = 'Unknown Error';
        if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as {message?: unknown}).message === 'string') {
          errMsg = (e as {message: string}).message;
        }
        setFilledError(errMsg);
        setFieldsFilled([]);
      }
      setFilledLoading(false);
    };
    fetchFieldsFilled();

    const fetchFormSubmissions = async () => {
      setSubmissionLoading(true);
      setSubmissionError(null);
      try {
        const res = await fetch('/api/form_submissions');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setFormSubmissions(data);
      } catch (e: unknown) {
        let errMsg = 'Unknown Error';
        if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as {message?: unknown}).message === 'string') {
          errMsg = (e as {message: string}).message;
        }
        setSubmissionError(errMsg);
        setFormSubmissions([]);
      }
      setSubmissionLoading(false);
    };
    fetchFormSubmissions();

    const fetchDiscounts = async () => {
      setDiscountLoading(true);
      setDiscountError(null);
      try {
        const res = await fetch('/api/discount');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setDiscounts(data);
      } catch (e: unknown) {
        let errMsg = 'Unknown Error';
        if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as {message?: unknown}).message === 'string') {
          errMsg = (e as {message: string}).message;
        }
        setDiscountError(errMsg);
        setDiscounts([]);
      }
      setDiscountLoading(false);
    };
    fetchDiscounts();

    const fetchReferrals = async () => {
      setReferralLoading(true);
      setReferralError(null);
      try {
        const res = await fetch('/api/referral');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setReferrals(data);
      } catch (e: unknown) {
        let errMsg = 'Unknown Error';
        if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as {message?: unknown}).message === 'string') {
          errMsg = (e as {message: string}).message;
        }
        setReferralError(errMsg);
        setReferrals([]);
      }
      setReferralLoading(false);
    };
    fetchReferrals();
  }, []);

  const glassCard = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    padding: 32,
  };

  const metricCard = {
    ...glassCard,
    padding: 24,
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #10b981 100%)',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{
            fontSize: 56,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
            letterSpacing: -2,
          }}>
            Analytics Dashboard
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 18, fontWeight: 500 }}>
            Real-time metrics and insights from your database
          </p>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 40,
        }}>
          <div style={metricCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: 14, color: '#0ea5e9', fontWeight: 600, marginBottom: 8 }}>Total Opens</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a' }}>{metrics.totalOpens}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{metrics.recentOpens} in last 24h</div>
          </div>

          <div style={metricCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: 14, color: '#06b6d4', fontWeight: 600, marginBottom: 8 }}>Unique Codes</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a' }}>{metrics.uniqueCodes}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Active users</div>
          </div>

          <div style={metricCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: 14, color: '#10b981', fontWeight: 600, marginBottom: 8 }}>Completion Rate</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a' }}>{metrics.openToSubmitRate}%</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Open → Submit</div>
          </div>

          <div style={metricCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: 14, color: '#f59e0b', fontWeight: 600, marginBottom: 8 }}>Total Submissions</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a' }}>{metrics.totalSubmissions}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Forms completed</div>
          </div>

          <div style={metricCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: 14, color: '#3b82f6', fontWeight: 600, marginBottom: 8 }}>Avg Interactions</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a' }}>{metrics.avgEventsPerCode}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Events per code</div>
          </div>

          <div style={metricCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: 14, color: '#ec4899', fontWeight: 600, marginBottom: 8 }}>Referrals</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a' }}>{metrics.totalReferrals}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Active referrals</div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div style={{ ...glassCard, marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 24 }}>Conversion Funnel</h2>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#0ea5e9' }}>{metrics.totalOpens}</div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Opens</div>
            </div>
            <div style={{ fontSize: 24, color: '#999' }}>→</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{metrics.totalFieldsFilled}</div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Fields Filled</div>
              <div style={{ fontSize: 12, color: '#10b981', marginTop: 4, fontWeight: 600 }}>{metrics.openToFilledRate}%</div>
            </div>
            <div style={{ fontSize: 24, color: '#999' }}>→</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>{metrics.totalSubmissions}</div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Submissions</div>
              <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 4, fontWeight: 600 }}>{metrics.filledToSubmitRate}%</div>
            </div>
          </div>
        </div>

        {/* Top Codes */}
        <div style={{ ...glassCard, marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 24 }}>Most Active Codes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {metrics.topCodes.map(([code, count], idx) => (
              <div key={code} style={{
                display: 'flex',
                alignItems: 'center',
                padding: 16,
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'][idx]} 0%, ${['#0284c7', '#0891b2', '#059669', '#d97706', '#2563eb'][idx]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  marginRight: 16,
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 14, fontWeight: 600 }}>{code}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0ea5e9' }}>{count} events</div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Tables */}
        <div style={{ ...glassCard, marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Recent Opens</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading...</div>
          ) : error ? (
            <div style={{ color: '#ef4444', padding: 20 }}>{error}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#0ea5e9', fontWeight: 600, fontSize: 14 }}>Code</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#0ea5e9', fontWeight: 600, fontSize: 14 }}>Opened At</th>
                  </tr>
                </thead>
                <tbody>
                  {codeOpens.slice(0, 10).map((row, idx) => (
                    <tr key={idx} style={{
                      background: 'rgba(255, 255, 255, 0.4)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}>
                      <td style={{ padding: '16px', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, fontFamily: 'monospace', fontWeight: 600 }}>{row.code}</td>
                      <td style={{ padding: '16px', borderTopRightRadius: 12, borderBottomRightRadius: 12, color: '#666' }}>{row.opened_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ ...glassCard, marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Input Events</h2>
          {inputLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading...</div>
          ) : inputError ? (
            <div style={{ color: '#ef4444', padding: 20 }}>{inputError}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#06b6d4', fontWeight: 600, fontSize: 14 }}>Code</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#06b6d4', fontWeight: 600, fontSize: 14 }}>Field</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#06b6d4', fontWeight: 600, fontSize: 14 }}>Value</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#06b6d4', fontWeight: 600, fontSize: 14 }}>Changed At</th>
                  </tr>
                </thead>
                <tbody>
                  {inputEvents.slice(0, 10).map((row, idx) => (
                    <tr key={row.id} style={{
                      background: 'rgba(255, 255, 255, 0.4)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}>
                      <td style={{ padding: '16px', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, fontFamily: 'monospace', fontWeight: 600 }}>{row.code}</td>
                      <td style={{ padding: '16px', color: '#666' }}>{row.field_name}</td>
                      <td style={{ padding: '16px', color: '#666' }}>{row.input_value}</td>
                      <td style={{ padding: '16px', borderTopRightRadius: 12, borderBottomRightRadius: 12, color: '#666' }}>{row.changed_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ ...glassCard, marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Form Submissions</h2>
          {submissionLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading...</div>
          ) : submissionError ? (
            <div style={{ color: '#ef4444', padding: 20 }}>{submissionError}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#f59e0b', fontWeight: 600, fontSize: 14 }}>Code</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#f59e0b', fontWeight: 600, fontSize: 14 }}>Submitted At</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#f59e0b', fontWeight: 600, fontSize: 14 }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {formSubmissions.slice(0, 10).map((row, idx) => (
                    <tr key={row.id} style={{
                      background: 'rgba(255, 255, 255, 0.4)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}>
                      <td style={{ padding: '16px', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, fontFamily: 'monospace', fontWeight: 600 }}>{row.code}</td>
                      <td style={{ padding: '16px', color: '#666' }}>{row.submitted_at}</td>
                      <td style={{ padding: '16px', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>
                        <pre style={{ margin: 0, fontSize: 12, color: '#666', maxWidth: 300, overflow: 'auto' }}>{JSON.stringify(row.submission_data, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div style={glassCard}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Discounts</h2>
            {discountLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading...</div>
            ) : discountError ? (
              <div style={{ color: '#ef4444', padding: 20 }}>{discountError}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {discounts.slice(0, 5).map((row, idx) => (
                  <div key={row.id} style={{
                    padding: 16,
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: 12,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>{row.code}</div>
                    <div style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 600 }}>{row.name}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{row.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={glassCard}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Referrals</h2>
            {referralLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading...</div>
            ) : referralError ? (
              <div style={{ color: '#ef4444', padding: 20 }}>{referralError}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {referrals.slice(0, 5).map((row, idx) => (
                  <div key={row.id} style={{
                    padding: 16,
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: 12,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981', marginBottom: 8 }}>{row.code}</div>
                    <div style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 600 }}>{row.name}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{row.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;