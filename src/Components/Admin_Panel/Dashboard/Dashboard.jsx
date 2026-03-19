import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardData, fetchChartsData, fetchUpcomingAppointments } from "../../../store/slices/dashboardSlice.js";
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from "recharts";
import ExpandPanel from "../Expandpanel/Expandpanel";
import DateRangePicker from "../Daterangepicker/Daterangepicker";
import "./Dashboard.css";

function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function buildDateRange(from, to) {
    const days = [];
    const cur = new Date(from);
    while (cur <= to) {
        days.push(cur.toLocaleDateString("en-US", { month: "short", day: "2-digit" }));
        cur.setDate(cur.getDate() + 1);
    }
    return days;
}

function getDefaultRange() {
    const from = startOfDay(new Date());
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return { from, to };
}

function toChartLabel(dateStr) {
    if (!dateStr) return null;
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
    });
}

function mapChartsData(rawCharts, from, to) {
    const labels = buildDateRange(from, to);
    const rows = new Map(
        labels.map((label) => [label, { date: label, approved: 0, pending: 0, revenue: 0, customers: 0 }])
    );

    rawCharts?.appointments?.forEach((item) => {
        const label = toChartLabel(item?._id?.date);
        if (!label || !rows.has(label)) return;
        const status = String(item?._id?.status || "").toLowerCase();
        if (status === "approved") rows.get(label).approved += item.count || 0;
        if (status === "pending") rows.get(label).pending += item.count || 0;
    });

    rawCharts?.revenue?.forEach((item) => {
        const label = toChartLabel(item?._id?.date);
        if (!label || !rows.has(label)) return;
        rows.get(label).revenue = item.total || 0;
    });

    rawCharts?.customers?.forEach((item) => {
        const label = toChartLabel(item?._id?.date);
        if (!label || !rows.has(label)) return;
        rows.get(label).customers = item.count || 0;
    });

    return labels.map((label) => rows.get(label));
}

const STATUS_OPTIONS = ["Approved", "Pending", "Cancelled", "Rejected", "No-Show", "Completed"];

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

function StatusDropdown({ status, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function h(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <div className="admin_status__wrapper" ref={ref}>
            <button className="admin_status__btn" onClick={() => setOpen((v) => !v)}>{status}</button>
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

export default function Dashboard() {
    const dispatch = useDispatch();
    const {
        data: dashboardApiData,
        chartsData,
        chartsLoading,
        chartsError,
        upcomingData,
        loading,
        error,
        from: reduxFrom,
        to: reduxTo,
    } = useSelector((state) => state.dashboard);

    const [expandedId, setExpandedId] = useState(null);
    const [dateRange, setDateRange] = useState(getDefaultRange());

    useEffect(() => {
        dispatch(fetchDashboardData({ from: reduxFrom, to: reduxTo }));
        dispatch(fetchChartsData({ from: reduxFrom, to: reduxTo }));
        dispatch(fetchUpcomingAppointments());
    }, [dispatch, reduxFrom, reduxTo]);

    useEffect(() => {
        if (reduxFrom && reduxTo) {
            setDateRange({ from: new Date(reduxFrom), to: new Date(reduxTo) });
        }
    }, [reduxFrom, reduxTo]);

    const chartSeries = useMemo(
        () => mapChartsData(chartsData?.data, dateRange.from, dateRange.to),
        [chartsData, dateRange.from, dateRange.to]
    );

    const appointmentsChartData = useMemo(
        () => chartSeries.map(({ date, approved, pending }) => ({ date, approved, pending })),
        [chartSeries]
    );
    const revenueChartData = useMemo(
        () => chartSeries.map(({ date, revenue }) => ({ date, revenue })),
        [chartSeries]
    );
    const customersChartData = useMemo(
        () => chartSeries.map(({ date, customers }) => ({ date, customers })),
        [chartSeries]
    );

    const handleDateChange = ({ from, to }) => {
        setDateRange({ from, to });
    };

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    function formatDateTime(dateString) {
        if (!dateString) return "-";
        if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return String(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <>
            <div className="admin_page__wrapper">
                <div className="admin_dashboard__container">
                    <div className="admin_dashboard__header">
                        <h1 className="admin_dashboard__title">Dashboard</h1>
                        <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={handleDateChange} />
                    </div>

                    {error && <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>}

                    <div className="admin_stats__row-top">
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--dark">{dashboardApiData?.data?.totalAppointments ?? 0}</div>
                            <div className="admin_stat__label">Total Appointments</div>
                        </div>
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--green">{dashboardApiData?.data?.approvedAppointments ?? 0}</div>
                            <div className="admin_stat__label">Approved Appointments</div>
                        </div>
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--orange">{dashboardApiData?.data?.pendingAppointments ?? 0}</div>
                            <div className="admin_stat__label">Pending Appointments</div>
                        </div>
                    </div>

                    <div className="admin_stats__row-bottom">
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--blue">{dashboardApiData?.data?.revenue ?? 0}</div>
                            <div className="admin_stat__label">Revenue</div>
                        </div>
                        <div className="admin_stat__card">
                            <div className="admin_stat__number admin_stat__number--purple">{dashboardApiData?.data?.customers ?? 0}</div>
                            <div className="admin_stat__label">Customers</div>
                        </div>
                    </div>

                    <div className="admin_section__title">Technical Analysis</div>
                    {chartsError && <div style={{ color: "#ef4444", marginBottom: 12 }}>{chartsError}</div>}
                    <div className="admin_charts__grid">
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
                                        <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

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

                    <div className="admin_table__section-title">Upcoming Appointments</div>
                    <div className="admin_table__wrapper">
                        <table className="admin_table__appointments">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th><div className="admin_table__th-inner">Date<div className="admin_table__sort-arrows"><span>^</span><span>v</span></div></div></th>
                                    <th><div className="admin_table__th-inner">Customer<div className="admin_table__sort-arrows"><span>^</span><span>v</span></div></div></th>
                                    <th><div className="admin_table__th-inner">Service<div className="admin_table__sort-arrows"><span>^</span><span>v</span></div></div></th>
                                    <th><div className="admin_table__th-inner">Duration<div className="admin_table__sort-arrows"><span>^</span><span>v</span></div></div></th>
                                    <th>Status</th>
                                    <th><div className="admin_table__th-inner">Payment<div className="admin_table__sort-arrows"><span>^</span><span>v</span></div></div></th>
                                    <th><div className="admin_table__th-inner">Created Date<div className="admin_table__sort-arrows"><span>^</span><span>v</span></div></div></th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingData?.data?.map((appt, index) => {
                                    const rowId = appt.id || appt._id;
                                    const isOpen = expandedId === rowId;
                                    return (
                                        <>
                                            <tr key={rowId} className="admin_table__data-row">
                                                <td>
                                                    <div className="admin_table__id-cell">
                                                        <button className={`admin_table__expand-btn${isOpen ? " admin_table__expand-btn--open" : ""}`} onClick={() => toggleExpand(rowId)}>
                                                            {isOpen ? "-" : "+"}
                                                        </button>
                                                        {rowId}
                                                    </div>
                                                </td>
                                                <td>{formatDateTime(appt.date)}</td>
                                                <td>{appt.customer}</td>
                                                <td>{appt.service}</td>
                                                <td>{appt.duration}</td>
                                                <td>
                                                    <StatusDropdown status={appt.status} onChange={() => {}} />
                                                </td>
                                                <td>{appt.payment}</td>
                                                <td className="admin_table__actions-cell">
                                                    <span className="admin_table__created-date">{formatDateTime(appt.createdAt)}</span>
                                                    <div className="admin_table__action-icons">
                                                        <button className="admin_table__action-btn" title="Edit"><EditIcon /></button>
                                                        <button className="admin_table__action-btn" title="Delete"><DeleteIcon /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isOpen && (
                                                <tr key={`${rowId}-expand`} className="admin_table__expand-row">
                                                    <td colSpan={8}>
                                                        <ExpandPanel appt={appt} onClose={() => setExpandedId(null)} />
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
