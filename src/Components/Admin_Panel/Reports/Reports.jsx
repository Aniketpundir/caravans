import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from "recharts";
import { fetchServices } from "../../../store/slices/servicesSlice";
import "./Reports.css";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = "https://api.caravanstoragecentralcoast.com.au/api";
const SHORTCUTS = ["Today", "Yesterday", "Tomorrow", "This week", "Last week", "This month", "Last month", "This year"];
const PER_PAGE_OPTS = [10, 20, 50, 100];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STATUS_LIST = ["pending", "approved", "cancelled", "rejected", "completed", "no-show"];
const STATUS_COLOR = { pending: "#f59e0b", approved: "#3b82f6", cancelled: "#9ca3af", rejected: "#ef4444", completed: "#22c55e", "no-show": "#92400e" };

// Cooldown + reminder-window constants
const REMINDER_COOLDOWN_MS = 10 * 60 * 1000; // 1 minute
const EXPIRY_WINDOW_DAYS = 10; // reminder button is only enabled when 0 <= daysRemaining <= 10

const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { Authorization: `Bearer ${token}` };
};

const sod = (d) => {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
};
const same = (a, b) => sod(a).getTime() === sod(b).getTime();
const fmtFull = (d) => d.toLocaleDateString("en-AU", { month: "long", day: "numeric", year: "numeric" });
const fmtShort = (d) => d.toLocaleDateString("en-AU", { month: "short", day: "2-digit" });
const toYMD = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Helper - how many days remain between today and the booking's endDate
const daysUntilExpiry = (endDate) => {
    if (!endDate) return null;
    const end = sod(new Date(endDate));
    const today = sod(new Date());
    return Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Helper - true only when endDate is today or within the next EXPIRY_WINDOW_DAYS days.
// A negative value (endDate already in the past) and a value greater than the window both return false.
const isWithinReminderWindow = (endDate) => {
    const days = daysUntilExpiry(endDate);
    return days !== null && days >= 0 && days <= EXPIRY_WINDOW_DAYS;
};

function getDefaultRange() {
    const end = sod(new Date());
    const start = new Date(end);
    start.setMonth(end.getMonth() - 1);
    return { s: start, e: end };
}

function dateRange(start, end) {
    const days = [];
    const cur = new Date(sod(start));
    const fin = sod(end);
    while (cur <= fin) {
        days.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return days;
}

function shortcut(label) {
    const today = sod(new Date());
    if (label === "Today") return { s: today, e: today };
    if (label === "Yesterday") {
        const day = new Date(today); day.setDate(today.getDate() - 1);
        return { s: sod(day), e: sod(day) };
    }
    if (label === "Tomorrow") {
        const day = new Date(today); day.setDate(today.getDate() + 1);
        return { s: sod(day), e: sod(day) };
    }
    if (label === "This week") {
        const start = new Date(today); start.setDate(today.getDate() - (today.getDay() || 7) + 1);
        const end = new Date(start); end.setDate(start.getDate() + 6);
        return { s: sod(start), e: sod(end) };
    }
    if (label === "Last week") {
        const start = new Date(today); start.setDate(today.getDate() - (today.getDay() || 7) - 6);
        const end = new Date(start); end.setDate(start.getDate() + 6);
        return { s: sod(start), e: sod(end) };
    }
    if (label === "This month") return { s: new Date(today.getFullYear(), today.getMonth(), 1), e: new Date(today.getFullYear(), today.getMonth() + 1, 0) };
    if (label === "Last month") return { s: new Date(today.getFullYear(), today.getMonth() - 1, 1), e: new Date(today.getFullYear(), today.getMonth(), 0) };
    if (label === "This year") return { s: new Date(today.getFullYear(), 0, 1), e: new Date(today.getFullYear(), 11, 31) };
    return getDefaultRange();
}

function CalMonth({ year, month, onDay, rS, rE }) {
    const dim = new Date(year, month + 1, 0).getDate();
    let fd = new Date(year, month, 1).getDay();
    fd = fd === 0 ? 6 : fd - 1;
    const prev = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < fd; i++) cells.push({ d: prev - fd + 1 + i, t: "p" });
    for (let d = 1; d <= dim; d++) cells.push({ d, t: "c" });
    while (cells.length % 7 !== 0) cells.push({ d: cells.length - fd - dim + 1, t: "n" });
    return (
        <div className="cal-month">
            <p className="cal-title">{MONTH_NAMES[month]} {year}</p>
            <div className="cal-grid">
                {WEEK_DAYS.map((d) => <div key={d} className="cal-dh">{d}</div>)}
                {cells.map((c, i) => {
                    if (c.t !== "c") return <div key={i} className="cal-day cal-other">{c.d}</div>;
                    const dt = new Date(year, month, c.d);
                    const isToday = same(dt, new Date());
                    const isStart = rS && same(dt, rS);
                    const isEnd = rE && same(dt, rE);
                    const inRange = rS && rE && dt > sod(rS) && dt < sod(rE);
                    let cls = "cal-day";
                    if (isToday) cls += " cal-today";
                    if (isStart || isEnd) cls += " cal-sel";
                    if (inRange) cls += " cal-in-range";
                    return <div key={i} className={cls} onClick={() => onDay(dt)}>{c.d}</div>;
                })}
            </div>
        </div>
    );
}

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

// Popup shown after a reminder email is successfully sent
function ReminderPopup({ data, onClose }) {
    if (!data) return null;
    return (
        <div className="reminder-modal-overlay" onClick={onClose}>
            <div className="reminder-modal" onClick={(e) => e.stopPropagation()}>
                <div className="reminder-modal-icon">✓</div>
                <h3 className="reminder-modal-title">Reminder Sent</h3>
                <p className="reminder-modal-msg">{data.message}</p>
                <div className="reminder-modal-details">
                    <div className="reminder-detail-row">
                        <span>Customer Email</span>
                        <strong>{data.customerEmail || "-"}</strong>
                    </div>
                    <div className="reminder-detail-row">
                        <span>Booking ID</span>
                        <strong>{data.bookingId || "-"}</strong>
                    </div>
                    <div className="reminder-detail-row">
                        <span>End Date</span>
                        <strong>{data.endDate || "-"}</strong>
                    </div>
                    <div className="reminder-detail-row">
                        <span>Days Remaining</span>
                        <strong>{data.daysRemaining ?? "-"}</strong>
                    </div>
                </div>
                <button className="reminder-modal-close" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default function Reports() {
    const [expandedId, setExpandedId] = useState(null);

    const Navigate = useNavigate();


    const handleDownloadPDF = () => {
        const rows = tab === "customers" ? customers : filtered;
        if (rows.length === 0) {
            alert("No data available to download for the selected range");
            return;
        }

        const doc = new jsPDF();
        const title = tab === "appointment" ? "Appointment Report"
            : tab === "revenue" ? "Revenue Report"
                : "Customers Report";

        doc.setFontSize(16);
        doc.text(title, 14, 16);
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`${fmtFull(rS)} - ${fmtFull(rE)}`, 14, 23);
        if (selSvc?.name) doc.text(`Service: ${selSvc.name}`, 14, 29);

        let head, body;

        if (tab === "customers") {
            head = [["Full Name", "Email", "Phone", "Last Appointment", "Total Appointments"]];
            body = rows.map((c) => [
                c.name,
                c.email,
                c.phone,
                c.lastDate.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" }),
                c.count,
            ]);
        } else {
            head = [["ID", "Date", "Customer", "Service", "Duration", "Status", "Amount", "Payment"]];
            body = rows.map((a) => [
                a.id,
                a.dateObj.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" }),
                a.customer,
                a.service,
                a.duration,
                a.status,
                `$${a.revenue}`,
                a.payment,
            ]);
        }

        autoTable(doc, {
            head,
            body,
            startY: selSvc?.name ? 34 : 28,
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [61, 214, 163], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [249, 250, 252] },
        });

        if (tab === "revenue") {
            const finalY = doc.lastAutoTable.finalY || 34;
            doc.setFontSize(12);
            doc.setTextColor(30);
            doc.text(`Total Revenue: $${totalRev.toLocaleString()}`, 14, finalY + 10);
        }

        doc.save(`${tab}-report_${toYMD(rS)}_to_${toYMD(rE)}.pdf`);
    };



    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [reminderPopup, setReminderPopup] = useState(null); // success popup data

    // Last reminder-sent timestamp per appointment id (drives the 1-minute cooldown)
    const [lastSentMap, setLastSentMap] = useState({});
    // Ticks every second so cooldown countdowns update in the UI
    const [nowTick, setNowTick] = useState(Date.now());

    useEffect(() => {
        const t = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    const isOnCooldown = (id) => {
        const last = lastSentMap[id];
        if (!last) return false;
        return nowTick - last < REMINDER_COOLDOWN_MS;
    };

    const cooldownSecondsLeft = (id) => {
        const last = lastSentMap[id];
        if (!last) return 0;
        return Math.max(0, Math.ceil((REMINDER_COOLDOWN_MS - (nowTick - last)) / 1000));
    };

    // Calls the expiry-reminder API for a single booking
    const handleAction = async (appointmentId) => {
        if (isOnCooldown(appointmentId)) return;
        setActionLoadingId(appointmentId);
        try {
            const response = await fetch(`${BASE_URL}/admin/bookings/${appointmentId}/expiry-reminder/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
            });

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                throw new Error(`Expiry reminder API returned non-JSON response (${response.status})`);
            }

            const json = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.message || "Failed to send reminder");
            }

            setLastSentMap((prev) => ({ ...prev, [appointmentId]: Date.now() }));
            setReminderPopup({
                message: json.message,
                customerEmail: json.data?.customerEmail,
                bookingId: json.data?.bookingId,
                endDate: json.data?.endDate,
                daysRemaining: json.data?.daysRemaining,
            });
        } catch (err) {
            console.error("Reminder error:", err);
            alert(err.message || "Something went wrong while sending reminder");
        } finally {
            setActionLoadingId(null);
        }
    };






    useEffect(() => {
        const token = localStorage.getItem("adminToken")

        if (!token) {
            Navigate("/admin-login")
        } else {
            Navigate("/admin-dashboard/report")
        }
    }, [])
    const dispatch = useDispatch();
    const services = useSelector((state) => state.services.list || []);

    const defaultRange = getDefaultRange();
    const [tab, setTab] = useState("appointment");
    const [svcO, setSvcO] = useState(false);
    const [selSvc, setSelSvc] = useState(null);
    const [calO, setCalO] = useState(false);
    const [calY, setCalY] = useState(defaultRange.s.getFullYear());
    const [calM, setCalM] = useState(defaultRange.s.getMonth());
    const [rS, setRS] = useState(defaultRange.s);
    const [rE, setRE] = useState(defaultRange.e);
    const [picking, setPick] = useState(true);
    const [perPg, setPerPg] = useState(20);
    const [ppO, setPpO] = useState(false);
    const [pg, setPg] = useState(1);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const calRef = useRef(null);

    useEffect(() => {
        dispatch(fetchServices());
    }, [dispatch]);

    useEffect(() => {
        const h = (e) => { if (calRef.current && !calRef.current.contains(e.target)) setCalO(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError("");
            try {
                const params = new URLSearchParams({
                    startDate: toYMD(rS),
                    endDate: toYMD(rE),
                });
                if (selSvc?.id) params.set("serviceId", selSvc.id);
                const response = await fetch(`${BASE_URL}/admin/reports?${params.toString()}`, {
                    headers: getAuthHeader(),
                });
                const raw = await response.text();
                const contentType = response.headers.get("content-type") || "";
                if (!contentType.includes("application/json")) {
                    throw new Error(
                        `Reports API returned non-JSON response (${response.status}). Check /api/admin/reports on backend.`
                    );
                }
                const json = JSON.parse(raw);
                if (!response.ok || !json.success) {
                    throw new Error(json.message || "Failed to fetch reports");
                }
                setReports(Array.isArray(json.data) ? json.data : []);
            } catch (err) {
                setError(err.message || "Failed to fetch reports");
                setReports([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [rS, rE, selSvc]);

    const filtered = useMemo(() => reports.map((item) => ({
        ...item,
        dateObj: new Date(item.date),
    })), [reports]);

    const chartData = useMemo(() => {
        const days = dateRange(rS, rE);
        return days.map((day) => {
            const dayRows = filtered.filter((item) => same(item.dateObj, day));
            return {
                label: fmtShort(day),
                appointments: dayRows.length,
                revenue: dayRows.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0),
            };
        });
    }, [filtered, rS, rE]);

    const stats = useMemo(() => {
        const base = STATUS_LIST.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
        filtered.forEach((item) => {
            const status = String(item.status || "").toLowerCase();
            if (status in base) base[status] += 1;
        });
        return base;
    }, [filtered]);

    const totalRev = useMemo(() => filtered.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0), [filtered]);

    const customers = useMemo(() => {
        const map = new Map();
        filtered.forEach((item) => {
            const key = item.customerId || item.customer;
            const current = map.get(key);
            if (!current) {
                map.set(key, {
                    name: item.customer,
                    email: item.email,
                    phone: item.phone,
                    lastDate: item.dateObj,
                    count: 1,
                    isNew: Boolean(item.isNewCustomer),
                });
                return;
            }
            current.count += 1;
            if (item.dateObj > current.lastDate) current.lastDate = item.dateObj;
        });
        return Array.from(map.values());
    }, [filtered]);

    const custStats = useMemo(() => ({
        existing: customers.filter((customer) => !customer.isNew).length,
        newCust: customers.filter((customer) => customer.isNew).length,
    }), [customers]);

    const custChartData = useMemo(() => {
        const days = dateRange(rS, rE);
        return days.map((day) => {
            const dayRows = filtered.filter((item) => same(item.dateObj, day));
            const newCustomers = dayRows.filter((item) => item.isNewCustomer).length;
            return {
                label: fmtShort(day),
                newCustomers,
                existingCustomers: dayRows.length - newCustomers,
            };
        });
    }, [filtered, rS, rE]);

    const handleDay = (d) => {
        if (picking) {
            setRS(d);
            setRE(d);
            setPick(false);
        } else {
            if (d < rS) {
                setRE(rS);
                setRS(d);
            } else {
                setRE(d);
            }
            setPick(true);
            setCalO(false);
        }
        setPg(1);
    };

    const handleShortcut = (label) => {
        const range = shortcut(label);
        setRS(range.s);
        setRE(range.e);
        setCalY(range.s.getFullYear());
        setCalM(range.s.getMonth());
        setCalO(false);
        setPg(1);
    };

    const prevM = () => { if (calM === 0) { setCalY((y) => y - 1); setCalM(11); } else setCalM((m) => m - 1); };
    const nextM = () => { if (calM === 11) { setCalY((y) => y + 1); setCalM(0); } else setCalM((m) => m + 1); };
    const m2 = calM === 11 ? 0 : calM + 1;
    const y2 = calM === 11 ? calY + 1 : calY;

    const dateLbl = `${fmtFull(rS)} - ${fmtFull(rE)}`;

    const tableRows = tab === "customers" ? customers : filtered;
    const totalPages = Math.max(1, Math.ceil(tableRows.length / perPg));
    const pageRows = tableRows.slice((pg - 1) * perPg, pg * perPg);
    const yKey = tab === "revenue" ? "revenue" : "appointments";
    const activeCData = tab === "customers" ? custChartData : chartData;
    const yMax = tab === "customers"
        ? Math.max(...custChartData.map((d) => d.newCustomers + d.existingCustomers), 1) * 1.3
        : Math.max(...chartData.map((d) => d[yKey]), 1) * 1.3;
    const barSz = activeCData.length > 30 ? 6 : activeCData.length > 14 ? 14 : 38;

    return (
        <div className="rp-page" onClick={() => { setSvcO(false); setPpO(false); }}>
            <h1 className="rp-h1">Reports</h1>

            <div className="rp-layout">
                <aside className="rp-sidebar">
                    {[
                        { k: "appointment", l: "Appointment Report" },
                        { k: "revenue", l: "Revenue Report" },
                        { k: "customers", l: "Customers Report" },
                    ].map((entry) => (
                        <button key={entry.k} className={`sb-btn${tab === entry.k ? " sb-active" : ""}`} onClick={() => { setTab(entry.k); setPg(1); }}>
                            {entry.l}
                        </button>
                    ))}
                </aside>

                <main className="rp-main">
                    <div className="rp-h2-row">
                        <h2 className="rp-h2">
                            {tab === "appointment" ? "Appointment Report" : tab === "revenue" ? "Revenue Report" : "Customers Report"}
                        </h2>
                        <button className="pdf-btn" onClick={handleDownloadPDF} disabled={loading}>
                            ⬇ Download PDF
                        </button>
                    </div>

                    <div className="filters-row">
                        {tab !== "customers" && (
                            <div className="dd-wrap" onClick={(e) => e.stopPropagation()}>
                                <div className={`dd-trigger${svcO ? " open" : ""}`} onClick={() => setSvcO((v) => !v)}>
                                    <span>{selSvc?.name || "Select Service"}</span>
                                    <span className="dd-arrow">{svcO ? "^" : "v"}</span>
                                </div>
                                {svcO && (
                                    <div className="dd-menu">
                                        <div className="dd-grp-lbl">Caravan Storage</div>
                                        <div className={`dd-item${!selSvc ? " dd-selected" : ""}`} onClick={() => { setSelSvc(null); setSvcO(false); setPg(1); }}>
                                            All Services
                                        </div>
                                        {services.map((service) => (
                                            <div key={service._id} className={`dd-item${selSvc?.id === service._id ? " dd-selected" : ""}`} onClick={() => { setSelSvc({ id: service._id, name: service.serviceName }); setSvcO(false); setPg(1); }}>
                                                {service.serviceName}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="dr-wrap" ref={calRef}>
                            <button className="dr-btn" onClick={() => setCalO((v) => !v)}>
                                <span className="dr-icon">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="3" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </span>
                                <span>{dateLbl}</span>
                            </button>
                            {calO && (
                                <div className="cal-popup" onClick={(e) => e.stopPropagation()}>
                                    <div className="cal-shortcuts">
                                        {SHORTCUTS.map((item) => (
                                            <div key={item} className="cal-sc" onClick={() => handleShortcut(item)}>{item}</div>
                                        ))}
                                    </div>
                                    <div className="cal-right">
                                        <div className="cal-nav-row">
                                            <button className="cal-nav-btn" onClick={prevM}>{"<< <"}</button>
                                            <span />
                                            <button className="cal-nav-btn" onClick={nextM}>{"> >>"}</button>
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

                    {error && <div className="no-data" style={{ marginBottom: 16 }}>{error}</div>}
                    {loading && <div className="no-data" style={{ marginBottom: 16 }}>Loading reports...</div>}

                    <div className="cs-row">
                        <div className="chart-card">
                            <p className="chart-card-title">{tab === "revenue" ? "Revenue" : tab === "customers" ? "Customers" : "Appointments"}</p>

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
                                    <span className="legend-lbl">{tab === "revenue" ? "Total Revenue (AUD)" : "Total Appointment"}</span>
                                </div>
                            )}

                            <ResponsiveContainer width="100%" height={230}>
                                {tab === "customers" ? (
                                    <BarChart data={custChartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }} barSize={barSz}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} interval={custChartData.length > 30 ? "preserveStartEnd" : custChartData.length > 14 ? 1 : 0} />
                                        <YAxis tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, yMax]} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="newCustomers" name="New Customers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="existingCustomers" name="Existing Customers" fill="#3dd6a3" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }} barSize={barSz}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} interval={chartData.length > 30 ? "preserveStartEnd" : chartData.length > 14 ? 1 : 0} />
                                        <YAxis tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} allowDecimals={tab === "revenue"} domain={[0, yMax]} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey={yKey} name={tab === "revenue" ? "Revenue (AUD)" : "Total Appointment"} fill="#3dd6a3" radius={[4, 4, 0, 0]} />
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
                                STATUS_LIST.map((status) => (
                                    <div key={status} className="stat-row">
                                        <div className="stat-left">
                                            <span className="stat-dot" style={{ background: STATUS_COLOR[status] }} />
                                            <span className="stat-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                                        </div>
                                        <span className="stat-num">{stats[status]}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="tbl-card">
                        <p className="tbl-heading">{tab === "customers" ? "Customer Summary" : "Appointments Summary"}</p>
                        {tab === "customers" ? (
                            <table className="data-tbl">
                                <thead><tr>
                                    <th>Full Name <span className="sort-ico">&lt;&gt;</span></th>
                                    <th>Email <span className="sort-ico">&lt;&gt;</span></th>
                                    <th>Phone</th>
                                    <th>Last Appointment Booked <span className="sort-ico">&lt;&gt;</span></th>
                                    <th>Total Appointments</th>
                                </tr></thead>
                                <tbody>
                                    {pageRows.length === 0 && <tr><td colSpan={5} className="no-data">No data for selected range</td></tr>}
                                    {pageRows.map((customer, index) => (
                                        <tr key={index}>
                                            <td><div className="cust-cell"><div className="avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg></div>{customer.name}</div></td>
                                            <td>{customer.email}</td>
                                            <td>{customer.phone}</td>
                                            <td>{customer.lastDate.toLocaleDateString("en-AU", { month: "long", day: "numeric", year: "numeric" })} {customer.lastDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true })}</td>
                                            <td>{customer.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="data-tbl">
                                <thead><tr>
                                    <th>ID</th>
                                    <th>Date <span className="sort-ico">&lt;&gt;</span></th>
                                    <th>Customer <span className="sort-ico">&lt;&gt;</span></th>
                                    <th>Service <span className="sort-ico">&lt;&gt;</span></th>
                                    <th>Duration <span className="sort-ico">&lt;&gt;</span></th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                    <th>UPTO Date</th>
                                    <th>Action</th>
                                    <th>Payment <span className="sort-ico">&lt;&gt;</span></th>
                                </tr></thead>
                                <tbody>
                                    {pageRows.length === 0 && <tr><td colSpan={7} className="no-data">No appointments for selected range</td></tr>}
                                    {pageRows.map((appointment) => {
                                        // Both "too far in the future" (>10 days) and "already in the past"
                                        // (negative days) return false here, and the button stays visible but disabled.
                                        const withinWindow = isWithinReminderWindow(appointment.endDate);
                                        const onCooldown = isOnCooldown(appointment.id);
                                        const isSendingThis = actionLoadingId === appointment.id;
                                        const isDisabledLook = !withinWindow || onCooldown || isSendingThis;

                                        return (
                                            <tr key={appointment.id}>
                                                <td
                                                    className={`id-cell${expandedId === appointment.id ? " id-expanded" : ""}`}
                                                    title={appointment.id}
                                                    onClick={() => setExpandedId((prev) => (prev === appointment.id ? null : appointment.id))}
                                                >
                                                    {appointment.id}
                                                </td>
                                                <td>{appointment.dateObj.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" })} {appointment.dateObj.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true })}</td>
                                                <td>{appointment.customer}</td>
                                                <td>{appointment.service}</td>
                                                <td>{appointment.duration}</td>
                                                <td><span className={`badge badge-${String(appointment.status || "").replace(" ", "-").toLowerCase()}`}>{appointment.status}</span></td>
                                                <td>${appointment.revenue}</td>
                                                <td>{appointment.endDate || "NULL"}</td>
                                                <td>
                                                    {withinWindow ? (
                                                        <button
                                                            className={`action-btn${isDisabledLook ? " action-btn-disabled" : ""}`}
                                                            disabled={onCooldown || isSendingThis}
                                                            onClick={() => handleAction(appointment.id)}
                                                        >
                                                            {isSendingThis
                                                                ? "..."
                                                                : onCooldown
                                                                    ? `Wait ${cooldownSecondsLeft(appointment.id)}s`
                                                                    : "Send Reminder"}
                                                        </button>
                                                    ) : (
                                                        <span className="no-data">-</span>
                                                    )}
                                                </td>
                                                <td><span className={`pay-badge${appointment.payment === "Paid" ? " paid" : ""}`}>{appointment.payment}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        <div className="pg-row">
                            <span className="pg-info">Showing <strong>{Math.min(tableRows.length, perPg)}</strong> out of <strong>{tableRows.length}</strong></span>
                            <div className="pg-pp" onClick={(e) => e.stopPropagation()}>
                                <span className="pg-pp-lbl">Per Page</span>
                                <div className="pg-pp-wrap">
                                    <div className="pg-pp-btn" onClick={() => setPpO((v) => !v)}>{perPg} {ppO ? "^" : "v"}</div>
                                    {ppO && (
                                        <div className="pg-pp-menu">
                                            {PER_PAGE_OPTS.map((option) => (
                                                <div key={option} className={`pg-pp-item${perPg === option ? " active" : ""}`} onClick={() => { setPerPg(option); setPpO(false); setPg(1); }}>
                                                    {perPg === option && <span className="pp-check">√</span>}{option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pg-btns">
                                <button className="pg-btn" disabled={pg === 1} onClick={() => setPg(1)}>&lt;&lt;</button>
                                <button className="pg-btn" disabled={pg === 1} onClick={() => setPg((p) => p - 1)}>&lt;</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button key={page} className={`pg-btn${pg === page ? " pg-active" : ""}`} onClick={() => setPg(page)}>{page}</button>
                                ))}
                                <button className="pg-btn" disabled={pg === totalPages} onClick={() => setPg((p) => p + 1)}>&gt;</button>
                                <button className="pg-btn" disabled={pg === totalPages} onClick={() => setPg(totalPages)}>&gt;&gt;</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <ReminderPopup data={reminderPopup} onClose={() => setReminderPopup(null)} />
        </div>
    );
}