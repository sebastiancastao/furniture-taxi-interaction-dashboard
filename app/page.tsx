"use client";

import React, { useEffect, useMemo, useState } from "react";

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

type Contact = { name?: string; email?: string; phone?: string };

const Dashboard: React.FC = () => {
  // Data states
  const [codeOpens, setCodeOpens] = useState<CodeOpen[]>([]);
  const [inputEvents, setInputEvents] = useState<CodeInputEvent[]>([]);
  const [fieldsFilled, setFieldsFilled] = useState<CodeAllFieldsFilled[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  // Loading / error states
  const [loading, setLoading] = useState(true);
  const [inputLoading, setInputLoading] = useState(true);
  const [filledLoading, setFilledLoading] = useState(true);
  const [submissionLoading, setSubmissionLoading] = useState(true);
  const [discountLoading, setDiscountLoading] = useState(true);
  const [referralLoading, setReferralLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [filledError, setFilledError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);

  // Global filters
  const [fromDate, setFromDate] = useState<string>(""); // yyyy-mm-dd
  const [toDate, setToDate] = useState<string>("");     // yyyy-mm-dd
  const [codeQuery, setCodeQuery] = useState<string>("");

  // Per-table quick filters
  const [opensFilter, setOpensFilter] = useState("");
  const [eventsFilter, setEventsFilter] = useState("");
  const [subsFilter, setSubsFilter] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");
  const [referralFilter, setReferralFilter] = useState("");

  // Fetch data
  useEffect(() => {
    const fetchOpens = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/code_opens");
        if (!res.ok) throw new Error(await res.text());
        setCodeOpens(await res.json());
      } catch (e: any) {
        setError(e?.message ?? "Unknown Error");
        setCodeOpens([]);
      }
      setLoading(false);
    };

    const fetchInputEvents = async () => {
      setInputLoading(true);
      setInputError(null);
      try {
        const res = await fetch("/api/code_input_events");
        if (!res.ok) throw new Error(await res.text());
        setInputEvents(await res.json());
      } catch (e: any) {
        setInputError(e?.message ?? "Unknown Error");
        setInputEvents([]);
      }
      setInputLoading(false);
    };

    const fetchFieldsFilled = async () => {
      setFilledLoading(true);
      setFilledError(null);
      try {
        const res = await fetch("/api/code_all_fields_filled");
        if (!res.ok) throw new Error(await res.text());
        setFieldsFilled(await res.json());
      } catch (e: any) {
        setFilledError(e?.message ?? "Unknown Error");
        setFieldsFilled([]);
      }
      setFilledLoading(false);
    };

    const fetchFormSubmissions = async () => {
      setSubmissionLoading(true);
      setSubmissionError(null);
      try {
        const res = await fetch("/api/form_submissions");
        if (!res.ok) throw new Error(await res.text());
        setFormSubmissions(await res.json());
      } catch (e: any) {
        setSubmissionError(e?.message ?? "Unknown Error");
        setFormSubmissions([]);
      }
      setSubmissionLoading(false);
    };

    const fetchDiscounts = async () => {
      setDiscountLoading(true);
      setDiscountError(null);
      try {
        const res = await fetch("/api/discount");
        if (!res.ok) throw new Error(await res.text());
        setDiscounts(await res.json());
      } catch (e: any) {
        setDiscountError(e?.message ?? "Unknown Error");
        setDiscounts([]);
      }
      setDiscountLoading(false);
    };

    const fetchReferrals = async () => {
      setReferralLoading(true);
      setReferralError(null);
      try {
        const res = await fetch("/api/referral");
        if (!res.ok) throw new Error(await res.text());
        setReferrals(await res.json());
      } catch (e: any) {
        setReferralError(e?.message ?? "Unknown Error");
        setReferrals([]);
      }
      setReferralLoading(false);
    };

    fetchOpens();
    fetchInputEvents();
    fetchFieldsFilled();
    fetchFormSubmissions();
    fetchDiscounts();
    fetchReferrals();
  }, []);

  // Helpers
  const toDayKey = (d: string) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const inDateRange = (iso: string) => {
    if (!fromDate && !toDate) return true;
    const t = new Date(iso).getTime();
    if (fromDate && t < new Date(fromDate).getTime()) return false;
    if (toDate && t > new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
    return true;
  };

  const matchesCodeQuery = (code: string) =>
    !codeQuery || code.toLowerCase().includes(codeQuery.toLowerCase());

  // Build a contact map per code: prefer Discounts/Referrals; fallback to submission_data
  const contactByCode: Record<string, Contact> = useMemo(() => {
    const map: Record<string, Contact> = {};
    const put = (code: string, c: Contact) => {
      if (!map[code]) map[code] = {};
      map[code] = { ...map[code], ...Object.fromEntries(Object.entries(c).filter(([, v]) => v)) };
    };

    discounts.forEach((d) => put(d.code, { name: d.name, email: d.email, phone: d.phone }));
    referrals.forEach((r) => put(r.code, { name: r.name, email: r.email, phone: r.phone }));

    formSubmissions.forEach((s) => {
      const sd = s.submission_data || {};
      put(s.code, {
        name: (sd["name"] as string) || (sd["full_name"] as string),
        email: (sd["email"] as string),
        phone: (sd["phone"] as string) || (sd["phone_number"] as string),
      });
    });

    return map;
  }, [discounts, referrals, formSubmissions]);

  // Apply global filters
  const filtered = useMemo(() => {
    const opens = codeOpens.filter(
      (o) => inDateRange(o.opened_at) && matchesCodeQuery(o.code)
    );
    const events = inputEvents.filter(
      (e) => inDateRange(e.changed_at) && matchesCodeQuery(e.code)
    );
    const filled = fieldsFilled.filter(
      (f) => inDateRange(f.filled_at) && matchesCodeQuery(f.code)
    );
    const subs = formSubmissions.filter(
      (s) => inDateRange(s.submitted_at) && matchesCodeQuery(s.code)
    );
    const disc = discounts.filter((d) => matchesCodeQuery(d.code));
    const refs = referrals.filter((r) => matchesCodeQuery(r.code));
    return { opens, events, filled, subs, disc, refs };
  }, [codeOpens, inputEvents, fieldsFilled, formSubmissions, discounts, referrals, fromDate, toDate, codeQuery]);

  // Per-code conversion as requested: ONLY count unique codes; success if same code appears in subs
  const perCodeOpenSubmit = useMemo(() => {
    const openedCodes = new Set(filtered.opens.map((o) => o.code));
    const submittedCodes = new Set(filtered.subs.map((s) => s.code));
    let success = 0;
    openedCodes.forEach((c) => {
      if (submittedCodes.has(c)) success += 1;
    });
    const denom = openedCodes.size;
    const rate = denom > 0 ? ((success / denom) * 100).toFixed(1) : "0.0";
    return { openedCodesCount: denom, successCodesCount: success, ratePercent: rate };
  }, [filtered.opens, filtered.subs]);

  // Other metrics (note: open→submit (event-level) kept for context but we show the per-code rate as "Completion Rate")
  const metrics = useMemo(() => {
    const uniqueCodes = new Set(filtered.opens.map((o) => o.code)).size;
    const totalOpens = filtered.opens.length;
    const totalInputEvents = filtered.events.length;
    const totalFieldsFilled = filtered.filled.length;
    const totalSubmissions = filtered.subs.length;
    const totalDiscounts = filtered.disc.length;
    const totalReferrals = filtered.refs.length;

    const openToFilledRate =
      totalOpens > 0 ? ((totalFieldsFilled / totalOpens) * 100).toFixed(1) : "0.0";
    const filledToSubmitRate =
      totalFieldsFilled > 0 ? ((totalSubmissions / totalFieldsFilled) * 100).toFixed(1) : "0.0";

    // recent opens (last 24h, ignoring date filters)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const recentOpens = codeOpens.filter((o) => now - new Date(o.opened_at).getTime() < dayMs).length;

    // top active codes (by input events)
    const codeActivity = filtered.events.reduce((acc, e) => {
      acc[e.code] = (acc[e.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCodes = Object.entries(codeActivity).sort(([, a], [, b]) => b - a).slice(0, 5);

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
      recentOpens,
      topCodes,
    };
  }, [filtered, codeOpens]);

  // Aggregate by day for simple line charts
  const seriesByDay = useMemo(() => {
    const inc = (m: Record<string, number>, day: string) => (m[day] = (m[day] ?? 0) + 1);
    const opens: Record<string, number> = {};
    const subs: Record<string, number> = {};
    filtered.opens.forEach((o) => inc(opens, toDayKey(o.opened_at)));
    filtered.subs.forEach((s) => inc(subs, toDayKey(s.submitted_at)));

    // union of days
    const days = Array.from(new Set([...Object.keys(opens), ...Object.keys(subs)])).sort();
    const opensSeries = days.map((d) => ({ day: d, value: opens[d] ?? 0 }));
    const subsSeries = days.map((d) => ({ day: d, value: subs[d] ?? 0 }));

    return { days, opensSeries, subsSeries };
  }, [filtered.opens, filtered.subs]);

  // Simple responsive SVG line chart
  const LineChart: React.FC<{ data: { day: string; value: number }[]; title: string }> = ({
    data,
    title,
  }) => {
    const width = 640;
    const height = 220;
    const padding = 36;

    const values = data.map((d) => d.value);
    const maxY = Math.max(1, ...values);
    const minY = 0;
    const x = (i: number) =>
      padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
    const y = (v: number) =>
      height - padding - ((v - minY) / (maxY - minY)) * (height - padding * 2);

    const path = data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.value)}`)
      .join(" ");

    return (
      <div style={{ overflowX: "auto" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>
          {title}
        </div>
        <svg width={width} height={height} style={{ background: "#fff", borderRadius: 12 }}>
          {/* axes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e5ea" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e5ea" />

          {/* labels (x) */}
          {data.map((d, i) => (
            <text key={d.day} x={x(i)} y={height - padding + 16} fontSize="10" textAnchor="middle" fill="#86868b">
              {d.day}
            </text>
          ))}

          {/* labels (y) */}
          {[0, Math.ceil(maxY / 2), maxY].map((t, i) => (
            <g key={i}>
              <text x={padding - 8} y={y(t)} fontSize="10" textAnchor="end" alignmentBaseline="middle" fill="#86868b">
                {t}
              </text>
              <line x1={padding} y1={y(t)} x2={width - padding} y2={y(t)} stroke="#f2f2f7" />
            </g>
          ))}

          {/* line */}
          <path d={path} fill="none" stroke="#0071e3" strokeWidth={2} />
          {/* points */}
          {data.map((d, i) => (
            <circle key={i} cx={x(i)} cy={y(d.value)} r={3} fill="#0071e3" />
          ))}
        </svg>
      </div>
    );
  };

  const card = {
    background: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
    padding: 32,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const metricCard = {
    ...card,
    padding: 28,
    textAlign: "center" as const,
    cursor: "default",
  };

  const hoverable = {
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)";
    },
  };

  // Row hover helpers
  const rowHover = {
    onMouseEnter: (e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = "#e8e8ed"),
    onMouseLeave: (e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = "#f5f5f7"),
  };

  // Filter helpers for per-table search
  const includes = (s: string, q: string) =>
    s?.toLowerCase().includes(q.trim().toLowerCase());

  return (
    <div
      style={{
        padding: "48px 40px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
        minHeight: "100vh",
        background: "#f5f5f7",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#1d1d1f",
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Analytics
          </h1>
          <p style={{ color: "#86868b", fontSize: 21, fontWeight: 400, letterSpacing: "-0.01em" }}>
            Real-time insights at a glance
          </p>
        </div>

        {/* GLOBAL FILTERS */}
        <div style={{ ...card, marginBottom: 32 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              alignItems: "end",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#86868b", marginBottom: 6 }}>
                From date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #e5e5ea",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#86868b", marginBottom: 6 }}>
                To date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #e5e5ea",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#86868b", marginBottom: 6 }}>
                Code search
              </label>
              <input
                type="text"
                placeholder="Search by code (e.g., VIP50)"
                value={codeQuery}
                onChange={(e) => setCodeQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #e5e5ea",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div style={metricCard} {...hoverable}>
            <div style={{ fontSize: 13, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>Total Opens</div>
            <div style={{ fontSize: 44, fontWeight: 600, color: "#1d1d1f" }}>{metrics.totalOpens}</div>
            <div style={{ fontSize: 13, color: "#86868b", marginTop: 8 }}>{metrics.recentOpens} in last 24h</div>
          </div>

          <div style={metricCard} {...hoverable}>
            <div style={{ fontSize: 13, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>Unique Codes (opened)</div>
            <div style={{ fontSize: 44, fontWeight: 600, color: "#1d1d1f" }}>{perCodeOpenSubmit.openedCodesCount}</div>
            <div style={{ fontSize: 13, color: "#86868b", marginTop: 8 }}>Codes with at least one open</div>
          </div>

          <div style={metricCard} {...hoverable}>
            <div style={{ fontSize: 13, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>Completion Rate</div>
            <div style={{ fontSize: 44, fontWeight: 600, color: "#1d1d1f" }}>{perCodeOpenSubmit.ratePercent}%</div>
            <div style={{ fontSize: 13, color: "#86868b", marginTop: 8 }}>Open (code) → Submit (same code)</div>
          </div>

          <div style={metricCard} {...hoverable}>
            <div style={{ fontSize: 13, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>Total Submissions</div>
            <div style={{ fontSize: 44, fontWeight: 600, color: "#1d1d1f" }}>{metrics.totalSubmissions}</div>
            <div style={{ fontSize: 13, color: "#86868b", marginTop: 8 }}>Forms completed</div>
          </div>

          <div style={metricCard} {...hoverable}>
            <div style={{ fontSize: 13, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>Open → Filled</div>
            <div style={{ fontSize: 44, fontWeight: 600, color: "#1d1d1f" }}>{metrics.openToFilledRate}%</div>
            <div style={{ fontSize: 13, color: "#86868b", marginTop: 8 }}>Event-level</div>
          </div>

          <div style={metricCard} {...hoverable}>
            <div style={{ fontSize: 13, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>Filled → Submit</div>
            <div style={{ fontSize: 44, fontWeight: 600, color: "#1d1d1f" }}>{metrics.filledToSubmitRate}%</div>
            <div style={{ fontSize: 13, color: "#86868b", marginTop: 8 }}>Event-level</div>
          </div>
        </div>

        {/* CHARTS */}
        <div style={{ ...card, marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1d1d1f", marginBottom: 16 }}>Trends</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
            <LineChart data={seriesByDay.opensSeries} title="Opens per day" />
            <LineChart data={seriesByDay.subsSeries} title="Submissions per day" />
          </div>
        </div>

        {/* FUNNEL */}
        <div style={{ ...card, marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1d1d1f", marginBottom: 24 }}>Conversion Funnel</h2>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 600, color: "#1d1d1f" }}>{metrics.totalOpens}</div>
              <div style={{ fontSize: 15, color: "#86868b", marginTop: 8, fontWeight: 500 }}>Opens</div>
            </div>
            <div style={{ fontSize: 28, color: "#d2d2d7" }}>→</div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 600, color: "#1d1d1f" }}>{metrics.totalFieldsFilled}</div>
              <div style={{ fontSize: 15, color: "#86868b", marginTop: 8, fontWeight: 500 }}>Fields Filled</div>
              <div style={{ fontSize: 13, color: "#06c", marginTop: 6, fontWeight: 600 }}>{metrics.openToFilledRate}%</div>
            </div>
            <div style={{ fontSize: 28, color: "#d2d2d7" }}>→</div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 600, color: "#1d1d1f" }}>{metrics.totalSubmissions}</div>
              <div style={{ fontSize: 15, color: "#86868b", marginTop: 8, fontWeight: 500 }}>Submissions</div>
              <div style={{ fontSize: 13, color: "#06c", marginTop: 6, fontWeight: 600 }}>{metrics.filledToSubmitRate}%</div>
            </div>
          </div>
          <div style={{ marginTop: 12, color: "#86868b", fontSize: 12 }}>
            * “Completion Rate” card above uses per-code logic (same code must both open and submit).
          </div>
        </div>

        {/* MOST ACTIVE CODES */}
        <div style={{ ...card, marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1d1d1f", marginBottom: 20 }}>Most Active Codes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {metrics.topCodes.map(([code, count], idx) => (
              <div
                key={code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "#f5f5f7",
                  borderRadius: 12,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e8ed")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f7")}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#1d1d1f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 14,
                    marginRight: 16,
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1, fontFamily: "'SF Mono', Monaco, monospace", fontSize: 15, fontWeight: 500, color: "#1d1d1f" }}>
                  {code}
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f" }}>{count}</div>
                <div style={{ fontSize: 13, color: "#86868b", marginLeft: 6, fontWeight: 500 }}>events</div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT OPENS TABLE (with Name/Email/Phone + per-table filter) */}
        <div style={{ ...card, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1d1d1f" }}>Recent Opens</h2>
            <input
              type="text"
              placeholder="Filter (code/name/email/phone)"
              value={opensFilter}
              onChange={(e) => setOpensFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e5ea" }}
            />
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "#86868b", fontSize: 15 }}>Loading...</div>
          ) : error ? (
            <div style={{ color: "#ff3b30", padding: 20, fontSize: 15 }}>{error}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                <thead>
                  <tr>
                    <th style={th}>Code</th>
                    <th style={th}>Name</th>
                    <th style={th}>Email</th>
                    <th style={th}>Phone</th>
                    <th style={th}>Opened At</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.opens
                    .filter((row) => {
                      const c = contactByCode[row.code] || {};
                      return (
                        !opensFilter ||
                        includes(row.code, opensFilter) ||
                        includes(c.name ?? "", opensFilter) ||
                        includes(c.email ?? "", opensFilter) ||
                        includes(c.phone ?? "", opensFilter)
                      );
                    })
                    .slice(0, 50)
                    .map((row, idx) => {
                      const c = contactByCode[row.code] || {};
                      return (
                        <tr key={idx} style={tr} {...rowHover}>
                          <td style={tdMonoLeft}>{row.code}</td>
                          <td style={td}>{c.name ?? "—"}</td>
                          <td style={td}>{c.email ?? "—"}</td>
                          <td style={td}>{c.phone ?? "—"}</td>
                          <td style={tdRight}>{row.opened_at}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* INPUT EVENTS TABLE */}
        <div style={{ ...card, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1d1d1f" }}>Input Events</h2>
            <input
              type="text"
              placeholder="Filter (code/field/value/name/email/phone)"
              value={eventsFilter}
              onChange={(e) => setEventsFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e5ea" }}
            />
          </div>
          {inputLoading ? (
            <div style={{ textAlign: "center", padding: 48, color: "#86868b", fontSize: 15 }}>Loading...</div>
          ) : inputError ? (
            <div style={{ color: "#ff3b30", padding: 20, fontSize: 15 }}>{inputError}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                <thead>
                  <tr>
                    <th style={th}>Code</th>
                    <th style={th}>Name</th>
                    <th style={th}>Email</th>
                    <th style={th}>Phone</th>
                    <th style={th}>Field</th>
                    <th style={th}>Value</th>
                    <th style={th}>Changed At</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.events
                    .filter((row) => {
                      const c = contactByCode[row.code] || {};
                      return (
                        !eventsFilter ||
                        includes(row.code, eventsFilter) ||
                        includes(row.field_name, eventsFilter) ||
                        includes(String(row.input_value ?? ""), eventsFilter) ||
                        includes(c.name ?? "", eventsFilter) ||
                        includes(c.email ?? "", eventsFilter) ||
                        includes(c.phone ?? "", eventsFilter)
                      );
                    })
                    .slice(0, 50)
                    .map((row) => {
                      const c = contactByCode[row.code] || {};
                      return (
                        <tr key={row.id} style={tr} {...rowHover}>
                          <td style={tdMonoLeft}>{row.code}</td>
                          <td style={td}>{c.name ?? "—"}</td>
                          <td style={td}>{c.email ?? "—"}</td>
                          <td style={td}>{c.phone ?? "—"}</td>
                          <td style={td}>{row.field_name}</td>
                          <td style={td}>{String(row.input_value ?? "")}</td>
                          <td style={tdRight}>{row.changed_at}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FORM SUBMISSIONS TABLE */}
        <div style={{ ...card, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1d1d1f" }}>Form Submissions</h2>
            <input
              type="text"
              placeholder="Filter (code/name/email/phone)"
              value={subsFilter}
              onChange={(e) => setSubsFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e5ea" }}
            />
          </div>
          {submissionLoading ? (
            <div style={{ textAlign: "center", padding: 48, color: "#86868b", fontSize: 15 }}>Loading...</div>
          ) : submissionError ? (
            <div style={{ color: "#ff3b30", padding: 20, fontSize: 15 }}>{submissionError}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                <thead>
                  <tr>
                    <th style={th}>Code</th>
                    <th style={th}>Name</th>
                    <th style={th}>Email</th>
                    <th style={th}>Phone</th>
                    <th style={th}>Submitted At</th>
                    <th style={th}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.subs
                    .filter((row) => {
                      const c = contactByCode[row.code] || {};
                      const sd = row.submission_data || {};
                      return (
                        !subsFilter ||
                        includes(row.code, subsFilter) ||
                        includes(c.name ?? String(sd["name"] ?? sd["full_name"] ?? ""), subsFilter) ||
                        includes(c.email ?? String(sd["email"] ?? ""), subsFilter) ||
                        includes(c.phone ?? String(sd["phone"] ?? sd["phone_number"] ?? ""), subsFilter)
                      );
                    })
                    .slice(0, 50)
                    .map((row) => {
                      const c = contactByCode[row.code] || {};
                      const sd = row.submission_data || {};
                      const n = c.name ?? (sd["name"] as string) ?? (sd["full_name"] as string) ?? "—";
                      const em = c.email ?? (sd["email"] as string) ?? "—";
                      const ph = c.phone ?? (sd["phone"] as string) ?? (sd["phone_number"] as string) ?? "—";
                      return (
                        <tr key={row.id} style={tr} {...rowHover}>
                          <td style={tdMonoLeft}>{row.code}</td>
                          <td style={td}>{n}</td>
                          <td style={td}>{em}</td>
                          <td style={td}>{ph}</td>
                          <td style={tdRight}>{row.submitted_at}</td>
                          <td style={{ ...td, maxWidth: 320 }}>
                            <pre
                              style={{
                                margin: 0,
                                fontSize: 12,
                                fontFamily: "'SF Mono', Monaco, monospace",
                                color: "#86868b",
                                overflow: "auto",
                              }}
                            >
                              {JSON.stringify(sd, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DISCOUNTS / REFERRALS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1d1d1f" }}>Discounts</h2>
              <input
                type="text"
                placeholder="Filter (code/name/email/phone)"
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e5ea" }}
              />
            </div>
            {discountLoading ? (
              <div style={{ textAlign: "center", padding: 48, color: "#86868b", fontSize: 15 }}>Loading...</div>
            ) : discountError ? (
              <div style={{ color: "#ff3b30", padding: 20, fontSize: 15 }}>{discountError}</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                  <thead>
                    <tr>
                      <th style={th}>Code</th>
                      <th style={th}>Name</th>
                      <th style={th}>Email</th>
                      <th style={th}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.disc
                      .filter(
                        (d) =>
                          !discountFilter ||
                          includes(d.code, discountFilter) ||
                          includes(d.name, discountFilter) ||
                          includes(d.email, discountFilter) ||
                          includes(d.phone, discountFilter)
                      )
                      .slice(0, 50)
                      .map((row) => (
                        <tr key={row.id} style={tr} {...rowHover}>
                          <td style={tdMonoLeft}>{row.code}</td>
                          <td style={td}>{row.name}</td>
                          <td style={td}>{row.email}</td>
                          <td style={td}>{row.phone}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1d1d1f" }}>Referrals</h2>
              <input
                type="text"
                placeholder="Filter (code/name/email/phone)"
                value={referralFilter}
                onChange={(e) => setReferralFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e5ea" }}
              />
            </div>
            {referralLoading ? (
              <div style={{ textAlign: "center", padding: 48, color: "#86868b", fontSize: 15 }}>Loading...</div>
            ) : referralError ? (
              <div style={{ color: "#ff3b30", padding: 20, fontSize: 15 }}>{referralError}</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                  <thead>
                    <tr>
                      <th style={th}>Code</th>
                      <th style={th}>Name</th>
                      <th style={th}>Email</th>
                      <th style={th}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.refs
                      .filter(
                        (r) =>
                          !referralFilter ||
                          includes(r.code, referralFilter) ||
                          includes(r.name, referralFilter) ||
                          includes(r.email, referralFilter) ||
                          includes(r.phone, referralFilter)
                      )
                      .slice(0, 50)
                      .map((row) => (
                        <tr key={row.id} style={tr} {...rowHover}>
                          <td style={tdMonoLeft}>{row.code}</td>
                          <td style={td}>{row.name}</td>
                          <td style={td}>{row.email}</td>
                          <td style={td}>{row.phone}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// table cell styles
const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 16px",
  color: "#86868b",
  fontWeight: 500,
  fontSize: 13,
  letterSpacing: "0.01em",
};

const tr: React.CSSProperties = {
  background: "#f5f5f7",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
};

const td: React.CSSProperties = {
  padding: "14px 16px",
  color: "#1d1d1f",
  fontSize: 14,
};

const tdRight: React.CSSProperties = {
  ...td,
  color: "#86868b",
  textAlign: "right",
  borderTopRightRadius: 10,
  borderBottomRightRadius: 10,
};

const tdMonoLeft: React.CSSProperties = {
  ...td,
  fontFamily: "'SF Mono', Monaco, monospace",
  fontWeight: 500,
  fontSize: 14,
  color: "#1d1d1f",
  borderTopLeftRadius: 10,
  borderBottomLeftRadius: 10,
};

export default Dashboard;
