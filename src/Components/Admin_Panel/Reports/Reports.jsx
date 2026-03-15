import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from "recharts";
import "./Reports.css";

// ─── Raw Appointments Data ─────────────────────────────────────
const ALL_APPOINTMENTS = [
    { id: "#19", date: new Date(2026, 2, 13, 13, 21), customer: "Mark Taylor", email: "marktaylor275@gmail.com", phone: "434 272 332", service: "Large Lot - 9mx3m", duration: "30 days", status: "approved", payment: "Paid", revenue: 250 },
    { id: "#18", date: new Date(2026, 2, 13, 9, 47), customer: "Andrew Doyle", email: "andrew.doyle@trimaxmowers.com.au", phone: "467 555 495", service: "Medium Lot - 7mx3m", duration: "30 days", status: "approved", payment: "Paid", revenue: 180 },
    { id: "#17", date: new Date(2026, 2, 11, 10, 51), customer: "Gary Bond", email: "gary.p.bond@gmail.com", phone: "418 438 932", service: "Small Lot - 6mx3m", duration: "30 days", status: "approved", payment: "Paid", revenue: 130 },
    { id: "#16", date: new Date(2026, 2, 9, 18, 16), customer: "Megan McGuinness", email: "megan.cruwys@det.nsw.edu.au", phone: "439 881 567", service: "Large Lot - 9mx3m", duration: "30 days", status: "approved", payment: "Paid", revenue: 250 },
    { id: "#15", date: new Date(2026, 2, 7, 11, 0), customer: "James O'Brien", email: "jamesobrien@hotmail.com", phone: "412 333 111", service: "Medium Lot - 7mx3m", duration: "30 days", status: "cancelled", payment: "Unpaid", revenue: 0 },
    { id: "#14", date: new Date(2026, 2, 5, 14, 30), customer: "Sarah Collins", email: "sarah.c@example.com", phone: "421 555 777", service: "Large Lot - 9mx3m", duration: "30 days", status: "completed", payment: "Paid", revenue: 250 },
    { id: "#13", date: new Date(2026, 2, 4, 10, 0), customer: "Tom Nguyen", email: "tom.nguyen@gmail.com", phone: "430 222 888", service: "Small Lot - 6mx3m", duration: "14 days", status: "rejected", payment: "Unpaid", revenue: 0 },
    { id: "#12", date: new Date(2026, 2, 3, 9, 0), customer: "Linda Park", email: "linda.park@work.au", phone: "415 444 555", service: "Medium Lot - 7mx3m", duration: "30 days", status: "approved", payment: "Paid", revenue: 180 },
    { id: "#11", date: new Date(2026, 2, 2, 15, 20), customer: "Chris Evans", email: "chris.e@company.com", phone: "409 111 222", service: "Large Lot - 9mx3m", duration: "30 days", status: "pending", payment: "Unpaid", revenue: 0 },
    { id: "#10", date: new Date(2026, 1, 28, 8, 45), customer: "Maria Rossi", email: "maria.rossi@gmail.com", phone: "427 888 999", service: "Small Lot - 6mx3m", duration: "7 days", status: "completed", payment: "Paid", revenue: 70 },
    { id: "#9", date: new Date(2026, 1, 25, 12, 0), customer: "David Kim", email: "david.kim@outlook.com", phone: "418 777 333", service: "Medium Lot - 7mx3m", duration: "30 days", status: "approved", payment: "Paid", revenue: 180 },
    { id: "#8", date: new Date(2026, 1, 20, 16, 10), customer: "Emma White", email: "emma.white@uni.edu.au", phone: "431 000 555", service: "Large Lot - 9mx3m", duration: "30 days", status: "no-show", payment: "Paid", revenue: 250 },
];

const SERVICES = ["Large Lot - 9mx3m", "Medium Lot - 7mx3m", "Small Lot - 6mx3m"];
const STATUS_LIST = ["pending", "approved", "cancelled", "rejected", "completed", "no-show"];
const STATUS_COLOR = { pending: "#f59e0b", approved: "#3b82f6", cancelled: "#9ca3af", rejected: "#ef4444", completed: "#22c55e", "no-show": "#92400e" };
const SHORTCUTS = ["Today", "Yesterday", "Tomorrow", "This week", "Last week", "This month", "Last month", "This year"];
const PER_PAGE_OPTS = [10, 20, 50, 100];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TODAY = new Date(2026, 2, 13);

// ─── Helpers ──────────────────────────────────────────────────
const sod = d => { const n = new Date(d); n.setHours(0, 0, 0, 0); return n; };
const same = (a, b) => sod(a).getTime() === sod(b).getTime();
const fmtFull = d => d.toLocaleDateString("en-AU", { month: "long", day: "numeric", year: "numeric" });
const fmtShort = d => d.toLocaleDateString("en-AU", { month: "short", day: "2-digit" });

function dateRange(start, end) {
    const days = []; const cur = new Date(sod(start)); const fin = sod(end);
    while (cur <= fin) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    return days;
}

function shortcut(s) {
    const t = new Date(TODAY);
    if (s === "Today") return { s: sod(t), e: sod(t) };
    if (s === "Yesterday") { const y = new Date(t); y.setDate(t.getDate() - 1); return { s: sod(y), e: sod(y) }; }
    if (s === "Tomorrow") { const tm = new Date(t); tm.setDate(t.getDate() + 1); return { s: sod(tm), e: sod(tm) }; }
    if (s === "This week") { const m = new Date(t); m.setDate(t.getDate() - (t.getDay() || 7) + 1); const su = new Date(m); su.setDate(m.getDate() + 6); return { s: sod(m), e: sod(su) }; }
    if (s === "Last week") { const m = new Date(t); m.setDate(t.getDate() - (t.getDay() || 7) - 6); const su = new Date(m); su.setDate(m.getDate() + 6); return { s: sod(m), e: sod(su) }; }
    if (s === "This month") return { s: new Date(t.getFullYear(), t.getMonth(), 1), e: new Date(t.getFullYear(), t.getMonth() + 1, 0) };
    if (s === "Last month") return { s: new Date(t.getFullYear(), t.getMonth() - 1, 1), e: new Date(t.getFullYear(), t.getMonth(), 0) };
    if (s === "This year") return { s: new Date(t.getFullYear(), 0, 1), e: new Date(t.getFullYear(), 11, 31) };
}

// ─── Calendar Month ───────────────────────────────────────────
function CalMonth({ year, month, onDay, rS, rE }) {
    const dim = new Date(year, month + 1, 0).getDate();
    let fd = new Date(year, month, 1).getDay(); fd = fd === 0 ? 6 : fd - 1;
    const prev = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < fd; i++) cells.push({ d: prev - fd + 1 + i, t: "p" });
    for (let d = 1; d <= dim; d++) cells.push({ d, t: "c" });
    while (cells.length % 7 !== 0) cells.push({ d: cells.length - fd - dim + 1, t: "n" });
    return (
        <div className="cal-month">
            <p className="cal-title">{MONTH_NAMES[month]} {year}</p>
            <div className="cal-grid">
                {WEEK_DAYS.map(d => <div key={d} className="cal-dh">{d}</div>)}
                {cells.map((c, i) => {
                    if (c.t !== "c") return <div key={i} className="cal-day cal-other">{c.d}</div>;
                    const dt = new Date(year, month, c.d);
                    const isT = same(dt, TODAY), isS = rS && same(dt, rS), isE = rE && same(dt, rE);
                    const inR = rS && rE && dt > sod(rS) && dt < sod(rE);
                    let cls = "cal-day";
                    if (isT) cls += " cal-today";
                    if (isS || isE) cls += " cal-sel";
                    if (inR) cls += " cal-in-range";
                    return <div key={i} className={cls} onClick={() => onDay(dt)}>{c.d}</div>;
                })}
            </div>
        </div>
    );
}

// ─── Tooltip ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tt">
            <p className="tt-lbl">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></p>
            ))}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────
export default function Reports() {
    const [tab, setTab] = useState("appointment");
    const [svcO, setSvcO] = useState(false);
    const [selSvc, setSelSvc] = useState(null);
    const [calO, setCalO] = useState(false);
    const [calY, setCalY] = useState(2026);
    const [calM, setCalM] = useState(2);
    const [rS, setRS] = useState(new Date(2026, 2, 9));
    const [rE, setRE] = useState(new Date(2026, 2, 15));
    const [picking, setPick] = useState(true);
    const [perPg, setPerPg] = useState(20);
    const [ppO, setPpO] = useState(false);
    const [pg, setPg] = useState(1);
    const calRef = useRef(null);

    useEffect(() => {
        const h = e => { if (calRef.current && !calRef.current.contains(e.target)) setCalO(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    // ── Filtered appointments ──────────────────────────────────
    const filtered = useMemo(() => {
        const s = sod(rS), e = sod(rE);
        return ALL_APPOINTMENTS.filter(a => {
            const ad = sod(a.date);
            return ad >= s && ad <= e && (!selSvc || a.service === selSvc);
        });
    }, [rS, rE, selSvc]);

    // ── Chart data (dynamic per date range) ───────────────────
    const chartData = useMemo(() => {
        const days = dateRange(rS, rE);
        if (days.length > 60) {
            const map = {};
            filtered.forEach(a => {
                const k = `${MONTH_NAMES[a.date.getMonth()].slice(0, 3)} ${a.date.getFullYear()}`;
                if (!map[k]) map[k] = { label: k, appointments: 0, revenue: 0 };
                map[k].appointments++; map[k].revenue += a.revenue;
            });
            return Object.values(map);
        }
        return days.map(d => ({
            label: fmtShort(d),
            appointments: filtered.filter(a => same(a.date, d)).length,
            revenue: filtered.filter(a => same(a.date, d)).reduce((s, a) => s + a.revenue, 0),
        }));
    }, [filtered, rS, rE]);

    // ── Quick stats ────────────────────────────────────────────
    const stats = useMemo(() => {
        const base = STATUS_LIST.reduce((a, s) => ({ ...a, [s]: 0 }), {});
        filtered.forEach(a => { if (a.status in base) base[a.status]++; });
        return base;
    }, [filtered]);

    const totalRev = useMemo(() => filtered.reduce((s, a) => s + a.revenue, 0), [filtered]);

    // ── Customers ─────────────────────────────────────────────
    // Customers who had any appointment BEFORE the selected range = existing
    const customers = useMemo(() => {
        const s = sod(rS), e = sod(rE);
        const map = {};
        filtered.forEach(a => {
            if (!map[a.customer]) {
                // check if this customer had any appointment before range start
                const hadBefore = ALL_APPOINTMENTS.some(
                    x => x.customer === a.customer && sod(x.date) < s
                );
                map[a.customer] = {
                    name: a.customer, email: a.email, phone: a.phone,
                    lastDate: a.date, count: 0, isNew: !hadBefore
                };
            }
            map[a.customer].count++;
            if (a.date > map[a.customer].lastDate) map[a.customer].lastDate = a.date;
        });
        return Object.values(map);
    }, [filtered, rS]);

    const custStats = useMemo(() => ({
        existing: customers.filter(c => !c.isNew).length,
        newCust: customers.filter(c => c.isNew).length,
    }), [customers]);

    // ── Customers Chart Data ───────────────────────────────────
    const custChartData = useMemo(() => {
        const days = dateRange(rS, rE);
        if (days.length > 60) {
            const map = {};
            filtered.forEach(a => {
                const k = `${MONTH_NAMES[a.date.getMonth()].slice(0, 3)} ${a.date.getFullYear()}`;
                if (!map[k]) map[k] = { label: k, newCustomers: 0, existingCustomers: 0 };
                const hadBefore = ALL_APPOINTMENTS.some(
                    x => x.customer === a.customer && sod(x.date) < sod(rS)
                );
                if (hadBefore) map[k].existingCustomers++;
                else map[k].newCustomers++;
            });
            return Object.values(map);
        }
        return days.map(d => {
            const dayAppts = filtered.filter(a => same(a.date, d));
            const newC = dayAppts.filter(a => !ALL_APPOINTMENTS.some(
                x => x.customer === a.customer && sod(x.date) < sod(rS)
            )).length;
            return { label: fmtShort(d), newCustomers: newC, existingCustomers: dayAppts.length - newC };
        });
    }, [filtered, rS, rE]);

    // ── Date picker ────────────────────────────────────────────
    const handleDay = d => {
        if (picking) { setRS(d); setRE(d); setPick(false); }
        else { if (d < rS) { setRE(rS); setRS(d); } else setRE(d); setPick(true); setCalO(false); }
        setPg(1);
    };
    const handleShortcut = s => { const r = shortcut(s); setRS(r.s); setRE(r.e); setCalO(false); setPg(1); };

    const prevM = () => { if (calM === 0) { setCalY(y => y - 1); setCalM(11); } else setCalM(m => m - 1); };
    const nextM = () => { if (calM === 11) { setCalY(y => y + 1); setCalM(0); } else setCalM(m => m + 1); };
    const m2 = calM === 11 ? 0 : calM + 1, y2 = calM === 11 ? calY + 1 : calY;

    const dateLbl = rS && rE ? `${fmtFull(rS)}  –  ${fmtFull(rE)}` : rS ? `${fmtFull(rS)}  –  ...` : "Select date range";

    // ── Pagination ─────────────────────────────────────────────
    const tableRows = tab === "customers" ? customers : filtered;
    const totalPages = Math.max(1, Math.ceil(tableRows.length / perPg));
    const pageRows = tableRows.slice((pg - 1) * perPg, pg * perPg);

    const yKey = tab === "revenue" ? "revenue" : "appointments";
    const activeCData = tab === "customers" ? custChartData : chartData;
    const yMax = tab === "customers"
        ? Math.max(...custChartData.map(d => d.newCustomers + d.existingCustomers), 1) * 1.3
        : Math.max(...chartData.map(d => d[yKey]), 1) * 1.3;
    const barSz = activeCData.length > 30 ? 6 : activeCData.length > 14 ? 14 : 38;

    return (
        <div className="rp-page" onClick={() => { setSvcO(false); setPpO(false); }}>
            <h1 className="rp-h1">Reports</h1>

            <div className="rp-layout">
                {/* Sidebar */}
                <aside className="rp-sidebar">
                    {[
                        { k: "appointment", l: "Appointment Report" },
                        { k: "revenue", l: "Revenue Report" },
                        { k: "customers", l: "Customers Report" },
                    ].map(t => (
                        <button key={t.k} className={`sb-btn${tab === t.k ? " sb-active" : ""}`}
                            onClick={() => { setTab(t.k); setPg(1); }}>
                            {t.l}
                        </button>
                    ))}
                </aside>

                {/* Main */}
                <main className="rp-main">
                    <h2 className="rp-h2">
                        {tab === "appointment" ? "Appointment Report" : tab === "revenue" ? "Revenue Report" : "Customers Report"}
                    </h2>

                    {/* Filters */}
                    <div className="filters-row">
                        {tab !== "customers" && (
                            <div className="dd-wrap" onClick={e => e.stopPropagation()}>
                                <div className={`dd-trigger${svcO ? " open" : ""}`} onClick={() => setSvcO(!svcO)}>
                                    <span>{selSvc || "Select Service"}</span>
                                    <span className="dd-arrow">{svcO ? "▲" : "▼"}</span>
                                </div>
                                {svcO && (
                                    <div className="dd-menu">
                                        <div className="dd-grp-lbl">Caravan Storage</div>
                                        <div className={`dd-item${!selSvc ? " dd-selected" : ""}`}
                                            onClick={() => { setSelSvc(null); setSvcO(false); setPg(1); }}>All Services</div>
                                        {SERVICES.map(s => (
                                            <div key={s} className={`dd-item${selSvc === s ? " dd-selected" : ""}`}
                                                onClick={() => { setSelSvc(s); setSvcO(false); setPg(1); }}>
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Date Picker */}
                        <div className="dr-wrap" ref={calRef}>
                            <button className="dr-btn" onClick={() => setCalO(!calO)}>
                                <span className="dr-icon">📅</span>
                                <span>{dateLbl}</span>
                            </button>
                            {calO && (
                                <div className="cal-popup" onClick={e => e.stopPropagation()}>
                                    <div className="cal-shortcuts">
                                        {SHORTCUTS.map(s => (
                                            <div key={s} className="cal-sc" onClick={() => handleShortcut(s)}>{s}</div>
                                        ))}
                                    </div>
                                    <div className="cal-right">
                                        <div className="cal-nav-row">
                                            <button className="cal-nav-btn" onClick={prevM}>‹‹  ‹</button>
                                            <span />
                                            <button className="cal-nav-btn" onClick={nextM}>›  ››</button>
                                        </div>
                                        <div className="cal-two">
                                            <CalMonth year={calY} month={calM} onDay={handleDay} rS={rS} rE={rE} />
                                            <CalMonth year={y2} month={m2} onDay={handleDay} rS={rS} rE={rE} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart + Stats */}
                    <div className="cs-row">
                        <div className="chart-card">
                            <p className="chart-card-title">
                                {tab === "revenue" ? "Revenue" : tab === "customers" ? "Customers" : "Appointments"}
                            </p>

                            {/* Legend */}
                            {tab === "customers" ? (
                                <div className="legend-row">
                                    <span className="legend-box" style={{ background: "#f59e0b", borderColor: "#f59e0b" }} />
                                    <span className="legend-lbl">New Customers</span>
                                    <span className="legend-box" style={{ background: "#3dd6a3", borderColor: "#3dd6a3", marginLeft: 12 }} />
                                    <span className="legend-lbl">Existing Customers</span>
                                </div>
                            ) : (
                                <div className="legend-row">
                                    <span className="legend-box" />
                                    <span className="legend-lbl">
                                        {tab === "revenue" ? "Total Revenue (AUD)" : "Total Appointment"}
                                    </span>
                                </div>
                            )}

                            <ResponsiveContainer width="100%" height={230}>
                                {tab === "customers" ? (
                                    <BarChart data={custChartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }} barSize={barSz}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false}
                                            interval={custChartData.length > 30 ? "preserveStartEnd" : custChartData.length > 14 ? 1 : 0} />
                                        <YAxis tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false}
                                            allowDecimals={false} domain={[0, yMax]} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="newCustomers" name="New Customers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="existingCustomers" name="Existing Customers" fill="#3dd6a3" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }} barSize={barSz}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false}
                                            interval={chartData.length > 30 ? "preserveStartEnd" : chartData.length > 14 ? 1 : 0} />
                                        <YAxis tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false}
                                            allowDecimals={tab === "revenue"} domain={[0, yMax]} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey={yKey}
                                            name={tab === "revenue" ? "Revenue (AUD)" : "Total Appointment"}
                                            fill="#3dd6a3" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>

                        <div className="stats-card">
                            <p className="stats-title">Quick Stats</p>
                            {tab === "revenue" ? (
                                <div className="stat-rev">
                                    <p className="stat-rev-lbl">Total Revenue</p>
                                    <p className="stat-rev-val">${totalRev.toLocaleString()}</p>
                                </div>
                            ) : tab === "customers" ? (
                                <>
                                    <div className="stat-row">
                                        <div className="stat-left">
                                            <span className="stat-dot" style={{ background: "#22c55e" }} />
                                            <span className="stat-name">Existing Customers</span>
                                        </div>
                                        <span className="stat-num">{custStats.existing}</span>
                                    </div>
                                    <div className="stat-row">
                                        <div className="stat-left">
                                            <span className="stat-dot" style={{ background: "#f59e0b" }} />
                                            <span className="stat-name">New Customers</span>
                                        </div>
                                        <span className="stat-num">{custStats.newCust}</span>
                                    </div>
                                </>
                            ) : (
                                STATUS_LIST.map(s => (
                                    <div key={s} className="stat-row">
                                        <div className="stat-left">
                                            <span className="stat-dot" style={{ background: STATUS_COLOR[s] }} />
                                            <span className="stat-name">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                                        </div>
                                        <span className="stat-num">{stats[s]}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="tbl-card">
                        <p className="tbl-heading">
                            {tab === "customers" ? "Customer Summary" : "Appointments Summary"}
                        </p>
                        {tab === "customers" ? (
                            <table className="data-tbl">
                                <thead><tr>
                                    <th>Full Name <span className="sort-ico">⇅</span></th>
                                    <th>Email <span className="sort-ico">⇅</span></th>
                                    <th>Phone</th>
                                    <th>Last Appointment Booked <span className="sort-ico">⇅</span></th>
                                    <th>Total Appointments</th>
                                </tr></thead>
                                <tbody>
                                    {pageRows.length === 0 && <tr><td colSpan={5} className="no-data">No data for selected range</td></tr>}
                                    {pageRows.map((c, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="cust-cell">
                                                    <div className="avatar">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                            <circle cx="12" cy="8" r="4" />
                                                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                                        </svg>
                                                    </div>
                                                    {c.name}
                                                </div>
                                            </td>
                                            <td>{c.email}</td>
                                            <td>{c.phone}</td>
                                            <td>
                                                {c.lastDate.toLocaleDateString("en-AU", { month: "long", day: "numeric", year: "numeric" })}
                                                {" "}
                                                {c.lastDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                            </td>
                                            <td>{c.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="data-tbl">
                                <thead><tr>
                                    <th>ID</th>
                                    <th>Date <span className="sort-ico">⇅</span></th>
                                    <th>Customer <span className="sort-ico">⇅</span></th>
                                    <th>Service <span className="sort-ico">⇅</span></th>
                                    <th>Duration <span className="sort-ico">⇅</span></th>
                                    <th>Status</th>
                                    <th>Payment <span className="sort-ico">⇅</span></th>
                                </tr></thead>
                                <tbody>
                                    {pageRows.length === 0 && <tr><td colSpan={7} className="no-data">No appointments for selected range</td></tr>}
                                    {pageRows.map((a, i) => (
                                        <tr key={i}>
                                            <td>{a.id}</td>
                                            <td>
                                                {a.date.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" })}
                                                {" "}
                                                {a.date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                            </td>
                                            <td>{a.customer}</td>
                                            <td>{a.service}</td>
                                            <td>{a.duration}</td>
                                            <td>
                                                <span className={`badge badge-${a.status.replace(" ", "-")}`}>
                                                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`pay-badge${a.payment === "Paid" ? " paid" : ""}`}>
                                                    {a.payment}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Pagination */}
                        <div className="pg-row">
                            <span className="pg-info">
                                Showing <strong>{Math.min(tableRows.length, perPg)}</strong> out of <strong>{tableRows.length}</strong>
                            </span>
                            <div className="pg-pp" onClick={e => e.stopPropagation()}>
                                <span className="pg-pp-lbl">Per Page</span>
                                <div className="pg-pp-wrap">
                                    <div className="pg-pp-btn" onClick={() => setPpO(!ppO)}>
                                        {perPg} {ppO ? "▲" : "▼"}
                                    </div>
                                    {ppO && (
                                        <div className="pg-pp-menu">
                                            {PER_PAGE_OPTS.map(o => (
                                                <div key={o} className={`pg-pp-item${perPg === o ? " active" : ""}`}
                                                    onClick={() => { setPerPg(o); setPpO(false); setPg(1); }}>
                                                    {perPg === o && <span className="pp-check">✓</span>}{o}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pg-btns">
                                <button className="pg-btn" disabled={pg === 1} onClick={() => setPg(1)}>«</button>
                                <button className="pg-btn" disabled={pg === 1} onClick={() => setPg(p => p - 1)}>‹</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} className={`pg-btn${pg === p ? " pg-active" : ""}`} onClick={() => setPg(p)}>{p}</button>
                                ))}
                                <button className="pg-btn" disabled={pg === totalPages} onClick={() => setPg(p => p + 1)}>›</button>
                                <button className="pg-btn" disabled={pg === totalPages} onClick={() => setPg(totalPages)}>»</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <div className="support-bubble">⊕</div>
        </div>
    );
}