import { useState, useEffect, useRef, useMemo } from "react";
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from "recharts";
import ExpandPanel from "../Expandpanel/Expandpanel";
import "./Dashboard.css";

// ─── UTILITY: Last 7 days dates ──────────────────────────────────────────────
function getLast7Days() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i); // 6 din peeche se aaj tak
        return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
        // Output: "Mar 06", "Mar 07", ... "Mar 12"
    });
}

function formatDisplayDate(dateStr) {
    // "Mar 06" → "March 6, 2026" format for header display
    const d = new Date(`${dateStr} ${new Date().getFullYear()}`);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ─── UTILITY: Build empty chart data for 7 days ───────────────────────────────
function buildEmptyChartData(dates) {
    return dates.map((date) => ({ date, approved: 0, pending: 0, revenue: 0, customers: 0 }));
}

// ─── STATUS OPTIONS ───────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["Approved", "Pending", "Cancelled", "Rejected", "No-Show", "Completed"];

// ─── SAMPLE APPOINTMENTS (replace with API data) ─────────────────────────────
const initialAppointments = [
    {
        id: "#152",
        date: "March 28, 2026 12:00 am",
        customer: "Tracy Hazell",
        firstName: "Tracy",
        lastName: "Hazell",
        email: "tracyhazell@gmail.com",
        phone: "+1 555 000 1111",
        service: "Large Lot - 9mx3m",
        duration: "110 Days",
        status: "Approved",
        payment: "$738.10",
        paymentMethod: "Credit Card",
        tax: "$67.10",
        createdDate: "January 14, 2026 7:39 am",
        time: "12:00 am To 12:00 am",
        bookingDate: "March 28, 2026",
    },
    {
        id: "#173",
        date: "April 2, 2026 12:00 am",
        customer: "Corey Hogan",
        firstName: "Corey",
        lastName: "Hogan",
        email: "coreyhoganaes@gmail.com",
        phone: "+1 555 000 2222",
        service: "Medium Lot - 7mx3m",
        duration: "18 Days",
        status: "Approved",
        payment: "$93.85",
        paymentMethod: "Credit Card",
        tax: "$8.53",
        createdDate: "February 17, 2026 11:26 am",
        time: "12:00 am To 12:00 am",
        bookingDate: "April 2, 2026",
    },
    {
        id: "#172",
        date: "April 24, 2026 12:00 am",
        customer: "Rodney SMITH",
        firstName: "Rodney",
        lastName: "SMITH",
        email: "rodneysmith@gmail.com",
        phone: "+1 555 000 3333",
        service: "Small Lot - 6mx3m",
        duration: "52 Days",
        status: "Approved",
        payment: "$232.23",
        paymentMethod: "Credit Card",
        tax: "$21.11",
        createdDate: "February 14, 2026 10:54 am",
        time: "12:00 am To 12:00 am",
        bookingDate: "April 24, 2026",
    },
];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const EditIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

// ─── STATUS DROPDOWN ──────────────────────────────────────────────────────────
function StatusDropdown({ status, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="admin_status__wrapper" ref={ref}>
            <button className="admin_status__btn" onClick={() => setOpen((v) => !v)}>
                {status}
            </button>
            {open && (
                <div className="admin_status__dropdown">
                    <div className="admin_status__dropdown-header">Change status</div>
                    {STATUS_OPTIONS.map((opt) => (
                        <div
                            key={opt}
                            className={`admin_status__dropdown-option${opt === status ? " admin_status__dropdown-option--selected" : ""}`}
                            onClick={() => { onChange(opt); setOpen(false); }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [expandedId, setExpandedId] = useState(null);

    // ── Last 7 days dates (auto, changes every day) ──
    const last7Days = useMemo(() => getLast7Days(), []);

    // ── Chart data: start with empty skeleton, fill from API ──
    const [appointmentsChartData, setAppointmentsChartData] = useState(
        () => buildEmptyChartData(last7Days).map(d => ({ date: d.date, approved: 0, pending: 0 }))
    );
    const [revenueChartData, setRevenueChartData] = useState(
        () => last7Days.map(date => ({ date, revenue: 0 }))
    );
    const [customersChartData, setCustomersChartData] = useState(
        () => last7Days.map(date => ({ date, customers: 0 }))
    );

    // ── Header date display ──
    const dateFrom = formatDisplayDate(last7Days[0]);
    const dateTo = formatDisplayDate(last7Days[6]);

    // ── Fetch chart data from API ──
    useEffect(() => {
        // Convert "Mar 06" → "2026-03-06" for API params
        const toISO = (label) => {
            const d = new Date(`${label} ${new Date().getFullYear()}`);
            return d.toISOString().split("T")[0];
        };
        const fromParam = toISO(last7Days[0]);
        const toParam = toISO(last7Days[6]);

        // ── Replace these fetch URLs with your actual API endpoints ──

        // Appointments chart
        fetch(`/api/charts/appointments?from=${fromParam}&to=${toParam}`)
            .then((res) => res.json())
            .then((data) => setAppointmentsChartData(data))
            .catch(() => {
                // If API fails, keep empty data (no crash)
            });

        // Revenue chart
        fetch(`/api/charts/revenue?from=${fromParam}&to=${toParam}`)
            .then((res) => res.json())
            .then((data) => setRevenueChartData(data))
            .catch(() => { });

        // Customers chart
        fetch(`/api/charts/customers?from=${fromParam}&to=${toParam}`)
            .then((res) => res.json())
            .then((data) => setCustomersChartData(data))
            .catch(() => { });

        /*
        ─── YA agar ek hi API call mein sab data aata ho ───
        fetch(`/api/dashboard/charts?from=${fromParam}&to=${toParam}`)
            .then((res) => res.json())
            .then((data) => {
                setAppointmentsChartData(data.appointments);
                setRevenueChartData(data.revenue);
                setCustomersChartData(data.customers);
            })
            .catch(() => {});
        */
    }, [last7Days]);

    const handleStatusChange = (index, newStatus) => {
        setAppointments((prev) =>
            prev.map((a, i) => (i === index ? { ...a, status: newStatus } : a))
        );
    };

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <>
            <div className="admin_page__wrapper">
                <div className="admin_dashboard__container">

                    {/* ── Header ── */}
                    <div className="admin_dashboard__header">
                        <h1 className="admin_dashboard__title">Dashboard</h1>
                        {/* Date range auto update hoti hai last 7 days se */}
                        <div className="admin_dashboard__date-picker">
                            <svg viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>{dateFrom}</span>
                            <span>-</span>
                            <span>{dateTo}</span>
                        </div>
                    </div>

                    {/* ── Stat Cards Row 1 ── */}
                    <div className="admin_stats__row-top">
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--dark">2</div>
                            <div className="admin_stat__label">Total Appointments</div>
                        </div>
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--green">2</div>
                            <div className="admin_stat__label">Approved Appointments</div>
                        </div>
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--orange">0</div>
                            <div className="admin_stat__label">Pending Appointments</div>
                        </div>
                    </div>

                    {/* ── Stat Cards Row 2 ── */}
                    <div className="admin_stats__row-bottom">
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--blue">$301.95</div>
                            <div className="admin_stat__label">Revenue</div>
                        </div>
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--purple">2</div>
                            <div className="admin_stat__label">Customers</div>
                        </div>
                    </div>

                    {/* ── Technical Analysis ── */}
                    <div className="admin_section__title">Technical Analysis</div>
                    <div className="admin_charts__grid">

                        {/* Appointments Chart */}
                        <div className="admin_chart__card">
                            <div className="admin_chart__title">Appointments</div>
                            <div className="admin_chart__legend">
                                <div className="admin_chart__legend-item">
                                    <div className="admin_chart__legend-box admin_chart__legend-box--green" />
                                    <span>Approved Appointment</span>
                                </div>
                                <div className="admin_chart__legend-item">
                                    <div className="admin_chart__legend-box admin_chart__legend-box--orange" />
                                    <span>Pending Appointment</span>
                                </div>
                            </div>
                            <div className="admin_chart__canvas-wrap">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={appointmentsChartData} barSize={18}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="approved" fill="#22c55e" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="pending" fill="#f5d9a0" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Revenue Chart */}
                        <div className="admin_chart__card">
                            <div className="admin_chart__title">Revenue</div>
                            <div className="admin_chart__legend">
                                <div className="admin_chart__legend-item">
                                    <div className="admin_chart__legend-box admin_chart__legend-box--green" />
                                    <span>Revenue</span>
                                </div>
                            </div>
                            <div className="admin_chart__canvas-wrap">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#22c55e"
                                            strokeWidth={2}
                                            dot={{ fill: "#22c55e", r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Customers Chart */}
                        <div className="admin_chart__card">
                            <div className="admin_chart__title">Customers</div>
                            <div className="admin_chart__legend">
                                <div className="admin_chart__legend-item">
                                    <div className="admin_chart__legend-box admin_chart__legend-box--blue" />
                                    <span>Customers</span>
                                </div>
                            </div>
                            <div className="admin_chart__canvas-wrap">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={customersChartData} barSize={28}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="customers" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* ── Upcoming Appointments Table ── */}
                    <div className="admin_table__section-title">Upcoming Appointments</div>
                    <div className="admin_table__wrapper">
                        <table className="admin_table__appointments">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>
                                        <div className="admin_table__th-inner">Date
                                            <div className="admin_table__sort-arrows"><span>▲</span><span>▼</span></div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="admin_table__th-inner">Customer
                                            <div className="admin_table__sort-arrows"><span>▲</span><span>▼</span></div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="admin_table__th-inner">Service
                                            <div className="admin_table__sort-arrows"><span>▲</span><span>▼</span></div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="admin_table__th-inner">Duration
                                            <div className="admin_table__sort-arrows"><span>▲</span><span>▼</span></div>
                                        </div>
                                    </th>
                                    <th>Status</th>
                                    <th>
                                        <div className="admin_table__th-inner">Payment
                                            <div className="admin_table__sort-arrows"><span>▲</span><span>▼</span></div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="admin_table__th-inner">Created Date
                                            <div className="admin_table__sort-arrows"><span>▲</span><span>▼</span></div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((appt, index) => {
                                    const isOpen = expandedId === appt.id;
                                    return (
                                        <>
                                            <tr key={appt.id} className="admin_table__data-row">
                                                <td>
                                                    <div className="admin_table__id-cell">
                                                        <button
                                                            className={`admin_table__expand-btn${isOpen ? " admin_table__expand-btn--open" : ""}`}
                                                            onClick={() => toggleExpand(appt.id)}
                                                        >
                                                            {isOpen ? "−" : "+"}
                                                        </button>
                                                        {appt.id}
                                                    </div>
                                                </td>
                                                <td>{appt.date}</td>
                                                <td>{appt.customer}</td>
                                                <td>{appt.service}</td>
                                                <td>{appt.duration}</td>
                                                <td>
                                                    <StatusDropdown
                                                        status={appt.status}
                                                        onChange={(newStatus) => handleStatusChange(index, newStatus)}
                                                    />
                                                </td>
                                                <td>{appt.payment}</td>
                                                <td className="admin_table__actions-cell">
                                                    <span className="admin_table__created-date">{appt.createdDate}</span>
                                                    <div className="admin_table__action-icons">
                                                        <button className="admin_table__action-btn" title="Edit">
                                                            <EditIcon />
                                                        </button>
                                                        <button className="admin_table__action-btn" title="Delete">
                                                            <DeleteIcon />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {isOpen && (
                                                <tr key={`${appt.id}-expand`} className="admin_table__expand-row">
                                                    <td colSpan={8}>
                                                        <ExpandPanel
                                                            appt={appt}
                                                            onClose={() => setExpandedId(null)}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

            {/* ── Help FAB ── */}
            <div className="admin_help__fab">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </div>
        </>
    );
}