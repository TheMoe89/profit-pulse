import { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell, LineChart, Line } from "recharts";

const SUPA_URL = "https://ffznfjejdvskicezxzzm.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmem5mamVqZHZza2ljZXp4enptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzM4MTksImV4cCI6MjA5MTg0OTgxOX0.8fXTIWdVP9VVGeuXoxZ4QIbnmxumnNOLrvWu3UjDnEA";
const supa = {
  headers: { "Content-Type": "application/json", "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` },
  async getRequests() {
    const res = await fetch(`${SUPA_URL}/rest/v1/Requests?select=*&order=id.desc`, { headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.map(r => ({ id: r.id, empName: r.emp_name, department: r.department, position: r.position, level: r.level, country: r.country, city: r.city, from: r.from_date, to: r.to_date, days: r.days, daily: r.daily, totalPerDiem: r.total_per_diem, transport: r.transport, finalTotal: r.final_total, createdAt: r.created_at }));
  },
  async saveRequest(r) {
    const res = await fetch(`${SUPA_URL}/rest/v1/Requests`, { method: "POST", headers: { ...this.headers, "Prefer": "return=representation" }, body: JSON.stringify({ emp_name: r.empName, department: r.department, position: r.position, level: r.level, country: r.country, city: r.city, from_date: r.from, to_date: r.to, days: r.days, daily: r.daily, total_per_diem: r.totalPerDiem, transport: r.transport, final_total: r.finalTotal }) });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data[0]?.id;
  },
  async deleteRequest(id) {
    const res = await fetch(`${SUPA_URL}/rest/v1/Requests?id=eq.${id}`, { method: "DELETE", headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
  },
  async getUsers() {
    const res = await fetch(`${SUPA_URL}/rest/v1/Users?select=*&order=id.asc`, { headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },
  async addUser(u) {
    const res = await fetch(`${SUPA_URL}/rest/v1/Users`, { method: "POST", headers: { ...this.headers, "Prefer": "return=representation" }, body: JSON.stringify(u) });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json())[0];
  },
  async updateUser(id, updates) {
    const res = await fetch(`${SUPA_URL}/rest/v1/Users?id=eq.${id}`, { method: "PATCH", headers: { ...this.headers, "Prefer": "return=representation" }, body: JSON.stringify(updates) });
    if (!res.ok) throw new Error(await res.text());
  },
  async deleteUser(id) {
    const res = await fetch(`${SUPA_URL}/rest/v1/Users?id=eq.${id}`, { method: "DELETE", headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
  },
  async login(username, password) {
    const res = await fetch(`${SUPA_URL}/rest/v1/Users?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}&select=*`, { headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data[0] || null;
  },

  // ── OT_Employees ──────────────────────────────────────────────
  async getOTEmployees() {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Employees?select=*&order=id.asc`, { headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.map(e => ({
      id: e.id, name: e.name, department: e.department,
      position: e.position, level: e.level, country: e.country,
      salary: e.salary ?? 0, createdAt: e.created_at,
    }));
  },
  async addOTEmployee(e) {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Employees`, {
      method: "POST",
      headers: { ...this.headers, "Prefer": "return=representation" },
      body: JSON.stringify({ name: e.name, department: e.department, position: e.position, level: e.level, country: e.country, salary: e.salary || null }),
    });
    if (!res.ok) throw new Error(await res.text());
    const row = (await res.json())[0];
    return { id: row.id, name: row.name, department: row.department, position: row.position, level: row.level, country: row.country, salary: row.salary ?? 0 };
  },
  async updateOTEmployee(id, e) {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Employees?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...this.headers, "Prefer": "return=representation" },
      body: JSON.stringify({ name: e.name, department: e.department, position: e.position, level: e.level, country: e.country, salary: e.salary || null }),
    });
    if (!res.ok) throw new Error(await res.text());
  },
  async deleteOTEmployee(id) {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Employees?id=eq.${id}`, { method: "DELETE", headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
  },

  // ── OT_Records ────────────────────────────────────────────────
  async getOTRecords() {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Records?select=*&order=id.desc`, { headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.map(r => ({
      id: r.id, empId: r.emp_id, empName: r.emp_name,
      department: r.department, country: r.country,
      month: r.month, otDate: r.ot_date,
      fromTime: r.from_time, toTime: r.to_time,
      fromTimeLabel: r.from_time_label, toTimeLabel: r.to_time_label,
      overtimeHours: r.overtime_hours, overtimeType: r.overtime_type,
      multiplier: r.multiplier, hourlyRate: r.hourly_rate,
      overtimePay: r.overtime_pay, clientName: r.client_name,
      notes: r.notes, status: r.status,
      submittedBy: r.submitted_by,
      approvalChain: r.approval_chain || [],
      createdAt: r.created_at,
    }));
  },
  async addOTRecord(r) {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Records`, {
      method: "POST",
      headers: { ...this.headers, "Prefer": "return=representation" },
      body: JSON.stringify({
        emp_id: r.empId, emp_name: r.empName,
        department: r.department, country: r.country,
        month: r.month, ot_date: r.otDate,
        from_time: r.fromTime, to_time: r.toTime,
        from_time_label: r.fromTimeLabel, to_time_label: r.toTimeLabel,
        overtime_hours: r.overtimeHours, overtime_type: r.overtimeType,
        multiplier: r.multiplier, hourly_rate: r.hourlyRate,
        overtime_pay: r.overtimePay, client_name: r.clientName,
        notes: r.notes, status: r.status,
        submitted_by: r.submittedBy,
        approval_chain: r.approvalChain,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json())[0]?.id;
  },
  async updateOTRecord(id, updates) {
    // updates can be partial — used for approval chain changes and status
    const mapped = {};
    if (updates.status       !== undefined) mapped.status        = updates.status;
    if (updates.approvalChain !== undefined) mapped.approval_chain = updates.approvalChain;
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Records?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...this.headers, "Prefer": "return=representation" },
      body: JSON.stringify(mapped),
    });
    if (!res.ok) throw new Error(await res.text());
  },
  async deleteOTRecord(id) {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Records?id=eq.${id}`, { method: "DELETE", headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
  },

  // ── OT_ApprovalThresholds ─────────────────────────────────────
  async getOTThresholds() {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_ApprovalThresholds?select=*&order=sort_order.asc`, { headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.map(t => ({
      id: t.id,
      range: t.range_label,
      threshold: t.threshold >= 9999 ? Infinity : t.threshold,
      periodType: t.period_type,
      chain: t.chain || [],
      sortOrder: t.sort_order,
    }));
  },
  async updateOTThreshold(id, updates) {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_ApprovalThresholds?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...this.headers, "Prefer": "return=representation" },
      body: JSON.stringify({
        threshold: updates.threshold === Infinity ? 9999 : updates.threshold,
        period_type: updates.periodType,
        chain: updates.chain,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  // ── OT_Clients ─────────────────────────────────────────────
  async getOTClients() {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Clients?select=*&order=name.asc`, { headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.map(c => ({ id: c.id, name: c.name, code: c.code || "" }));
  },
  async addOTClient(name, code) {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Clients`, {
      method: "POST",
      headers: { ...this.headers, "Prefer": "return=representation" },
      body: JSON.stringify({ name, code: code || null }),
    });
    if (!res.ok) throw new Error(await res.text());
    const row = (await res.json())[0];
    return { id: row.id, name: row.name, code: row.code || "" };
  },
  async deleteOTClient(id) {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Clients?id=eq.${id}`, { method: "DELETE", headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
  },

  // ── OT_Employees — salary update shortcut ────────────────────
  async updateOTSalary(id, salary) {
    const res = await fetch(`${SUPA_URL}/rest/v1/OT_Employees?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...this.headers, "Prefer": "return=representation" },
      body: JSON.stringify({ salary }),
    });
    if (!res.ok) throw new Error(await res.text());
  },
};

const RATES = {
  "First Level Management": { Egypt: 200, KSA: 250, "Arab Countries": 300 },
  "Middle Management": { Egypt: 300, KSA: 350, "Arab Countries": 450 },
};
const TRANSPORT_ALLOWANCE = 120;
const COUNTRIES = ["Egypt", "KSA", "Arab Countries"];
const POSITION_LEVELS = ["First Level Management", "Middle Management"];
const DEPT_COLORS = ["#3b82f6","#22c55e","#f59e0b","#ec4899","#8b5cf6","#06b6d4","#f97316","#14b8a6"];

const initialEmployees = [
  { id: 1, name: "Ahmed Al-Rashidi", department: "Finance", position: "Finance Manager", level: "Middle Management" },
  { id: 2, name: "Sara Al-Otaibi", department: "HR", position: "HR Specialist", level: "First Level Management" },
  { id: 3, name: "Khalid Mansour", department: "Operations", position: "Operations Director", level: "Middle Management" },
];

const initialCities = [
  { id: 1, name: "Cairo", country: "Egypt" },
  { id: 2, name: "Alexandria", country: "Egypt" },
  { id: 3, name: "Riyadh", country: "KSA" },
  { id: 4, name: "Jeddah", country: "KSA" },
  { id: 5, name: "Dubai", country: "Arab Countries" },
  { id: 6, name: "Amman", country: "Arab Countries" },
];

function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
function daysBetween(from, to) {
  if (!from || !to) return 0;
  const d1 = new Date(from), d2 = new Date(to);
  return Math.max(0, Math.round((d2 - d1) / 86400000) + 1);
}
function getMonthKey(dateStr) {
  if (!dateStr) return "";
  const [y, m] = dateStr.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${y}`;
}

const ACQ = {
  teal:       "#3ECFB2",
  tealDark:   "#2aab92",
  tealGlow:   "rgba(62,207,178,0.15)",
  tealBorder: "rgba(62,207,178,0.25)",
  bg:         "#1a1a1a",
  bgCard:     "#222222",
  bgCardHover:"#272727",
  surface:    "rgba(255,255,255,0.04)",
  border:     "rgba(255,255,255,0.08)",
  text:       "#ffffff",
  textMuted:  "#888888",
  textSub:    "#aaaaaa",
};

const S = {
  app: { minHeight: "100vh", background: ACQ.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: ACQ.text },
  header: { background: "#111111", borderBottom: `1px solid ${ACQ.tealBorder}`, padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "68px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 32px rgba(0,0,0,0.6)", flexWrap: "wrap", gap: "8px", paddingTop: "10px", paddingBottom: "10px" },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { width: 34, height: 34, background: ACQ.teal, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoText: { fontSize: "1rem", fontWeight: 800, color: ACQ.text, letterSpacing: "-0.01em" },
  logoSub: { fontSize: "0.6rem", color: ACQ.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 },
  nav: { display: "flex", gap: "3px", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "4px", flexWrap: "wrap", justifyContent: "center" },
  navBtn: (active) => ({ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.02em", transition: "all 0.2s", background: active ? ACQ.teal : "transparent", color: active ? "#111" : ACQ.textMuted, whiteSpace: "nowrap" }),
  main: { maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem" },
  card: { background: ACQ.bgCard, border: `1px solid ${ACQ.border}`, borderRadius: 14, padding: "1.2rem", marginBottom: "1rem" },
  cardTitle: { fontSize: "0.95rem", fontWeight: 700, color: ACQ.text, marginBottom: "1.2rem", letterSpacing: "0.03em", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  dot: { width: 8, height: 8, borderRadius: "50%", background: ACQ.teal, display: "inline-block", flexShrink: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" },
  label: { fontSize: "0.78rem", color: ACQ.textMuted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, display: "block" },
  input: { width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${ACQ.border}`, borderRadius: 10, padding: "10px 14px", color: ACQ.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" },
  inputDisabled: { width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", color: "#444", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", cursor: "not-allowed" },
  inputError: { width: "100%", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.4)", borderRadius: 10, padding: "10px 14px", color: ACQ.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" },
  readOnly: { width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", color: "#555", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" },
  errorMsg: { color: "#ff6b6b", fontSize: "0.73rem", marginTop: 4 },
  hintMsg: { color: "#555", fontSize: "0.73rem", marginTop: 4 },
  btnPrimary: { background: ACQ.teal, border: "none", borderRadius: 10, padding: "12px 28px", color: "#111", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", letterSpacing: "0.04em" },
  btnSecondary: { background: "rgba(255,255,255,0.06)", border: `1px solid ${ACQ.border}`, borderRadius: 10, padding: "10px 20px", color: ACQ.textSub, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" },
  btnSuccess: { background: ACQ.teal, border: "none", borderRadius: 10, padding: "12px 28px", color: "#111", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" },
  btnRow: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.2rem", flexWrap: "wrap" },
  result: { background: `rgba(62,207,178,0.06)`, border: `1px solid ${ACQ.tealBorder}`, borderRadius: 16, padding: "1.8rem", marginTop: "1.5rem" },
  resultGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.2rem" },
  resultRow: { display: "flex", flexDirection: "column", gap: 2 },
  resultLabel: { fontSize: "0.72rem", color: ACQ.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 },
  resultValue: { fontSize: "0.95rem", color: ACQ.text, fontWeight: 600 },
  totalBox: { background: ACQ.teal, borderRadius: 12, padding: "1.2rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" },
  totalLabel: { fontSize: "0.85rem", color: "rgba(0,0,0,0.7)", fontWeight: 700, letterSpacing: "0.05em" },
  totalValue: { fontSize: "1.6rem", color: "#111", fontWeight: 800 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 14px", fontSize: "0.72rem", color: ACQ.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${ACQ.border}`, fontWeight: 700 },
  td: { padding: "11px 14px", fontSize: "0.85rem", color: ACQ.textSub, borderBottom: `1px solid rgba(255,255,255,0.04)` },
  countryBadge: (country) => {
    const map = { Egypt: ["rgba(255,193,7,0.12)","#f5c518","rgba(255,193,7,0.25)"], KSA: ["rgba(62,207,178,0.12)",ACQ.teal,"rgba(62,207,178,0.25)"], "Arab Countries": ["rgba(255,255,255,0.06)","#aaa","rgba(255,255,255,0.12)"] };
    const [bg, color, border] = map[country] || ["rgba(255,255,255,0.06)","#aaa","rgba(255,255,255,0.12)"];
    return { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", background: bg, color, border: `1px solid ${border}` };
  },
  levelBadge: (level) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, background: level === "Middle Management" ? `rgba(62,207,178,0.15)` : "rgba(255,255,255,0.06)", color: level === "Middle Management" ? ACQ.teal : "#aaa", border: `1px solid ${level === "Middle Management" ? ACQ.tealBorder : "rgba(255,255,255,0.1)"}` }),
  toast: (type) => ({ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "success" ? ACQ.teal : "#e34a4a", color: type === "success" ? "#111" : "#fff", borderRadius: 12, padding: "12px 22px", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", animation: "fadeIn 0.3s" }),
  removeBtn: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 7, padding: "4px 12px", color: "#ff6b6b", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 },
};

// ── Dashboard helpers ──────────────────────────────────────────
function buildDashboardData(requests) {
  const totalSpend = requests.reduce((s, r) => s + r.finalTotal, 0);
  const totalDays = requests.reduce((s, r) => s + r.days, 0);
  const depts = [...new Set(requests.map(r => r.department))];

  // Expenditure by Department (bar)
  const byDept = depts.map(dept => ({
    department: dept,
    total: requests.filter(r => r.department === dept).reduce((s, r) => s + r.finalTotal, 0),
  }));

  // Monthly by Department
  const monthKeys = [...new Set(requests.map(r => getMonthKey(r.from)))].sort((a, b) => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const [ma, ya] = a.split(" "); const [mb, yb] = b.split(" ");
    return ya !== yb ? parseInt(ya) - parseInt(yb) : months.indexOf(ma) - months.indexOf(mb);
  });

  const monthly = monthKeys.map(month => {
    const row = { month };
    depts.forEach(dept => {
      row[dept] = requests.filter(r => getMonthKey(r.from) === month && r.department === dept).reduce((s, r) => s + r.finalTotal, 0);
    });
    return row;
  });

  // Dept breakdown table
  const breakdown = depts.map(dept => {
    const dReqs = requests.filter(r => r.department === dept);
    return { dept, count: dReqs.length, days: dReqs.reduce((s, r) => s + r.days, 0), spend: dReqs.reduce((s, r) => s + r.finalTotal, 0) };
  }).sort((a, b) => b.spend - a.spend);

  return { totalSpend, totalDays, depts, byDept, monthly, breakdown };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111", border: "1px solid rgba(62,207,178,0.25)", borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ color: "#3ECFB2", fontSize: "0.78rem", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>{p.name}: {p.value?.toLocaleString()} SAR</div>
      ))}
    </div>
  );
};

// ── Custom Booking-style Date Range Picker ────────────────────
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function toYMD(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function parseYMD(str) {
  if (!str) return null;
  const [y,m,d] = str.split("-").map(Number);
  return new Date(y, m-1, d);
}
function sameDay(a, b) {
  return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function isBetween(d, start, end) {
  if (!start || !end) return false;
  return d > start && d < end;
}

function DateRangePicker({ from, to, onChange, errorFrom, errorTo }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [view, setView] = useState("days");
  const [yearRangeStart, setYearRangeStart] = useState(null);
  const [calPos, setCalPos] = useState({ top: 0, left: 0 });
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const ref = useRef();
  const triggerRef = useRef();

  const fromDate = parseYMD(from);
  const toDate = parseYMD(to);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setView("days"); }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openCalendar() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const calWidth = 300;
      const calHeight = 380;
      let left = rect.left;
      if (left + calWidth > window.innerWidth - 16) {
        left = window.innerWidth - calWidth - 16;
      }
      if (left < 16) left = 16;
      // Always open upward
      const top = rect.top - calHeight - 8;
      setCalPos({ top: Math.max(8, top), left });
    }
    setOpen(o => !o);
    setView("days");
  }

  // Year grid: show 12 years at a time
  const yStart = yearRangeStart ?? (Math.floor(viewYear / 12) * 12);
  const yearGrid = Array.from({ length: 12 }, (_, i) => yStart + i);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); }
    else setViewMonth(m => m-1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); }
    else setViewMonth(m => m+1);
  }

  function getDays() {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    return cells;
  }

  function handleDayClick(day) {
    if (!day) return;
    const ymd = toYMD(day);
    if (!from || (from && to) || ymd < from) {
      // Start fresh — set from, clear to
      onChange({ from: ymd, to: "" });
    } else if (ymd === from && !to) {
      // Same day clicked again → 1-day trip
      onChange({ from: ymd, to: ymd });
      setOpen(false); setView("days");
    } else {
      onChange({ from, to: ymd });
      setOpen(false); setView("days");
    }
  }

  function getDayStyle(day) {
    if (!day) return {};
    const ymd = toYMD(day);
    const isFrom = from && sameDay(day, fromDate);
    const isTo = to && sameDay(day, toDate);
    const isInRange = fromDate && (toDate || hovered) && isBetween(day, fromDate, toDate || hovered);
    const isHoverEnd = hovered && from && !to && sameDay(day, hovered) && toYMD(hovered) > from;
    const isPast = day < new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let bg = "transparent", color = "#c8dde8", borderRadius = "50%", fontWeight = 400;
    if (isPast) color = "#3a5a6a";
    if (isInRange) { bg = "rgba(26,143,227,0.18)"; borderRadius = "0"; color = "#e8f4ff"; }
    if (isFrom) { bg = "linear-gradient(135deg,#1a8fe3,#0dd3b4)"; color = "#fff"; fontWeight = 700; borderRadius = isInRange || (fromDate && (toDate||hovered) && toYMD(day) < (to||toYMD(hovered||day))) ? "50% 0 0 50%" : "50%"; }
    if (isTo || isHoverEnd) { bg = "linear-gradient(135deg,#1a8fe3,#0dd3b4)"; color = "#fff"; fontWeight = 700; borderRadius = "0 50% 50% 0"; }
    if (isFrom && (isTo || (from===to))) { borderRadius = "50%"; }
    return { background: bg, color, borderRadius, fontWeight, cursor: isPast ? "default" : "pointer", opacity: isPast ? 0.4 : 1 };
  }

  const hasError = errorFrom || errorTo;
  const totalDays = from && to ? daysBetween(from, to) : null;
  const days = getDays();

  // Shared popup container style
  const popupStyle = {
    position: "fixed",
    top: calPos.top,
    left: calPos.left,
    zIndex: 9999,
    background: "#111",
    border: "1px solid rgba(62,207,178,0.2)",
    borderRadius: 14,
    padding: "0.9rem",
    boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
    width: 300,
    boxSizing: "border-box",
  };

  const navBtnStyle = { background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, color: "#aaa", cursor: "pointer", fontSize: 16 };
  const titleBtnStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 14px", fontWeight: 700, color: "#fff", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 };

  return (
    <div ref={ref} style={{ position: "relative", gridColumn: "1 / -1", width: "100%", overflow: "visible" }}>
      {/* Trigger field */}
      <div ref={triggerRef} onClick={openCalendar} style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px",
        background: hasError ? "rgba(255,100,100,0.3)" : "rgba(100,200,255,0.15)",
        borderRadius: 10, overflow: "hidden", cursor: "pointer",
      }}>
        {[
          { label: "TRAVEL FROM DATE *", val: from ? formatDate(from) : "Select date", err: errorFrom },
          { label: "TRAVEL TO DATE *", val: to ? formatDate(to) : "Select date", err: errorTo },
        ].map(({ label, val, err }) => (
          <div key={label} style={{ background: err ? "rgba(255,100,100,0.08)" : "rgba(255,255,255,0.04)", padding: "10px 14px", borderBottom: err ? "2px solid rgba(255,100,100,0.5)" : "none" }}>
            <div style={{ fontSize: "0.68rem", color: err ? "#ff7070" : "#7ab3d4", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: "0.92rem", color: val.includes("Select") ? "#4a7a9a" : "#e8f4ff", fontWeight: val.includes("Select") ? 400 : 600, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7ab3d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {val}
            </div>
            {err && <div style={{ fontSize: "0.7rem", color: "#ff7070", marginTop: 2 }}>{err}</div>}
          </div>
        ))}
      </div>

      {open && (
        <div style={popupStyle}>

          {/* ── YEAR PICKER ── */}
          {view === "years" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <button style={navBtnStyle} onClick={() => setYearRangeStart(yStart - 12)}>‹</button>
                <div style={{ fontWeight: 700, color: "#e8f4ff", fontSize: "0.9rem" }}>{yStart} – {yStart + 11}</div>
                <button style={navBtnStyle} onClick={() => setYearRangeStart(yStart + 12)}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {yearGrid.map(yr => (
                  <button key={yr} onClick={() => { setViewYear(yr); setYearRangeStart(null); setView("months"); }}
                    style={{ background: yr === viewYear ? "linear-gradient(135deg,#1a8fe3,#0dd3b4)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "10px 0", color: yr === viewYear ? "#fff" : "#c8dde8", fontWeight: yr === viewYear ? 700 : 400, fontSize: "0.88rem", cursor: "pointer" }}>
                    {yr}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: "1rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(100,200,255,0.08)" }}>
                <button onClick={() => setView("days")} style={{ background: "none", border: "none", color: "#7ab3d4", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>← Back</button>
              </div>
            </>
          )}

          {/* ── MONTH PICKER ── */}
          {view === "months" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <button style={navBtnStyle} onClick={() => setViewYear(y => y-1)}>‹</button>
                <button style={titleBtnStyle} onClick={() => setView("years")}>{viewYear} ▾</button>
                <button style={navBtnStyle} onClick={() => setViewYear(y => y+1)}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                {MONTH_NAMES.map((mn, mi) => (
                  <button key={mn} onClick={() => { setViewMonth(mi); setView("days"); }}
                    style={{ background: mi === viewMonth && viewYear === today.getFullYear() ? "linear-gradient(135deg,#1a8fe3,#0dd3b4)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "10px 0", color: mi === viewMonth ? "#fff" : "#c8dde8", fontWeight: mi === viewMonth ? 700 : 400, fontSize: "0.82rem", cursor: "pointer" }}>
                    {mn.slice(0,3)}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: "1rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(100,200,255,0.08)" }}>
                <button onClick={() => setView("years")} style={{ background: "none", border: "none", color: "#7ab3d4", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>← Back to Years</button>
              </div>
            </>
          )}

          {/* ── DAY PICKER ── */}
          {view === "days" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <button style={navBtnStyle} onClick={prevMonth}>‹</button>
                <button style={{ ...titleBtnStyle, fontSize: "0.82rem" }} onClick={() => { setYearRangeStart(null); setView("years"); }}>
                  {MONTH_NAMES[viewMonth]} {viewYear} ▾
                </button>
                <button style={navBtnStyle} onClick={nextMonth}>›</button>
              </div>

              <div style={{ textAlign: "center", fontSize: "0.65rem", color: "#4a7a9a", marginBottom: "0.5rem", fontWeight: 600, letterSpacing: "0.04em" }}>
                {!from ? "SELECT DEPARTURE DATE" : !to ? "SELECT RETURN DATE" : `✓ ${daysBetween(from,to)} DAY${daysBetween(from,to)!==1?"S":""} SELECTED`}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 2 }}>
                {DAY_NAMES.map(d => <div key={d} style={{ textAlign: "center", fontSize: "0.62rem", color: "#4a7a9a", fontWeight: 700, padding: "3px 0" }}>{d}</div>)}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "1px" }}>
                {days.map((day, i) => {
                  const ds = day ? getDayStyle(day) : {};
                  return (
                    <div key={i}
                      onClick={() => day && !(day < new Date(today.getFullYear(),today.getMonth(),today.getDate())) && handleDayClick(day)}
                      onMouseEnter={() => day && from && !to && setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", transition: "all 0.1s", background: ds.background || "transparent", color: ds.color || "transparent", borderRadius: ds.borderRadius || "50%", fontWeight: ds.fontWeight || 400, cursor: ds.cursor || "default", opacity: ds.opacity ?? 1 }}
                    >
                      {day ? day.getDate() : ""}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(100,200,255,0.08)" }}>
                <button onClick={() => { onChange({ from: "", to: "" }); }} style={{ background: "none", border: "none", color: "#7ab3d4", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>Clear</button>
                {totalDays !== null && (
                  <div style={{ fontSize: "0.75rem", color: "#0dd3b4", fontWeight: 700 }}>
                    {totalDays} day{totalDays !== 1 ? "s" : ""}
                  </div>
                )}
                {from && to && (
                  <button onClick={() => { setOpen(false); setView("days"); }} style={{ background: "linear-gradient(135deg,#1a8fe3,#0dd3b4)", border: "none", borderRadius: 7, padding: "5px 12px", color: "#fff", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>Done ✓</button>
                )}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function EmpSearch({ employees, value, onChange, error, inputStyle }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const selectedEmp = employees.find(e => e.id === Number(value));

  // Filter employees by typed query
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleSelect(emp) {
    onChange(emp.id);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onChange("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder={selectedEmp ? selectedEmp.name : "Type or select employee..."}
          value={open ? query : (selectedEmp ? selectedEmp.name : query)}
          onChange={e => { setQuery(e.target.value); setOpen(true); onChange(""); }}
          onFocus={() => { setOpen(true); setQuery(""); }}
          style={{
            ...inputStyle,
            paddingRight: 36,
            color: selectedEmp && !open ? "#3ECFB2" : undefined,
            fontWeight: selectedEmp && !open ? 600 : undefined,
          }}
        />
        {/* Clear or dropdown arrow */}
        {selectedEmp ? (
          <button onClick={handleClear} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "1rem", padding: 0 }}>✕</button>
        ) : (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: "0.7rem", pointerEvents: "none" }}>▼</span>
        )}
      </div>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#1a2a3a", border: "1px solid rgba(62,207,178,0.25)",
          borderRadius: 10, zIndex: 9999, maxHeight: 220, overflowY: "auto",
          boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 16px", color: "#555", fontSize: "0.82rem" }}>No employees found</div>
          ) : (
            filtered.map(emp => (
              <div
                key={emp.id}
                onClick={() => handleSelect(emp)}
                style={{
                  padding: "10px 16px", cursor: "pointer", fontSize: "0.85rem",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: emp.id === Number(value) ? "rgba(62,207,178,0.1)" : "transparent",
                  color: emp.id === Number(value) ? "#3ECFB2" : "#e8f4ff",
                  fontWeight: emp.id === Number(value) ? 700 : 400,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(62,207,178,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = emp.id === Number(value) ? "rgba(62,207,178,0.1)" : "transparent"}
              >
                <div>{emp.name}</div>
                <div style={{ fontSize: "0.72rem", color: "#7ab3d4", marginTop: 2 }}>{emp.department} · {emp.position}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function PerDiemModule({ currentUser, handleLogout, activeModuleLabel = "Per Diem" }) {
  const [tab, setTab] = useState("dashboard");

  // Use platform-wide permission helpers — Per Diem tab keys
  const canAccess = (t) => canAccessTab(currentUser, "perdiem", t);

  // Per Diem tabs — Admin tab removed (now a global platform panel)
  const ALL_TABS = PLATFORM_MODULES.find(m => m.id === "perdiem")?.tabs.filter(t => t.key !== "admin") || [];


  const [employees, setEmployees] = useState(initialEmployees);
  const [cities, setCities] = useState(initialCities);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [form, setForm] = useState({ empId: "", country: "", city: "", from: "", to: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [empForm, setEmpForm] = useState({ name: "", department: "", position: "", level: "First Level Management" });
  const [empErrors, setEmpErrors] = useState({});
  const [cityForm, setCityForm] = useState({ name: "", country: "KSA" });
  const [cityErrors, setCityErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [previewReq, setPreviewReq] = useState(null);
  const [unlockedRows, setUnlockedRows] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [lockModal, setLockModal] = useState(null);
  const [lockPassword, setLockPassword] = useState("");
  const [lockError, setLockError] = useState(false);
  const ADMIN_PASSWORD = "Acquaint2026";
  const [reportFilters, setReportFilters] = useState({ preset: "all", dateFrom: "", dateTo: "", department: "all", country: "all", level: "all", employee: "all", groupBy: "department" });
  const [dbOpen, setDbOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const importRef = useRef();
  const resultRef = useRef();
  const dbRef = useRef();

  useEffect(() => {
    function handleOutside(e) {
      if (dbRef.current && !dbRef.current.contains(e.target)) setDbOpen(false);
      if (importRef.current && !importRef.current.contains(e.target)) setImportOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Load requests from Supabase on mount
  useEffect(() => {
    supa.getRequests()
      .then(data => { setRequests(data); setLoadingRequests(false); })
      .catch(err => { setLoadingRequests(false); showToast(`DB Error: ${err.message}`, "error"); });
  }, []);

  const selectedEmp = employees.find(e => e.id === Number(form.empId));
  const citiesForCountry = cities.filter(c => c.country === form.country);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function validate() {
    const e = {};
    if (!form.empId) e.empId = "Select an employee";
    if (!form.country) e.country = "Select a destination country";
    if (form.country && citiesForCountry.length === 0) e.city = `No cities added for ${form.country} yet — go to the Cities tab`;
    else if (!form.city) e.city = "Select a destination city";
    if (!form.from) e.from = "Required";
    if (!form.to) e.to = "Required";
    if (form.from && form.to && form.to < form.from) e.to = "End date cannot be before start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    const emp = employees.find(e => e.id === Number(form.empId));
    const days = daysBetween(form.from, form.to);
    const daily = RATES[emp.level][form.country];
    const totalPerDiem = daily * days;
    const finalTotal = totalPerDiem + TRANSPORT_ALLOWANCE;
    const r = { id: Date.now(), empName: emp.name, department: emp.department, position: emp.position, level: emp.level, country: form.country, city: form.city, from: form.from, to: form.to, days, daily, totalPerDiem, transport: TRANSPORT_ALLOWANCE, finalTotal };
    setResult(r);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleSave() {
    if (!result) return;
    try {
      const dbId = await supa.saveRequest(result);
      const saved = { ...result, id: dbId ?? result.id };
      setRequests(prev => [saved, ...prev]);
      showToast("Request saved successfully!");
      setResult(null);
      setForm({ empId: "", country: "", city: "", from: "", to: "" });
    } catch (err) {
      showToast("Failed to save request", "error");
    }
  }

  async function deleteRequest(id) {
    try {
      await supa.deleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      setUnlockedRows(prev => { const n = {...prev}; delete n[id]; return n; });
      setConfirmDelete(null);
      showToast("Request deleted.");
    } catch (err) {
      showToast("Failed to delete request", "error");
    }
  }

  function handleUnlockRow() {
    if (lockPassword === ADMIN_PASSWORD) {
      setUnlockedRows(prev => ({ ...prev, [lockModal]: true }));
      setLockModal(null);
      setLockPassword("");
      setLockError(false);
    } else {
      setLockError(true);
    }
  }

  function validateEmp() {
    const e = {};
    if (!empForm.name.trim()) e.name = "Required";
    if (!empForm.department.trim()) e.department = "Required";
    if (!empForm.position.trim()) e.position = "Required";
    setEmpErrors(e);
    return Object.keys(e).length === 0;
  }
  function addEmployee() {
    if (!validateEmp()) return;
    setEmployees(prev => [...prev, { id: Date.now(), ...empForm }]);
    setEmpForm({ name: "", department: "", position: "", level: "First Level Management" });
    setEmpErrors({});
    showToast("Employee added!");
  }

  function downloadEmpTemplate() {
    const csv = [
      "Employee Name,Department,Position,Position Level",
      "Ahmed Al-Rashidi,Finance,Finance Manager,Middle Management",
      "Sara Al-Otaibi,HR,HR Specialist,First Level Management",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "employees_template.csv";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    setImportOpen(false);
  }

  function handleImportCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n").map(l => l.trim()).filter(Boolean);
      const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
      const nameIdx = headers.findIndex(h => h.includes("name"));
      const deptIdx = headers.findIndex(h => h.includes("department") || h.includes("dept"));
      const posIdx  = headers.findIndex(h => h.includes("position") && !h.includes("level"));
      const levIdx  = headers.findIndex(h => h.includes("level"));
      if (nameIdx === -1) { showToast("CSV must have an 'Employee Name' column", "error"); return; }
      const imported = []; const skipped = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        const name = cols[nameIdx];
        if (!name) continue;
        const dept   = deptIdx !== -1 ? cols[deptIdx] : "";
        const pos    = posIdx  !== -1 ? cols[posIdx]  : "";
        const rawLev = levIdx  !== -1 ? cols[levIdx]  : "";
        let level = "First Level Management";
        if (rawLev.toLowerCase().includes("middle") || rawLev.toLowerCase().includes("mm")) level = "Middle Management";
        if (employees.find(emp => emp.name.toLowerCase() === name.toLowerCase())) { skipped.push(name); continue; }
        imported.push({ id: Date.now() + i, name, department: dept, position: pos, level });
      }
      if (imported.length > 0) {
        setEmployees(prev => [...prev, ...imported]);
        showToast(`✅ Imported ${imported.length} employee${imported.length > 1 ? "s" : ""}${skipped.length > 0 ? ` · ${skipped.length} skipped (duplicate)` : ""}`);
      } else {
        showToast("No new employees found in CSV", "error");
      }
      setImportOpen(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  function removeEmployee(id) { setEmployees(prev => prev.filter(e => e.id !== id)); }

  function validateCity() {
    const e = {};
    if (!cityForm.name.trim()) e.name = "City name is required";
    else if (cities.find(c => c.name.toLowerCase() === cityForm.name.trim().toLowerCase() && c.country === cityForm.country)) e.name = "This city already exists for that country";
    setCityErrors(e);
    return Object.keys(e).length === 0;
  }
  function addCity() {
    if (!validateCity()) return;
    setCities(prev => [...prev, { id: Date.now(), name: cityForm.name.trim(), country: cityForm.country }]);
    setCityForm(f => ({ ...f, name: "" }));
    setCityErrors({});
    showToast("City added!");
  }
  function removeCity(id) { setCities(prev => prev.filter(c => c.id !== id)); }

  // Dashboard data
  const dash = buildDashboardData(requests);
  const uniqueDepts = [...new Set(requests.map(r => r.department))];

  function downloadPDF(r) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Per Diem Request - ${r.empName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a2a3a; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 3px solid #1a8fe3; }
    .brand { display: flex; flex-direction: column; gap: 4px; }
    .brand-title { font-size: 22px; font-weight: 800; color: #1a8fe3; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #7ab3d4; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .doc-meta { text-align: right; }
    .doc-id { font-size: 11px; color: #999; margin-bottom: 4px; }
    .doc-date { font-size: 12px; color: #444; font-weight: 600; }
    .doc-title { font-size: 18px; font-weight: 800; color: #1a2a3a; margin-bottom: 28px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 11px; font-weight: 700; color: #1a8fe3; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e8f0f8; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #e0e8f0; border-radius: 8px; overflow: hidden; }
    .grid-item { padding: 12px 16px; border-bottom: 1px solid #e0e8f0; }
    .grid-item:nth-last-child(-n+2) { border-bottom: none; }
    .grid-item label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; display: block; margin-bottom: 4px; }
    .grid-item value { font-size: 13px; color: #1a2a3a; font-weight: 600; display: block; }
    .calc-table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e0e8f0; }
    .calc-table tr:not(:last-child) td { border-bottom: 1px solid #e0e8f0; }
    .calc-table td { padding: 11px 16px; font-size: 13px; }
    .calc-table td:last-child { text-align: right; font-weight: 600; color: #1a2a3a; }
    .calc-table td:first-child { color: #555; }
    .calc-table tr.highlight td { background: #f0f7ff; }
    .total-box { background: linear-gradient(135deg, #1a8fe3, #0dd3b4); border-radius: 10px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
    .total-box .label { color: rgba(255,255,255,0.85); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .total-box .amount { color: #fff; font-size: 26px; font-weight: 800; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e0e8f0; display: flex; justify-content: space-between; align-items: center; }
    .footer-note { font-size: 10px; color: #aaa; }
    .sig-block { display: flex; gap: 48px; }
    .sig { text-align: center; }
    .sig-line { width: 140px; border-bottom: 1px solid #ccc; margin-bottom: 6px; height: 36px; }
    .sig-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.8px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #e8f4ff; color: #1a8fe3; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-title">Per Diem Calculator</div>
      <div class="brand-sub">HR & Finance Portal</div>
    </div>
    <div class="doc-meta">
      <div class="doc-id">REQUEST #${String(r.id).slice(-6)}</div>
      <div class="doc-date">Issued: ${new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" })}</div>
    </div>
  </div>

  <div class="doc-title">Business Travel Per Diem Request</div>

  <div class="section">
    <div class="section-title">Employee Information</div>
    <div class="grid">
      <div class="grid-item"><label>Employee Name</label><value>${r.empName}</value></div>
      <div class="grid-item"><label>Department</label><value>${r.department}</value></div>
      <div class="grid-item"><label>Position</label><value>${r.position}</value></div>
      <div class="grid-item"><label>Position Level</label><value><span class="badge">${r.level}</span></value></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Travel Details</div>
    <div class="grid">
      <div class="grid-item"><label>Destination Country</label><value>${r.country}</value></div>
      <div class="grid-item"><label>Destination City</label><value>${r.city}</value></div>
      <div class="grid-item"><label>Travel From</label><value>${formatDate(r.from)}</value></div>
      <div class="grid-item"><label>Travel To</label><value>${formatDate(r.to)}</value></div>
      <div class="grid-item" style="grid-column:1/-1"><label>Number of Travel Days</label><value>${r.days} day${r.days !== 1 ? "s" : ""}</value></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Allowance Calculation</div>
    <table class="calc-table">
      <tr><td>Daily Per Diem Rate (${r.level} — ${r.country})</td><td>${r.daily.toLocaleString()} SAR / day</td></tr>
      <tr><td>Number of Days</td><td>${r.days} day${r.days !== 1 ? "s" : ""}</td></tr>
      <tr class="highlight"><td>Total Per Diem (${r.daily} × ${r.days})</td><td>${r.totalPerDiem.toLocaleString()} SAR</td></tr>
      <tr><td>Transportation Allowance (Fixed)</td><td>${r.transport.toLocaleString()} SAR</td></tr>
    </table>
    <div class="total-box">
      <div class="label">Final Total Amount Payable</div>
      <div class="amount">${r.finalTotal.toLocaleString()} SAR</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-note">Generated by Per Diem Calculator · HR & Finance Portal<br/>This document is system-generated and valid without a physical signature unless required by policy.</div>
    <div class="sig-block">
      <div class="sig"><div class="sig-line"></div><div class="sig-label">Employee Signature</div></div>
      <div class="sig"><div class="sig-line"></div><div class="sig-label">Finance Approval</div></div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PerDiem_${r.empName.replace(/\s+/g, "_")}_${r.from}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── LOGIN SCREEN ──

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        select option { background: #1a2a3a; color: #e8f4ff; }
        input[type="date"] { cursor: pointer; position: relative; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6);
          cursor: pointer;
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%; height: 100%;
          opacity: 0;
        }
        .recharts-wrapper { cursor: default !important; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; padding: 2rem; }
        }
        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 768px) {
          .acq-header { padding: 0 1rem !important; height: auto !important; flex-wrap: wrap; padding-top: 10px !important; padding-bottom: 10px !important; gap: 8px; }
          .acq-nav { width: 100%; justify-content: center; gap: 3px !important; }
          .acq-nav button { padding: 6px 10px !important; font-size: 0.72rem !important; }
          .acq-main { padding: 1rem !important; }
          .acq-grid { grid-template-columns: 1fr !important; }
          .acq-card { padding: 1.2rem !important; border-radius: 12px !important; }
          .acq-kpi-grid { grid-template-columns: 1fr 1fr !important; gap: 0.7rem !important; }
          .acq-result-grid { grid-template-columns: 1fr 1fr !important; }
          .acq-btn-row { justify-content: stretch !important; }
          .acq-btn-row button { flex: 1; }
        }
        @media (max-width: 480px) {
          .acq-kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .acq-result-grid { grid-template-columns: 1fr !important; }
        }
        .recharts-wrapper { cursor: default !important; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; padding: 2rem; }
        }
        .light-card { background: #ffffff !important; border-color: rgba(0,0,0,0.08) !important; }
        .light-input { background: rgba(0,0,0,0.04) !important; border-color: rgba(0,0,0,0.1) !important; color: #111 !important; }
      `}</style>

      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}

      <div style={S.header}>
        <div style={S.logo}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#e8f4ff", letterSpacing: "-0.02em" }}>{activeModuleLabel}</div>
        </div>
        <nav style={S.nav}>
          {canAccess("dashboard") && <button key="dashboard" style={S.navBtn(tab === "dashboard")} onClick={() => { setTab("dashboard"); setDbOpen(false); }}>📊 Dashboard</button>}
          {canAccess("form") && <button key="form" style={S.navBtn(tab === "form")} onClick={() => { setTab("form"); setDbOpen(false); }}>🧾 New Request</button>}
          {canAccess("requests") && <button key="requests" style={S.navBtn(tab === "requests")} onClick={() => { setTab("requests"); setDbOpen(false); }}>📋 Requests</button>}
          {canAccess("reports") && (
            <button style={{ ...S.navBtn(tab === "reports"), display: "flex", alignItems: "center", gap: 6 }} onClick={() => { setTab("reports"); setDbOpen(false); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Reports
            </button>
          )}
          {/* Database dropdown — only if has access to employees or cities */}
          {(canAccess("employees") || canAccess("cities")) && (
            <div style={{ position: "relative" }} ref={dbRef}>
              <button style={{ ...S.navBtn(tab === "employees" || tab === "cities"), display: "flex", alignItems: "center", gap: 6 }} onClick={() => setDbOpen(o => !o)}>
                🗄️ Database <span style={{ fontSize: "0.65rem", opacity: 0.7, marginLeft: 2 }}>{dbOpen ? "▲" : "▼"}</span>
              </button>
              {dbOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 999, background: "#111", border: "1px solid rgba(62,207,178,0.2)", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 36px rgba(0,0,0,0.7)", minWidth: 160 }}>
                  {canAccess("employees") && <button onClick={() => { setTab("employees"); setDbOpen(false); }} style={{ display: "block", width: "100%", padding: "11px 18px", border: "none", background: tab === "employees" ? "rgba(62,207,178,0.1)" : "transparent", color: tab === "employees" ? "#3ECFB2" : "#aaa", fontSize: "0.85rem", fontWeight: tab === "employees" ? 700 : 500, cursor: "pointer", textAlign: "left", borderBottom: "1px solid rgba(100,200,255,0.08)" }}>👥 Employees</button>}
                  {canAccess("cities") && <button onClick={() => { setTab("cities"); setDbOpen(false); }} style={{ display: "block", width: "100%", padding: "11px 18px", border: "none", background: tab === "cities" ? "rgba(62,207,178,0.1)" : "transparent", color: tab === "cities" ? "#3ECFB2" : "#aaa", fontSize: "0.85rem", fontWeight: tab === "cities" ? 700 : 500, cursor: "pointer", textAlign: "left" }}>🏙️ Cities</button>}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User info (logout is in sidebar) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e8f4ff" }}>{currentUser.full_name || currentUser.username}</div>
            <div style={{ fontSize: "0.65rem", color: "#3ECFB2", textTransform: "capitalize", fontWeight: 600 }}>{currentUser.role}</div>
          </div>
        </div>
      </div>

      <div style={S.main}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <>
            {/* Summary KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { icon: "💰", label: "Total Expenditure", value: `${dash.totalSpend.toLocaleString()} SAR`, gradient: "linear-gradient(135deg,#1a8fe3,#0dd3b4)", iconBg: "rgba(26,143,227,0.2)" },
                { icon: "🧾", label: "Total Requests", value: requests.length, gradient: "linear-gradient(135deg,#22c55e,#16a34a)", iconBg: "rgba(34,197,94,0.2)" },
                { icon: "🏢", label: "Departments", value: uniqueDepts.length, gradient: "linear-gradient(135deg,#f59e0b,#d97706)", iconBg: "rgba(245,158,11,0.2)" },
                { icon: "✈️", label: "Travel Days", value: dash.totalDays, gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", iconBg: "rgba(139,92,246,0.2)" },
              ].map(({ icon, label, value, gradient, iconBg }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(100,200,255,0.1)", borderRadius: 14, padding: "1.2rem 1.4rem", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#7ab3d4", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {requests.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", padding: "3rem", color: "#4a7a9a" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#7ab3d4", marginBottom: 8 }}>No data yet</div>
                <div style={{ fontSize: "0.85rem" }}>Save some per diem requests to see the dashboard charts.</div>
              </div>
            ) : (
              <>
                {/* Expenditure by Department */}
                <div style={S.card}>
                  <div style={S.cardTitle}><span style={S.dot}/> Expenditure by Department</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dash.byDept} margin={{ top: 30, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,200,255,0.08)" />
                      <XAxis dataKey="department" tick={{ fill: "#7ab3d4", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fill: "#7ab3d4", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                      <Bar dataKey="total" name="Total Spend" radius={[6,6,0,0]} maxBarSize={80}>
                        {dash.byDept.map((entry, i) => (
                          <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                        ))}
                        <LabelList dataKey="total" position="top" formatter={v => `${v.toLocaleString()}`} style={{ fill: "#e8f4ff", fontSize: 11, fontWeight: 700 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Expenditure by Department */}
                <div style={S.card}>
                  <div style={S.cardTitle}><span style={S.dot}/> Monthly Expenditure by Department</div>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={dash.monthly} margin={{ top: 30, right: 20, left: 10, bottom: 5 }} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,200,255,0.08)" />
                      <XAxis dataKey="month" tick={{ fill: "#7ab3d4", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fill: "#7ab3d4", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                      <Legend wrapperStyle={{ color: "#7ab3d4", fontSize: "0.8rem", paddingTop: 12 }} />
                      {uniqueDepts.map((dept, i) => (
                        <Bar key={dept} dataKey={dept} name={dept} fill={DEPT_COLORS[i % DEPT_COLORS.length]} radius={[4,4,0,0]} maxBarSize={60}>
                          <LabelList dataKey={dept} position="top" formatter={v => v > 0 ? `${v.toLocaleString()}` : ""} style={{ fill: "#e8f4ff", fontSize: 10, fontWeight: 700 }} />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Department Breakdown Table */}
                <div style={S.card}>
                  <div style={S.cardTitle}><span style={S.dot}/> Department Breakdown</div>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {["Department", "Requests", "Total Days", "Total Spend"].map(h => (
                          <th key={h} style={{ ...S.th, textAlign: h === "Department" ? "left" : "right" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dash.breakdown.map((row, i) => (
                        <tr key={row.dept}>
                          <td style={{ ...S.td, fontWeight: 600, color: "#e8f4ff" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                              <span style={{ width: 10, height: 10, borderRadius: "50%", background: DEPT_COLORS[i % DEPT_COLORS.length], display: "inline-block" }} />
                              {row.dept}
                            </span>
                          </td>
                          <td style={{ ...S.td, textAlign: "right" }}>{row.count}</td>
                          <td style={{ ...S.td, textAlign: "right" }}>{row.days}</td>
                          <td style={{ ...S.td, textAlign: "right", color: "#0dd3b4", fontWeight: 800 }}>{row.spend.toLocaleString()} SAR</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Grand total row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "0.9rem 1.2rem", background: "rgba(13,211,180,0.07)", borderRadius: 10, border: "1px solid rgba(13,211,180,0.15)" }}>
                    <span style={{ color: "#7ab3d4", fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Grand Total</span>
                    <span style={{ color: "#0dd3b4", fontWeight: 800, fontSize: "1.1rem" }}>{dash.totalSpend.toLocaleString()} SAR</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── NEW REQUEST ── */}
        {tab === "form" && (
          <>
            <div style={S.card}>
              <div style={S.cardTitle}><span style={S.dot}/> Per Diem Request Form</div>
              <div style={S.grid}>
                <div style={{ position: "relative" }}>
                  <label style={S.label}>Employee Name *</label>
                  <EmpSearch
                    employees={employees}
                    value={form.empId}
                    onChange={id => setForm(f => ({ ...f, empId: id }))}
                    error={errors.empId}
                    inputStyle={errors.empId ? S.inputError : S.input}
                  />
                  {errors.empId && <div style={S.errorMsg}>{errors.empId}</div>}
                </div>
                <div>
                  <label style={S.label}>Department</label>
                  <input style={S.readOnly} readOnly value={selectedEmp?.department || ""} placeholder="Auto-filled" />
                </div>
                <div>
                  <label style={S.label}>Position</label>
                  <input style={S.readOnly} readOnly value={selectedEmp?.position || ""} placeholder="Auto-filled" />
                </div>
                <div>
                  <label style={S.label}>Position Level</label>
                  <input style={S.readOnly} readOnly value={selectedEmp?.level || ""} placeholder="Auto-filled" />
                </div>
                <div>
                  <label style={S.label}>Destination Country *</label>
                  <select style={errors.country ? S.inputError : S.input} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value, city: "" }))}>
                    <option value="">— Select Country —</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.country && <div style={S.errorMsg}>{errors.country}</div>}
                </div>
                <div>
                  <label style={S.label}>Destination City *</label>
                  {!form.country ? (
                    <select style={S.inputDisabled} disabled><option>— Select a country first —</option></select>
                  ) : citiesForCountry.length === 0 ? (
                    <>
                      <select style={S.inputDisabled} disabled><option>— No cities added yet —</option></select>
                      <div style={S.hintMsg}>Go to the 🏙️ Cities tab to add cities for {form.country}</div>
                    </>
                  ) : (
                    <>
                      <select style={errors.city ? S.inputError : S.input} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                        <option value="">— Select City —</option>
                        {citiesForCountry.map(c => <option key={c.id}>{c.name}</option>)}
                      </select>
                      {errors.city && <div style={S.errorMsg}>{errors.city}</div>}
                    </>
                  )}
                </div>
                <div style={{ gridColumn: "1 / -1", height: 1, background: "rgba(100,200,255,0.06)" }} />
                <DateRangePicker
                  from={form.from} to={form.to}
                  errorFrom={errors.from} errorTo={errors.to}
                  onChange={({ from, to }) => setForm(f => ({ ...f, from, to }))}
                />
              </div>
              <div style={S.btnRow}>
                <button style={S.btnSecondary} onClick={() => { setForm({ empId: "", country: "", city: "", from: "", to: "" }); setErrors({}); setResult(null); }}>Clear</button>
                <button style={S.btnPrimary} onClick={handleCalculate}>⚡ Calculate</button>
              </div>
            </div>

            {result && (
              <div style={S.result} ref={resultRef} id="print-section">
                <div style={{ ...S.cardTitle, marginBottom: "1.2rem" }}><span style={S.dot}/> Calculation Result</div>
                <div style={S.resultGrid}>
                  {[
                    ["Employee Name", result.empName], ["Department", result.department],
                    ["Position", result.position], ["Position Level", result.level],
                    ["Destination Country", result.country], ["Destination City", result.city],
                    ["Travel From", formatDate(result.from)], ["Travel To", formatDate(result.to)],
                    ["Number of Days", `${result.days} day${result.days !== 1 ? "s" : ""}`],
                    ["Daily Rate", `${result.daily} SAR`],
                    ["Total Per Diem", `${result.totalPerDiem.toLocaleString()} SAR`],
                    ["Transportation Allowance", `${result.transport} SAR`],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={S.resultRow}>
                      <span style={S.resultLabel}>{lbl}</span>
                      <span style={S.resultValue}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={S.totalBox}>
                  <span style={S.totalLabel}>💲 FINAL TOTAL AMOUNT</span>
                  <span style={S.totalValue}>{result.finalTotal.toLocaleString()} SAR</span>
                </div>
                <div style={S.btnRow}>
                  <button style={S.btnSuccess} onClick={handleSave}>✅ Save Request</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── EMPLOYEES ── */}
        {tab === "employees" && (
          <>
            <div style={S.card}>
              <div style={S.cardTitle}><span style={S.dot}/> Add New Employee</div>
              <div style={S.grid}>
                <div>
                  <label style={S.label}>Full Name *</label>
                  <input style={empErrors.name ? S.inputError : S.input} value={empForm.name} onChange={e => setEmpForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mohammed Al-Harbi" />
                  {empErrors.name && <div style={S.errorMsg}>{empErrors.name}</div>}
                </div>
                <div>
                  <label style={S.label}>Department *</label>
                  <input style={empErrors.department ? S.inputError : S.input} value={empForm.department} onChange={e => setEmpForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Finance" />
                  {empErrors.department && <div style={S.errorMsg}>{empErrors.department}</div>}
                </div>
                <div>
                  <label style={S.label}>Position *</label>
                  <input style={empErrors.position ? S.inputError : S.input} value={empForm.position} onChange={e => setEmpForm(f => ({ ...f, position: e.target.value }))} placeholder="e.g. Senior Accountant" />
                  {empErrors.position && <div style={S.errorMsg}>{empErrors.position}</div>}
                </div>
                <div>
                  <label style={S.label}>Position Level</label>
                  <select style={S.input} value={empForm.level} onChange={e => setEmpForm(f => ({ ...f, level: e.target.value }))}>
                    {POSITION_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.btnRow}>
                <button style={S.btnPrimary} onClick={addEmployee}>+ Add Employee</button>
              </div>
            </div>
            <div style={S.card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem", flexWrap: "wrap", gap: 10 }}>
                <div style={S.cardTitle} ><span style={S.dot}/> Employees List ({employees.length})</div>
                {/* Import dropdown */}
                <div style={{ position: "relative" }} ref={importRef}>
                  <button onClick={() => setImportOpen(o => !o)}
                    style={{ background: "rgba(62,207,178,0.1)", border: "1px solid rgba(62,207,178,0.3)", borderRadius: 9, padding: "7px 16px", color: "#3ECFB2", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    📥 Import {importOpen ? "▲" : "▼"}
                  </button>
                  {importOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 999, background: "#1a1a1a", border: "1px solid rgba(62,207,178,0.2)", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 36px rgba(0,0,0,0.7)", minWidth: 220 }}>
                      <button onClick={downloadEmpTemplate}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 18px", border: "none", background: "transparent", color: "#e8f4ff", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(62,207,178,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <span style={{ fontSize: "1.1rem" }}>⬇️</span>
                        <div>
                          <div>Download CSV Template</div>
                          <div style={{ fontSize: "0.72rem", color: "#555", marginTop: 2 }}>Get the template with correct headers</div>
                        </div>
                      </button>
                      <label
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 18px", background: "transparent", color: "#e8f4ff", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(62,207,178,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <span style={{ fontSize: "1.1rem" }}>⬆️</span>
                        <div>
                          <div>Upload CSV File</div>
                          <div style={{ fontSize: "0.72rem", color: "#555", marginTop: 2 }}>Import employees from filled template</div>
                        </div>
                        <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: "none" }} />
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <table style={S.table}>
                <thead><tr>{["Name","Department","Position","Level",""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td style={{ ...S.td, fontWeight: 600, color: "#e8f4ff" }}>{emp.name}</td>
                      <td style={S.td}>{emp.department}</td>
                      <td style={S.td}>{emp.position}</td>
                      <td style={S.td}><span style={S.levelBadge(emp.level)}>{emp.level}</span></td>
                      <td style={S.td}><button style={S.removeBtn} onClick={() => removeEmployee(emp.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── CITIES ── */}
        {tab === "cities" && (
          <>
            <div style={S.card}>
              <div style={S.cardTitle}><span style={S.dot}/> Add New City</div>
              <div style={S.grid}>
                <div>
                  <label style={S.label}>City Name *</label>
                  <input style={cityErrors.name ? S.inputError : S.input} value={cityForm.name} onChange={e => setCityForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dammam" onKeyDown={e => e.key === "Enter" && addCity()} />
                  {cityErrors.name && <div style={S.errorMsg}>{cityErrors.name}</div>}
                </div>
                <div>
                  <label style={S.label}>Country *</label>
                  <select style={S.input} value={cityForm.country} onChange={e => setCityForm(f => ({ ...f, country: e.target.value }))}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.btnRow}>
                <button style={S.btnPrimary} onClick={addCity}>+ Add City</button>
              </div>
            </div>
            {COUNTRIES.map(country => {
              const list = cities.filter(c => c.country === country);
              return (
                <div key={country} style={S.card}>
                  <div style={S.cardTitle}>
                    <span style={S.dot}/>
                    <span style={S.countryBadge(country)}>{country}</span>
                    <span style={{ color: "#4a7a9a", fontWeight: 400, fontSize: "0.85rem" }}>{list.length} {list.length === 1 ? "city" : "cities"}</span>
                  </div>
                  {list.length === 0 ? (
                    <div style={{ color: "#4a7a9a", fontSize: "0.85rem", padding: "0.5rem 0" }}>No cities added yet for {country}.</div>
                  ) : (
                    <table style={S.table}>
                      <thead><tr>{["City Name","Country",""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {list.map(c => (
                          <tr key={c.id}>
                            <td style={{ ...S.td, fontWeight: 600, color: "#e8f4ff" }}>{c.name}</td>
                            <td style={S.td}><span style={S.countryBadge(c.country)}>{c.country}</span></td>
                            <td style={S.td}><button style={S.removeBtn} onClick={() => removeCity(c.id)}>Remove</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── REQUESTS ── */}
        {tab === "requests" && (
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.dot}/> Per Diem Requests ({requests.length}) </div>
            {loadingRequests ? (
              <div style={{ textAlign: "center", color: "#3ECFB2", padding: "2rem", fontSize: "0.9rem" }}>⏳ Loading requests...</div>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: "center", color: "#7ab3d4", padding: "2rem", fontSize: "0.9rem" }}>No requests saved yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr>{["#","Request ID","Employee","Dept","Level","Country","City","Dates","Days","Daily","Per Diem","Transport","Total","Created","Actions"].map(h => (
                      <th key={h} style={{ ...S.th, padding: "8px 8px", fontSize: "0.68rem" }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {requests.map((r, idx) => (
                      <tr key={r.id}>
                        <td style={{ ...S.td, fontSize: "0.72rem", padding: "8px 8px", color: "#555", fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ ...S.td, fontSize: "0.72rem", padding: "8px 8px", color: "#3ECFB2", fontWeight: 700, fontFamily: "monospace", whiteSpace: "nowrap" }}>#{String(r.id).padStart(6, "0")}</td>
                        <td style={{ ...S.td, fontWeight: 600, color: "#e8f4ff", whiteSpace: "nowrap", fontSize: "0.78rem", padding: "8px 8px" }}>{r.empName}</td>
                        <td style={{ ...S.td, fontSize: "0.75rem", padding: "8px 8px" }}>{r.department}</td>
                        <td style={{ ...S.td, padding: "8px 8px" }}><span style={S.levelBadge(r.level)}>{r.level === "Middle Management" ? "MM" : "FLM"}</span></td>
                        <td style={{ ...S.td, padding: "8px 8px" }}><span style={S.countryBadge(r.country)}>{r.country}</span></td>
                        <td style={{ ...S.td, whiteSpace: "nowrap", fontSize: "0.75rem", padding: "8px 8px" }}>{r.city}</td>
                        <td style={{ ...S.td, whiteSpace: "nowrap", fontSize: "0.72rem", padding: "8px 8px" }}>{formatDate(r.from)}→{formatDate(r.to)}</td>
                        <td style={{ ...S.td, textAlign: "center", fontSize: "0.75rem", padding: "8px 8px" }}>{r.days}</td>
                        <td style={{ ...S.td, fontSize: "0.75rem", padding: "8px 8px" }}>{r.daily}</td>
                        <td style={{ ...S.td, fontSize: "0.75rem", padding: "8px 8px" }}>{r.totalPerDiem.toLocaleString()}</td>
                        <td style={{ ...S.td, fontSize: "0.75rem", padding: "8px 8px" }}>{r.transport}</td>
                        <td style={{ ...S.td, color: "#0dd3b4", fontWeight: 800, fontSize: "0.75rem", padding: "8px 8px", whiteSpace: "nowrap" }}>{r.finalTotal.toLocaleString()} SAR</td>
                        <td style={{ ...S.td, fontSize: "0.72rem", padding: "8px 8px", color: "#7ab3d4", whiteSpace: "nowrap" }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td style={{ ...S.td, whiteSpace: "nowrap", padding: "8px 6px" }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button
                              onClick={() => setPreviewReq(r)}
                              title="Preview report"
                              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(100,200,255,0.2)", borderRadius: 8, padding: "5px 10px", color: "#7ab3d4", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}
                            >👁</button>
                            <button
                              onClick={() => downloadPDF(r)}
                              title="Download PDF"
                              style={{ background: "linear-gradient(135deg,#1a8fe3,#0dd3b4)", border: "none", borderRadius: 8, padding: "5px 12px", color: "#fff", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}
                            >⬇ PDF</button>
                            {unlockedRows[r.id] ? (
                              confirmDelete === r.id ? (
                                // Inline confirmation
                                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                  <span style={{ fontSize: "0.7rem", color: "#ff7070", fontWeight: 600, whiteSpace: "nowrap" }}>Sure?</span>
                                  <button
                                    onClick={() => deleteRequest(r.id)}
                                    style={{ background: "rgba(255,80,80,0.2)", border: "1px solid rgba(255,80,80,0.4)", borderRadius: 6, padding: "4px 10px", color: "#ff7070", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}
                                  >Yes</button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", color: "#7ab3d4", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}
                                  >No</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(r.id)}
                                  title="Delete request"
                                  style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.35)", borderRadius: 8, padding: "5px 11px", color: "#ff7070", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}
                                >✕</button>
                              )
                            ) : (
                              <button
                                onClick={() => { setLockModal(r.id); setLockPassword(""); setLockError(false); }}
                                title="Admin unlock to delete"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 10px", color: "#555", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                              >🔒</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: "1.2rem", padding: "1rem 1.4rem", background: "rgba(13,211,180,0.08)", borderRadius: 10, border: "1px solid rgba(13,211,180,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#7ab3d4", fontWeight: 600, fontSize: "0.85rem" }}>Grand Total ({requests.length} requests)</span>
                  <span style={{ color: "#0dd3b4", fontWeight: 800, fontSize: "1.3rem" }}>{requests.reduce((s, r) => s + r.finalTotal, 0).toLocaleString()} SAR</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab === "reports" && (() => {
          const rf = reportFilters;
          const now = new Date();
          function getPresetRange(preset) {
            const y = now.getFullYear(), m = now.getMonth();
            if (preset === "this_month") return { from: `${y}-${String(m+1).padStart(2,"0")}-01`, to: `${y}-${String(m+1).padStart(2,"0")}-${new Date(y,m+1,0).getDate()}` };
            if (preset === "last_month") { const lm = m===0?11:m-1, ly = m===0?y-1:y; return { from: `${ly}-${String(lm+1).padStart(2,"0")}-01`, to: `${ly}-${String(lm+1).padStart(2,"0")}-${new Date(ly,lm+1,0).getDate()}` }; }
            if (preset === "this_quarter") { const qs = Math.floor(m/3)*3; return { from: `${y}-${String(qs+1).padStart(2,"0")}-01`, to: `${y}-${String(qs+3).padStart(2,"0")}-${new Date(y,qs+3,0).getDate()}` }; }
            if (preset === "this_year") return { from: `${y}-01-01`, to: `${y}-12-31` };
            if (preset === "last_year") return { from: `${y-1}-01-01`, to: `${y-1}-12-31` };
            return { from: rf.dateFrom, to: rf.dateTo };
          }
          const range = getPresetRange(rf.preset);
          const filtered = requests.filter(r => {
            if (range.from && r.from < range.from) return false;
            if (range.to && r.from > range.to) return false;
            if (rf.department !== "all" && r.department !== rf.department) return false;
            if (rf.country !== "all" && r.country !== rf.country) return false;
            if (rf.level !== "all" && r.level !== rf.level) return false;
            if (rf.employee !== "all" && r.empName !== rf.employee) return false;
            return true;
          });
          const groupKeys = rf.groupBy === "department" ? [...new Set(filtered.map(r=>r.department))]
            : rf.groupBy === "employee" ? [...new Set(filtered.map(r=>r.empName))]
            : rf.groupBy === "country" ? [...new Set(filtered.map(r=>r.country))]
            : [...new Set(filtered.map(r=>getMonthKey(r.from)))].sort((a,b)=>{ const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; const [ma,ya]=a.split(" "); const [mb,yb]=b.split(" "); return ya!==yb?parseInt(ya)-parseInt(yb):months.indexOf(ma)-months.indexOf(mb); });
          const grouped = groupKeys.map(key => {
            const rows = filtered.filter(r => rf.groupBy==="department"?r.department===key:rf.groupBy==="employee"?r.empName===key:rf.groupBy==="country"?r.country===key:getMonthKey(r.from)===key);
            return { key, count:rows.length, days:rows.reduce((s,r)=>s+r.days,0), perDiem:rows.reduce((s,r)=>s+r.totalPerDiem,0), transport:rows.reduce((s,r)=>s+r.transport,0), total:rows.reduce((s,r)=>s+r.finalTotal,0) };
          });
          const grandTotal = filtered.reduce((s,r)=>s+r.finalTotal,0);
          const grandDays = filtered.reduce((s,r)=>s+r.days,0);
          const uniqueDepts = [...new Set(requests.map(r=>r.department))];
          const uniqueEmps = [...new Set(requests.map(r=>r.empName))];
          const groupLabel = { department:"Department", employee:"Employee", country:"Country", month:"Month" }[rf.groupBy];
          const setRF = (key, val) => setReportFilters(f=>({...f,[key]:val}));

          function downloadCSV() {
            const headers = ["Employee","Department","Position Level","Country","City","From","To","Days","Daily Rate","Per Diem","Transport","Total"];
            const rows = filtered.map(r=>[r.empName,r.department,r.level,r.country,r.city,formatDate(r.from),formatDate(r.to),r.days,r.daily,r.totalPerDiem,r.transport,r.finalTotal]);
            const csv = [headers,...rows].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
            const blob = new Blob([csv],{type:"text/csv"});
            const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`PerDiem_Report_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
          }

          function downloadReportPDF() {
            const presetLabel = {all:"All Time",this_month:"This Month",last_month:"Last Month",this_quarter:"This Quarter",this_year:"This Year",last_year:"Last Year",custom:"Custom Range"}[rf.preset]||"All Time";
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Per Diem Report</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a2a3a;padding:40px}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #1a8fe3}.brand-title{font-size:20px;font-weight:800;color:#1a8fe3}.brand-sub{font-size:10px;color:#7ab3d4;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-top:3px}.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}.kpi{border:1px solid #e0e8f0;border-radius:8px;padding:12px 16px}.kpi label{font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:700;display:block;margin-bottom:4px}.kpi value{font-size:18px;font-weight:800;color:#1a8fe3}.section-title{font-size:10px;font-weight:700;color:#1a8fe3;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #e8f0f8}table{width:100%;border-collapse:collapse;border:1px solid #e0e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px}th{background:#f0f7ff;padding:9px 12px;font-size:10px;color:#1a8fe3;text-transform:uppercase;letter-spacing:.8px;text-align:left;border-bottom:1px solid #e0e8f0}td{padding:9px 12px;font-size:12px;border-bottom:1px solid #f0f4f8}tr:last-child td{border-bottom:none}.total-row td{font-weight:800;background:#f0f7ff;color:#1a8fe3}.total-box{background:linear-gradient(135deg,#1a8fe3,#0dd3b4);border-radius:10px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center}.total-box .lbl{color:rgba(255,255,255,.85);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px}.total-box .amt{color:#fff;font-size:22px;font-weight:800}.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e0e8f0;font-size:10px;color:#aaa}</style>
</head><body>
<div class="header"><div><div class="brand-title">Per Diem Calculator</div><div class="brand-sub">HR & Finance Portal</div></div><div style="text-align:right"><div style="font-size:14px;font-weight:800">Per Diem Expenditure Report</div><div style="font-size:11px;color:#888">Period: ${presetLabel}${range.from?` · ${formatDate(range.from)} – ${formatDate(range.to)}`:""} · Generated: ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})}</div></div></div>
<div class="kpi-row"><div class="kpi"><label>Total Requests</label><value>${filtered.length}</value></div><div class="kpi"><label>Total Days</label><value>${grandDays}</value></div><div class="kpi"><label>Departments</label><value>${new Set(filtered.map(r=>r.department)).size}</value></div><div class="kpi"><label>Total Spend</label><value>${grandTotal.toLocaleString()} SAR</value></div></div>
<div class="section-title">Summary by ${groupLabel}</div>
<table><thead><tr><th>${groupLabel}</th><th>Requests</th><th>Days</th><th>Per Diem</th><th>Transport</th><th>Total</th></tr></thead><tbody>
${grouped.map(g=>`<tr><td><strong>${g.key}</strong></td><td>${g.count}</td><td>${g.days}</td><td>${g.perDiem.toLocaleString()} SAR</td><td>${g.transport.toLocaleString()} SAR</td><td><strong>${g.total.toLocaleString()} SAR</strong></td></tr>`).join("")}
<tr class="total-row"><td>GRAND TOTAL</td><td>${filtered.length}</td><td>${grandDays}</td><td>${filtered.reduce((s,r)=>s+r.totalPerDiem,0).toLocaleString()} SAR</td><td>${filtered.reduce((s,r)=>s+r.transport,0).toLocaleString()} SAR</td><td>${grandTotal.toLocaleString()} SAR</td></tr>
</tbody></table>
<div class="section-title">Detailed Requests</div>
<table><thead><tr><th>Employee</th><th>Dept</th><th>Level</th><th>Country</th><th>City</th><th>From</th><th>To</th><th>Days</th><th>Daily</th><th>Total</th></tr></thead><tbody>
${filtered.map(r=>`<tr><td>${r.empName}</td><td>${r.department}</td><td>${r.level==="Middle Management"?"MM":"FLM"}</td><td>${r.country}</td><td>${r.city}</td><td>${formatDate(r.from)}</td><td>${formatDate(r.to)}</td><td>${r.days}</td><td>${r.daily}</td><td><strong>${r.finalTotal.toLocaleString()} SAR</strong></td></tr>`).join("")}
</tbody></table>
<div class="total-box"><div class="lbl">Grand Total Amount</div><div class="amt">${grandTotal.toLocaleString()} SAR</div></div>
<div class="footer">Generated by Per Diem Calculator · HR & Finance Portal · ${new Date().toLocaleString()}</div>
</body></html>`;
            const blob = new Blob([html],{type:"text/html"});
            const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`PerDiem_Report_${new Date().toISOString().slice(0,10)}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
          }

          return (
            <>
              <div style={S.card}>
                <div style={S.cardTitle}><span style={S.dot}/> Report Filters</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"1.2rem", marginBottom:"1.2rem" }}>
                  <div><label style={S.label}>Period</label>
                    <select style={S.input} value={rf.preset} onChange={e=>setRF("preset",e.target.value)}>
                      {[["all","All Time"],["this_month","This Month"],["last_month","Last Month"],["this_quarter","This Quarter"],["this_year","This Year"],["last_year","Last Year"],["custom","Custom Range"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select></div>
                  <div><label style={S.label}>Group By</label>
                    <select style={S.input} value={rf.groupBy} onChange={e=>setRF("groupBy",e.target.value)}>
                      {[["department","Department"],["employee","Employee"],["country","Country"],["month","Month"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select></div>
                  <div><label style={S.label}>Department</label>
                    <select style={S.input} value={rf.department} onChange={e=>setRF("department",e.target.value)}>
                      <option value="all">All Departments</option>
                      {uniqueDepts.map(d=><option key={d}>{d}</option>)}
                    </select></div>
                  <div><label style={S.label}>Country</label>
                    <select style={S.input} value={rf.country} onChange={e=>setRF("country",e.target.value)}>
                      <option value="all">All Countries</option>
                      {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                    </select></div>
                  <div><label style={S.label}>Position Level</label>
                    <select style={S.input} value={rf.level} onChange={e=>setRF("level",e.target.value)}>
                      <option value="all">All Levels</option>
                      {POSITION_LEVELS.map(l=><option key={l}>{l}</option>)}
                    </select></div>
                  <div><label style={S.label}>Employee</label>
                    <select style={S.input} value={rf.employee} onChange={e=>setRF("employee",e.target.value)}>
                      <option value="all">All Employees</option>
                      {uniqueEmps.map(e=><option key={e}>{e}</option>)}
                    </select></div>
                </div>
                {rf.preset === "custom" && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem", marginBottom:"1.2rem" }}>
                    <div><label style={S.label}>From Date</label><input type="date" style={S.input} value={rf.dateFrom} onChange={e=>setRF("dateFrom",e.target.value)}/></div>
                    <div><label style={S.label}>To Date</label><input type="date" style={S.input} value={rf.dateTo} onChange={e=>setRF("dateTo",e.target.value)}/></div>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:"0.8rem", color:"#4a7a9a" }}>Showing <span style={{ color:"#0dd3b4", fontWeight:700 }}>{filtered.length}</span> of {requests.length} requests</div>
                  <button style={S.btnSecondary} onClick={()=>setReportFilters({ preset:"all", dateFrom:"", dateTo:"", department:"all", country:"all", level:"all", employee:"all", groupBy:"department" })}>Reset Filters</button>
                </div>
              </div>

              {requests.length === 0 ? (
                <div style={{ ...S.card, textAlign:"center", padding:"3rem", color:"#4a7a9a" }}>
                  <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>📈</div>
                  <div style={{ fontSize:"1rem", fontWeight:600, color:"#7ab3d4", marginBottom:8 }}>No data yet</div>
                  <div style={{ fontSize:"0.85rem" }}>Save some per diem requests first to generate reports.</div>
                </div>
              ) : (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
                    {[
                      { icon:"🧾", label:"Requests", value:filtered.length, color:"#22c55e" },
                      { icon:"✈️", label:"Travel Days", value:grandDays, color:"#8b5cf6" },
                      { icon:"🏢", label:"Departments", value:new Set(filtered.map(r=>r.department)).size, color:"#f59e0b" },
                      { icon:"💰", label:"Total Spend", value:`${grandTotal.toLocaleString()} SAR`, color:"#1a8fe3" },
                    ].map(({icon,label,value,color})=>(
                      <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(100,200,255,0.1)", borderRadius:14, padding:"1rem 1.2rem", display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ fontSize:22 }}>{icon}</div>
                        <div>
                          <div style={{ fontSize:"0.7rem", color:"#7ab3d4", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600, marginBottom:3 }}>{label}</div>
                          <div style={{ fontSize:"1.1rem", fontWeight:800, color }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={S.card}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.2rem", flexWrap:"wrap", gap:10 }}>
                      <div style={S.cardTitle}><span style={S.dot}/> Summary by {groupLabel}</div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={downloadCSV} style={{ ...S.btnSecondary, fontSize:"0.78rem", padding:"7px 14px" }}>⬇ CSV</button>
                        <button onClick={downloadReportPDF} style={{ ...S.btnPrimary, fontSize:"0.78rem", padding:"7px 14px" }}>⬇ PDF Report</button>
                      </div>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={S.table}>
                        <thead><tr>{[groupLabel,"Requests","Days","Per Diem","Transport","Total"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>
                          {grouped.map((g, i) => {
                            // For month grouping, show dept sub-rows
                            const monthDepts = rf.groupBy === "month"
                              ? [...new Set(filtered.filter(r => getMonthKey(r.from) === g.key).map(r => r.department))]
                              : null;
                            return (
                              <>
                                {/* Main row */}
                                <tr key={g.key} style={{ background: rf.groupBy === "month" ? "rgba(255,255,255,0.03)" : "transparent" }}>
                                  <td style={{ ...S.td, fontWeight: 700, color: "#e8f4ff" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: DEPT_COLORS[i % DEPT_COLORS.length], display: "inline-block", flexShrink: 0 }} />
                                      {g.key}
                                    </span>
                                  </td>
                                  <td style={{ ...S.td, textAlign: "center" }}>{g.count}</td>
                                  <td style={{ ...S.td, textAlign: "center" }}>{g.days}</td>
                                  <td style={S.td}>{g.perDiem.toLocaleString()} SAR</td>
                                  <td style={S.td}>{g.transport.toLocaleString()} SAR</td>
                                  <td style={{ ...S.td, color: "#0dd3b4", fontWeight: 800 }}>{g.total.toLocaleString()} SAR</td>
                                </tr>
                                {/* Dept sub-rows for month grouping */}
                                {rf.groupBy === "month" && monthDepts.map((dept, di) => {
                                  const dRows = filtered.filter(r => getMonthKey(r.from) === g.key && r.department === dept);
                                  const dTotal = dRows.reduce((s,r)=>s+r.finalTotal,0);
                                  const dDays = dRows.reduce((s,r)=>s+r.days,0);
                                  const dPerDiem = dRows.reduce((s,r)=>s+r.totalPerDiem,0);
                                  const dTransport = dRows.reduce((s,r)=>s+r.transport,0);
                                  return (
                                    <tr key={`${g.key}-${dept}`} style={{ background: "rgba(26,143,227,0.04)" }}>
                                      <td style={{ ...S.td, color: "#7ab3d4", fontSize: "0.82rem", paddingLeft: 32 }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: DEPT_COLORS[di % DEPT_COLORS.length], display: "inline-block", flexShrink: 0 }} />
                                          {dept}
                                        </span>
                                      </td>
                                      <td style={{ ...S.td, textAlign: "center", color: "#7ab3d4", fontSize: "0.82rem" }}>{dRows.length}</td>
                                      <td style={{ ...S.td, textAlign: "center", color: "#7ab3d4", fontSize: "0.82rem" }}>{dDays}</td>
                                      <td style={{ ...S.td, color: "#7ab3d4", fontSize: "0.82rem" }}>{dPerDiem.toLocaleString()} SAR</td>
                                      <td style={{ ...S.td, color: "#7ab3d4", fontSize: "0.82rem" }}>{dTransport.toLocaleString()} SAR</td>
                                      <td style={{ ...S.td, color: "#a8d8f0", fontWeight: 600, fontSize: "0.82rem" }}>{dTotal.toLocaleString()} SAR</td>
                                    </tr>
                                  );
                                })}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop:"1rem", padding:"0.9rem 1.2rem", background:"rgba(13,211,180,0.08)", borderRadius:10, border:"1px solid rgba(13,211,180,0.2)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ color:"#7ab3d4", fontWeight:600, fontSize:"0.82rem" }}>Grand Total · {filtered.length} requests · {grandDays} days</span>
                      <span style={{ color:"#0dd3b4", fontWeight:800, fontSize:"1.2rem" }}>{grandTotal.toLocaleString()} SAR</span>
                    </div>
                  </div>

                  <div style={S.card}>
                    <div style={S.cardTitle}><span style={S.dot}/> Detailed Requests ({filtered.length})</div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={S.table}>
                        <thead><tr>{["Employee","Dept","Level","Country","City","From","To","Days","Daily","Per Diem","Transport","Total"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>
                          {filtered.map(r=>(
                            <tr key={r.id}>
                              <td style={{ ...S.td, fontWeight:600, color:"#e8f4ff", whiteSpace:"nowrap" }}>{r.empName}</td>
                              <td style={S.td}>{r.department}</td>
                              <td style={S.td}><span style={S.levelBadge(r.level)}>{r.level==="Middle Management"?"MM":"FLM"}</span></td>
                              <td style={S.td}><span style={S.countryBadge(r.country)}>{r.country}</span></td>
                              <td style={{ ...S.td, whiteSpace:"nowrap" }}>{r.city}</td>
                              <td style={{ ...S.td, fontSize:"0.78rem" }}>{formatDate(r.from)}</td>
                              <td style={{ ...S.td, fontSize:"0.78rem" }}>{formatDate(r.to)}</td>
                              <td style={{ ...S.td, textAlign:"center" }}>{r.days}</td>
                              <td style={S.td}>{r.daily}</td>
                              <td style={S.td}>{r.totalPerDiem.toLocaleString()}</td>
                              <td style={S.td}>{r.transport}</td>
                              <td style={{ ...S.td, color:"#0dd3b4", fontWeight:800 }}>{r.finalTotal.toLocaleString()} SAR</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          );
        })()}

      </div> {/* ── END S.MAIN ── */}

      {/* ── PER-ROW LOCK MODAL ── */}
      {lockModal && (
        <div onClick={() => { setLockModal(null); setLockPassword(""); setLockError(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a1a", border: "1px solid rgba(62,207,178,0.3)", borderRadius: 16, width: "100%", maxWidth: 360, padding: "2rem", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#e8f4ff" }}>Admin Verification</div>
              <div style={{ fontSize: "0.78rem", color: "#7ab3d4", marginTop: 4 }}>Enter password to unlock delete for this request</div>
            </div>
            <input
              type="password"
              placeholder="Admin password"
              value={lockPassword}
              onChange={e => { setLockPassword(e.target.value); setLockError(false); }}
              onKeyDown={e => e.key === "Enter" && handleUnlockRow()}
              autoFocus
              style={{ ...S.input, marginBottom: lockError ? 6 : "1rem", border: lockError ? "1px solid rgba(255,80,80,0.5)" : undefined }}
            />
            {lockError && <div style={{ color: "#ff7070", fontSize: "0.73rem", marginBottom: "1rem" }}>❌ Incorrect password. Try again.</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setLockModal(null); setLockPassword(""); setLockError(false); }} style={{ ...S.btnSecondary, flex: 1 }}>Cancel</button>
              <button onClick={handleUnlockRow} style={{ ...S.btnPrimary, flex: 1 }}>Unlock 🔓</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {previewReq && (
        <div onClick={() => setPreviewReq(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", color: "#1a2a3a", fontFamily: "'Segoe UI', Arial, sans-serif", colorScheme: "light" }}>

            {/* Modal header bar */}
            <div style={{ background: "linear-gradient(135deg,#1a8fe3,#0dd3b4)", padding: "16px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "1rem" }}>Per Diem Request Preview</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", marginTop: 2 }}>Request #{String(previewReq.id).slice(-6)}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => downloadPDF(previewReq)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, padding: "6px 14px", color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>⬇ Download PDF</button>
                <button onClick={() => setPreviewReq(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, color: "#fff", fontWeight: 700, fontSize: "1.1rem", cursor: "pointer" }}>✕</button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding: "28px 32px", background: "#ffffff", color: "#1a2a3a" }}>

              {/* Issued date */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #e8f0f8" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1a2a3a" }}>Business Travel Per Diem Request</div>
                <div style={{ fontSize: "0.75rem", color: "#999", textAlign: "right" }}>
                  <div>Issued: {new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" })}</div>
                </div>
              </div>

              {/* Employee info */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1a8fe3", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #e8f0f8" }}>Employee Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #e0e8f0", borderRadius: 8, overflow: "hidden" }}>
                  {[["Employee Name", previewReq.empName], ["Department", previewReq.department], ["Position", previewReq.position], ["Position Level", previewReq.level]].map(([l,v]) => (
                    <div key={l} style={{ padding: "10px 14px", borderBottom: "1px solid #e8f0f8" }}>
                      <div style={{ fontSize: "0.65rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1a2a3a" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Travel details */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1a8fe3", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #e8f0f8" }}>Travel Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #e0e8f0", borderRadius: 8, overflow: "hidden" }}>
                  {[["Destination Country", previewReq.country], ["Destination City", previewReq.city], ["Travel From", formatDate(previewReq.from)], ["Travel To", formatDate(previewReq.to)]].map(([l,v]) => (
                    <div key={l} style={{ padding: "10px 14px", borderBottom: "1px solid #e8f0f8" }}>
                      <div style={{ fontSize: "0.65rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1a2a3a" }}>{v}</div>
                    </div>
                  ))}
                  <div style={{ padding: "10px 14px", gridColumn: "1/-1" }}>
                    <div style={{ fontSize: "0.65rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 3 }}>Number of Travel Days</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1a2a3a" }}>{previewReq.days} day{previewReq.days !== 1 ? "s" : ""}</div>
                  </div>
                </div>
              </div>

              {/* Calculation */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1a8fe3", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #e8f0f8" }}>Allowance Calculation</div>
                <div style={{ border: "1px solid #e0e8f0", borderRadius: 8, overflow: "hidden" }}>
                  {[
                    [`Daily Rate (${previewReq.level} — ${previewReq.country})`, `${previewReq.daily.toLocaleString()} SAR / day`, false],
                    [`Number of Days`, `${previewReq.days} day${previewReq.days!==1?"s":""}`, false],
                    [`Total Per Diem (${previewReq.daily} × ${previewReq.days})`, `${previewReq.totalPerDiem.toLocaleString()} SAR`, true],
                    [`Transportation Allowance (Fixed)`, `${previewReq.transport.toLocaleString()} SAR`, false],
                  ].map(([l,v,hl]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #e8f0f8", background: hl ? "#f0f7ff" : "#fff" }}>
                      <div style={{ fontSize: "0.85rem", color: "#555" }}>{l}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2a3a" }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Total box */}
                <div style={{ background: "linear-gradient(135deg,#1a8fe3,#0dd3b4)", borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Final Total Amount Payable</div>
                  <div style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 800 }}>{previewReq.finalTotal.toLocaleString()} SAR</div>
                </div>
              </div>

              {/* Signature */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 48, paddingTop: 20, borderTop: "1px solid #e8f0f8", marginTop: 8 }}>
                {["Employee Signature", "Finance Approval"].map(lbl => (
                  <div key={lbl} style={{ textAlign: "center" }}>
                    <div style={{ width: 140, borderBottom: "1px solid #ccc", height: 36, marginBottom: 6 }} />
                    <div style={{ fontSize: "0.65rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.8px" }}>{lbl}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// OT MODULE — completely self-contained
// ═══════════════════════════════════════════════════════════════
const LABOR_LAWS = {
  KSA: {
    name:"Saudi Arabia",flag:"🇸🇦",currency:"SAR",
    workdayHours:8,weeklyHours:48,
    weeklyOffDays:["Friday","Saturday"],
    weekendMultiplier:1.5,overtimeMultiplier:1.5,holidayMultiplier:1.5,
    lawRef:"Saudi Labor Law – Article 107",
  },
  Egypt:{
    name:"Egypt",flag:"🇪🇬",currency:"EGP",
    workdayHours:8,weeklyHours:48,
    weeklyOffDays:["Friday","Saturday"],
    weekendMultiplier:2.0,overtimeMultiplier:1.35,holidayMultiplier:2.0,
    lawRef:"Egyptian Labor Law No. 12 of 2003 – Article 134",
  },
};
// Default editable approval thresholds — stored in state inside OTModule
const OT_APPROVAL_CHAIN_DEFAULT=[
  {range:"0-2",periodType:"hours",threshold:2,chain:[{level:1,role:"Direct Manager"}]},
  {range:"2-5",periodType:"hours",threshold:5,chain:[{level:1,role:"Direct Manager"},{level:2,role:"Department Head"}]},
  {range:"5-10",periodType:"hours",threshold:10,chain:[{level:1,role:"Direct Manager"},{level:2,role:"Department Head"},{level:3,role:"HR Manager"}]},
  {range:"10+",periodType:"hours",threshold:Infinity,chain:[{level:1,role:"Direct Manager"},{level:2,role:"Department Head"},{level:3,role:"HR Manager"},{level:4,role:"CFO / Executive Approval"}]},
];
function getOTChainFromThresholds(hours,thresholds){
  for(const t of thresholds){if(hours<=t.threshold)return t.chain;}
  return thresholds[thresholds.length-1].chain;
}

// ─────────────────────────────────────────────────────────────
// SUBMITTER-BASED APPROVAL CHAIN RESOLVER
// Reusable for OT, Per Diem, Loans, and any future module.
// Reads direct_approver_id / second_approver_id / third_approver_id
// from the submitting user's profile, then resolves names from allUsers.
// Returns an array of chain steps: [{ level, role, approverId, approverName }]
// ─────────────────────────────────────────────────────────────
function resolveApprovalChain(submitterUser, allUsers) {
  if (!submitterUser) return [];
  const chain = [];
  const approverFields = [
    { field: "direct_approver_id",  label: "Direct Approver"  },
    { field: "second_approver_id",  label: "Second Approver"  },
    { field: "third_approver_id",   label: "Third Approver"   },
  ];
  approverFields.forEach(({ field, label }, idx) => {
    const approverId = submitterUser[field];
    if (!approverId) return;
    const approverUser = allUsers.find(u => String(u.id) === String(approverId));
    chain.push({
      level: idx + 1,
      role: label,
      approverId: approverId,
      approverName: approverUser ? (approverUser.full_name || approverUser.username) : `User #${approverId}`,
    });
  });
  // Fallback: if submitter has no chain configured, show a placeholder
  if (chain.length === 0) {
    chain.push({ level: 1, role: "Approver (Not configured)", approverId: null, approverName: "—" });
  }
  return chain;
}

// KSA OT Hourly Rate: (Total/30/8) + ((Total*0.65/30/8)*0.5)
// KSA OT Hourly Rate: (Total/30/8) + ((Basic/30/8) × 50%)  — NO multiplier applied here
function getKSAOTHourlyRate(totalSalary){
  const basic=totalSalary*0.65;
  return(totalSalary/30/8)+((basic/30/8)*0.5);
}
// Egypt OT Hourly Rate: Basic (80% of Total) / 30 / 8  — Total Salary never used
function getEgyptOTHourlyRate(totalSalary){
  const basic=totalSalary*0.80;
  return basic/30/8;
}
function getOTHourlyRate(salary,country){
  if(country==="KSA")return getKSAOTHourlyRate(salary||0);
  return getEgyptOTHourlyRate(salary||0);
}

// Determine if an otDate (YYYY-MM-DD) falls on Fri or Sat
function isWeekend(dateStr){
  if(!dateStr)return false;
  const d=new Date(dateStr+"T12:00:00"); // noon avoids timezone date-shift
  const day=d.getDay(); // 0=Sun,5=Fri,6=Sat
  return day===5||day===6;
}

// ─── Egypt OT Segment-Based Pay Calculator ───────────────────────────────────
// Rules (Egypt only, weekday):
//   Day   OT: 06:00–18:00 → 1.35×  (360–1080 min from midnight)
//   Night OT: 18:00–06:00 → 1.70×  (1080–1440 then 0–360, wrapping midnight)
//
// For any from→to range (including midnight crossings) we:
//   1. Split the range into 30-min slots
//   2. Classify each slot as day or night
//   3. Sum pay for each bucket separately
// Weekend OT is still a flat 2.0× on the full duration (no split needed).
// KSA uses a flat rate with no time-of-day split.
// ─────────────────────────────────────────────────────────────────────────────

// Returns true if a minute-of-day value falls in the Night window (18:00–06:00)
function _isNightMinute(min) {
  const m = ((Number(min) % 1440) + 1440) % 1440; // normalise to 0–1439
  return m >= 1080 || m < 360; // 18:00–24:00 or 00:00–06:00
}

// Core engine: given hourly rate + from/to in minutes, return total pay.
// Handles weekends (flat 2×), pure-day, pure-night, and any overlap.
// toMin may exceed 1440 (e.g. 10 PM → 4 AM next day = fromMin=1320, toMin=1560).
function calcEgyptOTPay(hourlyRate, fromMin, toMin, dateStr) {
  const from = Number(fromMin);
  const to   = Number(toMin);
  if (isNaN(from) || isNaN(to) || to <= from) return 0;

  // Weekend: flat 2× on total hours — no time-of-day split needed
  if (isWeekend(dateStr)) {
    return hourlyRate * ((to - from) / 60) * 2.0;
  }

  // Weekday: split into 30-min slots and classify each
  const SLOT = 30; // minutes
  let dayHours   = 0;
  let nightHours = 0;

  for (let t = from; t < to; t += SLOT) {
    const slotEnd    = Math.min(t + SLOT, to);
    const slotHours  = (slotEnd - t) / 60;
    const midpoint   = t + (slotEnd - t) / 2; // classify by slot midpoint
    if (_isNightMinute(midpoint)) {
      nightHours += slotHours;
    } else {
      dayHours   += slotHours;
    }
  }

  return hourlyRate * dayHours * 1.35 + hourlyRate * nightHours * 1.70;
}

// Legacy single-multiplier helper (kept for label/display purposes only).
// Returns the *dominant* type label based on where most hours fall.
function getOTMultiplier(country, dateStr, fromMin, toMin) {
  if (country === "KSA") {
    return { label: "Standard OT", multiplier: 1, color: "#3ECFB2" };
  }
  // Egypt
  if (isWeekend(dateStr)) return { label: "Weekend OT", multiplier: 2.0, color: "#f59e0b" };

  const from = Number(fromMin);
  const to   = Number(toMin);
  if (isNaN(from) || isNaN(to) || to <= from) return { label: "Daytime OT (1.35×)", multiplier: 1.35, color: "#3ECFB2" };

  // Determine dominant segment for display label
  let dayMin = 0, nightMin = 0;
  const SLOT = 30;
  for (let t = from; t < to; t += SLOT) {
    const slotEnd  = Math.min(t + SLOT, to);
    const mid      = t + (slotEnd - t) / 2;
    if (_isNightMinute(mid)) nightMin += (slotEnd - t);
    else                      dayMin   += (slotEnd - t);
  }

  if (dayMin > 0 && nightMin > 0) return { label: "Mixed OT (Day+Night)", multiplier: null, color: "#8b5cf6" };
  if (nightMin > 0)               return { label: "Night OT (1.70×)",      multiplier: 1.70, color: "#a855f7" };
  return                                  { label: "Daytime OT (1.35×)",    multiplier: 1.35, color: "#3ECFB2" };
}

// Convenience: compute total OT pay from salary + times.
// This is the single function to call for any country.
function computeOTPay(hourlyRate, hours, country, dateStr, fromMin, toMin) {
  if (country === "KSA") return hourlyRate * hours * 1; // flat, no multiplier
  return calcEgyptOTPay(hourlyRate, fromMin, toMin, dateStr);
}

// Basic salary derived from total salary by country
function getBasicSalary(totalSalary,country){
  if(!totalSalary)return 0;
  return country==="KSA"?totalSalary*0.65:totalSalary*0.80;
}

// Format minutes-since-midnight back to display label (e.g. 1080 → "6:00 PM")
function formatMinutes(totalMin){
  if(totalMin===""||totalMin===null||totalMin===undefined)return"—";
  const h=Math.floor(Number(totalMin)/60);
  const m=Number(totalMin)%60;
  const period=h<12?"AM":h===24?"AM":"PM";
  const displayH=h%12===0?12:h%12;
  return`${displayH}:${String(m).padStart(2,"0")} ${period}`;
}
const OT_STATUS_CFG={
  pending:{label:"Pending",color:"#f59e0b",bg:"rgba(245,158,11,0.12)",border:"rgba(245,158,11,0.3)"},
  approved:{label:"Approved",color:"#22c55e",bg:"rgba(34,197,94,0.12)",border:"rgba(34,197,94,0.3)"},
  rejected:{label:"Rejected",color:"#ef4444",bg:"rgba(239,68,68,0.12)",border:"rgba(239,68,68,0.3)"},
  partial:{label:"In Review",color:"#3b82f6",bg:"rgba(59,130,246,0.12)",border:"rgba(59,130,246,0.3)"},
};
const OT_MONTHS_=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function otCurMonth(){const d=new Date();return`${OT_MONTHS_[d.getMonth()]} ${d.getFullYear()}`;}
function otMonthOpts(){const o=[],n=new Date();for(let i=5;i>=-1;i--){const d=new Date(n.getFullYear(),n.getMonth()-i,1);o.push(`${OT_MONTHS_[d.getMonth()]} ${d.getFullYear()}`);}return o;}

const OT_INIT_EMPLOYEES=[
  {id:1,name:"Ahmed Al-Rashidi",department:"Finance",  position:"Finance Manager",     level:"Middle Management",      country:"KSA",  salary:18000},
  {id:2,name:"Sara Al-Otaibi",  department:"HR",       position:"HR Specialist",       level:"First Level Management", country:"KSA",  salary:12000},
  {id:3,name:"Khalid Mansour",  department:"Operations",position:"Operations Director", level:"Middle Management",      country:"KSA",  salary:22000},
  {id:4,name:"Nour Hassan",     department:"IT",       position:"Systems Engineer",     level:"First Level Management", country:"Egypt",salary:15000},
  {id:5,name:"Mohamed Abdel-Aziz",department:"Legal", position:"Legal Counsel",        level:"Middle Management",      country:"Egypt",salary:20000},
];

// Time options for From/To dropdowns — every 30 minutes, 6 AM → 12 AM
function buildTimeOptions() {
  const opts = [];
  // Full 24-hour range: 0:00 (12 AM) → 23:00 (11 PM), every 30 minutes
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const totalMin = h * 60 + m;
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const period = h < 12 ? "AM" : "PM";
      const label = `${displayH}:${String(m).padStart(2, "0")} ${period}`;
      opts.push({ label, value: totalMin });
    }
  }
  return opts;
}
const OT_TIME_OPTIONS = buildTimeOptions();

function calcOTHours(fromMin, toMin) {
  if (fromMin === "" || toMin === "" || fromMin === null || toMin === null) return null;
  const diff = (Number(toMin) - Number(fromMin)) / 60;
  return diff > 0 ? diff : null;
}

// OT-specific ACQ tokens (identical palette)
const OT_ACQ={
  teal:"#3ECFB2",tealBorder:"rgba(62,207,178,0.25)",tealGlow:"rgba(62,207,178,0.12)",
  bg:"#1a1a1a",bgCard:"#222222",border:"rgba(255,255,255,0.08)",
  text:"#ffffff",textMuted:"#888888",textSub:"#aaaaaa",
  amber:"#f59e0b",amberGlow:"rgba(245,158,11,0.12)",
  red:"#ef4444",green:"#22c55e",blue:"#3b82f6",purple:"#a855f7",
};
const OS={
  app:{minHeight:"100vh",background:OT_ACQ.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif",color:OT_ACQ.text},
  header:{background:"#111111",borderBottom:`1px solid ${OT_ACQ.tealBorder}`,padding:"0 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:"68px",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 32px rgba(0,0,0,0.6)",flexWrap:"wrap",gap:"8px",paddingTop:"10px",paddingBottom:"10px"},
  nav:{display:"flex",gap:"3px",background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"4px",flexWrap:"wrap",justifyContent:"center"},
  navBtn:(a)=>({padding:"6px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:"0.75rem",fontWeight:600,letterSpacing:"0.02em",transition:"all 0.2s",background:a?OT_ACQ.teal:"transparent",color:a?"#111":OT_ACQ.textMuted,whiteSpace:"nowrap"}),
  main:{maxWidth:1200,margin:"0 auto",padding:"1.5rem 1rem"},
  card:{background:OT_ACQ.bgCard,border:`1px solid ${OT_ACQ.border}`,borderRadius:14,padding:"1.2rem",marginBottom:"1rem"},
  cardTitle:{fontSize:"0.95rem",fontWeight:700,color:OT_ACQ.text,marginBottom:"1.2rem",letterSpacing:"0.03em",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},
  dot:{width:8,height:8,borderRadius:"50%",background:OT_ACQ.teal,display:"inline-block",flexShrink:0},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1rem"},
  label:{fontSize:"0.78rem",color:OT_ACQ.textMuted,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6,display:"block"},
  input:{width:"100%",background:"rgba(100,200,255,0.07)",border:"1px solid rgba(100,200,255,0.2)",borderRadius:10,padding:"10px 14px",color:OT_ACQ.text,fontSize:"0.9rem",outline:"none",boxSizing:"border-box"},
  inputError:{width:"100%",background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.4)",borderRadius:10,padding:"10px 14px",color:OT_ACQ.text,fontSize:"0.9rem",outline:"none",boxSizing:"border-box"},
  readOnly:{width:"100%",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:10,padding:"10px 14px",color:"#555",fontSize:"0.9rem",outline:"none",boxSizing:"border-box"},
  errorMsg:{color:"#ff6b6b",fontSize:"0.73rem",marginTop:4},
  btnPrimary:{background:OT_ACQ.teal,border:"none",borderRadius:10,padding:"12px 28px",color:"#111",fontWeight:700,fontSize:"0.88rem",cursor:"pointer",letterSpacing:"0.04em"},
  btnSecondary:{background:"rgba(255,255,255,0.06)",border:`1px solid ${OT_ACQ.border}`,borderRadius:10,padding:"10px 20px",color:OT_ACQ.textSub,fontWeight:600,fontSize:"0.85rem",cursor:"pointer"},
  btnRow:{display:"flex",gap:10,justifyContent:"flex-end",marginTop:"1.2rem",flexWrap:"wrap"},
  th:{textAlign:"left",padding:"10px 14px",fontSize:"0.72rem",color:OT_ACQ.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`1px solid ${OT_ACQ.border}`,fontWeight:700},
  td:{padding:"11px 14px",fontSize:"0.85rem",color:OT_ACQ.textSub,borderBottom:`1px solid rgba(255,255,255,0.04)`},
  toast:(t)=>({position:"fixed",bottom:24,right:24,zIndex:9999,background:t==="success"?OT_ACQ.teal:"#e34a4a",color:t==="success"?"#111":"#fff",borderRadius:12,padding:"12px 22px",fontWeight:700,fontSize:"0.88rem",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}),
  removeBtn:{background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:7,padding:"4px 12px",color:"#ff6b6b",fontSize:"0.78rem",cursor:"pointer",fontWeight:600},
};

function otCountryBadge(c){
  const m={KSA:["rgba(62,207,178,0.12)","#3ECFB2","rgba(62,207,178,0.3)"],Egypt:["rgba(245,158,11,0.12)","#f59e0b","rgba(245,158,11,0.3)"]};
  const[bg,color,border]=m[c]||["rgba(255,255,255,0.06)","#aaa","rgba(255,255,255,0.12)"];
  return{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.05em",background:bg,color,border:`1px solid ${border}`};
}
function otStatusBadge(s){
  const cfg=OT_STATUS_CFG[s]||OT_STATUS_CFG.pending;
  return{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:"0.7rem",fontWeight:700,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`};
}

const OTTooltip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:"#111",border:"1px solid rgba(62,207,178,0.25)",borderRadius:10,padding:"10px 14px"}}><div style={{color:"#3ECFB2",fontSize:"0.78rem",marginBottom:6,fontWeight:600}}>{label}</div>{payload.map((p,i)=>(<div key={i} style={{color:"#fff",fontSize:"0.85rem",fontWeight:700}}>{p.name}: {p.value?.toLocaleString()}</div>))}</div>);
};

// ─────────────────────────────────────────────────────────────
// OTDatePicker — single-date picker, 1:1 match with Per Diem DateRangePicker UI
// ─────────────────────────────────────────────────────────────
function OTDatePicker({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("days");
  const [yearRangeStart, setYearRangeStart] = useState(null);
  const [calPos, setCalPos] = useState({ top: 0, left: 0 });
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const ref = useRef();
  const triggerRef = useRef();

  const selectedDate = value ? parseYMD(value) : null;

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setView("days"); }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openCalendar() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const calWidth = 300;
      const calHeight = 360;
      let left = rect.left;
      if (left + calWidth > window.innerWidth - 16) left = window.innerWidth - calWidth - 16;
      if (left < 16) left = 16;
      const top = rect.top - calHeight - 8;
      setCalPos({ top: Math.max(8, top), left });
    }
    setOpen(o => !o);
    setView("days");
  }

  const yStart = yearRangeStart ?? (Math.floor(viewYear / 12) * 12);
  const yearGrid = Array.from({ length: 12 }, (_, i) => yStart + i);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function getDays() {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    return cells;
  }

  function getDayStyle(day) {
    if (!day) return {};
    const isSelected = selectedDate && sameDay(day, selectedDate);
    const isToday = sameDay(day, today);
    let bg = "transparent", color = "#c8dde8", borderRadius = "50%", fontWeight = 400;
    if (isSelected) { bg = "linear-gradient(135deg,#1a8fe3,#0dd3b4)"; color = "#fff"; fontWeight = 700; }
    else if (isToday) { bg = "rgba(62,207,178,0.15)"; color = "#3ECFB2"; fontWeight = 700; }
    return { background: bg, color, borderRadius, fontWeight, cursor: "pointer", opacity: 1 };
  }

  const days = getDays();
  const displayVal = value ? (() => {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  })() : null;

  const popupStyle = {
    position: "fixed", top: calPos.top, left: calPos.left, zIndex: 9999,
    background: "#111", border: "1px solid rgba(62,207,178,0.2)", borderRadius: 14,
    padding: "0.9rem", boxShadow: "0 16px 48px rgba(0,0,0,0.8)", width: 300, boxSizing: "border-box",
  };
  const navBtnStyle = { background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, color: "#aaa", cursor: "pointer", fontSize: 16 };
  const titleBtnStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 14px", fontWeight: 700, color: "#fff", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", overflow: "visible" }}>
      {/* Trigger — label is outside this component, consistent with other fields */}
      <div ref={triggerRef} onClick={openCalendar} style={{
        display: "flex", alignItems: "center", gap: 8,
        background: error ? "rgba(255,100,100,0.08)" : "rgba(100,200,255,0.07)",
        border: error ? "1px solid rgba(255,100,100,0.4)" : "1px solid rgba(100,200,255,0.2)",
        borderRadius: 10, padding: "10px 14px", cursor: "pointer", minHeight: 44,
        width: "100%", boxSizing: "border-box",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={error ? "#ff7070" : "#7ab3d4"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <div style={{ fontSize: "0.9rem", color: displayVal ? "#e8f4ff" : "#5a8aaa", fontWeight: displayVal ? 600 : 400 }}>{displayVal || "Select date…"}</div>
      </div>
      {error && <div style={{ fontSize: "0.7rem", color: "#ff7070", marginTop: 4 }}>{error}</div>}

      {open && (
        <div style={popupStyle}>

          {/* YEAR PICKER */}
          {view === "years" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <button style={navBtnStyle} onClick={() => setYearRangeStart(yStart - 12)}>‹</button>
                <div style={{ fontWeight: 700, color: "#e8f4ff", fontSize: "0.9rem" }}>{yStart} – {yStart + 11}</div>
                <button style={navBtnStyle} onClick={() => setYearRangeStart(yStart + 12)}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {yearGrid.map(yr => (
                  <button key={yr} onClick={() => { setViewYear(yr); setYearRangeStart(null); setView("months"); }}
                    style={{ background: yr === viewYear ? "linear-gradient(135deg,#1a8fe3,#0dd3b4)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "10px 0", color: yr === viewYear ? "#fff" : "#c8dde8", fontWeight: yr === viewYear ? 700 : 400, fontSize: "0.88rem", cursor: "pointer" }}>
                    {yr}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: "1rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(100,200,255,0.08)" }}>
                <button onClick={() => setView("days")} style={{ background: "none", border: "none", color: "#7ab3d4", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>← Back</button>
              </div>
            </>
          )}

          {/* MONTH PICKER */}
          {view === "months" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <button style={navBtnStyle} onClick={() => setViewYear(y => y - 1)}>‹</button>
                <button style={titleBtnStyle} onClick={() => setView("years")}>{viewYear} ▾</button>
                <button style={navBtnStyle} onClick={() => setViewYear(y => y + 1)}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                {MONTH_NAMES.map((mn, mi) => (
                  <button key={mn} onClick={() => { setViewMonth(mi); setView("days"); }}
                    style={{ background: mi === viewMonth ? "linear-gradient(135deg,#1a8fe3,#0dd3b4)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: "10px 0", color: mi === viewMonth ? "#fff" : "#c8dde8", fontWeight: mi === viewMonth ? 700 : 400, fontSize: "0.82rem", cursor: "pointer" }}>
                    {mn.slice(0, 3)}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: "1rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(100,200,255,0.08)" }}>
                <button onClick={() => setView("years")} style={{ background: "none", border: "none", color: "#7ab3d4", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>← Back to Years</button>
              </div>
            </>
          )}

          {/* DAY PICKER */}
          {view === "days" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <button style={navBtnStyle} onClick={prevMonth}>‹</button>
                <button style={{ ...titleBtnStyle, fontSize: "0.82rem" }} onClick={() => { setYearRangeStart(null); setView("years"); }}>
                  {MONTH_NAMES[viewMonth]} {viewYear} ▾
                </button>
                <button style={navBtnStyle} onClick={nextMonth}>›</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 2 }}>
                {DAY_NAMES.map(d => <div key={d} style={{ textAlign: "center", fontSize: "0.62rem", color: "#4a7a9a", fontWeight: 700, padding: "3px 0" }}>{d}</div>)}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "1px" }}>
                {days.map((day, i) => {
                  const ds = day ? getDayStyle(day) : {};
                  return (
                    <div key={i}
                      onClick={() => {
                        if (!day) return;
                        const ymd = toYMD(day);
                        onChange(ymd);
                        setOpen(false);
                        setView("days");
                      }}
                      style={{ height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", transition: "all 0.1s", background: ds.background || "transparent", color: ds.color || "transparent", borderRadius: ds.borderRadius || "50%", fontWeight: ds.fontWeight || 400, cursor: day ? "pointer" : "default", opacity: ds.opacity ?? 1 }}
                    >
                      {day ? day.getDate() : ""}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(100,200,255,0.08)" }}>
                <button onClick={() => { onChange(""); }} style={{ background: "none", border: "none", color: "#7ab3d4", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>Clear</button>
                {value && <div style={{ fontSize: "0.75rem", color: "#0dd3b4", fontWeight: 700 }}>{displayVal}</div>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OT REPORTS PANEL
// ─────────────────────────────────────────────────────────────
function OTReportsPanel({ records = [], employees = [] }) {
  const [rptMonth, setRptMonth] = useState("all");
  const [rptDept, setRptDept] = useState("all");
  const [rptCountry, setRptCountry] = useState("all");
  const [rptStatus, setRptStatus] = useState("all");
  const [rptEmployee, setRptEmployee] = useState("all");
  const [rptOTType, setRptOTType] = useState("all");

  const allMonths = [...new Set(records.map(r => r.month))].sort().reverse();
  const allDepts  = [...new Set(records.map(r => r.department))].sort();
  const allEmps   = [...new Set(records.map(r => r.empName))].sort();
  const allOTTypes = [...new Set(records.map(r => r.overtimeType).filter(Boolean))].sort();

  const filtered = records.filter(r => {
    if (rptMonth    !== "all" && r.month       !== rptMonth)    return false;
    if (rptDept     !== "all" && r.department  !== rptDept)     return false;
    if (rptCountry  !== "all" && r.country     !== rptCountry)  return false;
    if (rptStatus   !== "all" && r.status      !== rptStatus)   return false;
    if (rptEmployee !== "all" && r.empName     !== rptEmployee)  return false;
    if (rptOTType   !== "all" && r.overtimeType!== rptOTType)   return false;
    return true;
  });

  const totalHours   = filtered.reduce((s, r) => s + r.overtimeHours, 0);
  const totalPay     = filtered.reduce((s, r) => s + r.overtimePay,   0);
  const pendingCount = filtered.filter(r => r.status === "pending").length;
  const approvedCount= filtered.filter(r => r.status === "approved").length;
  const mixedCurrency= rptCountry === "all";

  // Breakdown by department
  const deptBreak = allDepts.map(dept => {
    const rows = filtered.filter(r => r.department === dept);
    return { dept, count: rows.length, hours: rows.reduce((s,r)=>s+r.overtimeHours,0), pay: rows.reduce((s,r)=>s+r.overtimePay,0) };
  }).filter(d => d.count > 0).sort((a,b) => b.hours - a.hours);

  // Breakdown by employee
  const empBreak = allEmps.map(name => {
    const rows = filtered.filter(r => r.empName === name);
    if (!rows.length) return null;
    return { name, dept: rows[0].department, country: rows[0].country, count: rows.length, hours: rows.reduce((s,r)=>s+r.overtimeHours,0), pay: rows.reduce((s,r)=>s+r.overtimePay,0) };
  }).filter(Boolean).sort((a,b) => b.hours - a.hours);

  // Breakdown by OT type
  const typeBreak = allOTTypes.map(type => {
    const rows = filtered.filter(r => r.overtimeType === type);
    if (!rows.length) return null;
    const cfg = Object.values(OT_STATUS_CFG).find(c => c.label === type) || { color: "#3ECFB2" };
    return { type, count: rows.length, hours: rows.reduce((s,r)=>s+r.overtimeHours,0), pay: rows.reduce((s,r)=>s+r.overtimePay,0) };
  }).filter(Boolean).sort((a,b) => b.hours - a.hours);

  function resetFilters() {
    setRptMonth("all"); setRptDept("all"); setRptCountry("all");
    setRptStatus("all"); setRptEmployee("all"); setRptOTType("all");
  }

  const hasFilters = rptMonth!=="all"||rptDept!=="all"||rptCountry!=="all"||rptStatus!=="all"||rptEmployee!=="all"||rptOTType!=="all";
  const currency = rptCountry === "KSA" ? "SAR" : rptCountry === "Egypt" ? "EGP" : "";

  const selStyle = { ...OS.input, width: "auto", fontSize: "0.82rem", padding: "7px 14px" };

  return (
    <div style={OS.main}>
      {/* ── FILTER BAR ── */}
      <div style={{ ...OS.card, marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: "0.78rem", color: OT_ACQ.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Report Filters</div>
          {hasFilters && (
            <button onClick={resetFilters} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${OT_ACQ.border}`, borderRadius: 8, padding: "6px 14px", color: OT_ACQ.textMuted, fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}>Reset All</button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <select style={selStyle} value={rptMonth} onChange={e => setRptMonth(e.target.value)}>
            <option value="all">📅 All Months</option>
            {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select style={{ ...selStyle, borderColor: rptCountry !== "all" ? OT_ACQ.teal : undefined }} value={rptCountry} onChange={e => { setRptCountry(e.target.value); }}>
            <option value="all">🌍 All Countries</option>
            <option value="KSA">🇸🇦 KSA</option>
            <option value="Egypt">🇪🇬 Egypt</option>
          </select>
          <select style={selStyle} value={rptDept} onChange={e => setRptDept(e.target.value)}>
            <option value="all">🏢 All Departments</option>
            {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select style={selStyle} value={rptEmployee} onChange={e => setRptEmployee(e.target.value)}>
            <option value="all">👤 All Employees</option>
            {allEmps.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select style={selStyle} value={rptStatus} onChange={e => setRptStatus(e.target.value)}>
            <option value="all">📌 All Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
            <option value="partial">🔄 In Review</option>
          </select>
          <select style={selStyle} value={rptOTType} onChange={e => setRptOTType(e.target.value)}>
            <option value="all">⏱ All OT Types</option>
            {allOTTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {rptCountry === "all" && (
          <div style={{ marginTop: 10, fontSize: "0.72rem", color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, padding: "5px 12px", fontWeight: 600, display: "inline-block" }}>
            ⚠️ Select a country to see pay totals in a single currency (SAR or EGP)
          </div>
        )}
      </div>

      {/* ── KPI SUMMARY ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { icon: "📋", label: "Total Records", value: filtered.length, gradient: "linear-gradient(135deg,#3ECFB2,#1a8fe3)", iconBg: "rgba(62,207,178,0.2)" },
          { icon: "⏱",  label: "Total OT Hours",value: `${totalHours.toFixed(1)}h`, gradient: "linear-gradient(135deg,#3ECFB2,#0dd3b4)", iconBg: "rgba(62,207,178,0.2)" },
          { icon: "💰",  label: `OT Pay${mixedCurrency?" (mixed)":""}`, value: mixedCurrency ? "—" : `${totalPay.toLocaleString(undefined,{maximumFractionDigits:0})} ${currency}`, gradient: "linear-gradient(135deg,#22c55e,#16a34a)", iconBg: "rgba(34,197,94,0.2)" },
          { icon: "⏳",  label: "Pending", value: pendingCount, gradient: "linear-gradient(135deg,#f59e0b,#d97706)", iconBg: "rgba(245,158,11,0.2)" },
          { icon: "✅",  label: "Approved", value: approvedCount, gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)", iconBg: "rgba(59,130,246,0.2)" },
        ].map(({ icon, label, value, gradient, iconBg }) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${OT_ACQ.border}`, borderRadius: 14, padding: "1.1rem 1.2rem", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: "0.68rem", color: OT_ACQ.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...OS.card, textAlign: "center", padding: "3rem", color: OT_ACQ.textMuted }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
          <div style={{ fontSize: "1rem", fontWeight: 600, color: OT_ACQ.textSub, marginBottom: 8 }}>No records match the selected filters</div>
          <div style={{ fontSize: "0.85rem" }}>Adjust the filters above to refine your report.</div>
          {hasFilters && <button onClick={resetFilters} style={{ ...OS.btnPrimary, marginTop: "1rem", fontSize: "0.82rem", padding: "9px 20px" }}>Reset Filters</button>}
        </div>
      ) : (
        <>
          {/* ── BY DEPARTMENT ── */}
          {deptBreak.length > 0 && (
            <div style={OS.card}>
              <div style={OS.cardTitle}><span style={OS.dot}/> OT Breakdown by Department</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Department","Records","OT Hours", mixedCurrency?"OT Pay":"OT Pay"].map((h,i) => (
                      <th key={h} style={{ ...OS.th, textAlign: i===0?"left":"right" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptBreak.map((row, i) => (
                    <tr key={row.dept}>
                      <td style={{ ...OS.td, fontWeight: 600, color: "#e8f4ff" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: DEPT_COLORS[i % DEPT_COLORS.length], display: "inline-block" }}/>
                          {row.dept}
                        </span>
                      </td>
                      <td style={{ ...OS.td, textAlign: "right" }}>{row.count}</td>
                      <td style={{ ...OS.td, textAlign: "right", color: OT_ACQ.teal, fontWeight: 700 }}>{row.hours.toFixed(1)}h</td>
                      <td style={{ ...OS.td, textAlign: "right", color: "#22c55e", fontWeight: 700 }}>
                        {mixedCurrency ? "—" : `${row.pay.toLocaleString(undefined,{maximumFractionDigits:0})} ${currency}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "0.8rem 1rem", background: "rgba(62,207,178,0.06)", borderRadius: 10, border: "1px solid rgba(62,207,178,0.15)", flexWrap: "wrap", gap: 8 }}>
                <span style={{ color: OT_ACQ.textMuted, fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Grand Total</span>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <span style={{ color: OT_ACQ.teal, fontWeight: 800, fontSize: "1rem" }}>{totalHours.toFixed(1)}h</span>
                  {!mixedCurrency && <span style={{ color: "#22c55e", fontWeight: 800, fontSize: "1.05rem" }}>{totalPay.toLocaleString(undefined,{maximumFractionDigits:0})} {currency}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── BY OT TYPE ── */}
          {typeBreak.length > 0 && (
            <div style={OS.card}>
              <div style={OS.cardTitle}><span style={OS.dot}/> OT Breakdown by Type</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["OT Type","Records","OT Hours", mixedCurrency?"OT Pay":"OT Pay"].map((h,i) => (
                      <th key={h} style={{ ...OS.th, textAlign: i===0?"left":"right" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {typeBreak.map((row) => (
                    <tr key={row.type}>
                      <td style={{ ...OS.td, fontWeight: 600, color: "#e8f4ff" }}>{row.type || "—"}</td>
                      <td style={{ ...OS.td, textAlign: "right" }}>{row.count}</td>
                      <td style={{ ...OS.td, textAlign: "right", color: OT_ACQ.teal, fontWeight: 700 }}>{row.hours.toFixed(1)}h</td>
                      <td style={{ ...OS.td, textAlign: "right", color: "#22c55e", fontWeight: 700 }}>
                        {mixedCurrency ? "—" : `${row.pay.toLocaleString(undefined,{maximumFractionDigits:0})} ${currency}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── BY EMPLOYEE ── */}
          {empBreak.length > 0 && (
            <div style={OS.card}>
              <div style={OS.cardTitle}><span style={OS.dot}/> OT Breakdown by Employee</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Employee","Department","Country","Records","OT Hours", mixedCurrency?"OT Pay":"OT Pay"].map((h,i) => (
                      <th key={h} style={{ ...OS.th, textAlign: i<3?"left":"right" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empBreak.map((row) => (
                    <tr key={row.name}>
                      <td style={{ ...OS.td, fontWeight: 600, color: "#e8f4ff" }}>{row.name}</td>
                      <td style={{ ...OS.td, color: OT_ACQ.textSub }}>{row.dept}</td>
                      <td style={OS.td}><span style={otCountryBadge(row.country)}>{row.country}</span></td>
                      <td style={{ ...OS.td, textAlign: "right" }}>{row.count}</td>
                      <td style={{ ...OS.td, textAlign: "right", color: OT_ACQ.teal, fontWeight: 700 }}>{row.hours.toFixed(1)}h</td>
                      <td style={{ ...OS.td, textAlign: "right", color: "#22c55e", fontWeight: 700 }}>
                        {mixedCurrency ? "—" : `${row.pay.toLocaleString(undefined,{maximumFractionDigits:0})} ${currency}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OTModule({ currentUser, allUsers = [], activeModuleLabel = "Overtime" }) {
  const [tab, setTab] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingThresholds, setLoadingThresholds] = useState(true);
  const [toast, setToast] = useState(null);
  const [otPreview, setOtPreview] = useState(null);
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [salaryEditId, setSalaryEditId] = useState(null);
  const [salaryEditVal, setSalaryEditVal] = useState("");
  const [empForm, setEmpForm] = useState({name:"",department:"",position:"",country:"KSA",salary:""});
  const [empErrors, setEmpErrors] = useState({});
  const [empEditId, setEmpEditId] = useState(null);
  const [approvalThresholds, setApprovalThresholds] = useState(OT_APPROVAL_CHAIN_DEFAULT);
  const [editingThresholds, setEditingThresholds] = useState(false);
  const [thresholdDraft, setThresholdDraft] = useState(null);

  const [form, setForm] = useState({department:"",empId:"",month:otCurMonth(),otDate:"",fromTime:"",toTime:"",clientName:"",notes:"",attachment:null});
  const [formErrors, setFormErrors] = useState({});
  const [otEntries, setOtEntries] = useState([]); // multi-entry rows
  const [clientNames, setClientNames] = useState([]); // Client Names database
  const [clientForm, setClientForm] = useState({name:"",code:""});
  const [clientFormError, setClientFormError] = useState("");

  // ── Dashboard filters ─────────────────────────────────────────
  const [dashCountry, setDashCountry] = useState("all");
  const [dashDept, setDashDept] = useState("all");

  // ── Load all OT data from Supabase on mount ───────────────────
  useEffect(() => {
    supa.getOTEmployees()
      .then(data => { setEmployees(data); setLoadingEmployees(false); })
      .catch(err => { setLoadingEmployees(false); showToast(`Employees load error: ${err.message}`, "error"); });

    supa.getOTRecords()
      .then(data => { setRecords(data); setLoadingRecords(false); })
      .catch(err => { setLoadingRecords(false); showToast(`Records load error: ${err.message}`, "error"); });

    supa.getOTThresholds()
      .then(data => { if (data.length > 0) setApprovalThresholds(data); setLoadingThresholds(false); })
      .catch(err => { setLoadingThresholds(false); });

    supa.getOTClients()
      .then(data => setClientNames(data))
      .catch(() => {}); // silently fail — table may not exist yet
  }, []);

  function showToast(msg,type="success"){setToast({msg,type});setTimeout(()=>setToast(null),3200);}

  const otSelectedEmp = employees.find(e=>e.id===Number(form.empId));
  const filteredRecords = records.filter(r=>{
    if(filterMonth!=="all"&&r.month!==filterMonth)return false;
    if(filterStatus!=="all"&&r.status!==filterStatus)return false;
    if(filterCountry!=="all"&&r.country!==filterCountry)return false;
    return true;
  });

  const totalOTHours=records.reduce((s,r)=>s+r.overtimeHours,0);
  const totalOTPay=records.reduce((s,r)=>s+r.overtimePay,0);
  const pendingCount=records.filter(r=>r.status==="pending").length;
  const approvedCount=records.filter(r=>r.status==="approved").length;

  // Dashboard filtered records (separate from OT Records tab filters)
  const dashRecords = records.filter(r=>{
    if(dashCountry!=="all"&&r.country!==dashCountry)return false;
    if(dashDept!=="all"&&r.department!==dashDept)return false;
    return true;
  });
  const dashCurrency = dashCountry==="KSA"?"SAR":dashCountry==="Egypt"?"EGP":"(mixed)";
  const dashTotalHours = dashRecords.reduce((s,r)=>s+r.overtimeHours,0);
  const dashTotalPay   = dashRecords.reduce((s,r)=>s+r.overtimePay,0);
  const dashPending    = dashRecords.filter(r=>r.status==="pending").length;
  const dashApproved   = dashRecords.filter(r=>r.status==="approved").length;

  const allDepts = [...new Set(records.map(r=>r.department))].sort();

  const monthlyData=otMonthOpts().map(m=>({
    month:m.split(" ")[0],
    hours:dashRecords.filter(r=>r.month===m).reduce((s,r)=>s+r.overtimeHours,0),
    pay:dashRecords.filter(r=>r.month===m).reduce((s,r)=>s+r.overtimePay,0),
  }));

  // OT by Department (for dashboard)
  const dashDeptData = allDepts.map(dept=>({
    dept,
    hours: dashRecords.filter(r=>r.department===dept).reduce((s,r)=>s+r.overtimeHours,0),
    pay:   dashRecords.filter(r=>r.department===dept).reduce((s,r)=>s+r.overtimePay,0),
  })).filter(d=>d.hours>0);

  // OT by Department by Month (stacked/grouped bar)
  const dashMonthlyDeptData = otMonthOpts().map(m=>({
    month: m.split(" ")[0],
    ...Object.fromEntries(allDepts.map(dept=>[dept, dashRecords.filter(r=>r.month===m&&r.department===dept).reduce((s,r)=>s+r.overtimeHours,0)])),
  }));

  // Department breakdown table
  const dashDeptBreakdown = allDepts.map(dept=>{
    const dRecs = dashRecords.filter(r=>r.department===dept);
    return { dept, count: dRecs.length, hours: dRecs.reduce((s,r)=>s+r.overtimeHours,0), pay: dRecs.reduce((s,r)=>s+r.overtimePay,0) };
  }).filter(d=>d.count>0);

  const deptData=[...new Set(employees.map(e=>e.department))].map(dept=>({
    dept,
    hours:records.filter(r=>employees.find(e=>e.id===r.empId)?.department===dept).reduce((s,r)=>s+r.overtimeHours,0),
  })).filter(d=>d.hours>0);

  // Pre-compute per-country totals for OT Records tab (avoids IIFE in JSX)
  const recordTotalsCountries = [...new Set(filteredRecords.map(r=>r.country))].sort();
  const recordTotalsByCountry = recordTotalsCountries.map(country=>{
    const law = LABOR_LAWS[country]||{};
    const cRecs = filteredRecords.filter(r=>r.country===country);
    return {
      country,
      flag: law.flag||"🌍",
      currency: law.currency||"",
      countryRgb: country==="KSA"?"62,207,178":"245,158,11",
      countryColor: country==="KSA"?OT_ACQ.teal:OT_ACQ.amber,
      count: cRecs.length,
      totalHrs: cRecs.reduce((s,r)=>s+r.overtimeHours,0),
      totalPay: cRecs.reduce((s,r)=>s+r.overtimePay,0),
    };
  });

  const otHoursCalc = calcOTHours(form.fromTime, form.toTime);

  function validateForm(){
    const e={};
    if(!form.department)e.department="Select a department";
    if(!form.empId)e.empId="Select an employee";
    if(!form.month)e.month="Select a month / cycle";
    if(!form.otDate)e.otDate="Select the overtime date";
    if(form.fromTime==="")e.fromTime="Select a start time";
    if(form.toTime==="")e.toTime="Select an end time";
    if(form.fromTime!==""&&form.toTime!==""&&otHoursCalc===null)e.toTime="End time must be after start time";
    if(otHoursCalc===null&&form.fromTime!==""&&form.toTime!=="")e.otHours="OT hours could not be calculated — check times";
    if(!form.clientName)e.clientName="Select a client";
    setFormErrors(e);
    return Object.keys(e).length===0;
  }

  async function handleSubmit(){
    if(!validateForm())return;
    const emp=otSelectedEmp;
    const hours=otHoursCalc;
    const hourlyRate=getOTHourlyRate(emp.salary||0,emp.country);
    const{label,multiplier,color}=getOTMultiplier(emp.country,form.otDate,form.fromTime,form.toTime);
    const overtimePay=computeOTPay(hourlyRate,hours,emp.country,form.otDate,form.fromTime,form.toTime);
    const submitterChain = resolveApprovalChain(currentUser, allUsers);

    // Build all rows: extra entries + main form row
    const allRows = [
      ...otEntries,
      { empId: form.empId, empName: emp.name, department: emp.department, country: emp.country,
        month: form.month, otDate: form.otDate, fromTime: form.fromTime, toTime: form.toTime,
        clientName: form.clientName||"—", notes: form.notes,
        hourlyRate, hours, multiplier, label, overtimePay }
    ];

    try {
      const savedIds = [];
      for (const row of allRows) {
        const rowEmp = employees.find(e=>e.id===Number(row.empId)) || emp;
        const rowHourlyRate = row.hourlyRate ?? getOTHourlyRate(rowEmp.salary||0, rowEmp.country);
        const rowHours = row.hours ?? calcOTHours(row.fromTime, row.toTime);
        const {label:rowLabel, multiplier:rowMult} = getOTMultiplier(rowEmp.country, row.otDate, row.fromTime, row.toTime);
        const rowPay = computeOTPay(rowHourlyRate, rowHours||0, rowEmp.country, row.otDate, row.fromTime, row.toTime);
        const newRecord={
          empId: rowEmp.id, empName: rowEmp.name,
          department: rowEmp.department, country: rowEmp.country,
          month: row.month, otDate: row.otDate,
          fromTime: row.fromTime, toTime: row.toTime,
          fromTimeLabel: formatMinutes(row.fromTime), toTimeLabel: formatMinutes(row.toTime),
          overtimeHours: rowHours||0, overtimeType: rowLabel,
          multiplier: rowMult, hourlyRate: rowHourlyRate, overtimePay: rowPay,
          clientName: row.clientName||"—",
          notes: row.notes||"",
          submittedBy: currentUser.full_name || currentUser.username,
          approvalChain: submitterChain.map(a=>({...a,status:"pending",signedBy:"",signedAt:""})),
          status:"pending",
        };
        const dbId = await supa.addOTRecord(newRecord);
        const saved = { ...newRecord, id: dbId ?? Date.now(), createdAt: new Date().toISOString() };
        setRecords(prev=>[saved,...prev]);
        savedIds.push(dbId);
      }
      setForm({department:"",empId:"",month:otCurMonth(),otDate:"",fromTime:"",toTime:"",clientName:"",notes:"",attachment:null});
      setOtEntries([]);
      setFormErrors({});
      showToast(`✅ ${allRows.length > 1 ? `${allRows.length} OT requests` : "Overtime request"} submitted for approval!`);
      setTab("ot-approval");
    } catch(err) {
      showToast(`Failed to save: ${err.message}`,"error");
    }
  }

  async function advanceApproval(recordId,levelIndex,action){
    const record = records.find(r => r.id === recordId);
    if (!record) return;
    const chain=record.approvalChain.map((a,i)=>i===levelIndex?{...a,status:action,signedBy:currentUser.full_name||currentUser.username,signedAt:new Date().toLocaleString()}:a);
    const allApproved=chain.every(a=>a.status==="approved");
    const anyRejected=chain.some(a=>a.status==="rejected");
    const status=anyRejected?"rejected":allApproved?"approved":chain[0].status==="pending"?"pending":"partial";
    // Optimistic update
    setRecords(prev=>prev.map(r=>r.id===recordId?{...r,approvalChain:chain,status}:r));
    try {
      await supa.updateOTRecord(recordId, { approvalChain: chain, status });
      showToast(action==="approved"?"✅ Level approved":"❌ Level rejected");
    } catch(err) {
      // Revert on failure
      setRecords(prev=>prev.map(r=>r.id===recordId?record:r));
      showToast(`Failed to update: ${err.message}`,"error");
    }
  }

  const ALL_OT_TABS=[
    {key:"dashboard",label:"📊 Dashboard"},
    {key:"ot-new",label:"⏱ New Request"},
    {key:"ot-requests",label:"📋 OT Records"},
    {key:"ot-approval",label:"✅ Approvals"},
    {key:"ot-reports",label:"📈 Reports"},
    // Database group: Salary Mgmt, Labor Laws, Employees, Client Names
    {key:"ot-salary",label:"💰 Salary Mgmt",group:"database"},
    {key:"ot-laws",label:"⚖️ Labor Laws",group:"database"},
    {key:"ot-employees",label:"👥 Employees",group:"database"},
    {key:"ot-clients",label:"🏢 Client Names",group:"database"},
  ];
  const OT_TABS=ALL_OT_TABS.filter(t=>canAccessTab(currentUser,"overtime",t.key));

  // Database group state
  const [dbGroupOpen, setDbGroupOpen] = useState(false);
  const dbGroupRef = useRef();
  useEffect(()=>{
    function handler(e){if(dbGroupRef.current&&!dbGroupRef.current.contains(e.target))setDbGroupOpen(false);}
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[]);

  const dbTabs = OT_TABS.filter(t=>t.group==="database");
  const topTabs = OT_TABS.filter(t=>!t.group);
  const activeDbTab = dbTabs.find(t=>t.key===tab);

  return (
    <div style={OS.app}>
      {toast&&<div style={OS.toast(toast.type)}>{toast.msg}</div>}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); select option{background:#1a2a3a;color:#e8f4ff;} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* OT HEADER */}
      <div style={OS.header}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:"1.3rem",fontWeight:800,color:OT_ACQ.text,letterSpacing:"-0.02em"}}>{activeModuleLabel}</div>
        </div>
        <div style={OS.nav}>
          {topTabs.map(t=>(
            <button key={t.key} style={OS.navBtn(tab===t.key)} onClick={()=>setTab(t.key)}>{t.label}</button>
          ))}
          {dbTabs.length>0&&(
            <div ref={dbGroupRef} style={{position:"relative"}}>
              <button
                style={{...OS.navBtn(!!activeDbTab),display:"flex",alignItems:"center",gap:5}}
                onClick={()=>setDbGroupOpen(o=>!o)}>
                🗄 Database {activeDbTab?`· ${activeDbTab.label}`:""} {dbGroupOpen?"▲":"▼"}
              </button>
              {dbGroupOpen&&(
                <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:9999,background:"#1a1a1a",border:`1px solid ${OT_ACQ.tealBorder}`,borderRadius:12,overflow:"hidden",boxShadow:"0 12px 36px rgba(0,0,0,0.7)",minWidth:180}}>
                  {dbTabs.map(t=>(
                    <button key={t.key}
                      onClick={()=>{setTab(t.key);setDbGroupOpen(false);}}
                      style={{display:"block",width:"100%",padding:"11px 18px",border:"none",background:tab===t.key?"rgba(62,207,178,0.12)":"transparent",color:tab===t.key?OT_ACQ.teal:OT_ACQ.textSub,fontWeight:tab===t.key?700:500,fontSize:"0.8rem",cursor:"pointer",textAlign:"left",borderLeft:tab===t.key?`3px solid ${OT_ACQ.teal}`:"3px solid transparent",transition:"all 0.15s"}}
                      onMouseEnter={e=>{if(tab!==t.key)e.currentTarget.style.background="rgba(255,255,255,0.05)";}}
                      onMouseLeave={e=>{if(tab!==t.key)e.currentTarget.style.background="transparent";}}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{fontSize:"0.72rem",color:OT_ACQ.textMuted,display:"flex",gap:12,alignItems:"center"}}>
          <span style={{color:OT_ACQ.teal,fontWeight:700}}>{records.length}</span> records
          <span>|</span>
          <span style={{color:OT_ACQ.amber,fontWeight:700}}>{pendingCount}</span> pending
        </div>
      </div>

      <div style={OS.main}>

        {/* ── OT DASHBOARD ── */}
        {tab==="dashboard"&&(
          <>
            {/* Dashboard Filters */}
            <div style={{...OS.card,marginBottom:"1rem"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div style={{fontSize:"0.78rem",color:OT_ACQ.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Dashboard Filters</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                  <div>
                    <select style={{...OS.input,width:"auto",fontSize:"0.82rem",padding:"7px 14px",borderColor:dashCountry!=="all"?OT_ACQ.teal:undefined}}
                      value={dashCountry} onChange={e=>{setDashCountry(e.target.value);setDashDept("all");}}>
                      <option value="all">🌍 All Countries</option>
                      <option value="KSA">🇸🇦 KSA (SAR)</option>
                      <option value="Egypt">🇪🇬 Egypt (EGP)</option>
                    </select>
                  </div>
                  <div>
                    <select style={{...OS.input,width:"auto",fontSize:"0.82rem",padding:"7px 14px"}}
                      value={dashDept} onChange={e=>setDashDept(e.target.value)}>
                      <option value="all">🏢 All Departments</option>
                      {allDepts.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {(dashCountry!=="all"||dashDept!=="all")&&(
                    <button onClick={()=>{setDashCountry("all");setDashDept("all");}} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${OT_ACQ.border}`,borderRadius:8,padding:"7px 12px",color:OT_ACQ.textMuted,fontSize:"0.78rem",cursor:"pointer",fontWeight:600}}>Reset</button>
                  )}
                </div>
                {dashCountry==="all"&&(
                  <div style={{fontSize:"0.72rem",color:"#f59e0b",background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:8,padding:"5px 12px",fontWeight:600}}>
                    ⚠️ Select a country to avoid mixing SAR + EGP
                  </div>
                )}
              </div>
            </div>

            {/* KPI Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1rem",marginBottom:"1.5rem"}}>
              {[
                {icon:"⏱",label:"Total OT Hours",value:`${dashTotalHours.toFixed(1)}h`,gradient:"linear-gradient(135deg,#3ECFB2,#1a8fe3)",iconBg:"rgba(62,207,178,0.2)"},
                {icon:"💰",label:`Total OT Pay${dashCountry==="all"?" (mixed)":""}`,value:dashCountry==="all"?"—":`${dashTotalPay.toLocaleString(undefined,{maximumFractionDigits:0})} ${dashCurrency}`,gradient:"linear-gradient(135deg,#22c55e,#16a34a)",iconBg:"rgba(34,197,94,0.2)"},
                {icon:"🕐",label:"Pending",value:dashPending,gradient:"linear-gradient(135deg,#f59e0b,#d97706)",iconBg:"rgba(245,158,11,0.2)"},
                {icon:"✅",label:"Approved",value:dashApproved,gradient:"linear-gradient(135deg,#3b82f6,#1d4ed8)",iconBg:"rgba(59,130,246,0.2)"},
              ].map(({icon,label,value,gradient,iconBg})=>(
                <div key={label} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${OT_ACQ.border}`,borderRadius:14,padding:"1.2rem 1.4rem",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:44,height:44,borderRadius:12,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icon}</div>
                  <div>
                    <div style={{fontSize:"0.72rem",color:OT_ACQ.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600,marginBottom:4}}>{label}</div>
                    <div style={{fontSize:"1.25rem",fontWeight:800,background:gradient,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {records.length===0?(
              <div style={{...OS.card,textAlign:"center",padding:"3rem",color:OT_ACQ.textMuted}}>
                <div style={{fontSize:"3rem",marginBottom:"1rem"}}>📊</div>
                <div style={{fontSize:"1rem",fontWeight:600,color:OT_ACQ.textSub,marginBottom:8}}>No data yet</div>
                <div style={{fontSize:"0.85rem"}}>Submit overtime requests to see the dashboard charts.</div>
                <button onClick={()=>setTab("ot-new")} style={{...OS.btnPrimary,marginTop:"1rem",fontSize:"0.82rem",padding:"9px 20px"}}>Submit your first →</button>
              </div>
            ):(
              <>
                {/* OT by Department */}
                <div style={OS.card}>
                  <div style={OS.cardTitle}><span style={OS.dot}/> OT Hours by Department</div>
                  {dashDeptData.length===0?(
                    <div style={{textAlign:"center",color:OT_ACQ.textMuted,padding:"2rem",fontSize:"0.85rem"}}>No data for selected filters</div>
                  ):(
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashDeptData} margin={{top:30,right:20,left:10,bottom:5}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="dept" tick={{fill:OT_ACQ.textMuted,fontSize:12}} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={v=>`${v}h`} tick={{fill:OT_ACQ.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<OTTooltip/>} cursor={{fill:"transparent"}}/>
                        <Bar dataKey="hours" name="OT Hours" radius={[6,6,0,0]} maxBarSize={80}>
                          {dashDeptData.map((_,i)=><Cell key={i} fill={DEPT_COLORS[i%DEPT_COLORS.length]}/>)}
                          <LabelList dataKey="hours" position="top" formatter={v=>`${v.toFixed(1)}h`} style={{fill:"#e8f4ff",fontSize:11,fontWeight:700}}/>
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Monthly OT Hours Trend + OT by Department by Month side by side */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
                  <div style={OS.card}>
                    <div style={OS.cardTitle}><span style={OS.dot}/> Monthly OT Hours Trend</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={monthlyData} margin={{top:20,right:10,left:0,bottom:5}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="month" tick={{fill:OT_ACQ.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={v=>`${v}h`} tick={{fill:OT_ACQ.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<OTTooltip/>}/>
                        <Line type="monotone" dataKey="hours" stroke={OT_ACQ.teal} strokeWidth={2.5} dot={{fill:OT_ACQ.teal,r:4}} name="OT Hours">
                          <LabelList dataKey="hours" position="top" formatter={v=>v>0?`${v.toFixed(0)}h`:""} style={{fill:"#e8f4ff",fontSize:10,fontWeight:700}}/>
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={OS.card}>
                    <div style={OS.cardTitle}><span style={OS.dot}/> OT by Department by Month</div>
                    {allDepts.length===0?(
                      <div style={{textAlign:"center",color:OT_ACQ.textMuted,padding:"2rem",fontSize:"0.85rem"}}>No data yet</div>
                    ):(
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dashMonthlyDeptData} margin={{top:20,right:10,left:0,bottom:5}} barCategoryGap="25%">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                          <XAxis dataKey="month" tick={{fill:OT_ACQ.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                          <YAxis tickFormatter={v=>`${v}h`} tick={{fill:OT_ACQ.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                          <Tooltip content={<OTTooltip/>} cursor={{fill:"transparent"}}/>
                          <Legend wrapperStyle={{color:OT_ACQ.textMuted,fontSize:"0.75rem",paddingTop:8}}/>
                          {allDepts.filter(d=>dashDept==="all"||d===dashDept).map((dept,i)=>(
                            <Bar key={dept} dataKey={dept} name={dept} fill={DEPT_COLORS[i%DEPT_COLORS.length]} radius={[3,3,0,0]} maxBarSize={40}>
                              <LabelList dataKey={dept} position="top" formatter={v=>v>0?`${v.toFixed(0)}h`:""} style={{fill:"#e8f4ff",fontSize:9,fontWeight:700}}/>
                            </Bar>
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Department Breakdown Table */}
                <div style={OS.card}>
                  <div style={OS.cardTitle}><span style={OS.dot}/> Department Breakdown</div>
                  {dashDeptBreakdown.length===0?(
                    <div style={{textAlign:"center",color:OT_ACQ.textMuted,padding:"2rem",fontSize:"0.85rem"}}>No data for selected filters</div>
                  ):(
                    <>
                      <table style={{width:"100%",borderCollapse:"collapse"}}>
                        <thead>
                          <tr>
                            {["Department","Records","OT Hours",dashCountry==="all"?"OT Pay":"OT Pay"].map((h,hi)=>(
                              <th key={h} style={{...OS.th,textAlign:hi===0?"left":"right"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dashDeptBreakdown.map((row,i)=>(
                            <tr key={row.dept}>
                              <td style={{...OS.td,fontWeight:600,color:"#e8f4ff"}}>
                                <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                                  <span style={{width:10,height:10,borderRadius:"50%",background:DEPT_COLORS[i%DEPT_COLORS.length],display:"inline-block"}}/>
                                  {row.dept}
                                </span>
                              </td>
                              <td style={{...OS.td,textAlign:"right"}}>{row.count}</td>
                              <td style={{...OS.td,textAlign:"right",color:OT_ACQ.teal,fontWeight:700}}>{row.hours.toFixed(1)}h</td>
                              <td style={{...OS.td,textAlign:"right",color:"#22c55e",fontWeight:800}}>
                                {dashCountry==="all"?"—":`${row.pay.toLocaleString(undefined,{maximumFractionDigits:0})} ${dashCurrency}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Grand total bar */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"1rem",padding:"0.9rem 1.2rem",background:"rgba(62,207,178,0.07)",borderRadius:10,border:"1px solid rgba(62,207,178,0.15)",flexWrap:"wrap",gap:10}}>
                        <span style={{color:OT_ACQ.textMuted,fontWeight:700,fontSize:"0.82rem",textTransform:"uppercase",letterSpacing:"0.05em"}}>Grand Total</span>
                        <div style={{display:"flex",gap:24,alignItems:"center"}}>
                          <span style={{color:OT_ACQ.teal,fontWeight:800,fontSize:"1rem"}}>{dashDeptBreakdown.reduce((s,r)=>s+r.hours,0).toFixed(1)}h</span>
                          {dashCountry!=="all"&&(
                            <span style={{color:"#22c55e",fontWeight:800,fontSize:"1.1rem"}}>{dashDeptBreakdown.reduce((s,r)=>s+r.pay,0).toLocaleString(undefined,{maximumFractionDigits:0})} {dashCurrency}</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── OT REPORTS ── */}
        {tab==="ot-reports"&&(
          <OTReportsPanel records={records} employees={employees} />
        )}

        {/* ── OT NEW REQUEST ── */}
        {tab==="ot-new"&&(
          <div style={OS.card}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:"1.2rem"}}>
              <div style={OS.cardTitle}>
                <span style={{background:OT_ACQ.teal,borderRadius:8,width:28,height:28,display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#111",fontSize:"0.85rem"}}>⏱</span>
                New Overtime Request
              </div>
              {/* + Add Another Row button */}
              <button
                style={{background:"rgba(62,207,178,0.1)",border:`1px solid ${OT_ACQ.tealBorder}`,borderRadius:9,padding:"7px 16px",color:OT_ACQ.teal,fontWeight:700,fontSize:"0.8rem",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}
                onClick={()=>{
                  // Validate current form before adding another row
                  const e={};
                  if(!form.department)e.department="Select a department";
                  if(!form.empId)e.empId="Select an employee";
                  if(!form.month)e.month="Select a month / cycle";
                  if(!form.otDate)e.otDate="Select the overtime date";
                  if(form.fromTime==="")e.fromTime="Select a start time";
                  if(form.toTime==="")e.toTime="Select an end time";
                  if(form.fromTime!==""&&form.toTime!==""&&calcOTHours(form.fromTime,form.toTime)===null)e.toTime="End time must be after start time";
                  if(!form.clientName)e.clientName="Select a client";
                  setFormErrors(e);
                  if(Object.keys(e).length)return;
                  // Snapshot current form into entries
                  const rowEmp=employees.find(e=>e.id===Number(form.empId));
                  setOtEntries(prev=>[...prev,{
                    empId:form.empId, empName:rowEmp?.name||"",
                    department:form.department, country:rowEmp?.country||"",
                    month:form.month, otDate:form.otDate,
                    fromTime:form.fromTime, toTime:form.toTime,
                    clientName:form.clientName, notes:form.notes,
                  }]);
                  // Reset date/time fields for next row; keep dept/emp/month/client
                  setForm(f=>({...f,otDate:"",fromTime:"",toTime:"",notes:"",attachment:null}));
                  setFormErrors({});
                }}>
                + Add Another Row
              </button>
            </div>

            {/* Multi-entry staged rows */}
            {otEntries.length>0&&(
              <div style={{marginBottom:"1.2rem",background:"rgba(62,207,178,0.04)",border:`1px solid ${OT_ACQ.tealBorder}`,borderRadius:10,padding:"10px 14px"}}>
                <div style={{fontSize:"0.7rem",color:OT_ACQ.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>
                  📋 Queued Entries ({otEntries.length})
                </div>
                {otEntries.map((entry,i)=>{
                  const hrs=calcOTHours(entry.fromTime,entry.toTime);
                  return(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"8px 12px",marginBottom:6,flexWrap:"wrap",gap:6}}>
                      <div style={{fontSize:"0.82rem",color:OT_ACQ.text,fontWeight:600}}>{entry.empName}</div>
                      <div style={{fontSize:"0.75rem",color:OT_ACQ.textMuted}}>{entry.otDate} · {formatMinutes(entry.fromTime)}–{formatMinutes(entry.toTime)} · {hrs?`${hrs.toFixed(1)}h`:"—"}</div>
                      <div style={{fontSize:"0.72rem",color:OT_ACQ.textMuted}}>{entry.clientName}</div>
                      <button onClick={()=>setOtEntries(prev=>prev.filter((_,j)=>j!==i))} style={{background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:6,padding:"3px 10px",color:"#ff6b6b",fontSize:"0.72rem",cursor:"pointer",fontWeight:600}}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}

            {otSelectedEmp&&(
              <div style={{background:otSelectedEmp.country==="KSA"?"rgba(62,207,178,0.08)":"rgba(245,158,11,0.08)",border:`1px solid ${otSelectedEmp.country==="KSA"?OT_ACQ.tealBorder:"rgba(245,158,11,0.3)"}`,borderRadius:10,padding:"10px 16px",marginBottom:"1.2rem",fontSize:"0.85rem",color:otSelectedEmp.country==="KSA"?OT_ACQ.teal:OT_ACQ.amber,fontWeight:600}}>
                {otSelectedEmp.country==="KSA"
                  ?"🇸🇦 OT for this employee will be calculated as per the Saudi labor law"
                  :"🇪🇬 OT for this employee will be calculated as per the Egyptian labor law"}
              </div>
            )}
            <div style={OS.grid}>

              {/* 1. Department * */}
              <div>
                <label style={OS.label}>Department *</label>
                <select style={formErrors.department?OS.inputError:OS.input} value={form.department}
                  onChange={e=>{setForm(f=>({...f,department:e.target.value,empId:""}));}}>
                  <option value="">Select department…</option>
                  {[...new Set(employees.map(e=>e.department))].sort().map(d=><option key={d} value={d}>{d}</option>)}
                </select>
                {formErrors.department&&<div style={OS.errorMsg}>{formErrors.department}</div>}
              </div>

              {/* 2. Employee Name * */}
              <div>
                <label style={OS.label}>Employee Name *</label>
                <select style={formErrors.empId?OS.inputError:OS.input} value={form.empId}
                  onChange={e=>setForm(f=>({...f,empId:e.target.value}))}
                  disabled={!form.department}>
                  <option value="">{form.department?"Select employee…":"Select department first"}</option>
                  {employees.filter(e=>e.department===form.department).map(e=>(
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                {formErrors.empId&&<div style={OS.errorMsg}>{formErrors.empId}</div>}
              </div>

              {/* 3. Month / Cycle * */}
              <div>
                <label style={OS.label}>Month / Cycle *</label>
                <select style={formErrors.month?OS.inputError:OS.input} value={form.month} onChange={e=>setForm(f=>({...f,month:e.target.value}))}>
                  {otMonthOpts().map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                {formErrors.month&&<div style={OS.errorMsg}>{formErrors.month}</div>}
              </div>

              {/* 4. Overtime Date * — Per Diem style calendar */}
              <div>
                <label style={OS.label}>Overtime Date *</label>
                <OTDatePicker
                  value={form.otDate}
                  onChange={v=>setForm(f=>({...f,otDate:v}))}
                  error={formErrors.otDate}
                />
                {form.otDate&&otSelectedEmp?.country==="Egypt"&&isWeekend(form.otDate)&&(
                  <div style={{fontSize:"0.72rem",color:"#f59e0b",marginTop:4,fontWeight:600}}>⚠️ Weekend — 2× rate applies</div>
                )}
              </div>

              {/* 5. From Time * */}
              <div>
                <label style={OS.label}>From Time *</label>
                <select style={formErrors.fromTime?OS.inputError:OS.input} value={form.fromTime}
                  onChange={e=>setForm(f=>({...f,fromTime:e.target.value}))}>
                  <option value="">Select start time…</option>
                  {OT_TIME_OPTIONS.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {formErrors.fromTime&&<div style={OS.errorMsg}>{formErrors.fromTime}</div>}
              </div>

              {/* 6. To Time * */}
              <div>
                <label style={OS.label}>To Time *</label>
                <select style={formErrors.toTime?OS.inputError:OS.input} value={form.toTime}
                  onChange={e=>setForm(f=>({...f,toTime:e.target.value}))}>
                  <option value="">Select end time…</option>
                  {OT_TIME_OPTIONS.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {formErrors.toTime&&<div style={OS.errorMsg}>{formErrors.toTime}</div>}
              </div>

              {/* 7. OT Hours — auto-calculated, read-only */}
              <div>
                <label style={OS.label}>OT Hours (Auto-Calculated)</label>
                <input readOnly style={{...OS.readOnly,color:otHoursCalc!==null?OT_ACQ.teal:"#444",fontWeight:otHoursCalc!==null?700:400}}
                  value={otHoursCalc!==null?`${otHoursCalc.toFixed(1)} hrs`:"Calculated from times above"}/>
                {formErrors.otHours&&<div style={OS.errorMsg}>{formErrors.otHours}</div>}
              </div>

              {/* Live Pay Preview — shows segment breakdown for Egypt */}
              {otHoursCalc!==null && otSelectedEmp && form.otDate && (()=>{
                const hr = getOTHourlyRate(otSelectedEmp.salary||0, otSelectedEmp.country);
                const {label:otLabel, color:otColor} = getOTMultiplier(otSelectedEmp.country, form.otDate, form.fromTime, form.toTime);
                const totalPay = computeOTPay(hr, otHoursCalc, otSelectedEmp.country, form.otDate, form.fromTime, form.toTime);
                const law = LABOR_LAWS[otSelectedEmp.country]||{};
                const currency = law.currency||"";

                // Build segment breakdown for Egypt weekday with overlap
                let segments = [];
                if (otSelectedEmp.country === "Egypt" && !isWeekend(form.otDate)) {
                  const from = Number(form.fromTime), to = Number(form.toTime);
                  let dayMin=0, nightMin=0;
                  const SLOT=30;
                  for(let t=from;t<to;t+=SLOT){
                    const end=Math.min(t+SLOT,to); const mid=t+(end-t)/2;
                    if(_isNightMinute(mid)) nightMin+=(end-t); else dayMin+=(end-t);
                  }
                  if(dayMin>0) segments.push({label:`Day OT (1.35×)`,hours:dayMin/60,pay:hr*(dayMin/60)*1.35,color:"#3ECFB2"});
                  if(nightMin>0) segments.push({label:`Night OT (1.70×)`,hours:nightMin/60,pay:hr*(nightMin/60)*1.70,color:"#a855f7"});
                }

                return (
                  <div style={{gridColumn:"1/-1",background:"rgba(62,207,178,0.05)",border:`1px solid rgba(62,207,178,0.2)`,borderRadius:12,padding:"14px 16px",marginTop:4}}>
                    <div style={{fontSize:"0.68rem",color:"rgba(62,207,178,0.7)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>
                      ⚡ Live Pay Estimate
                    </div>
                    {segments.length > 1 ? (
                      <>
                        {segments.map((seg,i)=>(
                          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,padding:"6px 10px",background:"rgba(255,255,255,0.03)",borderRadius:8,borderLeft:`3px solid ${seg.color}`}}>
                            <div>
                              <span style={{fontSize:"0.78rem",fontWeight:700,color:seg.color}}>{seg.label}</span>
                              <span style={{fontSize:"0.72rem",color:OT_ACQ.textMuted,marginLeft:8}}>{seg.hours.toFixed(1)} hrs × {hr.toFixed(2)} {currency}/hr</span>
                            </div>
                            <span style={{fontSize:"0.85rem",fontWeight:700,color:"#e8f4ff"}}>{seg.pay.toLocaleString(undefined,{maximumFractionDigits:2})} {currency}</span>
                          </div>
                        ))}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,paddingTop:8,borderTop:"1px solid rgba(62,207,178,0.15)"}}>
                          <span style={{fontSize:"0.78rem",color:OT_ACQ.textMuted,fontWeight:700}}>Total OT Pay</span>
                          <span style={{fontSize:"1.05rem",fontWeight:800,color:"#22c55e"}}>{totalPay.toLocaleString(undefined,{maximumFractionDigits:2})} {currency}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <span style={{fontSize:"0.82rem",fontWeight:700,color:otColor}}>{otLabel}</span>
                          <span style={{fontSize:"0.72rem",color:OT_ACQ.textMuted,marginLeft:8}}>{otHoursCalc.toFixed(1)} hrs × {hr.toFixed(2)} {currency}/hr</span>
                        </div>
                        <span style={{fontSize:"1.05rem",fontWeight:800,color:"#22c55e"}}>{totalPay.toLocaleString(undefined,{maximumFractionDigits:2})} {currency}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 8. Client Name * — from Client Names database */}
              <div>
                <label style={OS.label}>Client Name *</label>
                <select style={formErrors.clientName?OS.inputError:OS.input} value={form.clientName} onChange={e=>setForm(f=>({...f,clientName:e.target.value}))}>
                  <option value="">Select client…</option>
                  {clientNames.map(c=><option key={c.id} value={c.name}>{c.name}{c.code?` (${c.code})`:""}</option>)}
                  {clientNames.length===0&&<option disabled>No clients yet — add them in Database → Client Names</option>}
                </select>
                {formErrors.clientName&&<div style={OS.errorMsg}>{formErrors.clientName}</div>}
              </div>

              {/* 9. Attachment — optional */}
              <div>
                <label style={OS.label}>Attachment <span style={{color:OT_ACQ.textMuted,fontWeight:400,textTransform:"none",letterSpacing:0,fontSize:"0.72rem"}}>(optional)</span></label>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${OT_ACQ.border}`,borderRadius:10,padding:"10px 14px",cursor:"pointer",flex:1,color:OT_ACQ.textMuted,fontSize:"0.85rem"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    <span style={{color:form.attachment?OT_ACQ.teal:OT_ACQ.textMuted,fontWeight:form.attachment?600:400}}>
                      {form.attachment?form.attachment.name:"Click to attach file…"}
                    </span>
                    <input type="file" style={{display:"none"}} onChange={e=>setForm(f=>({...f,attachment:e.target.files[0]||null}))}/>
                  </label>
                  {form.attachment&&(
                    <button onClick={()=>setForm(f=>({...f,attachment:null}))} style={{background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:8,padding:"8px 12px",color:"#ff6b6b",cursor:"pointer",fontWeight:700,fontSize:"0.8rem"}}>✕</button>
                  )}
                </div>
              </div>

            </div>

            {/* 10. Notes / Justification — optional */}
            <div style={{marginTop:"1rem"}}>
              <label style={OS.label}>Notes / Justification <span style={{color:OT_ACQ.textMuted,fontWeight:400,textTransform:"none",letterSpacing:0,fontSize:"0.72rem"}}>(optional)</span></label>
              <textarea style={{...OS.input,minHeight:72,resize:"vertical"}} placeholder="Reason for overtime…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
            </div>

            {/* Submitter approval chain preview */}
            {(() => {
              const chain = resolveApprovalChain(currentUser, allUsers);
              return (
                <div style={{marginTop:"1rem",background:"rgba(62,207,178,0.04)",border:"1px solid rgba(62,207,178,0.15)",borderRadius:10,padding:"12px 16px"}}>
                  <div style={{fontSize:"0.68rem",color:"rgba(62,207,178,0.7)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>
                    Your Approval Chain — this request will be routed to:
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    {chain.map((step, i) => (
                      <div key={i} style={{display:"inline-flex",alignItems:"center",gap:6}}>
                        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(62,207,178,0.08)",border:"1px solid rgba(62,207,178,0.2)",borderRadius:20,padding:"4px 12px"}}>
                          <div style={{width:16,height:16,borderRadius:"50%",background:"#3ECFB2",color:"#111",fontWeight:800,fontSize:"0.6rem",display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</div>
                          <div>
                            <div style={{fontSize:"0.7rem",color:OT_ACQ.textMuted,lineHeight:1}}>{step.role}</div>
                            <div style={{fontSize:"0.76rem",color:"#fff",fontWeight:600}}>{step.approverName}</div>
                          </div>
                        </div>
                        {i < chain.length - 1 && <span style={{color:"#3ECFB2",fontSize:"0.8rem"}}>→</span>}
                      </div>
                    ))}
                  </div>
                  {!currentUser.direct_approver_id && (
                    <div style={{marginTop:8,fontSize:"0.7rem",color:"#555"}}>⚠️ No approval chain configured for your account. Ask an admin to set it up.</div>
                  )}
                </div>
              );
            })()}

            <div style={OS.btnRow}>
              <button style={OS.btnSecondary} onClick={()=>{setForm({department:"",empId:"",month:otCurMonth(),otDate:"",fromTime:"",toTime:"",clientName:"",notes:"",attachment:null});setOtEntries([]);setFormErrors({});}}>Clear All</button>
              <button style={OS.btnPrimary} onClick={handleSubmit}>
                {otEntries.length>0?`Submit All ${otEntries.length+1} Records →`:"Submit Request →"}
              </button>
            </div>
          </div>
        )}

        {/* ── OT RECORDS ── */}
        {tab==="ot-requests"&&(
          <div style={OS.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:"1.2rem"}}>
              <div style={OS.cardTitle}><span style={OS.dot}/> Overtime Records</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[
                  {v:filterMonth,set:setFilterMonth,opts:[["all","All Months"],...otMonthOpts().map(m=>[m,m])]},
                  {v:filterCountry,set:setFilterCountry,opts:[["all","All Countries"],["KSA","🇸🇦 KSA"],["Egypt","🇪🇬 Egypt"]]},
                  {v:filterStatus,set:setFilterStatus,opts:[["all","All Statuses"],...Object.entries(OT_STATUS_CFG).map(([k,v])=>[k,v.label])]},
                ].map(({v,set,opts},i)=>(
                  <select key={i} style={{...OS.input,width:"auto",fontSize:"0.8rem",padding:"7px 12px"}} value={v} onChange={e=>set(e.target.value)}>
                    {opts.map(([k,l])=><option key={k} value={k}>{l}</option>)}
                  </select>
                ))}
              </div>
            </div>
            {loadingRecords ? (
              <div style={{textAlign:"center",color:OT_ACQ.textMuted,padding:"3rem",fontSize:"0.85rem"}}>Loading records…</div>
            ) : filteredRecords.length===0?(
              <div style={{textAlign:"center",color:OT_ACQ.textMuted,padding:"3rem",fontSize:"0.85rem"}}>No records match the filters.</div>
            ):(
              <>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Employee","Dept","Country","Month","Hrs","Type","Pay","Status","Approval","Actions"].map(h=><th key={h} style={OS.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredRecords.map(r=>{
                      const law=LABOR_LAWS[r.country]||{};
                      const appLevels=r.approvalChain.filter(a=>a.status==="approved").length;
                      return(
                        <tr key={r.id}>
                          <td style={{...OS.td,color:OT_ACQ.text,fontWeight:600}}>{r.empName}</td>
                          <td style={OS.td}>{r.department}</td>
                          <td style={OS.td}><span style={otCountryBadge(r.country)}>{law.flag} {r.country}</span></td>
                          <td style={OS.td}>{r.month}</td>
                          <td style={{...OS.td,color:OT_ACQ.teal,fontWeight:700}}>{r.overtimeHours}h</td>
                          <td style={{...OS.td,fontSize:"0.75rem",color:"#888"}}>{r.overtimeType}</td>
                          <td style={{...OS.td,color:"#22c55e",fontWeight:700}}>{r.overtimePay.toLocaleString(undefined,{maximumFractionDigits:0})} {law.currency}</td>
                          <td style={OS.td}><span style={otStatusBadge(r.status)}>{OT_STATUS_CFG[r.status]?.label}</span></td>
                          <td style={OS.td}>
                            <div style={{fontSize:"0.72rem",color:OT_ACQ.textMuted}}>{appLevels}/{r.approvalChain.length}</div>
                            <div style={{display:"flex",gap:2,marginTop:3}}>{r.approvalChain.map((a,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:a.status==="approved"?"#22c55e":a.status==="rejected"?"#ef4444":"#333",border:`1px solid ${OT_ACQ.border}`}} title={`${a.role}: ${a.status}`}/>)}</div>
                          </td>
                          <td style={OS.td}>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={()=>setOtPreview(r)} style={{background:"rgba(62,207,178,0.1)",border:`1px solid ${OT_ACQ.tealBorder}`,borderRadius:7,padding:"4px 10px",color:OT_ACQ.teal,fontSize:"0.75rem",cursor:"pointer",fontWeight:600}}>View</button>
                              {deleteConfirm===r.id?(
                                <div style={{display:"flex",gap:4}}>
                                  <button onClick={async ()=>{
                                    try {
                                      await supa.deleteOTRecord(r.id);
                                      setRecords(p=>p.filter(x=>x.id!==r.id));
                                      setDeleteConfirm(null);
                                      showToast("Record deleted.");
                                    } catch(err) { showToast(`Delete failed: ${err.message}`,"error"); }
                                  }} style={{background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:6,padding:"4px 10px",color:"#ff6b6b",fontSize:"0.75rem",cursor:"pointer",fontWeight:700}}>Yes</button>
                                  <button onClick={()=>setDeleteConfirm(null)} style={{...OS.btnSecondary,padding:"4px 8px",fontSize:"0.75rem"}}>No</button>
                                </div>
                              ):(
                                <button onClick={()=>setDeleteConfirm(r.id)} style={OS.removeBtn}>Delete</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* ── Dynamic Totals per Country ── */}
              {recordTotalsByCountry.length>0&&(
                <div style={{marginTop:"1rem",display:"flex",flexDirection:"column",gap:8}}>
                  {recordTotalsByCountry.map(ct=>(
                    <div key={ct.country} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.85rem 1.2rem",background:`rgba(${ct.countryRgb},0.07)`,borderRadius:10,border:`1px solid rgba(${ct.countryRgb},0.2)`,flexWrap:"wrap",gap:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:"1rem"}}>{ct.flag}</span>
                        <span style={{fontWeight:700,color:ct.countryColor,fontSize:"0.88rem",textTransform:"uppercase",letterSpacing:"0.05em"}}>{ct.country}</span>
                        <span style={{fontSize:"0.72rem",color:OT_ACQ.textMuted,fontWeight:600}}>{ct.count} record{ct.count!==1?"s":""}</span>
                      </div>
                      <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
                        <div>
                          <div style={{fontSize:"0.62rem",color:OT_ACQ.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Total Hours</div>
                          <div style={{fontSize:"1rem",fontWeight:800,color:OT_ACQ.teal}}>{ct.totalHrs.toFixed(1)}h</div>
                        </div>
                        <div>
                          <div style={{fontSize:"0.62rem",color:OT_ACQ.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Total OT Pay</div>
                          <div style={{fontSize:"1rem",fontWeight:800,color:"#22c55e"}}>{ct.totalPay.toLocaleString(undefined,{maximumFractionDigits:0})} {ct.currency}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </>
            )}
          </div>
        )}

        {/* ── OT APPROVALS ── */}
        {tab==="ot-approval"&&(
          <div>
            <div style={{...OS.cardTitle,marginBottom:"1rem"}}>✅ Overtime Approval Queue</div>
            {records.filter(r=>r.status!=="approved"&&r.status!=="rejected").length===0&&(
              <div style={{...OS.card,textAlign:"center",color:OT_ACQ.textMuted,padding:"3rem",fontSize:"0.85rem"}}>🎉 No pending approvals!</div>
            )}
            {records.filter(r=>r.status!=="approved"&&r.status!=="rejected").map(r=>{
              const law=LABOR_LAWS[r.country]||{};
              return(
                <div key={r.id} style={{...OS.card,borderLeft:"3px solid #f59e0b",marginBottom:"1rem"}}>
                  {/* Header row */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:"1rem"}}>
                    <div>
                      <div style={{fontWeight:700,color:OT_ACQ.text,fontSize:"0.95rem"}}>{r.empName}</div>
                      <div style={{fontSize:"0.75rem",color:OT_ACQ.textMuted,marginTop:2}}>{r.department}</div>
                      {r.submittedBy && (
                        <div style={{fontSize:"0.68rem",color:"rgba(62,207,178,0.6)",marginTop:4,fontWeight:600}}>
                          Submitted by: <span style={{color:"#3ECFB2"}}>{r.submittedBy}</span>
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={otCountryBadge(r.country)}>{law.flag} {r.country}</span>
                      <span style={otStatusBadge(r.status)}>{OT_STATUS_CFG[r.status]?.label}</span>
                      <span style={{color:"#22c55e",fontWeight:700,fontSize:"0.9rem"}}>{r.overtimePay.toLocaleString(undefined,{maximumFractionDigits:2})} {law.currency}</span>
                    </div>
                  </div>

                  {/* Request detail grid */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:"1rem"}}>
                    {[
                      ["📅 OT Date",   r.otDate?new Date(r.otDate+"T12:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"],
                      ["📆 Month",     r.month||"—"],
                      ["⏱ OT Hours",  `${r.overtimeHours}h`],
                      ["🕐 From",      r.fromTimeLabel||formatMinutes(r.fromTime)||"—"],
                      ["🕔 To",        r.toTimeLabel||formatMinutes(r.toTime)||"—"],
                      ["🏢 Client",    r.clientName||"—"],
                      ["📊 Type",      r.overtimeType||"—"],
                    ].map(([l,v])=>(
                      <div key={l} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${OT_ACQ.border}`,borderRadius:8,padding:"8px 12px"}}>
                        <div style={{fontSize:"0.62rem",color:OT_ACQ.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3,fontWeight:700}}>{l}</div>
                        <div style={{fontSize:"0.82rem",color:OT_ACQ.text,fontWeight:600}}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {r.notes&&<div style={{marginBottom:"1rem",fontSize:"0.78rem",color:OT_ACQ.textMuted,background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"8px 12px"}}>📝 {r.notes}</div>}

                  {/* Approval chain steps */}
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {r.approvalChain.map((step,i)=>{
                      const isNext=step.status==="pending"&&r.approvalChain.slice(0,i).every(a=>a.status==="approved");
                      return(
                        <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${step.status==="approved"?"rgba(34,197,94,0.25)":step.status==="rejected"?"rgba(239,68,68,0.25)":OT_ACQ.border}`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:24,height:24,borderRadius:"50%",background:step.status==="approved"?"#22c55e":step.status==="rejected"?"#ef4444":isNext?"#f59e0b":"#333",color:["approved","rejected"].includes(step.status)?"#fff":"#111",fontWeight:800,fontSize:"0.72rem",display:"flex",alignItems:"center",justifyContent:"center"}}>{step.status==="approved"?"✓":step.status==="rejected"?"✗":i+1}</div>
                            <div>
                              <div style={{fontSize:"0.85rem",color:OT_ACQ.text,fontWeight:600}}>{step.role}</div>
                              {step.approverName && step.approverName !== "—" && (
                                <div style={{fontSize:"0.68rem",color:OT_ACQ.textMuted,marginTop:1}}>{step.approverName}</div>
                              )}
                              {step.signedBy&&<div style={{fontSize:"0.7rem",color:OT_ACQ.textMuted}}>✓ by {step.signedBy} · {step.signedAt}</div>}
                            </div>
                          </div>
                          {isNext&&step.status==="pending"?(
                            <div style={{display:"flex",gap:8}}>
                              <button onClick={()=>advanceApproval(r.id,i,"rejected")} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"5px 14px",color:"#ef4444",fontWeight:700,fontSize:"0.78rem",cursor:"pointer"}}>Reject</button>
                              <button onClick={()=>advanceApproval(r.id,i,"approved")} style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:8,padding:"5px 14px",color:"#22c55e",fontWeight:700,fontSize:"0.78rem",cursor:"pointer"}}>Approve ✓</button>
                            </div>
                          ):(
                            <span style={otStatusBadge(step.status==="pending"?"pending":step.status)}>{step.status==="pending"&&!isNext?"Waiting":OT_STATUS_CFG[step.status]?.label||step.status}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {records.filter(r=>r.status==="approved"||r.status==="rejected").length>0&&(
              <div style={{marginTop:"1.5rem"}}>
                <div style={{fontSize:"0.78rem",color:OT_ACQ.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Completed</div>
                {records.filter(r=>r.status==="approved"||r.status==="rejected").map(r=>{
                  const law=LABOR_LAWS[r.country]||{};
                  return(
                    <div key={r.id} style={{...OS.card,opacity:0.75,borderLeft:`3px solid ${r.status==="approved"?"#22c55e":"#ef4444"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:4}}>
                        <div>
                          <div style={{fontWeight:700,color:OT_ACQ.text,fontSize:"0.95rem"}}>{r.empName}</div>
                          <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>
                            {[
                              r.otDate?`📅 OT Date: ${new Date(r.otDate+"T12:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}`:null,
                              (r.fromTimeLabel||formatMinutes(r.fromTime))&&(r.fromTimeLabel||formatMinutes(r.fromTime))!=="—"?`🕐 From: ${r.fromTimeLabel||formatMinutes(r.fromTime)}`:null,
                              (r.toTimeLabel||formatMinutes(r.toTime))&&(r.toTimeLabel||formatMinutes(r.toTime))!=="—"?`🕔 To: ${r.toTimeLabel||formatMinutes(r.toTime)}`:null,
                              r.clientName&&r.clientName!=="—"?`🏢 Client: ${r.clientName}`:null,
                            ].filter(Boolean).map((item,idx)=>(
                              <div key={idx} style={{fontSize:"0.73rem",color:"#777",fontWeight:500}}>{item}</div>
                            ))}
                          </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                          <span style={otStatusBadge(r.status)}>{OT_STATUS_CFG[r.status]?.label}</span>
                          <div style={{display:"flex",gap:10,fontSize:"0.82rem",color:OT_ACQ.textMuted}}>
                            <span>📆 {r.month}</span>
                            <span style={{color:OT_ACQ.teal,fontWeight:700}}>⏱ {r.overtimeHours}h</span>
                            <span style={{color:"#22c55e",fontWeight:700}}>{r.overtimePay.toLocaleString(undefined,{maximumFractionDigits:0})} {law.currency}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── OT SALARY MGMT ── */}
        {tab==="ot-salary"&&(
          <div>
            <div style={{...OS.cardTitle,marginBottom:"1rem"}}>💰 Salary & OT Summary</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1rem"}}>
              {employees.map(emp=>{
                const empCountry=emp.country||"KSA";
                const law=LABOR_LAWS[empCountry]||LABOR_LAWS.KSA;
                const empRecs=records.filter(r=>r.empId===emp.id);
                const totalOT=empRecs.reduce((s,r)=>s+r.overtimePay,0);
                const totalHrs=empRecs.reduce((s,r)=>s+r.overtimeHours,0);
                const salary=emp.salary||0;
                const monthHrs=empRecs.filter(r=>r.month===otCurMonth()).reduce((s,r)=>s+r.overtimeHours,0);
                const basicSalary=getBasicSalary(salary,empCountry);
                const isEditing=salaryEditId===emp.id;
                return(
                  <div key={emp.id} style={{...OS.card,borderLeft:`3px solid ${empCountry==="KSA"?OT_ACQ.teal:OT_ACQ.amber}`}}>
                    <div style={{marginBottom:"1rem"}}>
                      <div style={{fontWeight:700,color:OT_ACQ.text,fontSize:"0.9rem"}}>{emp.name}</div>
                      <div style={{fontSize:"0.75rem",color:OT_ACQ.textMuted}}>{emp.department} · {emp.position}</div>
                      <span style={{...otCountryBadge(empCountry),marginTop:4,display:"inline-block"}}>{law.flag} {empCountry}</span>
                    </div>
                    <div style={{marginBottom:"0.8rem"}}>
                      <div style={{fontSize:"0.72rem",color:OT_ACQ.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Monthly Salary</div>
                      {isEditing?(
                        <div style={{display:"flex",gap:6}}>
                          <input type="number" style={{...OS.input,flex:1,padding:"8px 12px"}} value={salaryEditVal} onChange={e=>setSalaryEditVal(e.target.value)} autoFocus/>
                          <button onClick={async ()=>{
                            const val=Number(salaryEditVal);
                            if(val>0){
                              setEmployees(prev=>prev.map(e=>e.id===emp.id?{...e,salary:val}:e));
                              try {
                                await supa.updateOTSalary(emp.id, val);
                                showToast(`Salary updated for ${emp.name}`);
                              } catch(err) {
                                setEmployees(prev=>prev.map(e=>e.id===emp.id?{...e,salary:emp.salary}:e));
                                showToast(`Save failed: ${err.message}`,"error");
                              }
                            }
                            setSalaryEditId(null);
                          }} style={{background:OT_ACQ.teal,border:"none",borderRadius:8,padding:"8px 12px",color:"#111",fontWeight:700,cursor:"pointer",fontSize:"0.8rem"}}>✓</button>
                          <button onClick={()=>setSalaryEditId(null)} style={{...OS.btnSecondary,padding:"8px 12px",fontSize:"0.8rem"}}>✕</button>
                        </div>
                      ):(
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontSize:"1.2rem",fontWeight:800,color:OT_ACQ.text}}>{salary.toLocaleString()} <span style={{fontSize:"0.75rem",color:OT_ACQ.textMuted,fontWeight:400}}>{law.currency}/mo</span></div>
                          <button onClick={()=>{setSalaryEditId(emp.id);setSalaryEditVal(emp.salary);}} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${OT_ACQ.border}`,borderRadius:7,padding:"4px 10px",color:OT_ACQ.textSub,fontSize:"0.75rem",cursor:"pointer"}}>Edit</button>
                        </div>
                      )}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:"0.8rem"}}>
                      {[["OT Hourly Rate",`${getOTHourlyRate(salary,empCountry).toFixed(2)} ${law.currency}`],["OT Hrs YTD",`${totalHrs.toFixed(1)}h`],["OT Pay YTD",`${totalOT.toLocaleString(undefined,{maximumFractionDigits:0})} ${law.currency}`]].map(([l,v])=>(
                        <div key={l} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"8px 10px"}}>
                          <div style={{fontSize:"0.65rem",color:OT_ACQ.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3}}>{l}</div>
                          <div style={{fontSize:"0.82rem",fontWeight:700,color:OT_ACQ.teal}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:"0.7rem",color:OT_ACQ.textMuted,display:"flex",justifyContent:"space-between",marginBottom:2}}><span>Basic Salary ({empCountry==="KSA"?"65%":"80%"})</span><span style={{color:OT_ACQ.textSub,fontWeight:700}}>{basicSalary.toLocaleString(undefined,{maximumFractionDigits:0})} {law.currency}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LABOR LAWS ── */}
        {tab==="ot-laws"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(420px,1fr))",gap:"1.2rem",marginBottom:"1.5rem"}}>
              {Object.entries(LABOR_LAWS).map(([key,law])=>(
                <div key={key} style={{...OS.card,borderTop:`3px solid ${key==="KSA"?OT_ACQ.teal:OT_ACQ.amber}`}}>
                  <div style={{fontSize:"1.5rem",marginBottom:4}}>{law.flag}</div>
                  <div style={{fontWeight:800,fontSize:"1.05rem",color:OT_ACQ.text,marginBottom:2}}>{law.name}</div>
                  <div style={{fontSize:"0.75rem",color:OT_ACQ.textMuted,marginBottom:"1.2rem",fontStyle:"italic"}}>{law.lawRef}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1rem"}}>
                    {[
                      ["Standard Workday",`${law.workdayHours} hrs/day`],
                      ["Max Weekly Hours",`${law.weeklyHours} hrs`],
                      ["Standard OT Rate",`${law.overtimeMultiplier}×`],
                      ["Weekend Rate",`${law.weekendMultiplier}×`],
                      ["Official Holidays",`${law.holidayMultiplier}×`],
                      ["Currency",law.currency],
                    ].map(([l,v])=>(
                      <div key={l} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${OT_ACQ.border}`,borderRadius:8,padding:"10px 12px"}}>
                        <div style={{fontSize:"0.65rem",color:OT_ACQ.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{l}</div>
                        <div style={{fontSize:"0.9rem",fontWeight:700,color:key==="KSA"?OT_ACQ.teal:OT_ACQ.amber}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginBottom:"1rem"}}>
                    <div style={{fontSize:"0.72rem",color:OT_ACQ.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Weekly Off Days</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{law.weeklyOffDays.map(d=><span key={d} style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:"0.7rem",fontWeight:700,background:"rgba(255,255,255,0.06)",color:OT_ACQ.textSub,border:`1px solid ${OT_ACQ.border}`}}>{d}</span>)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Editable Approval Thresholds */}
            <div style={OS.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
                <div style={OS.cardTitle}><span style={OS.dot}/> Approval Thresholds</div>
                {!editingThresholds?(
                  <button onClick={()=>{setThresholdDraft(approvalThresholds.map(t=>({...t,chain:[...t.chain]})));setEditingThresholds(true);}} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${OT_ACQ.border}`,borderRadius:8,padding:"6px 14px",color:OT_ACQ.textSub,fontSize:"0.78rem",cursor:"pointer",fontWeight:600}}>✏️ Edit</button>
                ):(
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={async ()=>{
                      setApprovalThresholds(thresholdDraft);
                      setEditingThresholds(false);
                      // Persist each threshold row that has a DB id
                      try {
                        await Promise.all(thresholdDraft.filter(t=>t.id).map(t=>
                          supa.updateOTThreshold(t.id, { threshold: t.threshold, periodType: t.periodType, chain: t.chain })
                        ));
                        showToast("Approval thresholds updated!");
                      } catch(err) {
                        showToast(`Save failed: ${err.message}`,"error");
                      }
                    }} style={{background:OT_ACQ.teal,border:"none",borderRadius:8,padding:"6px 14px",color:"#111",fontSize:"0.78rem",cursor:"pointer",fontWeight:700}}>Save</button>
                    <button onClick={()=>setEditingThresholds(false)} style={{...OS.btnSecondary,padding:"6px 14px",fontSize:"0.78rem"}}>Cancel</button>
                  </div>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {(editingThresholds?thresholdDraft:approvalThresholds).map((t,i)=>(
                  <div key={t.range} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${OT_ACQ.border}`,borderRadius:10,padding:"12px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:8}}>
                      <div style={{fontSize:"0.72rem",color:OT_ACQ.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",minWidth:60}}>{t.range}</div>
                      {editingThresholds?(
                        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{fontSize:"0.78rem",color:OT_ACQ.textSub}}>Up to</span>
                          <input type="number" min="0" style={{...OS.input,width:80,padding:"5px 10px",fontSize:"0.82rem"}}
                            value={t.threshold===Infinity?"":t.threshold}
                            placeholder="∞"
                            onChange={e=>{const v=e.target.value===""?Infinity:Number(e.target.value);setThresholdDraft(d=>d.map((x,j)=>j===i?{...x,threshold:v}:x));}}/>
                          <select style={{...OS.input,width:100,padding:"5px 10px",fontSize:"0.82rem"}} value={t.periodType}
                            onChange={e=>setThresholdDraft(d=>d.map((x,j)=>j===i?{...x,periodType:e.target.value}:x))}>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                          </select>
                        </div>
                      ):(
                        <div style={{fontSize:"0.82rem",color:OT_ACQ.textSub}}>Up to <strong style={{color:OT_ACQ.text}}>{t.threshold===Infinity?"∞":t.threshold}</strong> {t.periodType}</div>
                      )}
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {t.chain.map((c,j)=>(
                        <div key={j} style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",border:`1px solid ${OT_ACQ.border}`,borderRadius:20,padding:"3px 12px"}}>
                          <div style={{width:18,height:18,borderRadius:"50%",background:OT_ACQ.teal,color:"#111",fontWeight:800,fontSize:"0.65rem",display:"flex",alignItems:"center",justifyContent:"center"}}>{j+1}</div>
                          <span style={{fontSize:"0.75rem",color:OT_ACQ.textSub}}>{c.role}</span>
                          {j<t.chain.length-1&&<span style={{color:OT_ACQ.textMuted,fontSize:"0.7rem"}}>→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── OT EMPLOYEES ── */}
        {tab==="ot-employees"&&(
          <>
            <div style={OS.card}>
              <div style={OS.cardTitle}><span style={OS.dot}/> {empEditId?"Edit Employee":"Add Employee"}</div>
              <div style={OS.grid}>
                {[["name","Full Name *","e.g. Mohammed Al-Harbi"],["department","Department *","e.g. Finance"],["position","Position *","e.g. Senior Accountant"]].map(([k,l,ph])=>(
                  <div key={k}><label style={OS.label}>{l}</label><input style={empErrors[k]?OS.inputError:OS.input} value={empForm[k]||""} onChange={e=>setEmpForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}/>{empErrors[k]&&<div style={OS.errorMsg}>{empErrors[k]}</div>}</div>
                ))}
                <div><label style={OS.label}>Country (for OT Law)</label><select style={OS.input} value={empForm.country||"KSA"} onChange={e=>setEmpForm(f=>({...f,country:e.target.value}))}><option value="KSA">🇸🇦 Saudi Arabia (KSA)</option><option value="Egypt">🇪🇬 Egypt</option></select></div>
                <div>
                  <label style={OS.label}>Monthly Salary</label>
                  <input type="number" min="0" style={OS.input} value={empForm.salary||""} onChange={e=>setEmpForm(f=>({...f,salary:Number(e.target.value)}))} placeholder="e.g. 15000"/>
                </div>
                <div>
                  <label style={OS.label}>Basic Salary (Auto-Calculated)</label>
                  <input readOnly style={{...OS.readOnly,color:empForm.salary?OT_ACQ.teal:"#444",fontWeight:empForm.salary?700:400}}
                    value={empForm.salary>0?`${getBasicSalary(Number(empForm.salary),empForm.country||"KSA").toLocaleString(undefined,{maximumFractionDigits:0})} ${LABOR_LAWS[empForm.country||"KSA"]?.currency} (${empForm.country==="Egypt"?"80%":"65%"} of total)`:"Calculated after salary entry"}/>
                </div>
              </div>
              <div style={OS.btnRow}>
                {empEditId&&<button style={OS.btnSecondary} onClick={()=>{setEmpEditId(null);setEmpForm({name:"",department:"",position:"",country:"KSA",salary:""});setEmpErrors({});}}>Cancel</button>}
                <button style={OS.btnPrimary} onClick={async ()=>{
                  const e={};
                  if(!empForm.name?.trim())e.name="Required";
                  if(!empForm.department?.trim())e.department="Required";
                  if(!empForm.position?.trim())e.position="Required";
                  setEmpErrors(e);
                  if(Object.keys(e).length)return;
                  if(empEditId){
                    // Optimistic update
                    setEmployees(p=>p.map(x=>x.id===empEditId?{...x,...empForm}:x));
                    try {
                      await supa.updateOTEmployee(empEditId, empForm);
                      showToast("Employee updated!");
                    } catch(err) {
                      // refetch on error
                      supa.getOTEmployees().then(setEmployees).catch(()=>{});
                      showToast(`Save failed: ${err.message}`,"error");
                    }
                    setEmpEditId(null);
                  } else {
                    try {
                      const saved = await supa.addOTEmployee(empForm);
                      setEmployees(p=>[...p, saved]);
                      showToast("Employee added!");
                    } catch(err) {
                      showToast(`Add failed: ${err.message}`,"error");
                    }
                  }
                  setEmpForm({name:"",department:"",position:"",country:"KSA",salary:""});
                  setEmpErrors({});
                }}>{empEditId?"Save Changes":"+ Add Employee"}</button>
              </div>
            </div>
            <div style={OS.card}>
              <div style={OS.cardTitle}><span style={OS.dot}/> Employees ({employees.length})</div>
              {loadingEmployees ? (
                <div style={{textAlign:"center",color:OT_ACQ.textMuted,padding:"2rem",fontSize:"0.85rem"}}>Loading employees…</div>
              ) : (
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Name","Dept","Position","Country","Total Salary","Basic Salary",""].map(h=><th key={h} style={OS.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {employees.map(emp=>{
                      const basic=getBasicSalary(emp.salary||0,emp.country||"KSA");
                      return(
                        <tr key={emp.id}>
                          <td style={{...OS.td,color:OT_ACQ.text,fontWeight:600}}>{emp.name}</td>
                          <td style={OS.td}>{emp.department}</td>
                          <td style={OS.td}>{emp.position}</td>
                          <td style={OS.td}>{emp.country?<span style={otCountryBadge(emp.country)}>{LABOR_LAWS[emp.country]?.flag} {emp.country}</span>:"—"}</td>
                          <td style={{...OS.td,color:OT_ACQ.teal,fontWeight:700}}>{emp.salary?`${emp.salary.toLocaleString()} ${LABOR_LAWS[emp.country]?.currency||"SAR"}`:<span style={{color:"#444",fontSize:"0.75rem"}}>Not set</span>}</td>
                          <td style={{...OS.td,color:OT_ACQ.amber,fontWeight:600}}>{emp.salary?`${basic.toLocaleString(undefined,{maximumFractionDigits:0})} ${LABOR_LAWS[emp.country]?.currency||"SAR"}`:"—"}</td>
                          <td style={OS.td}>
                            <div style={{display:"flex",gap:6}}>
                              <button style={{background:"rgba(62,207,178,0.1)",border:`1px solid ${OT_ACQ.tealBorder}`,borderRadius:7,padding:"4px 10px",color:OT_ACQ.teal,fontSize:"0.75rem",cursor:"pointer",fontWeight:600}} onClick={()=>{setEmpEditId(emp.id);setEmpForm({name:emp.name,department:emp.department,position:emp.position,country:emp.country||"KSA",salary:emp.salary||""});setEmpErrors({});}}>Edit</button>
                              <button style={OS.removeBtn} onClick={async ()=>{
                                setEmployees(p=>p.filter(e=>e.id!==emp.id));
                                try {
                                  await supa.deleteOTEmployee(emp.id);
                                  showToast("Employee removed.");
                                } catch(err) {
                                  supa.getOTEmployees().then(setEmployees).catch(()=>{});
                                  showToast(`Remove failed: ${err.message}`,"error");
                                }
                              }}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </>
        )}

        {/* ── CLIENT NAMES ── */}
        {tab==="ot-clients"&&(
          <>
            <div style={OS.card}>
              <div style={OS.cardTitle}><span style={OS.dot}/> Add New Client</div>
              <div style={OS.grid}>
                <div>
                  <label style={OS.label}>Client Name *</label>
                  <input
                    style={clientFormError?OS.inputError:OS.input}
                    value={clientForm.name}
                    onChange={e=>{setClientForm(f=>({...f,name:e.target.value}));setClientFormError("");}}
                    placeholder="e.g. Aramco"
                    onKeyDown={async e=>{
                      if(e.key!=="Enter")return;
                      if(!clientForm.name.trim()){setClientFormError("Client name is required");return;}
                      if(clientNames.find(c=>c.name.toLowerCase()===clientForm.name.trim().toLowerCase())){setClientFormError("Client already exists");return;}
                      try {
                        const newClient = await supa.addOTClient(clientForm.name.trim(), clientForm.code.trim());
                        setClientNames(prev=>[...prev,newClient].sort((a,b)=>a.name.localeCompare(b.name)));
                        setClientForm({name:"",code:""});setClientFormError("");showToast("✅ Client added!");
                      } catch(err){showToast(`Failed to add client: ${err.message}`,"error");}
                    }}
                  />
                  {clientFormError&&<div style={OS.errorMsg}>{clientFormError}</div>}
                </div>
                <div>
                  <label style={OS.label}>Client Code <span style={{color:OT_ACQ.textMuted,fontWeight:400,textTransform:"none",letterSpacing:0,fontSize:"0.72rem"}}>(optional)</span></label>
                  <input style={OS.input} value={clientForm.code} onChange={e=>setClientForm(f=>({...f,code:e.target.value}))} placeholder="e.g. ARC-001"/>
                </div>
              </div>
              <div style={OS.btnRow}>
                <button style={OS.btnPrimary} onClick={async()=>{
                  if(!clientForm.name.trim()){setClientFormError("Client name is required");return;}
                  if(clientNames.find(c=>c.name.toLowerCase()===clientForm.name.trim().toLowerCase())){setClientFormError("Client already exists");return;}
                  try {
                    const newClient = await supa.addOTClient(clientForm.name.trim(), clientForm.code.trim());
                    setClientNames(prev=>[...prev,newClient].sort((a,b)=>a.name.localeCompare(b.name)));
                    setClientForm({name:"",code:""});setClientFormError("");showToast("✅ Client added!");
                  } catch(err){showToast(`Failed to add client: ${err.message}`,"error");}
                }}>+ Add Client</button>
              </div>
            </div>
            <div style={OS.card}>
              <div style={OS.cardTitle}><span style={OS.dot}/> Client List ({clientNames.length})</div>
              {clientNames.length===0?(
                <div style={{textAlign:"center",color:OT_ACQ.textMuted,padding:"2rem",fontSize:"0.85rem"}}>No clients added yet. Add your first client above.</div>
              ):(
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Client Name","Code",""].map(h=><th key={h} style={OS.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {clientNames.map(c=>(
                      <tr key={c.id}>
                        <td style={{...OS.td,color:OT_ACQ.text,fontWeight:600}}>{c.name}</td>
                        <td style={OS.td}>{c.code||<span style={{color:"#444",fontSize:"0.75rem"}}>—</span>}</td>
                        <td style={OS.td}>
                          <button style={OS.removeBtn} onClick={async()=>{
                            try {
                              await supa.deleteOTClient(c.id);
                              setClientNames(prev=>prev.filter(x=>x.id!==c.id));
                              showToast("Client removed");
                            } catch(err){showToast(`Failed to remove: ${err.message}`,"error");}
                          }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

      </div>

      {/* OT Preview Modal */}
      {otPreview&&(
        <div onClick={()=>setOtPreview(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.6)",color:"#1a2a3a",fontFamily:"'Segoe UI',Arial,sans-serif"}}>
            <div style={{background:"linear-gradient(135deg,#1a8fe3,#0dd3b4)",padding:"16px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{color:"#fff",fontWeight:800,fontSize:"1rem"}}>Overtime Request — {otPreview.empName}</div><div style={{color:"rgba(255,255,255,0.75)",fontSize:"0.75rem",marginTop:2}}>#{String(otPreview.id).slice(-6)} · {otPreview.month}</div></div>
              <button onClick={()=>setOtPreview(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,width:32,height:32,color:"#fff",fontWeight:700,fontSize:"1.1rem",cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"28px 32px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",border:"1px solid #e0e8f0",borderRadius:8,overflow:"hidden",marginBottom:18}}>
                {[["Employee",otPreview.empName],["Department",otPreview.department],["Country",otPreview.country],["Month",otPreview.month],["OT Type",otPreview.overtimeType],["OT Hours",`${otPreview.overtimeHours} hrs`],["Multiplier",`${otPreview.multiplier}×`],["Hourly Rate",`${(otPreview.hourlyRate||0).toFixed(2)} ${LABOR_LAWS[otPreview.country]?.currency||"SAR"}`]].map(([l,v])=>(
                  <div key={l} style={{padding:"9px 14px",borderBottom:"1px solid #e8f0f8"}}><div style={{fontSize:"0.62rem",color:"#999",textTransform:"uppercase",letterSpacing:"0.8px",fontWeight:700,marginBottom:2}}>{l}</div><div style={{fontSize:"0.85rem",fontWeight:600,color:"#1a2a3a"}}>{v}</div></div>
                ))}
              </div>
              <div style={{background:"linear-gradient(135deg,#1a8fe3,#0dd3b4)",borderRadius:10,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <div style={{color:"rgba(255,255,255,0.85)",fontSize:"0.78rem",fontWeight:700,textTransform:"uppercase"}}>Overtime Pay Due</div>
                <div style={{color:"#fff",fontSize:"1.6rem",fontWeight:800}}>{otPreview.overtimePay.toLocaleString(undefined,{maximumFractionDigits:2})} {LABOR_LAWS[otPreview.country]?.currency||"SAR"}</div>
              </div>
              <div style={{fontSize:"0.7rem",color:"#1a8fe3",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Approval Chain</div>
              {otPreview.submittedBy && (
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",background:"#f0f7ff",borderRadius:8,marginBottom:10,border:"1px solid #e0e8f0"}}>
                  <span style={{fontSize:"0.72rem",color:"#999",fontWeight:700}}>SUBMITTED BY</span>
                  <span style={{fontSize:"0.82rem",fontWeight:700,color:"#1a8fe3"}}>{otPreview.submittedBy}</span>
                  <span style={{fontSize:"0.68rem",color:"#bbb",marginLeft:"auto"}}>Approval follows submitter's chain</span>
                </div>
              )}
              {otPreview.approvalChain.map((step,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#f8fafc",borderRadius:8,marginBottom:6,border:"1px solid #e0e8f0"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:step.status==="approved"?"#22c55e":step.status==="rejected"?"#ef4444":"#ddd",color:"#fff",fontWeight:800,fontSize:"0.7rem",display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</div>
                    <div>
                      <div style={{fontSize:"0.82rem",fontWeight:600,color:"#1a2a3a"}}>{step.role}</div>
                      {step.approverName && step.approverName !== "—" && (
                        <div style={{fontSize:"0.68rem",color:"#999",marginTop:1}}>{step.approverName}</div>
                      )}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                    <span style={{fontSize:"0.72rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:step.status==="approved"?"#dcfce7":step.status==="rejected"?"#fee2e2":"#f3f4f6",color:step.status==="approved"?"#16a34a":step.status==="rejected"?"#dc2626":"#6b7280"}}>{step.status}</span>
                    {step.signedBy&&<span style={{fontSize:"0.65rem",color:"#bbb"}}>{step.signedBy}</span>}
                  </div>
                </div>
              ))}
              {otPreview.notes&&<div style={{marginTop:14,padding:"10px 14px",background:"#f8fafc",borderRadius:8,border:"1px solid #e0e8f0",fontSize:"0.82rem",color:"#555"}}>📝 {otPreview.notes}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Demo accounts — fallback when Supabase is unreachable (Claude preview sandbox / CORS)
const DEMO_ACCOUNTS = [
  { username: "admin",   password: "Acquaint2026", full_name: "Admin User",   role: "admin"   },
  { username: "finance", password: "finance123",   full_name: "Finance User", role: "finance" },
  { username: "hr",      password: "hr123",        full_name: "HR User",      role: "hr"      },
  { username: "viewer",  password: "viewer123",    full_name: "Viewer",       role: "viewer"  },
];

// ═══════════════════════════════════════════════════════════════
// PLATFORM MODULE REGISTRY — single source of truth
// Add new modules here; Admin Panel picks them up automatically.
// ═══════════════════════════════════════════════════════════════
const PLATFORM_MODULES = [
  {
    id: "perdiem",
    label: "Per Diem",
    sub: "Travel Allowance",
    color: "#1a8fe3",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    tabs: [
      { key: "dashboard",  label: "📊 Dashboard"   },
      { key: "form",       label: "🧾 New Request"  },
      { key: "requests",   label: "📋 Requests"     },
      { key: "reports",    label: "📊 Reports"      },
      { key: "employees",  label: "👥 Employees"    },
      { key: "cities",     label: "🏙️ Cities"       },
      { key: "admin",      label: "⚙️ Admin Panel"  },
    ],
  },
  {
    id: "overtime",
    label: "Overtime",
    sub: "KSA & Egypt Law",
    color: "#3ECFB2",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    tabs: [
      { key: "dashboard",     label: "📊 Dashboard"   },
      { key: "ot-new",        label: "⏱ New Request"  },
      { key: "ot-requests",   label: "📋 OT Records"  },
      { key: "ot-approval",   label: "✅ Approvals"   },
      { key: "ot-salary",     label: "💰 Salary Mgmt" },
      { key: "ot-laws",       label: "⚖️ Labor Laws"  },
      { key: "ot-employees",  label: "👥 Employees"   },
      { key: "ot-clients",    label: "🏢 Client Names" },
    ],
  },
  // ── Add future modules here, e.g.:
  // { id: "loans", label: "Loans", sub: "Loan Management", color: "#8b5cf6", icon: (...), tabs: [...] },
];

// ── Permission helpers ──────────────────────────────────────────
// Permissions are stored in user.role as JSON: {"perdiem":["dashboard","form"],"overtime":["dashboard"]}
// Legacy flat-string roles are upgraded on first parse.
const LEGACY_ROLE_MAP = {
  admin:   { perdiem: ["dashboard","form","requests","reports","employees","cities","admin"], overtime: ["dashboard","ot-new","ot-requests","ot-approval","ot-salary","ot-laws","ot-employees","ot-clients"] },
  finance: { perdiem: ["dashboard","requests","reports"],                                    overtime: ["dashboard","ot-requests"] },
  hr:      { perdiem: ["dashboard","form","requests","employees"],                           overtime: ["dashboard","ot-new","ot-requests","ot-employees","ot-clients"] },
  viewer:  { perdiem: ["dashboard","requests"],                                              overtime: ["dashboard"] },
};

function parseUserPerms(user) {
  if (!user) return {};
  const r = (user.role || "").trim();
  if (!r) return {};
  // Known legacy role name
  if (LEGACY_ROLE_MAP[r]) return LEGACY_ROLE_MAP[r];
  // Try JSON
  try { const p = JSON.parse(r); if (typeof p === "object" && !Array.isArray(p)) return p; } catch {}
  // Comma-separated flat list (old Per Diem only) → grant to perdiem only
  const flat = r.split(",").map(s => s.trim()).filter(Boolean);
  return flat.length ? { perdiem: flat } : {};
}

function serializePerms(permsObj) {
  return JSON.stringify(permsObj);
}

function canAccessModule(user, moduleId) {
  const p = parseUserPerms(user);
  return Array.isArray(p[moduleId]) && p[moduleId].length > 0;
}

function canAccessTab(user, moduleId, tabKey) {
  const p = parseUserPerms(user);
  return Array.isArray(p[moduleId]) && p[moduleId].includes(tabKey);
}

function isAdminUser(user) {
  // Admin if they have access to admin tab in any module, OR legacy role "admin"
  if (!user) return false;
  if ((user.role||"").trim() === "admin") return true;
  const p = parseUserPerms(user);
  return Object.values(p).some(tabs => tabs.includes("admin"));
}

// ═══════════════════════════════════════════════════════════════
// ADMIN PANEL — platform-wide, standalone component
// ═══════════════════════════════════════════════════════════════
function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ full_name: "", username: "", password: "" });
  const [newPerms, setNewPerms] = useState({});          // { moduleId: [tabKey, ...] }
  const [newApprovalChain, setNewApprovalChain] = useState({ direct_approver_id: "", second_approver_id: "", third_approver_id: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [editPerms, setEditPerms] = useState({});
  const [editApprovalChain, setEditApprovalChain] = useState({ direct_approver_id: "", second_approver_id: "", third_approver_id: "" });
  const [editNewPassword, setEditNewPassword] = useState("");
  const [toast, setToast] = useState(null);

  function showToast(msg, type="success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  useEffect(() => {
    supa.getUsers().then(setUsers).catch(() => {});
  }, []);

  // Toggle a single tab within a module for a perms object
  function toggleTab(permsObj, moduleId, tabKey) {
    const existing = permsObj[moduleId] || [];
    const has = existing.includes(tabKey);
    return { ...permsObj, [moduleId]: has ? existing.filter(k => k !== tabKey) : [...existing, tabKey] };
  }

  // Toggle entire module — grants all tabs if none selected, clears if all selected
  function toggleModule(permsObj, moduleId) {
    const mod = PLATFORM_MODULES.find(m => m.id === moduleId);
    const existing = permsObj[moduleId] || [];
    if (existing.length === mod.tabs.length) {
      // deselect all
      const p = { ...permsObj }; delete p[moduleId]; return p;
    }
    return { ...permsObj, [moduleId]: mod.tabs.map(t => t.key) };
  }

  const teal = "#3ECFB2";
  const border = "rgba(255,255,255,0.08)";
  const cardStyle = { background: "#222", border: `1px solid ${border}`, borderRadius: 14, padding: "1.4rem", marginBottom: "1rem" };
  const labelStyle = { fontSize: "0.72rem", color: "#888", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, display: "block" };
  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${border}`, borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" };

  // Reusable permission grid renderer
  function PermGrid({ permsObj, onChange, accentColor }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {PLATFORM_MODULES.map(mod => {
          const granted = permsObj[mod.id] || [];
          const allSelected = granted.length === mod.tabs.length;
          const someSelected = granted.length > 0 && !allSelected;
          return (
            <div key={mod.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${granted.length>0 ? mod.color+"40" : border}`, borderRadius: 12, overflow: "hidden" }}>
              {/* Module header — click to toggle whole module */}
              <div
                onClick={() => onChange(toggleModule(permsObj, mod.id))}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", background: granted.length>0 ? `${mod.color}0d` : "transparent", borderBottom: `1px solid ${border}` }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${allSelected ? mod.color : someSelected ? mod.color : "#444"}`, background: allSelected ? mod.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                  {allSelected && <span style={{ color: "#111", fontSize: "0.6rem", fontWeight: 900 }}>✓</span>}
                  {someSelected && <span style={{ color: mod.color, fontSize: "0.65rem", fontWeight: 900 }}>—</span>}
                </div>
                <div style={{ color: mod.icon.props?.stroke || mod.color, flexShrink: 0 }}>{mod.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: granted.length>0 ? "#fff" : "#666" }}>{mod.label}</div>
                  <div style={{ fontSize: "0.65rem", color: mod.color, fontWeight: 600 }}>{granted.length}/{mod.tabs.length} tabs</div>
                </div>
                <div style={{ fontSize: "0.65rem", color: "#444", fontWeight: 600 }}>{allSelected?"Deselect All":"Select All"}</div>
              </div>
              {/* Tab checkboxes */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 16px" }}>
                {mod.tabs.map(tab => {
                  const active = granted.includes(tab.key);
                  return (
                    <label key={tab.key}
                      onClick={() => onChange(toggleTab(permsObj, mod.id, tab.key))}
                      style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", background: active ? `${mod.color}18` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? mod.color+"55" : border}`, borderRadius: 8, padding: "6px 12px", userSelect: "none", transition: "all 0.15s" }}
                    >
                      <span style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${active ? mod.color : "#444"}`, background: active ? mod.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                        {active && <span style={{ color: "#111", fontSize: "0.55rem", fontWeight: 900 }}>✓</span>}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: active ? "#fff" : "#666", fontWeight: active ? 600 : 400 }}>{tab.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const totalPermsCount = (permsObj) => Object.values(permsObj).reduce((s, arr) => s + arr.length, 0);

  // Reusable Approval Chain section — used in both Add and Edit forms
  function ApprovalChainSection({ chainState, onChange, excludeUserId }) {
    const otherUsers = users.filter(u => String(u.id) !== String(excludeUserId));
    const fields = [
      { key: "direct_approver_id",  label: "Direct Approver",         required: false },
      { key: "second_approver_id",  label: "Second Approver",         required: false },
      { key: "third_approver_id",   label: "Third Approver",          required: false },
    ];
    return (
      <div style={{ background: "rgba(62,207,178,0.04)", border: "1px solid rgba(62,207,178,0.15)", borderRadius: 12, padding: "1.1rem 1.2rem", marginBottom: "1.2rem" }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3ECFB2", flexShrink: 0 }} />
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#3ECFB2", letterSpacing: "0.04em" }}>Approval Chain</div>
          <div style={{ fontSize: "0.68rem", color: "#444", fontWeight: 500, marginLeft: 4 }}>Used for OT, Per Diem, and future modules</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {fields.map(({ key, label }) => {
            const val = chainState[key] || "";
            // Cascade validation: second needs direct, third needs second
            const isDisabled = (key === "second_approver_id" && !chainState.direct_approver_id)
                            || (key === "third_approver_id"  && !chainState.second_approver_id);
            // Filter already-selected approvers from other dropdowns
            const taken = fields.filter(f => f.key !== key).map(f => chainState[f.key]).filter(Boolean);
            const available = otherUsers.filter(u => !taken.includes(String(u.id)));
            return (
              <div key={key}>
                <label style={{ ...labelStyle, color: isDisabled ? "#333" : "#888" }}>{label}</label>
                <select
                  disabled={isDisabled}
                  value={val}
                  onChange={e => {
                    const updated = { ...chainState, [key]: e.target.value };
                    // If direct_approver cleared, also clear downstream
                    if (key === "direct_approver_id" && !e.target.value) {
                      updated.second_approver_id = "";
                      updated.third_approver_id = "";
                    }
                    if (key === "second_approver_id" && !e.target.value) {
                      updated.third_approver_id = "";
                    }
                    onChange(updated);
                  }}
                  style={{ ...inputStyle, opacity: isDisabled ? 0.35 : 1, cursor: isDisabled ? "not-allowed" : "pointer", color: val ? "#fff" : "#555" }}
                >
                  <option value="">— None —</option>
                  {available.map(u => (
                    <option key={u.id} value={String(u.id)}>{u.full_name || u.username}</option>
                  ))}
                </select>
                {isDisabled && (
                  <div style={{ fontSize: "0.68rem", color: "#444", marginTop: 4 }}>
                    {key === "second_approver_id" ? "Set a Direct Approver first" : "Set a Second Approver first"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Visual chain preview */}
        {(chainState.direct_approver_id || chainState.second_approver_id || chainState.third_approver_id) && (
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.65rem", color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginRight: 4 }}>Chain:</div>
            {["direct_approver_id", "second_approver_id", "third_approver_id"].map((key, idx) => {
              const id = chainState[key];
              if (!id) return null;
              const u = users.find(x => String(x.id) === String(id));
              const name = u ? (u.full_name || u.username) : `#${id}`;
              const labels = ["Direct", "2nd", "3rd"];
              return (
                <div key={key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(62,207,178,0.1)", border: "1px solid rgba(62,207,178,0.25)", borderRadius: 20, padding: "3px 12px" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#3ECFB2", color: "#111", fontWeight: 800, fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</div>
                    <span style={{ fontSize: "0.72rem", color: "#aaa" }}><span style={{ color: "#3ECFB2", fontWeight: 700 }}>{labels[idx]}: </span>{name}</span>
                  </div>
                  {idx < 2 && chainState[["second_approver_id","third_approver_id"][idx]] && (
                    <span style={{ color: "#3ECFB2", fontSize: "0.75rem" }}>→</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#fff" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: toast.type==="success"?teal:"#e34a4a", color: toast.type==="success"?"#111":"#fff", borderRadius: 12, padding: "12px 22px", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ background: "#111", borderBottom: "1px solid rgba(62,207,178,0.2)", padding: "0 1.5rem", display: "flex", alignItems: "center", minHeight: 64, gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#ff6b35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>⚙️</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>Platform Admin Panel</div>
          <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>User Access Management · All Modules</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#444" }}>
          {users.length} users · {PLATFORM_MODULES.length} modules
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1rem" }}>

        {/* ── ADD USER ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: teal, display: "inline-block" }}/>
            Add New User
          </div>

          {/* Basic fields */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem", marginBottom: "1.4rem" }}>
            {[["Full Name *","full_name","e.g. Sara Al-Otaibi","text"],["Username *","username","e.g. sara.otaibi","text"],["Password *","password","Set a password","text"]].map(([l,k,ph,t])=>(
              <div key={k}>
                <label style={labelStyle}>{l}</label>
                <input type={t} placeholder={ph} style={inputStyle} value={userForm[k]} onChange={e=>setUserForm(f=>({...f,[k]:e.target.value}))}/>
              </div>
            ))}
          </div>

          {/* Module + tab access */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ ...labelStyle, marginBottom: 10 }}>Module & Tab Access</label>
            <PermGrid permsObj={newPerms} onChange={setNewPerms} />
          </div>

          {/* Approval Chain */}
          <ApprovalChainSection
            chainState={newApprovalChain}
            onChange={setNewApprovalChain}
            excludeUserId={null}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={{ background: teal, border: "none", borderRadius: 10, padding: "11px 28px", color: "#111", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
              onClick={async () => {
                if (!userForm.full_name.trim() || !userForm.username.trim() || !userForm.password.trim()) {
                  showToast("Please fill all fields", "error"); return;
                }
                if (totalPermsCount(newPerms) === 0) { showToast("Grant at least one tab access", "error"); return; }
                try {
                  const newUser = await supa.addUser({
                    ...userForm,
                    role: serializePerms(newPerms),
                    direct_approver_id: newApprovalChain.direct_approver_id || null,
                    second_approver_id: newApprovalChain.second_approver_id || null,
                    third_approver_id:  newApprovalChain.third_approver_id  || null,
                  });
                  setUsers(prev => [...prev, newUser]);
                  setUserForm({ full_name: "", username: "", password: "" });
                  setNewPerms({});
                  setNewApprovalChain({ direct_approver_id: "", second_approver_id: "", third_approver_id: "" });
                  showToast("User added successfully!");
                } catch(e) { showToast("Failed: " + e.message, "error"); }
              }}>+ Add User</button>
          </div>
        </div>

        {/* ── USERS LIST ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: teal, display: "inline-block" }}/>
            Current Users ({users.length})
          </div>
          {users.length === 0 ? (
            <div style={{ color: "#444", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>No users yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {users.map(u => {
                const isMe = u.username === currentUser.username;
                const perms = parseUserPerms(u);
                const moduleCount = Object.keys(perms).filter(k => perms[k]?.length > 0).length;
                const tabCount = totalPermsCount(perms);
                return (
                  <div key={u.id}
                    onClick={() => { if (!isMe) { setEditingUser(u); setEditPerms(parseUserPerms(u)); setEditApprovalChain({ direct_approver_id: u.direct_approver_id ? String(u.direct_approver_id) : "", second_approver_id: u.second_approver_id ? String(u.second_approver_id) : "", third_approver_id: u.third_approver_id ? String(u.third_approver_id) : "" }); setEditNewPassword(""); } }}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 18px", cursor: isMe?"default":"pointer", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", transition: "all 0.15s" }}
                    onMouseEnter={e => { if (!isMe) { e.currentTarget.style.background="rgba(62,207,178,0.06)"; e.currentTarget.style.borderColor="rgba(62,207,178,0.2)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}
                  >
                    {/* Avatar */}
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(62,207,178,0.15)", border: "1px solid rgba(62,207,178,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, color: teal, flexShrink: 0 }}>
                      {u.full_name?.[0]?.toUpperCase()||"?"}
                    </div>
                    {/* Name */}
                    <div style={{ minWidth: 140 }}>
                      <div style={{ fontWeight: 700, color: "#e8f4ff", fontSize: "0.9rem" }}>{u.full_name} {isMe && <span style={{ fontSize: "0.68rem", color: teal }}>(You)</span>}</div>
                      <div style={{ fontSize: "0.72rem", color: "#555" }}>@{u.username}</div>
                    </div>
                    {/* Module badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
                      {PLATFORM_MODULES.map(mod => {
                        const tabs = perms[mod.id] || [];
                        if (!tabs.length) return null;
                        return (
                          <span key={mod.id} style={{ background: `${mod.color}18`, color: mod.color, border: `1px solid ${mod.color}44`, borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                            {mod.label} <span style={{ opacity: 0.7 }}>({tabs.length})</span>
                          </span>
                        );
                      })}
                    </div>
                    {/* Stats + edit cue */}
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div style={{ fontSize: "0.72rem", color: "#555" }}>{moduleCount} modules · {tabCount} tabs</div>
                      {/* Approval chain indicator */}
                      {u.direct_approver_id && (() => {
                        const chainCount = [u.direct_approver_id, u.second_approver_id, u.third_approver_id].filter(Boolean).length;
                        return (
                          <div style={{ fontSize: "0.68rem", color: "rgba(62,207,178,0.7)", fontWeight: 600, marginTop: 2 }}>
                            🔗 {chainCount}-step approval chain
                          </div>
                        );
                      })()}
                      {!u.direct_approver_id && (
                        <div style={{ fontSize: "0.68rem", color: "#333", marginTop: 2 }}>No approval chain</div>
                      )}
                      {!isMe && <div style={{ fontSize: "0.72rem", color: teal, fontWeight: 600, marginTop: 2 }}>✏️ Edit</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── EDIT USER MODAL ── */}
      {editingUser && (
        <div onClick={() => setEditingUser(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", overflowY: "auto" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a1a", border: "1px solid rgba(62,207,178,0.3)", borderRadius: 18, width: "100%", maxWidth: 620, padding: "2rem", boxShadow: "0 24px 80px rgba(0,0,0,0.8)", maxHeight: "90vh", overflowY: "auto" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(62,207,178,0.15)", border: "1px solid rgba(62,207,178,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, color: teal }}>
                  {editingUser.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#e8f4ff", fontSize: "1rem" }}>{editingUser.full_name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#555" }}>@{editingUser.username}</div>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "1.3rem" }}>✕</button>
            </div>

            {/* Module + tab access */}
            <div style={{ marginBottom: "1.4rem" }}>
              <label style={{ ...labelStyle, marginBottom: 10 }}>Module & Tab Access</label>
              <PermGrid permsObj={editPerms} onChange={setEditPerms} />
            </div>

            {/* Approval Chain */}
            <ApprovalChainSection
              chainState={editApprovalChain}
              onChange={setEditApprovalChain}
              excludeUserId={editingUser?.id}
            />

            {/* Change password */}
            <div style={{ marginBottom: "1.4rem" }}>
              <label style={{ ...labelStyle, marginBottom: 8 }}>Change Password <span style={{ color: "#444", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(leave blank to keep current)</span></label>
              <input type="text" placeholder="Enter new password…" value={editNewPassword} onChange={e => setEditNewPassword(e.target.value)}
                style={{ ...inputStyle }} />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
              <button onClick={async () => {
                try {
                  await supa.deleteUser(editingUser.id);
                  setUsers(prev => prev.filter(x => x.id !== editingUser.id));
                  setEditingUser(null);
                  showToast("User removed.");
                } catch(e) { showToast("Failed to remove: " + e.message, "error"); }
              }} style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 10, padding: "10px 18px", color: "#ff7070", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                🗑 Remove User
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setEditingUser(null)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`, borderRadius: 10, padding: "10px 20px", color: "#aaa", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>Cancel</button>
                <button onClick={async () => {
                  if (totalPermsCount(editPerms) === 0) { showToast("Grant at least one tab access", "error"); return; }
                  try {
                    const updates = {
                      role: serializePerms(editPerms),
                      direct_approver_id: editApprovalChain.direct_approver_id || null,
                      second_approver_id: editApprovalChain.second_approver_id || null,
                      third_approver_id:  editApprovalChain.third_approver_id  || null,
                    };
                    if (editNewPassword.trim()) updates.password = editNewPassword.trim();
                    await supa.updateUser(editingUser.id, updates);
                    setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updates } : u));
                    // Reflect approval chain changes in allUsers too (for chain resolution)
                    setEditingUser(null);
                    showToast("User updated!");
                  } catch(e) { showToast("Failed: " + e.message, "error"); }
                }} style={{ background: teal, border: "none", borderRadius: 10, padding: "10px 24px", color: "#111", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Save Changes ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHELL — Login gate + Left sidebar + module switcher
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeModule, setActiveModule] = useState(null); // set after login based on access
  const [allUsers, setAllUsers] = useState([]); // platform-wide user list for approval chain resolution
  const [sidebarExpanded, setSidebarExpanded] = useState(false); // collapsed by default, expands on hover

  async function handleLogin() {
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError("Please enter username and password."); return;
    }
    setLoginLoading(true); setLoginError("");
    let user = null;
    try {
      user = await supa.login(loginForm.username.trim(), loginForm.password.trim());
    } catch(e) {}
    if (!user) {
      user = DEMO_ACCOUNTS.find(
        a => a.username === loginForm.username.trim() && a.password === loginForm.password.trim()
      );
      if (user) user = { ...user, id: 0 };
    }
    if (user) {
      setCurrentUser(user);
      // Load all platform users for approval chain resolution
      supa.getUsers().then(setAllUsers).catch(() => {});
      // Set first accessible module (or admin if applicable)
      if (isAdminUser(user)) {
        const firstMod = PLATFORM_MODULES.find(m => canAccessModule(user, m.id));
        setActiveModule(firstMod ? firstMod.id : "admin");
      } else {
        const firstMod = PLATFORM_MODULES.find(m => canAccessModule(user, m.id));
        setActiveModule(firstMod ? firstMod.id : null);
      }
    } else {
      setLoginError("Incorrect username or password.");
    }
    setLoginLoading(false);
  }

  function handleLogout() {
    setCurrentUser(null);
    setLoginForm({ username: "", password: "" });
    setLoginError("");
  }

  // ── LOGIN SCREEN (no sidebar, clean full-screen) ──
  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <img src="data:image/png;base64,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" alt="Acquaint Communications" style={{ height: 52, width: "auto", objectFit: "contain" }} />
              <div style={{ fontSize: "0.65rem", color: "#777", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>ACQ - HR Portal</div>
            </div>
          </div>

          {/* Card */}
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(62,207,178,0.2)", borderRadius: 20, padding: "2.2rem", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
            <div style={{ marginBottom: "1.8rem" }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", marginBottom: "0.3rem" }}>Welcome back 👋</div>
              <div style={{ fontSize: "0.82rem", color: "#555" }}>Sign in to access your portal</div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.7rem", color: "#666", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={loginForm.username}
                onChange={e => { setLoginForm(f => ({ ...f, username: e.target.value })); setLoginError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, padding: "12px 15px", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.7rem", color: "#666", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={e => { setLoginForm(f => ({ ...f, password: e.target.value })); setLoginError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, padding: "12px 15px", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {loginError && (
              <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 9, padding: "10px 14px", color: "#ff7070", fontSize: "0.82rem", marginBottom: "1rem" }}>❌ {loginError}</div>
            )}

            <button
              onClick={handleLogin}
              disabled={loginLoading}
              style={{ width: "100%", background: "linear-gradient(135deg,#3ECFB2,#1a8fe3)", border: "none", borderRadius: 11, padding: "14px", color: "#111", fontWeight: 800, fontSize: "0.95rem", cursor: loginLoading ? "not-allowed" : "pointer", opacity: loginLoading ? 0.7 : 1, letterSpacing: "0.02em" }}
            >
              {loginLoading ? "Signing in..." : "Sign In →"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.7rem", color: "#2a2a2a" }}>
            Acquaint Communications © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED: sidebar + modules ──
  // Which modules this user can access (from platform registry)
  const accessibleModules = PLATFORM_MODULES.filter(m => canAccessModule(currentUser, m.id));
  const showAdmin = isAdminUser(currentUser);
  const activeMod = PLATFORM_MODULES.find(m => m.id === activeModule);
  const activeModuleLabel = activeModule === "admin" ? "Admin Panel" : activeMod ? activeMod.label : "";
  const SIDEBAR_W = sidebarExpanded ? 220 : 64;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#111", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── LEFT SIDEBAR ── */}
      <div
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        style={{
          width: SIDEBAR_W, minWidth: SIDEBAR_W, background: "#0d0d0d",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          position: "sticky", top: 0, height: "100vh", zIndex: 200,
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
          transition: "width 0.22s, min-width 0.22s",
          overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarExpanded ? "14px 18px 10px" : "10px 0 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, overflow: "hidden", transition: "padding 0.22s" }}>
          <img
            src="data:image/png;base64,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"
            alt="Acquaint Communications"
            style={{ height: sidebarExpanded ? 30 : 22, width: "auto", objectFit: "contain", transition: "height 0.22s", opacity: 1 }}
          />
          <div style={{ fontSize: "0.5rem", color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, opacity: sidebarExpanded ? 1 : 0, maxHeight: sidebarExpanded ? 16 : 0, overflow: "hidden", transition: "all 0.22s", whiteSpace: "nowrap" }}>HR Portal</div>
        </div>

        {/* User pill */}
        <div style={{ padding: sidebarExpanded ? "12px 18px" : "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "center", transition: "padding 0.22s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: sidebarExpanded ? 9 : 0, overflow: "hidden" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(62,207,178,0.15)", border: "1px solid rgba(62,207,178,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: "#3ECFB2", flexShrink: 0 }}>
              {(currentUser.full_name || currentUser.username || "?")[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0, opacity: sidebarExpanded ? 1 : 0, maxWidth: sidebarExpanded ? 160 : 0, transition: "all 0.22s", overflow: "hidden" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e8f4ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.full_name || currentUser.username}</div>
              <div style={{ fontSize: "0.62rem", color: "#3ECFB2", textTransform: "capitalize", fontWeight: 600 }}>
                {showAdmin ? "Admin" : `${accessibleModules.length} module${accessibleModules.length!==1?"s":""}`}
              </div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div style={{ padding: "16px 18px 8px", opacity: sidebarExpanded ? 1 : 0, maxHeight: sidebarExpanded ? 40 : 0, overflow: "hidden", transition: "all 0.22s" }}>
          <div style={{ fontSize: "0.6rem", color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>Modules</div>
        </div>

        {/* Module buttons — only modules user can access */}
        <div style={{ padding: sidebarExpanded ? "0 10px" : "4px 0", display: "flex", flexDirection: "column", gap: 3, flex: 1, overflowY: "auto", overflowX: "hidden", alignItems: sidebarExpanded ? "stretch" : "center", transition: "padding 0.22s" }}>
          {accessibleModules.map(mod => {
            const isActive = activeModule === mod.id;
            return (
              <button key={mod.id} onClick={() => setActiveModule(mod.id)} style={{
                display: "flex", alignItems: "center", gap: sidebarExpanded ? 11 : 0,
                width: sidebarExpanded ? "100%" : 44,
                padding: sidebarExpanded ? "10px 12px" : "10px 0",
                borderRadius: 10, border: "none", cursor: "pointer",
                transition: "all 0.18s",
                background: isActive ? `${mod.color}15` : "transparent",
                borderLeft: sidebarExpanded && isActive ? `3px solid ${mod.color}` : "3px solid transparent",
                textAlign: "left", position: "relative", justifyContent: sidebarExpanded ? "flex-start" : "center",
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: isActive ? `${mod.color}20` : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? mod.color : "#555", flexShrink: 0, transition: "all 0.18s" }}>
                  {mod.icon}
                </div>
                <div style={{ opacity: sidebarExpanded ? 1 : 0, maxWidth: sidebarExpanded ? 160 : 0, overflow: "hidden", transition: "all 0.22s" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : "#777", whiteSpace: "nowrap" }}>{mod.label}</div>
                  <div style={{ fontSize: "0.63rem", color: isActive ? mod.color : "#3a3a3a", fontWeight: 600, marginTop: 1, whiteSpace: "nowrap" }}>{mod.sub}</div>
                </div>
                {isActive && sidebarExpanded && <div style={{ position: "absolute", right: 10, width: 6, height: 6, borderRadius: "50%", background: mod.color, boxShadow: `0 0 8px ${mod.color}` }} />}
              </button>
            );
          })}

          {/* Admin Panel button — only for admin users */}
          {showAdmin && (() => {
            const isActive = activeModule === "admin";
            return (
              <button onClick={() => setActiveModule("admin")} style={{
                display: "flex", alignItems: "center", gap: sidebarExpanded ? 11 : 0,
                width: sidebarExpanded ? "100%" : 44,
                padding: sidebarExpanded ? "10px 12px" : "10px 0",
                borderRadius: 10, border: "none", cursor: "pointer",
                transition: "all 0.18s",
                background: isActive ? "rgba(255,107,53,0.12)" : "transparent",
                borderLeft: sidebarExpanded && isActive ? "3px solid #ff6b35" : "3px solid transparent",
                textAlign: "left", position: "relative", justifyContent: sidebarExpanded ? "flex-start" : "center",
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: isActive ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#ff6b35" : "#555", flexShrink: 0, fontSize: "1rem" }}>
                  ⚙️
                </div>
                <div style={{ opacity: sidebarExpanded ? 1 : 0, maxWidth: sidebarExpanded ? 160 : 0, overflow: "hidden", transition: "all 0.22s" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : "#777", whiteSpace: "nowrap" }}>Admin Panel</div>
                  <div style={{ fontSize: "0.63rem", color: isActive ? "#ff6b35" : "#3a3a3a", fontWeight: 600, marginTop: 1, whiteSpace: "nowrap" }}>Access Management</div>
                </div>
                {isActive && sidebarExpanded && <div style={{ position: "absolute", right: 10, width: 6, height: 6, borderRadius: "50%", background: "#ff6b35", boxShadow: "0 0 8px #ff6b35" }} />}
              </button>
            );
          })()}
        </div>

        {/* Sign out */}
        <div style={{ padding: sidebarExpanded ? "14px 10px 18px" : "10px 0 14px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", transition: "padding 0.22s" }}>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: sidebarExpanded ? 9 : 0, width: sidebarExpanded ? "100%" : 44, padding: sidebarExpanded ? "9px 12px" : "9px 0", borderRadius: 9, border: "none", background: "transparent", color: "#ff6b6b", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, justifyContent: sidebarExpanded ? "flex-start" : "center", transition: "all 0.18s" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span style={{ opacity: sidebarExpanded ? 1 : 0, maxWidth: sidebarExpanded ? 120 : 0, overflow: "hidden", transition: "all 0.22s", whiteSpace: "nowrap" }}>Sign Out</span>
          </button>
          <div style={{ fontSize: "0.6rem", color: "#2a2a2a", textAlign: "center", marginTop: 8, opacity: sidebarExpanded ? 1 : 0, maxHeight: sidebarExpanded ? 20 : 0, overflow: "hidden", transition: "all 0.22s" }}>Acquaint © {new Date().getFullYear()}</div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {activeModule === "perdiem"  && <PerDiemModule currentUser={currentUser} handleLogout={handleLogout} activeModuleLabel={activeModuleLabel} />}
        {activeModule === "overtime" && <OTModule currentUser={currentUser} allUsers={allUsers} activeModuleLabel={activeModuleLabel} />}
        {activeModule === "admin"    && showAdmin && <AdminPanel currentUser={currentUser} />}
        {!activeModule && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#444", fontSize: "0.9rem" }}>
            You don't have access to any modules. Contact your admin.
          </div>
        )}
      </div>
    </div>
  );
}
