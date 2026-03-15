import { useState, useRef, useEffect } from "react";
import "./Managepayments.css";

// ─── DATA ───────────────────────────────────────────────────────────────────
const ALL_PAYMENTS = [
    { id: 1, date: "March 13, 2026", customer: "Mark Taylor", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 198.13, apptOn: "March 13, 2026" },
    { id: 2, date: "March 13, 2026", customer: "Andrew Doyle", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 138.45, apptOn: "March 13, 2026" },
    { id: 3, date: "March 13, 2026", customer: "Michael Smith", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 401.94, apptOn: "March 17, 2026" },
    { id: 4, date: "March 11, 2026", customer: "Gary Bond", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 140.91, apptOn: "March 11, 2026" },
    { id: 5, date: "March 9, 2026", customer: "Megan McGuinness", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 161.04, apptOn: "March 9, 2026" },
    { id: 6, date: "March 6, 2026", customer: "Robert Uetzmann", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 161.63, apptOn: "March 6, 2026" },
    { id: 7, date: "March 4, 2026", customer: "Jamie Flanagan", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 89.32, apptOn: "March 7, 2026" },
    { id: 8, date: "March 3, 2026", customer: "Ashley Connelly", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 281.82, apptOn: "March 8, 2026" },
    { id: 9, date: "March 3, 2026", customer: "Robyne Felsch", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 201.30, apptOn: "March 3, 2026" },
    { id: 10, date: "March 2, 2026", customer: "Chris Knowles", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 535.92, apptOn: "March 2, 2026" },
    { id: 11, date: "March 1, 2026", customer: "Sean Burton", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 138.45, apptOn: "March 1, 2026" },
    { id: 12, date: "March 1, 2026", customer: "Elliot Dawkins", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 67.78, apptOn: "March 1, 2026" },
    { id: 13, date: "March 1, 2026", customer: "Nick Karas", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 161.63, apptOn: "March 3, 2026" },
    { id: 14, date: "February 26, 2026", customer: "Bradley Stevenson", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 109.49, apptOn: "February 26, 2026" },
    { id: 15, date: "February 26, 2026", customer: "Ryan Oehm", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 200.97, apptOn: "February 26, 2026" },
    { id: 16, date: "February 23, 2026", customer: "Suzanne Van Wynen", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 469.26, apptOn: "February 24, 2026" },
    { id: 17, date: "February 23, 2026", customer: "Linda Pearce", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 505.76, apptOn: "February 23, 2026" },
    { id: 18, date: "February 19, 2026", customer: "Yvonne Barrett", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 156.42, apptOn: "February 19, 2026" },
    { id: 19, date: "February 19, 2026", customer: "Tony Debellis", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 138.45, apptOn: "February 19, 2026" },
    { id: 20, date: "February 17, 2026", customer: "Trevor Clarke", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 133.98, apptOn: "February 19, 2026" },
    { id: 21, date: "February 15, 2026", customer: "Patricia Wong", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 320.00, apptOn: "February 15, 2026" },
    { id: 22, date: "February 14, 2026", customer: "David Kim", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 89.99, apptOn: "February 14, 2026" },
    { id: 23, date: "February 12, 2026", customer: "Helen Marsh", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 215.50, apptOn: "February 12, 2026" },
    { id: 24, date: "February 10, 2026", customer: "George Patel", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 138.45, apptOn: "February 10, 2026" },
    { id: 25, date: "February 8, 2026", customer: "Sandra Moore", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 444.20, apptOn: "February 8, 2026" },
    { id: 26, date: "February 6, 2026", customer: "James Nguyen", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 178.90, apptOn: "February 6, 2026" },
    { id: 27, date: "February 5, 2026", customer: "Karen Liu", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 99.00, apptOn: "February 5, 2026" },
    { id: 28, date: "February 3, 2026", customer: "Tom Richards", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 310.75, apptOn: "February 3, 2026" },
    { id: 29, date: "February 1, 2026", customer: "Amy Chen", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 195.00, apptOn: "February 1, 2026" },
    { id: 30, date: "January 30, 2026", customer: "Brian Foster", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 138.45, apptOn: "January 30, 2026" },
    { id: 31, date: "January 28, 2026", customer: "Diane Walsh", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 500.00, apptOn: "January 28, 2026" },
    { id: 32, date: "January 27, 2026", customer: "Peter Simmons", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 220.30, apptOn: "January 27, 2026" },
    { id: 33, date: "January 25, 2026", customer: "Ruth Cooper", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 89.32, apptOn: "January 25, 2026" },
    { id: 34, date: "January 23, 2026", customer: "Mark Spencer", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 375.60, apptOn: "January 23, 2026" },
    { id: 35, date: "January 22, 2026", customer: "Julie Adams", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 161.63, apptOn: "January 22, 2026" },
    { id: 36, date: "January 20, 2026", customer: "Colin Burke", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 138.45, apptOn: "January 20, 2026" },
    { id: 37, date: "January 18, 2026", customer: "Fiona Scott", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 289.00, apptOn: "January 18, 2026" },
    { id: 38, date: "January 16, 2026", customer: "Henry Grant", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 198.13, apptOn: "January 16, 2026" },
    { id: 39, date: "January 14, 2026", customer: "Irene Blake", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 67.78, apptOn: "January 14, 2026" },
    { id: 40, date: "January 13, 2026", customer: "Jack Turner", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 412.50, apptOn: "January 13, 2026" },
    { id: 41, date: "January 11, 2026", customer: "Laura Evans", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 161.63, apptOn: "January 11, 2026" },
    { id: 42, date: "January 9, 2026", customer: "Martin Bell", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 138.45, apptOn: "January 9, 2026" },
    { id: 43, date: "January 7, 2026", customer: "Nancy Wright", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 340.00, apptOn: "January 7, 2026" },
    { id: 44, date: "January 5, 2026", customer: "Oscar Hayes", service: "Medium Lot - 7mx3m", method: "Credit Card", status: "Paid", amount: 178.90, apptOn: "January 5, 2026" },
    { id: 45, date: "January 3, 2026", customer: "Paula King", service: "Small Lot - 6mx3m", method: "Credit Card", status: "Paid", amount: 89.32, apptOn: "January 3, 2026" },
    { id: 46, date: "January 1, 2026", customer: "Quincy Ross", service: "Large Lot - 9mx3m", method: "Credit Card", status: "Paid", amount: 560.00, apptOn: "January 1, 2026" },
];

const SERVICES = ["Small Lot - 6mx3m", "Medium Lot - 7mx3m", "Large Lot - 9mx3m"];
const STATUS_OPTIONS = ["Paid", "Pending", "Failed"];
const PER_PAGE_OPTIONS = [10, 20, 50];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const fmtAmt = (n) => `$${n.toFixed(2)}`;

// ─── CALENDAR GRID ───────────────────────────────────────────────────────────
function CalendarGrid({ year, month, start, end, hover, onPick, onHover }) {
    const firstDow = new Date(year, month, 1).getDay();
    const offset = firstDow === 0 ? 6 : firstDow - 1;
    const daysInPrev = new Date(year, month, 0).getDate();
    const daysInCur = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++)
        cells.push({ d: daysInPrev - offset + 1 + i, cur: false });
    for (let i = 1; i <= daysInCur; i++)
        cells.push({ d: i, cur: true });
    while (cells.length < 42)
        cells.push({ d: cells.length - offset - daysInCur + 1, cur: false });

    const today = new Date(2026, 2, 13);

    return (
        <div>
            <div className="mp-cal-header">{year} {MONTHS_FULL[month]}</div>
            <div className="mp-cal-grid">
                {DAYS_SHORT.map(d => (
                    <div key={d} className="mp-cal-day-label">{d}</div>
                ))}
                {cells.map((cell, i) => {
                    if (!cell.cur) return (
                        <div key={i} className="mp-cal-cell mp-cal-cell--inactive">
                            <span className="mp-cal-cell-inner mp-cal-cell-inner--inactive">{cell.d}</span>
                        </div>
                    );
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
                        <div key={i} className="mp-cal-cell"
                            onMouseEnter={() => onHover(dt)}
                            onClick={() => onPick(dt)}>
                            <span className={cls}>{cell.d}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── DATE RANGE PICKER ───────────────────────────────────────────────────────
function DateRangePicker({ start, end, onChange }) {
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(2026);
    const [viewMonth, setViewMonth] = useState(0);
    const [picking, setPicking] = useState(null);
    const [hover, setHover] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const month2 = viewMonth === 11 ? 0 : viewMonth + 1;
    const year2 = viewMonth === 11 ? viewYear + 1 : viewYear;

    const handlePick = (dt) => {
        if (!picking || (picking && end)) { setPicking(dt); onChange(dt, null); }
        else {
            const [s, e] = dt < picking ? [dt, picking] : [picking, dt];
            setPicking(null); onChange(s, e); setOpen(false);
        }
    };

    const fmt = (d) => d ? `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : "";
    const text = start ? (end ? `${fmt(start)} - ${fmt(end)}` : fmt(start)) : "";

    const NavBtn = ({ label, fn }) => (
        <button className="mp-cal-nav-btn" onClick={fn}>{label}</button>
    );

    return (
        <div className="mp-drp-wrap" ref={ref}>
            <div className={`mp-drp-trigger ${text ? "mp-drp-trigger--filled" : "mp-drp-trigger--empty"}`}
                onClick={() => setOpen(o => !o)}>
                <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span className="drp-text">{text || "Select date range"}</span>
                {text && (
                    <button className="mp-drp-clear"
                        onClick={(e) => { e.stopPropagation(); onChange(null, null); setPicking(null); }}>
                        ×
                    </button>
                )}
            </div>

            {open && (
                <div className="mp-drp-popup">
                    <div className="mp-cal-col">
                        <div className="mp-cal-nav">
                            <NavBtn label="«" fn={() => setViewYear(y => y - 1)} />
                            <NavBtn label="‹" fn={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }} />
                            <div className="mp-cal-nav-spacer" />
                        </div>
                        <CalendarGrid year={viewYear} month={viewMonth}
                            start={picking || start} end={picking ? null : end}
                            hover={hover} onPick={handlePick} onHover={setHover} />
                    </div>
                    <div className="mp-cal-col">
                        <div className="mp-cal-nav">
                            <div className="mp-cal-nav-spacer" />
                            <NavBtn label="›" fn={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }} />
                            <NavBtn label="»" fn={() => setViewYear(y => y + 1)} />
                        </div>
                        <CalendarGrid year={year2} month={month2}
                            start={picking || start} end={picking ? null : end}
                            hover={hover} onPick={handlePick} onHover={setHover} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── GENERIC SELECT ──────────────────────────────────────────────────────────
function Select({ placeholder, options, value, onChange, minWidth = 160 }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    return (
        <div className="mp-select-wrap" ref={ref} style={{ minWidth }}>
            <div className={`mp-select-trigger ${value ? "mp-select-trigger--value" : "mp-select-trigger--placeholder"}`}
                style={{ minWidth }} onClick={() => setOpen(o => !o)}>
                <span>{value || placeholder}</span>
                <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
            {open && (
                <div className="mp-select-menu">
                    {options.map(opt => (
                        <div key={opt} className={`mp-select-option ${value === opt ? "mp-select-option--active" : ""}`}
                            onClick={() => { onChange(opt); setOpen(false); }}>
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const k = (value || "paid").toLowerCase();
    return (
        <div className="mp-status-wrap" ref={ref}>
            <div className={`mp-status-badge mp-status-badge--${k}`} onClick={() => setOpen(o => !o)}>
                <span>{value}</span>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
            {open && (
                <div className="mp-status-menu">
                    {STATUS_OPTIONS.map(opt => (
                        <div key={opt}
                            className={`mp-status-option mp-status-option--${opt.toLowerCase()} ${value === opt ? "active" : ""}`}
                            onClick={() => { onChange(opt); setOpen(false); }}>
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── PAGE BUTTON ─────────────────────────────────────────────────────────────
function PageBtn({ label, onClick, active, disabled }) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={`mp-page-btn ${active ? "mp-page-btn--active" : ""}`}>
            {label}
        </button>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ManagePayments() {
    const [dateStart, setDateStart] = useState(new Date(2026, 0, 13));
    const [dateEnd, setDateEnd] = useState(new Date(2026, 2, 13));
    const [custSearch, setCustSearch] = useState("");
    const [service, setService] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [checkedIds, setCheckedIds] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [rowStatuses, setRowStatuses] = useState(
        Object.fromEntries(ALL_PAYMENTS.map(p => [p.id, p.status]))
    );
    const [hoverRow, setHoverRow] = useState(null);

    const handleDateChange = (s, e) => { setDateStart(s); setDateEnd(e); };
    const handleApply = () => setPage(1);
    const handleReset = () => {
        setDateStart(null); setDateEnd(null);
        setCustSearch(""); setService(""); setFilterStatus(""); setPage(1);
    };

    const total = ALL_PAYMENTS.length;
    const totalPages = Math.ceil(total / perPage);
    const pageData = ALL_PAYMENTS.slice((page - 1) * perPage, page * perPage);

    const allOnPageChecked = pageData.length > 0 && pageData.every(p => checkedIds.includes(p.id));
    const toggleAll = () => {
        if (allOnPageChecked) setCheckedIds(ids => ids.filter(id => !pageData.find(p => p.id === id)));
        else setCheckedIds(ids => [...new Set([...ids, ...pageData.map(p => p.id)])]);
    };
    const toggleOne = (id) =>
        setCheckedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

    const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="mp-page">
            <div className="mp-card">

                {/* ── HEADER + FILTERS */}
                <div className="mp-card-inner">
                    <h2 className="mp-title">Manage Payments</h2>

                    <div className="mp-filters">
                        <div className="mp-filter-group">
                            <span className="mp-filter-label">Transaction Date</span>
                            <DateRangePicker start={dateStart} end={dateEnd} onChange={handleDateChange} />
                        </div>

                        <div className="mp-filter-group">
                            <span className="mp-filter-label">Customer Name</span>
                            <input className="mp-input" value={custSearch}
                                onChange={e => setCustSearch(e.target.value)}
                                placeholder="Start typing to fetch Cu..." />
                        </div>

                        <div className="mp-filter-group">
                            <span className="mp-filter-label">Service</span>
                            <Select placeholder="Select Service" options={SERVICES} value={service} onChange={setService} minWidth={190} />
                        </div>

                        <div className="mp-filter-group">
                            <span className="mp-filter-label">Payment Status</span>
                            <Select placeholder="Select Status" options={STATUS_OPTIONS} value={filterStatus} onChange={setFilterStatus} minWidth={160} />
                        </div>

                        <div className="mp-filter-buttons">
                            <button className="mp-btn mp-btn-reset" onClick={handleReset}>Reset</button>
                            <button className="mp-btn mp-btn-apply" onClick={handleApply}>Apply</button>
                            <button className="mp-btn mp-btn-export">
                                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 3v12" />
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── TABLE */}
                <div className="mp-table-wrap">
                    <table className="mp-table">
                        <thead>
                            <tr>
                                <th className="mp-th-expand"></th>
                                <th className="mp-th-check">
                                    <input type="checkbox" className="mp-checkbox"
                                        checked={allOnPageChecked} onChange={toggleAll} />
                                </th>
                                {[["Date", true], ["Customer", true], ["Service", true], ["Method", false],
                                ["Status", false], ["Amount", false], ["Appointment On", true]].map(([col, sort]) => (
                                    <th key={col} className="mp-th">
                                        {col}
                                        {sort && <span className="mp-th-sort-icon">↑↓</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.map(p => (
                                <>
                                    <tr key={p.id}
                                        className={[
                                            "mp-tr",
                                            checkedIds.includes(p.id) ? "mp-tr--checked" : "",
                                            hoverRow === p.id && !checkedIds.includes(p.id) ? "mp-tr--hovered" : "",
                                        ].filter(Boolean).join(" ")}
                                        onMouseEnter={() => setHoverRow(p.id)}
                                        onMouseLeave={() => setHoverRow(null)}
                                    >
                                        <td className="mp-td-expand">
                                            <button className="mp-expand-btn"
                                                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                                                {expandedId === p.id ? "−" : "+"}
                                            </button>
                                        </td>

                                        <td className="mp-td-check">
                                            <input type="checkbox" className="mp-checkbox"
                                                checked={checkedIds.includes(p.id)} onChange={() => toggleOne(p.id)} />
                                        </td>

                                        <td className="mp-td">{p.date}</td>
                                        <td className="mp-td">{p.customer}</td>
                                        <td className="mp-td">{p.service}</td>
                                        <td className="mp-td">{p.method}</td>

                                        <td className="mp-td-status">
                                            <StatusBadge value={rowStatuses[p.id]}
                                                onChange={v => setRowStatuses(prev => ({ ...prev, [p.id]: v }))} />
                                        </td>

                                        <td className="mp-td mp-td--amount">{fmtAmt(p.amount)}</td>

                                        <td className="mp-td">
                                            {hoverRow === p.id ? (
                                                <div className="mp-appt-actions">
                                                    <span>{p.apptOn}</span>
                                                    <button className="mp-action-btn">
                                                        <svg width="14" height="14" fill="none" stroke="#6b7280" strokeWidth="1.8" viewBox="0 0 24 24">
                                                            <circle cx="12" cy="12" r="3" />
                                                            <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" />
                                                        </svg>
                                                    </button>
                                                    <button className="mp-action-btn">
                                                        <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="1.8" viewBox="0 0 24 24">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : p.apptOn}
                                        </td>
                                    </tr>

                                    {expandedId === p.id && (
                                        <tr key={`exp-${p.id}`} className="mp-tr-expanded">
                                            <td colSpan={9}>
                                                <div className="mp-expanded-inner">
                                                    {[
                                                        ["Transaction ID", `TXN-${String(p.id).padStart(6, "0")}`],
                                                        ["Customer", p.customer],
                                                        ["Service", p.service],
                                                        ["Payment Method", p.method],
                                                        ["Amount", fmtAmt(p.amount)],
                                                        ["Status", rowStatuses[p.id]],
                                                    ].map(([k, v]) => (
                                                        <div key={k}><span className="mp-expanded-key">{k}:</span> {v}</div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── PAGINATION */}
                <div className="mp-pagination">
                    <div className="mp-pagination-left">
                        <span>Showing <strong>{Math.min(perPage, total - (page - 1) * perPage)}</strong> out of <strong>{total}</strong></span>
                        <div className="mp-per-page">
                            <span>Per Page</span>
                            <div className="mp-per-page-select-wrap">
                                <select className="mp-per-page-select" value={perPage}
                                    onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
                                    {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <span className="mp-per-page-arrow">▼</span>
                            </div>
                        </div>
                    </div>

                    <div className="mp-pagination-right">
                        <PageBtn label="‹" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                        {pageNums.map(n => (
                            <PageBtn key={n} label={String(n)} onClick={() => setPage(n)} active={page === n} />
                        ))}
                        <PageBtn label="›" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
                    </div>
                </div>

            </div>
        </div>
    );
}