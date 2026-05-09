import { useState, useEffect, useRef } from "react";

const MOCK_USER = {
  name: "Arjun Sharma",
  email: "arjun@outboxlabs.com",
  avatar: "AS",
};

const MOCK_SCHEDULED = [
  { id: 1, to: "priya@company.io", subject: "Intro to ReachInbox", scheduledAt: "2026-05-10 09:00", status: "scheduled", sender: "arjun@outboxlabs.com" },
  { id: 2, to: "neil@startup.co", subject: "Cold Email Best Practices", scheduledAt: "2026-05-10 10:30", status: "scheduled", sender: "ops@outboxlabs.com" },
  { id: 3, to: "sara@growth.io", subject: "Your Q2 Lead Report", scheduledAt: "2026-05-11 08:00", status: "scheduled", sender: "arjun@outboxlabs.com" },
  { id: 4, to: "mike@vc.com", subject: "Partnership Opportunity", scheduledAt: "2026-05-11 14:00", status: "pending", sender: "ops@outboxlabs.com" },
  { id: 5, to: "ceo@bigco.com", subject: "Exclusive Outreach Demo", scheduledAt: "2026-05-12 11:00", status: "scheduled", sender: "arjun@outboxlabs.com" },
];

const MOCK_SENT = [
  { id: 10, to: "alice@marketing.com", subject: "Welcome to ReachInbox", sentAt: "2026-05-09 08:12", status: "sent", sender: "arjun@outboxlabs.com" },
  { id: 11, to: "bob@sales.io", subject: "Follow Up: Demo Call", sentAt: "2026-05-09 09:05", status: "sent", sender: "ops@outboxlabs.com" },
  { id: 12, to: "carol@tech.dev", subject: "Your Free Trial Starts Now", sentAt: "2026-05-08 15:30", status: "failed", sender: "arjun@outboxlabs.com" },
  { id: 13, to: "dan@agency.co", subject: "Cold Email Masterclass", sentAt: "2026-05-08 11:00", status: "sent", sender: "ops@outboxlabs.com" },
  { id: 14, to: "eve@fintech.com", subject: "Personalized Outreach Sequence", sentAt: "2026-05-07 16:45", status: "sent", sender: "arjun@outboxlabs.com" },
  { id: 15, to: "frank@media.io", subject: "Growth Strategy Proposal", sentAt: "2026-05-07 10:20", status: "sent", sender: "ops@outboxlabs.com" },
];

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", bg: "#E6F1FB", color: "#185FA5" },
  pending: { label: "Pending", bg: "#FAEEDA", color: "#854F0B" },
  sent: { label: "Sent", bg: "#EAF3DE", color: "#3B6D11" },
  failed: { label: "Failed", bg: "#FCEBEB", color: "#A32D2D" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600, padding: "3px 10px",
      borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.04em",
      display: "inline-block",
    }}>{cfg.label}</span>
  );
}

function Avatar({ initials, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #2A1A5E 0%, #4A3599 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#C4B8F5", fontSize: size * 0.35, fontWeight: 700,
      letterSpacing: "0.05em", flexShrink: 0,
    }}>{initials}</div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: "2.5px solid #2A1A5E", borderTopColor: "#8B5CF6",
        animation: "spin 0.7s linear infinite",
      }} />
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ textAlign: "center", padding: "72px 24px" }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.25 }}>{icon}</div>
      <p style={{ fontWeight: 600, color: "#1A1035", marginBottom: 6, fontSize: 15 }}>{title}</p>
      <p style={{ color: "#7C7A8A", fontSize: 13 }}>{desc}</p>
    </div>
  );
}

function ComposeModal({ onClose, onSchedule }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emails, setEmails] = useState([]);
  const [emailCount, setEmailCount] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [delay, setDelay] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(50);
  const [sender, setSender] = useState("arjun@outboxlabs.com");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const found = [...new Set(
        (text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [])
      )];
      setEmails(found);
      setEmailCount(found.length);
    };
    reader.readAsText(file);
  }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    onSchedule({
      subject, body, emails, emailCount, startTime, delay, hourlyLimit, sender,
    });
    setSubmitting(false);
    onClose();
  }

  const canNext = step === 1 ? (subject && body) : (emailCount > 0 && startTime);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,6,30,0.72)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#FFFFFF", borderRadius: 20,
        width: "min(560px, 95vw)", maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 32px 80px rgba(10,6,30,0.28)",
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "24px 28px 20px", borderBottom: "1px solid #F0EEF8",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#8B5CF6", letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>
              Step {step} of 2
            </p>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1035", margin: 0 }}>
              {step === 1 ? "Compose Email" : "Schedule Settings"}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: "#F5F3FF", border: "none", borderRadius: 10,
            width: 36, height: 36, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: "#5B4B8A", fontSize: 18,
          }}>✕</button>
        </div>

        {/* Step Indicators */}
        <div style={{ display: "flex", gap: 0, padding: "0 28px", marginTop: 20 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{
                height: 3, borderRadius: 4,
                background: s <= step ? "#8B5CF6" : "#E9E6F7",
                marginRight: s === 1 ? 6 : 0,
              }} />
            </div>
          ))}
        </div>

        <div style={{ padding: "24px 28px 28px" }}>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5B4B8A", display: "block", marginBottom: 6 }}>
                  FROM SENDER
                </label>
                <select value={sender} onChange={e => setSender(e.target.value)} style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: "1.5px solid #DDD9F0", fontSize: 14, color: "#1A1035",
                  background: "#FAFAFE", outline: "none", cursor: "pointer",
                }}>
                  <option>arjun@outboxlabs.com</option>
                  <option>ops@outboxlabs.com</option>
                  <option>sales@outboxlabs.com</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5B4B8A", display: "block", marginBottom: 6 }}>SUBJECT</label>
                <input
                  value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Enter email subject…"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #DDD9F0", fontSize: 14, color: "#1A1035",
                    background: "#FAFAFE", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5B4B8A", display: "block", marginBottom: 6 }}>BODY</label>
                <textarea
                  value={body} onChange={e => setBody(e.target.value)}
                  placeholder="Write your email body here…"
                  rows={6}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #DDD9F0", fontSize: 14, color: "#1A1035",
                    background: "#FAFAFE", resize: "vertical", outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* CSV Upload */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5B4B8A", display: "block", marginBottom: 6 }}>
                  UPLOAD LEADS (CSV / TXT)
                </label>
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: "2px dashed #C4B8F5", borderRadius: 12, padding: "28px 20px",
                    textAlign: "center", cursor: "pointer", background: "#FAFAFE",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
                  <p style={{ fontSize: 13, color: "#5B4B8A", margin: 0 }}>
                    {emailCount > 0
                      ? <><strong style={{ color: "#8B5CF6" }}>{emailCount} emails</strong> detected — click to reupload</>
                      : "Click to upload CSV or TXT file with email addresses"
                    }
                  </p>
                  <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{ display: "none" }} />
                </div>
                {emailCount > 0 && (
                  <div style={{
                    marginTop: 10, background: "#EAF3DE", borderRadius: 8,
                    padding: "8px 14px", fontSize: 13, color: "#3B6D11", fontWeight: 500,
                  }}>
                    ✓ {emailCount} unique email{emailCount !== 1 ? "s" : ""} will be scheduled
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5B4B8A", display: "block", marginBottom: 6 }}>
                  START TIME
                </label>
                <input
                  type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #DDD9F0", fontSize: 14, color: "#1A1035",
                    background: "#FAFAFE", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#5B4B8A", display: "block", marginBottom: 6 }}>
                    DELAY BETWEEN EMAILS (s)
                  </label>
                  <input
                    type="number" min={1} max={60} value={delay}
                    onChange={e => setDelay(Number(e.target.value))}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1.5px solid #DDD9F0", fontSize: 14, color: "#1A1035",
                      background: "#FAFAFE", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#5B4B8A", display: "block", marginBottom: 6 }}>
                    HOURLY LIMIT
                  </label>
                  <input
                    type="number" min={1} max={500} value={hourlyLimit}
                    onChange={e => setHourlyLimit(Number(e.target.value))}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1.5px solid #DDD9F0", fontSize: 14, color: "#1A1035",
                      background: "#FAFAFE", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Config summary */}
              <div style={{
                background: "#F5F3FF", borderRadius: 12, padding: "14px 16px",
                border: "1px solid #DDD9F0",
              }}>
                <p style={{ fontSize: 12, color: "#5B4B8A", fontWeight: 600, margin: "0 0 8px" }}>SCHEDULE SUMMARY</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    ["Subject", subject || "—"],
                    ["Sender", sender],
                    ["Recipients", emailCount ? `${emailCount} leads` : "No file uploaded"],
                    ["Delay", `${delay}s between sends`],
                    ["Rate limit", `${hourlyLimit} emails/hour`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#7C7A8A" }}>{k}</span>
                      <span style={{ color: "#1A1035", fontWeight: 500, maxWidth: "60%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step === 2 && (
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                border: "1.5px solid #DDD9F0", background: "#FAFAFE",
                color: "#5B4B8A", fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>← Back</button>
            )}
            {step === 1 ? (
              <button
                onClick={() => setStep(2)} disabled={!canNext}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, border: "none",
                  background: canNext ? "linear-gradient(135deg, #7C3AED, #4F46E5)" : "#DDD9F0",
                  color: canNext ? "#fff" : "#A097C0", fontWeight: 700, fontSize: 14,
                  cursor: canNext ? "pointer" : "not-allowed",
                }}
              >Next: Schedule Settings →</button>
            ) : (
              <button
                onClick={handleSubmit} disabled={!canNext || submitting}
                style={{
                  flex: 2, padding: "12px", borderRadius: 12, border: "none",
                  background: canNext ? "linear-gradient(135deg, #7C3AED, #4F46E5)" : "#DDD9F0",
                  color: canNext ? "#fff" : "#A097C0", fontWeight: 700, fontSize: 14,
                  cursor: canNext ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {submitting ? (
                  <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} /> Scheduling…</>
                ) : "Schedule Emails ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    onLogin();
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg, #0E0720 0%, #1A1035 50%, #0D1A3A 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif", position: "relative", overflow: "hidden",
    }}>
      {/* bg decorations */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "15%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "8%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "60%", left: "40%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,184,245,0.06) 0%, transparent 70%)" }} />
      </div>

      <div style={{
        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24,
        padding: "56px 48px", width: "min(420px, 90vw)", textAlign: "center",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 22 }}>✉</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            ReachInbox
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 10px", lineHeight: 1.25 }}>
          Welcome back
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 36px" }}>
          Sign in to manage your email campaigns
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 14,
            background: loading ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 15, fontWeight: 600, color: loading ? "#ccc" : "#1A1035",
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <><div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #aaa", borderTopColor: "#7C3AED", animation: "spin 0.7s linear infinite" }} />Signing in…</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

function Table({ columns, rows, emptyIcon, emptyTitle, emptyDesc, loading }) {
  if (loading) return <Spinner />;
  if (!rows.length) return <EmptyState icon={emptyIcon} title={emptyTitle} desc={emptyDesc} />;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #F0EEF8" }}>
            {columns.map(col => (
              <th key={col.key} style={{
                textAlign: "left", padding: "10px 16px",
                fontSize: 11, fontWeight: 700, color: "#8B7CB0",
                letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap",
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} style={{
              borderBottom: "1px solid #F5F3FF",
              background: i % 2 === 0 ? "transparent" : "rgba(139,92,246,0.015)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(139,92,246,0.015)"}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: "12px 16px", color: "#1A1035", verticalAlign: "middle" }}>
                  {col.render ? col.render(row[col.key], row) : (
                    <span style={{ color: col.muted ? "#7C7A8A" : "#1A1035" }}>{row[col.key]}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatsBar({ scheduled, sent, failed }) {
  const stats = [
    { label: "Scheduled", value: scheduled, color: "#185FA5", bg: "#E6F1FB" },
    { label: "Sent", value: sent, color: "#3B6D11", bg: "#EAF3DE" },
    { label: "Failed", value: failed, color: "#A32D2D", bg: "#FCEBEB" },
    { label: "Total", value: scheduled + sent + failed, color: "#5B4B8A", bg: "#F5F3FF" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: "#fff", borderRadius: 14, padding: "16px 18px",
          border: "1px solid #F0EEF8", boxShadow: "0 1px 4px rgba(90,75,138,0.07)",
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#8B7CB0", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("scheduled");
  const [showCompose, setShowCompose] = useState(false);
  const [scheduledEmails, setScheduledEmails] = useState(MOCK_SCHEDULED);
  const [sentEmails, setSentEmails] = useState(MOCK_SENT);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function switchTab(tab) {
    setActiveTab(tab);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
  }

  function handleSchedule(data) {
    const newEntries = data.emails.length > 0
      ? data.emails.map((email, i) => ({
          id: Date.now() + i,
          to: email,
          subject: data.subject,
          scheduledAt: data.startTime.replace("T", " "),
          status: "scheduled",
          sender: data.sender,
        }))
      : [{
          id: Date.now(),
          to: "lead@example.com",
          subject: data.subject,
          scheduledAt: data.startTime.replace("T", " "),
          status: "scheduled",
          sender: data.sender,
        }];

    setScheduledEmails(prev => [...newEntries, ...prev]);
    showToast(`${newEntries.length} email${newEntries.length > 1 ? "s" : ""} scheduled successfully!`);
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const scheduledColumns = [
    { key: "to", label: "Recipient" },
    { key: "subject", label: "Subject" },
    { key: "sender", label: "Sender", muted: true },
    { key: "scheduledAt", label: "Scheduled At", muted: true },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  const sentColumns = [
    { key: "to", label: "Recipient" },
    { key: "subject", label: "Subject" },
    { key: "sender", label: "Sender", muted: true },
    { key: "sentAt", label: "Sent At", muted: true },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  const failedCount = sentEmails.filter(e => e.status === "failed").length;

  return (
    <div style={{
      minHeight: "100vh", background: "#F7F5FF",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform: translateX(60px); } to { opacity:1; transform: translateX(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD9F0; border-radius: 99px; }
      `}</style>

      {/* Header */}
      <header style={{
        background: "#fff", borderBottom: "1px solid #EDE9F8",
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 12px rgba(90,75,138,0.06)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>✉</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#1A1035", letterSpacing: "-0.3px" }}>ReachInbox</span>
          <span style={{
            background: "#F5F3FF", color: "#7C3AED", fontSize: 10, fontWeight: 700,
            padding: "2px 8px", borderRadius: 6, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>Scheduler</span>
        </div>

        {/* Nav + user */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={() => setShowCompose(true)}
            style={{
              padding: "9px 20px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
              color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            }}
          >
            <span style={{ fontSize: 16 }}>+</span> Compose Email
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={MOCK_USER.avatar} size={34} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1A1035", lineHeight: 1.2 }}>{MOCK_USER.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#8B7CB0" }}>{MOCK_USER.email}</p>
            </div>
            <button
              onClick={() => setLoggedIn(false)}
              style={{
                marginLeft: 8, padding: "6px 12px", borderRadius: 8,
                border: "1px solid #EDE9F8", background: "transparent",
                color: "#8B7CB0", fontSize: 12, cursor: "pointer", fontWeight: 500,
              }}
            >Logout</button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats */}
        <StatsBar
          scheduled={scheduledEmails.length}
          sent={sentEmails.filter(e => e.status === "sent").length}
          failed={failedCount}
        />

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 20,
          border: "1px solid #EDE9F8",
          boxShadow: "0 4px 24px rgba(90,75,138,0.07)",
          overflow: "hidden",
          animation: "slideIn 0.3s ease",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex", borderBottom: "1px solid #F0EEF8",
            padding: "0 24px",
          }}>
            {[
              { id: "scheduled", label: "Scheduled Emails", count: scheduledEmails.length, icon: "🕐" },
              { id: "sent", label: "Sent Emails", count: sentEmails.length, icon: "✅" },
            ].map(tab => (
              <button key={tab.id} onClick={() => switchTab(tab.id)} style={{
                padding: "18px 6px", marginRight: 28,
                border: "none", background: "transparent",
                fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "#7C3AED" : "#8B7CB0",
                borderBottom: activeTab === tab.id ? "2.5px solid #7C3AED" : "2.5px solid transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                marginBottom: -1, transition: "all 0.2s",
              }}>
                <span>{tab.icon}</span>
                {tab.label}
                <span style={{
                  background: activeTab === tab.id ? "#EDE9F8" : "#F7F5FF",
                  color: activeTab === tab.id ? "#7C3AED" : "#A097C0",
                  fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 10,
                }}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Table section */}
          <div style={{ padding: "8px 0" }}>
            {activeTab === "scheduled" && (
              <Table
                columns={scheduledColumns}
                rows={scheduledEmails}
                loading={loading}
                emptyIcon="🕐"
                emptyTitle="No scheduled emails"
                emptyDesc="Compose your first email to get started"
              />
            )}
            {activeTab === "sent" && (
              <Table
                columns={sentColumns}
                rows={sentEmails}
                loading={loading}
                emptyIcon="📭"
                emptyTitle="No sent emails yet"
                emptyDesc="Your sent emails will appear here"
              />
            )}
          </div>
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: 20, display: "flex", alignItems: "center", gap: 20,
          justifyContent: "center",
        }}>
          {[
            ["⚡", "BullMQ + Redis backed"],
            ["🔒", "Idempotent delivery"],
            ["📊", "200 emails/hr limit"],
            ["⏱", "2s delay between sends"],
          ].map(([icon, text]) => (
            <span key={text} style={{ fontSize: 12, color: "#A097C0", display: "flex", alignItems: "center", gap: 5 }}>
              {icon} {text}
            </span>
          ))}
        </div>
      </main>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSchedule={handleSchedule}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28,
          background: toast.type === "success" ? "#1A3A1A" : "#3A1A1A",
          color: "#fff", padding: "14px 20px", borderRadius: 14,
          fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          animation: "toastIn 0.3s ease",
          display: "flex", alignItems: "center", gap: 10, zIndex: 200,
          maxWidth: 360,
        }}>
          <span style={{ fontSize: 18 }}>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
