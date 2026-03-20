import { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments, updatePaymentStatus } from "../../../store/slices/paymentsSlice";
import { fetchServices } from "../../../store/slices/servicesSlice";
import { downloadCsv } from "../../../utils/exportCsv";
import "./Managepayments.css";
import { useNavigate } from "react-router-dom";

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUS_OPTIONS = ["Paid", "Pending", "Failed"];
const PER_PAGE_OPTIONS = [10, 20, 50];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BOOKING_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
});

const toUiPaymentStatus = (value) => {
    const normalized = String(value || "Pending").toLowerCase();
    if (normalized === "succeeded") return "Paid";
    if (normalized === "failed") return "Failed";
    if (normalized === "refunded") return "Failed";
    return "Pending";
};

const toApiPaymentStatus = (value) => {
    const normalized = String(value || "Pending").toLowerCase();
    if (normalized === "paid") return "Succeeded";
    if (normalized === "failed") return "Failed";
    return "Pending";
};

const fmtAmt = (amount, currency = "AUD") => {
    const num = Number(amount) || 0;
    try {
        return new Intl.NumberFormat("en-AU", {
            style: "currency",
            currency: String(currency || "AUD").toUpperCase(),
        }).format(num);
    } catch {
        return `$${num.toFixed(2)}`;
    }
};

const toDateOnlyString = (value) => {
    if (!value) return "";
    if (typeof value === "string" && DATE_ONLY_RE.test(value)) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatBookingDate = (value) => {
    if (!value) return "-";
    const dateOnly = toDateOnlyString(value);
    if (!dateOnly) return String(value);
    const [year, month, day] = dateOnly.split("-").map(Number);
    return BOOKING_DATE_FORMATTER.format(new Date(year, month - 1, day));
};

const formatTimestamp = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return `${date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })} ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })}`;
};

const normalizePayment = (payment) => ({
    id: payment._id ?? payment.id ?? "",
    date: payment.date ?? payment.createdAt ?? "",
    customer: payment.customer ?? "-",
    service: payment.service ?? "-",
    serviceId: payment.serviceId ?? "",
    method: payment.method ?? "Card",
    status: toUiPaymentStatus(payment.status ?? payment.paymentStatus ?? "Pending"),
    amount: Number(payment.amount) || 0,
    appointmentOn: payment.appointmentOn ?? payment.startDate ?? "",
    currency: payment.currency ?? "AUD",
    transactionId: payment.stripePaymentIntentId ?? payment.transactionId ?? "-",
});

function CalendarGrid({ year, month, start, end, hover, onPick, onHover }) {
    const firstDow = new Date(year, month, 1).getDay();
    const offset = firstDow === 0 ? 6 : firstDow - 1;
    const daysInPrev = new Date(year, month, 0).getDate();
    const daysInCur = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push({ d: daysInPrev - offset + 1 + i, cur: false });
    for (let i = 1; i <= daysInCur; i++) cells.push({ d: i, cur: true });
    while (cells.length < 42) cells.push({ d: cells.length - offset - daysInCur + 1, cur: false });

    const today = new Date();

    return (
        <div>
            <div className="mp-cal-header">{year} {MONTHS_FULL[month]}</div>
            <div className="mp-cal-grid">
                {DAYS_SHORT.map((d) => (
                    <div key={d} className="mp-cal-day-label">{d}</div>
                ))}
                {cells.map((cell, i) => {
                    if (!cell.cur) {
                        return (
                            <div key={i} className="mp-cal-cell mp-cal-cell--inactive">
                                <span className="mp-cal-cell-inner mp-cal-cell-inner--inactive">{cell.d}</span>
                            </div>
                        );
                    }
                    const dt = new Date(year, month, cell.d);
                    const dow = i % 7;
                    const isWeekend = dow === 5 || dow === 6;
                    const isToday = dt.toDateString() === today.toDateString();
                    const isStart = start && dt.toDateString() === start.toDateString();
                    const isEnd = end && dt.toDateString() === end.toDateString();
                    const rangeEnd = end || hover;
                    const inRange = start && rangeEnd && dt > start && dt < rangeEnd;

                    const cls = [
                        "mp-cal-cell-inner",
                        isWeekend && !isStart && !isEnd ? "mp-cal-cell-inner--weekend" : "",
                        isToday ? "mp-cal-cell-inner--today" : "",
                        isStart || isEnd ? "mp-cal-cell-inner--selected" : "",
                        inRange && !isStart && !isEnd ? "mp-cal-cell-inner--in-range" : "",
                    ].filter(Boolean).join(" ");

                    return (
                        <div key={i} className="mp-cal-cell" onMouseEnter={() => onHover(dt)} onClick={() => onPick(dt)}>
                            <span className={cls}>{cell.d}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function DateRangePicker({ start, end, onChange }) {
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [picking, setPicking] = useState(null);
    const [hover, setHover] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const month2 = viewMonth === 11 ? 0 : viewMonth + 1;
    const year2 = viewMonth === 11 ? viewYear + 1 : viewYear;

    const handlePick = (dt) => {
        if (!picking || (picking && end)) {
            setPicking(dt);
            onChange(dt, null);
            return;
        }
        const [s, e] = dt < picking ? [dt, picking] : [picking, dt];
        setPicking(null);
        onChange(s, e);
        setOpen(false);
    };

    const fmt = (d) => d ? `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : "";
    const text = start ? (end ? `${fmt(start)} - ${fmt(end)}` : fmt(start)) : "";

    const NavBtn = ({ label, fn }) => (
        <button className="mp-cal-nav-btn" onClick={fn}>{label}</button>
    );

    return (
        <div className="mp-drp-wrap" ref={ref}>
            <div className={`mp-drp-trigger ${text ? "mp-drp-trigger--filled" : "mp-drp-trigger--empty"}`} onClick={() => setOpen((o) => !o)}>
                <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span className="drp-text">{text || "Select date range"}</span>
                {text && (
                    <button className="mp-drp-clear" onClick={(e) => { e.stopPropagation(); onChange(null, null); setPicking(null); }}>
                        x
                    </button>
                )}
            </div>

            {open && (
                <div className="mp-drp-popup">
                    <div className="mp-cal-col">
                        <div className="mp-cal-nav">
                            <NavBtn label="<<" fn={() => setViewYear((y) => y - 1)} />
                            <NavBtn label="<" fn={() => {
                                if (viewMonth === 0) {
                                    setViewMonth(11);
                                    setViewYear((y) => y - 1);
                                } else {
                                    setViewMonth((m) => m - 1);
                                }
                            }} />
                            <div className="mp-cal-nav-spacer" />
                        </div>
                        <CalendarGrid year={viewYear} month={viewMonth} start={picking || start} end={picking ? null : end} hover={hover} onPick={handlePick} onHover={setHover} />
                    </div>
                    <div className="mp-cal-col">
                        <div className="mp-cal-nav">
                            <div className="mp-cal-nav-spacer" />
                            <NavBtn label=">" fn={() => {
                                if (viewMonth === 11) {
                                    setViewMonth(0);
                                    setViewYear((y) => y + 1);
                                } else {
                                    setViewMonth((m) => m + 1);
                                }
                            }} />
                            <NavBtn label=">>" fn={() => setViewYear((y) => y + 1)} />
                        </div>
                        <CalendarGrid year={year2} month={month2} start={picking || start} end={picking ? null : end} hover={hover} onPick={handlePick} onHover={setHover} />
                    </div>
                </div>
            )}
        </div>
    );
}

function Select({ placeholder, options, value, onChange, minWidth = 160 }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

    return (
        <div className="mp-select-wrap" ref={ref} style={{ minWidth }}>
            <div className={`mp-select-trigger ${value ? "mp-select-trigger--value" : "mp-select-trigger--placeholder"}`} style={{ minWidth }} onClick={() => setOpen((o) => !o)}>
                <span>{selectedLabel || placeholder}</span>
                <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
            {open && (
                <div className="mp-select-menu">
                    {options.map((opt) => (
                        <div key={opt.value || "__empty"} className={`mp-select-option ${value === opt.value ? "mp-select-option--active" : ""}`} onClick={() => { onChange(opt.value); setOpen(false); }}>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ value, onChange, disabled = false }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const key = (value || "paid").toLowerCase();

    return (
        <div className="mp-status-wrap" ref={ref}>
            <div
                className={`mp-status-badge mp-status-badge--${key}`}
                onClick={() => !disabled && setOpen((o) => !o)}
                style={disabled ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
            >
                <span>{value}</span>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
            {open && !disabled && (
                <div className="mp-status-menu">
                    {STATUS_OPTIONS.map((opt) => (
                        <div key={opt} className={`mp-status-option mp-status-option--${opt.toLowerCase()} ${value === opt ? "active" : ""}`} onClick={() => { onChange(opt); setOpen(false); }}>
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PageBtn({ label, onClick, active, disabled }) {
    return (
        <button onClick={onClick} disabled={disabled} className={`mp-page-btn ${active ? "mp-page-btn--active" : ""}`}>
            {label}
        </button>
    );
}

function PaymentRow({ payment, expandedId, setExpandedId, checkedIds, toggleOne, hoverRow, setHoverRow, savingStatusId, onStatusChange }) {
    return (
        <>
            <tr
                className={[
                    "mp-tr",
                    checkedIds.includes(payment.id) ? "mp-tr--checked" : "",
                    hoverRow === payment.id && !checkedIds.includes(payment.id) ? "mp-tr--hovered" : "",
                ].filter(Boolean).join(" ")}
                onMouseEnter={() => setHoverRow(payment.id)}
                onMouseLeave={() => setHoverRow(null)}
            >
                <td className="mp-td-expand">
                    <button className="mp-expand-btn" onClick={() => setExpandedId(expandedId === payment.id ? null : payment.id)}>
                        {expandedId === payment.id ? "-" : "+"}
                    </button>
                </td>
                <td className="mp-td-check">
                    <input type="checkbox" className="mp-checkbox" checked={checkedIds.includes(payment.id)} onChange={() => toggleOne(payment.id)} />
                </td>
                <td className="mp-td">{formatTimestamp(payment.date)}</td>
                <td className="mp-td">{payment.customer}</td>
                <td className="mp-td">{payment.service}</td>
                <td className="mp-td">{payment.method}</td>
                <td className="mp-td-status">
                    <StatusBadge value={payment.status} onChange={(status) => onStatusChange(payment.id, status)} disabled={savingStatusId === payment.id} />
                </td>
                <td className="mp-td mp-td--amount">{fmtAmt(payment.amount, payment.currency)}</td>
                <td className="mp-td">{formatBookingDate(payment.appointmentOn)}</td>
            </tr>

            {expandedId === payment.id && (
                <tr className="mp-tr-expanded">
                    <td colSpan={9}>
                        <div className="mp-expanded-inner">
                            {[
                                ["Transaction ID", payment.transactionId],
                                ["Customer", payment.customer],
                                ["Service", payment.service],
                                ["Payment Method", payment.method],
                                ["Amount", fmtAmt(payment.amount, payment.currency)],
                                ["Status", payment.status],
                                ["Transaction Date", formatTimestamp(payment.date)],
                                ["Appointment On", formatBookingDate(payment.appointmentOn)],
                            ].map(([label, value]) => (
                                <div key={label}><span className="mp-expanded-key">{label}:</span> {value}</div>
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default function ManagePayments() {

    const Navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("adminToken")

        if (!token) {
            Navigate("/admin-login")
        } else {
            Navigate("/admin-dashboard/payments")
        }
    }, [])

    const dispatch = useDispatch();
    const { data: rawPayments, loading, error, updateError } = useSelector((state) => state.payments);
    const services = useSelector((state) => state.services.list);
    const servicesLoading = useSelector((state) => state.services.loading);

    const payments = useMemo(() => (
        Array.isArray(rawPayments) ? rawPayments.map(normalizePayment) : []
    ), [rawPayments]);

    const serviceOptions = useMemo(() => {
        const base = [{ label: "Select Service", value: "" }];
        const items = Array.isArray(services)
            ? services
                .filter((service) => service?._id)
                .map((service) => ({
                    label: service.serviceName || "Unnamed Service",
                    value: service._id,
                }))
            : [];
        return [...base, ...items];
    }, [services]);

    const statusOptions = useMemo(() => (
        [{ label: "Select Status", value: "" }, ...STATUS_OPTIONS.map((status) => ({ label: status, value: status }))]
    ), []);

    const [dateStart, setDateStart] = useState(null);
    const [dateEnd, setDateEnd] = useState(null);
    const [custSearch, setCustSearch] = useState("");
    const [service, setService] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [checkedIds, setCheckedIds] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [hoverRow, setHoverRow] = useState(null);
    const [savingStatusId, setSavingStatusId] = useState(null);

    useEffect(() => {
        dispatch(fetchPayments());
    }, [dispatch]);

    useEffect(() => {
        if (!Array.isArray(services) || services.length === 0) {
            dispatch(fetchServices());
        }
    }, [dispatch, services]);

    const handleDateChange = (start, end) => {
        setDateStart(start);
        setDateEnd(end);
    };

    const buildFilters = () => {
        const params = {};
        if (dateStart) params.startDate = toDateOnlyString(dateStart);
        if (dateEnd) params.endDate = toDateOnlyString(dateEnd);
        if (custSearch.trim()) params.q = custSearch.trim();
        if (service) params.serviceId = service;
        if (filterStatus) params.status = toApiPaymentStatus(filterStatus);
        return params;
    };

    const handleApply = () => {
        setPage(1);
        dispatch(fetchPayments(buildFilters()));
    };

    const handleReset = () => {
        setDateStart(null);
        setDateEnd(null);
        setCustSearch("");
        setService("");
        setFilterStatus("");
        setPage(1);
        setCheckedIds([]);
        setExpandedId(null);
        dispatch(fetchPayments());
    };

    const total = payments.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(page, totalPages);
    const pageData = payments.slice((currentPage - 1) * perPage, currentPage * perPage);

    useEffect(() => {
        if (page !== currentPage) setPage(currentPage);
    }, [page, currentPage]);

    const allOnPageChecked = pageData.length > 0 && pageData.every((payment) => checkedIds.includes(payment.id));

    const toggleAll = () => {
        if (allOnPageChecked) {
            setCheckedIds((ids) => ids.filter((id) => !pageData.find((payment) => payment.id === id)));
            return;
        }
        setCheckedIds((ids) => [...new Set([...ids, ...pageData.map((payment) => payment.id)])]);
    };

    const toggleOne = (id) => {
        setCheckedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    };

    const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);

    const handleStatusChange = async (id, status) => {
        setSavingStatusId(id);
        try {
            await dispatch(updatePaymentStatus({ id, status: toApiPaymentStatus(status) })).unwrap();
        } finally {
            setSavingStatusId(null);
        }
    };

    const handleExport = () => {
        downloadCsv(
            "payments.csv",
            payments.map((payment) => ({
                transactionDate: payment.date,
                customer: payment.customer,
                service: payment.service,
                method: payment.method,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                appointmentOn: payment.appointmentOn,
                transactionId: payment.transactionId,
            }))
        );
    };

    if (loading && payments.length === 0) {
        return (
            <div className="mp-page">
                <div className="mp-card">
                    <div className="mp-card-inner">Loading payments...</div>
                </div>
            </div>
        );
    }

    if (error && payments.length === 0) {
        return (
            <div className="mp-page">
                <div className="mp-card">
                    <div className="mp-card-inner">
                        <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>
                        <button className="mp-btn mp-btn-apply" onClick={() => dispatch(fetchPayments())}>Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mp-page">
            <div className="mp-card">
                <div className="mp-card-inner">
                    <h2 className="mp-title">Manage Payments</h2>

                    <div className="mp-filters">
                        <div className="mp-filter-group">
                            <span className="mp-filter-label">Transaction Date</span>
                            <DateRangePicker start={dateStart} end={dateEnd} onChange={handleDateChange} />
                        </div>

                        <div className="mp-filter-group">
                            <span className="mp-filter-label">Customer Name</span>
                            <input className="mp-input" value={custSearch} onChange={(e) => setCustSearch(e.target.value)} placeholder="Search customer" />
                        </div>

                        <div className="mp-filter-group">
                            <span className="mp-filter-label">Service</span>
                            <Select placeholder={servicesLoading ? "Loading services..." : "Select Service"} options={serviceOptions} value={service} onChange={setService} minWidth={190} />
                        </div>

                        <div className="mp-filter-group">
                            <span className="mp-filter-label">Payment Status</span>
                            <Select placeholder="Select Status" options={statusOptions} value={filterStatus} onChange={setFilterStatus} minWidth={160} />
                        </div>

                        <div className="mp-filter-buttons">
                            <button className="mp-btn mp-btn-reset" onClick={handleReset}>Reset</button>
                            <button className="mp-btn mp-btn-apply" onClick={handleApply}>Apply</button>
                            <button className="mp-btn mp-btn-export" type="button" onClick={handleExport}>
                                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5M12 3v12" />
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>

                    {updateError && <div style={{ color: "#ef4444", marginTop: 12 }}>{updateError}</div>}
                </div>

                <div className="mp-table-wrap">
                    <table className="mp-table">
                        <thead>
                            <tr>
                                <th className="mp-th-expand"></th>
                                <th className="mp-th-check">
                                    <input type="checkbox" className="mp-checkbox" checked={allOnPageChecked} onChange={toggleAll} />
                                </th>
                                {[["Date", true], ["Customer", true], ["Service", true], ["Method", false], ["Status", false], ["Amount", false], ["Appointment On", true]].map(([col, sortable]) => (
                                    <th key={col} className="mp-th">
                                        {col}
                                        {sortable && <span className="mp-th-sort-icon">^v</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="mp-td" style={{ textAlign: "center", padding: "36px", color: "#94a3b8" }}>
                                        No payments found
                                    </td>
                                </tr>
                            ) : pageData.map((payment) => (
                                <PaymentRow
                                    key={payment.id}
                                    payment={payment}
                                    expandedId={expandedId}
                                    setExpandedId={setExpandedId}
                                    checkedIds={checkedIds}
                                    toggleOne={toggleOne}
                                    hoverRow={hoverRow}
                                    setHoverRow={setHoverRow}
                                    savingStatusId={savingStatusId}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mp-pagination">
                    <div className="mp-pagination-left">
                        <span>Showing <strong>{pageData.length}</strong> out of <strong>{total}</strong></span>
                        <div className="mp-per-page">
                            <span>Per Page</span>
                            <div className="mp-per-page-select-wrap">
                                <select className="mp-per-page-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                                    {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <span className="mp-per-page-arrow">v</span>
                            </div>
                        </div>
                    </div>

                    <div className="mp-pagination-right">
                        <PageBtn label="<" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} />
                        {pageNums.map((n) => (
                            <PageBtn key={n} label={String(n)} onClick={() => setPage(n)} active={currentPage === n} />
                        ))}
                        <PageBtn label=">" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                    </div>
                </div>
            </div>
        </div>
    );
}
