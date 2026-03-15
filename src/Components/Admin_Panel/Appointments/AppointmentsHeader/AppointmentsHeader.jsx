import { useState, useRef, useEffect } from "react";
import "./AppointmentsHeader.css";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildCells(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    const cells = [];
    for (let i = startDow - 1; i >= 0; i--)
        cells.push({ date: new Date(year, month, -i), overflow: true });
    for (let d = 1; d <= lastDay.getDate(); d++)
        cells.push({ date: new Date(year, month, d), overflow: false });
    let fill = 1;
    while (cells.length % 7 !== 0)
        cells.push({ date: new Date(year, month + 1, fill++), overflow: true });
    return cells;
}

function isSameDay(a, b) {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}
function isBetween(d, s, e) {
    if (!s || !e) return false;
    return d.getTime() > s.getTime() && d.getTime() < e.getTime();
}
function isToday(d) { return isSameDay(d, new Date()); }
function isWeekend(d) { const day = d.getDay(); return day === 0 || day === 6; }
function fmtDate(d) {
    if (!d) return "";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function MonthPanel({ year, month, startDate, endDate, hoverDate, onDayClick, onDayHover }) {
    const cells = buildCells(year, month);
    const rangeEnd = endDate || hoverDate;
    return (
        <div className="drp-month">
            <div className="drp-grid">
                {DOW.map((d) => <div key={d} className="drp-dow">{d}</div>)}
                {cells.map((cell, i) => {
                    const { date, overflow } = cell;
                    const isStart = isSameDay(date, startDate);
                    const isEnd = isSameDay(date, endDate);
                    const isHEnd = !endDate && isSameDay(date, hoverDate);
                    const inRange = startDate && rangeEnd && !isStart &&
                        !isSameDay(date, rangeEnd) && isBetween(date, startDate, rangeEnd);
                    const isHRange = !endDate && startDate && hoverDate &&
                        isBetween(date, startDate, hoverDate);
                    let cls = "drp-day";
                    if (overflow) cls += " other-month";
                    if (isToday(date)) cls += " today";
                    if (isWeekend(date)) cls += " weekend";
                    if (isStart) cls += " range-start";
                    if (isEnd || isHEnd) cls += " range-end";
                    if (inRange || isHRange) cls += " in-range";
                    return (
                        <div key={i} className={cls}
                            onClick={() => !overflow && onDayClick(date)}
                            onMouseEnter={() => !overflow && onDayHover(date)}>
                            <span className="drp-day-num">{date.getDate()}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function DateRangePicker({ value, onChange }) {
    const today = new Date();
    const [open, setOpen] = useState(false);
    const [leftYear, setLY] = useState(value?.start?.getFullYear() ?? today.getFullYear());
    const [leftMonth, setLM] = useState(value?.start?.getMonth() ?? today.getMonth());
    const [startDate, setStart] = useState(value?.start ?? null);
    const [endDate, setEnd] = useState(value?.end ?? null);
    const [hoverDate, setHover] = useState(null);
    const [selecting, setSel] = useState(false);
    const wrapRef = useRef(null);
    const rightMonth = (leftMonth + 1) % 12;
    const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

    useEffect(() => {
        function handler(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    function handleDayClick(date) {
        if (!selecting || !startDate) {
            setStart(date); setEnd(null); setSel(true);
        } else {
            const s = date < startDate ? date : startDate;
            const e = date < startDate ? startDate : date;
            setStart(s); setEnd(e); setSel(false); setHover(null);
            onChange && onChange({ start: s, end: e });
            setOpen(false);
        }
    }

    function label() {
        if (startDate && endDate) return `${fmtDate(startDate)}  –  ${fmtDate(endDate)}`;
        if (startDate) return `${fmtDate(startDate)}  –  ...`;
        return "Select date range";
    }

    return (
        <div className="drp-wrapper" ref={wrapRef}>
            <div className={`drp-trigger${open ? " open" : ""}`} onClick={() => setOpen(v => !v)}>
                <span className="drp-trigger-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </span>
                <span className="drp-trigger-text">{label()}</span>
            </div>
            {open && (
                <div className="drp-popover">
                    <div className="drp-panel">
                        <div className="drp-month-header">
                            <div className="drp-nav-group">
                                <button className="drp-nav-btn" onClick={() => setLY(y => y - 1)}>«</button>
                                <button className="drp-nav-btn" onClick={() => {
                                    if (leftMonth === 0) { setLY(y => y - 1); setLM(11); } else setLM(m => m - 1);
                                }}>‹</button>
                            </div>
                            <span className="drp-month-title">{leftYear} {MONTH_NAMES[leftMonth]}</span>
                            <div style={{ width: 58 }} />
                        </div>
                        <MonthPanel year={leftYear} month={leftMonth}
                            startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                            onDayClick={handleDayClick} onDayHover={(d) => { if (selecting) setHover(d); }} />
                    </div>
                    <div className="drp-divider" />
                    <div className="drp-panel">
                        <div className="drp-month-header">
                            <div style={{ width: 58 }} />
                            <span className="drp-month-title">{rightYear} {MONTH_NAMES[rightMonth]}</span>
                            <div className="drp-nav-group">
                                <button className="drp-nav-btn" onClick={() => {
                                    if (leftMonth === 11) { setLY(y => y + 1); setLM(0); } else setLM(m => m + 1);
                                }}>›</button>
                                <button className="drp-nav-btn" onClick={() => setLY(y => y + 1)}>»</button>
                            </div>
                        </div>
                        <MonthPanel year={rightYear} month={rightMonth}
                            startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                            onDayClick={handleDayClick} onDayHover={(d) => { if (selecting) setHover(d); }} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Match highlight ───────────────────────────────────────────────────────────
function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <strong className="suggestion-highlight">{text.slice(idx, idx + query.length)}</strong>
            {text.slice(idx + query.length)}
        </>
    );
}

const STATUS_OPTIONS = ["Approved", "Pending", "Cancelled", "Rejected", "No-Show", "Completed"];

export default function AppointmentsHeader({
    filters,
    onFilterChange,
    onReset,
    onApply,
    onExport,
    onAddNew,
    onShareUrl,
    customerSuggestions = [],
    serviceOptions = [],
}) {
    const { customerName, service, statusFilter, appointmentId, searchQuery } = filters;
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggRef = useRef(null);

    const [dateRange, setDateRange] = useState(null);

    useEffect(() => {
        function handler(e) {
            if (suggRef.current && !suggRef.current.contains(e.target))
                setShowSuggestions(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function handleDateChange(range) {
        setDateRange(range);
        onFilterChange("dateRange", range);
    }

    // Merge API services + default options, unique
    const allServiceOptions = [...new Set(serviceOptions)];

    return (
        <div>
            <div className="appointments-header">
                <h1>Manage Appointments</h1>
                <div className="header-actions">
                    <button className="btn-add-new" onClick={onAddNew}>+ Add New</button>
                    <button className="btn-share-url" onClick={onShareUrl}>↗ Share URL</button>
                </div>
            </div>

            <div className="filters-card">
                <div className="filters-row-1">
                    {/* Date Range */}
                    <div className="filter-group">
                        <label className="filter-label">Appointment Date</label>
                        <DateRangePicker value={dateRange} onChange={handleDateChange} />
                    </div>

                    {/* Customer Name + Suggestions */}
                    <div className="filter-group" ref={suggRef} style={{ position: "relative" }}>
                        <label className="filter-label">Customer Name</label>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Start typing to fetch Customer"
                            value={customerName}
                            autoComplete="off"
                            onChange={(e) => {
                                onFilterChange("customerName", e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        {showSuggestions && customerSuggestions.length > 0 && (
                            <div className="suggestions-dropdown">
                                {customerSuggestions.map((name, idx) => (
                                    <div
                                        key={idx}
                                        className="suggestion-item"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            onFilterChange("customerName", name);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        {highlightMatch(name, customerName)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Service */}
                    <div className="filter-group">
                        <label className="filter-label">Service</label>
                        <select className="filter-select" value={service}
                            onChange={(e) => onFilterChange("service", e.target.value)}>
                            <option value="">Select Service</option>
                            {allServiceOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="filter-group">
                        <label className="filter-label">Status</label>
                        <select className="filter-select" value={statusFilter}
                            onChange={(e) => onFilterChange("statusFilter", e.target.value)}>
                            <option value="">Select Status</option>
                            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="filters-row-2">
                    <input
                        type="text" className="filter-input"
                        placeholder="Appointment ID"
                        value={appointmentId}
                        onChange={(e) => onFilterChange("appointmentId", e.target.value)}
                    />
                    <input
                        type="text" className="search-full"
                        placeholder="Search for Customers, Services..."
                        value={searchQuery}
                        onChange={(e) => onFilterChange("searchQuery", e.target.value)}
                    />
                    <button className="btn-reset" onClick={onReset}>Reset</button>
                    <button className="btn-apply" onClick={onApply}>Apply</button>
                    <button className="btn-export" onClick={onExport}>✎ Export</button>
                </div>
            </div>
        </div>
    );
}