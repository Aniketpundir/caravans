import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setDateRange, fetchDashboardData, fetchChartsData } from "../../../store/slices/dashboardSlice.js";
import "./DateRangePicker.css";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function startOfDay(d) {
    const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}
function endOfDay(d) {
    const x = new Date(d); x.setHours(23, 59, 59, 999); return x;
}
function sameDay(a, b) {
    return a && b && a.toDateString() === b.toDateString();
}
function isBetween(d, a, b) {
    if (!a || !b) return false;
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    return d > lo && d < hi;
}
function formatLabel(d) {
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year, month) {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
}

// ─── SHORTCUT PRESETS ────────────────────────────────────────────────────────
function getPreset(label) {
    const today = startOfDay(new Date());
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const dow = today.getDay();
    const mondayOffset = (dow + 6) % 7;

    switch (label) {
        case "Today":
            return { from: startOfDay(today), to: endOfDay(today) };
        case "Yesterday":
            return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
        case "Tomorrow": {
            const tom = new Date(today); tom.setDate(today.getDate() + 1);
            return { from: startOfDay(tom), to: endOfDay(tom) };
        }
        case "This week": {
            const mon = new Date(today); mon.setDate(today.getDate() - mondayOffset);
            const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
            return { from: startOfDay(mon), to: endOfDay(sun) };
        }
        case "Last week": {
            const mon = new Date(today); mon.setDate(today.getDate() - mondayOffset - 7);
            const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
            return { from: startOfDay(mon), to: endOfDay(sun) };
        }
        case "This month": {
            const from = new Date(today.getFullYear(), today.getMonth(), 1);
            const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return { from: startOfDay(from), to: endOfDay(to) };
        }
        case "Last month": {
            const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const to = new Date(today.getFullYear(), today.getMonth(), 0);
            return { from: startOfDay(from), to: endOfDay(to) };
        }
        case "This year": {
            const from = new Date(today.getFullYear(), 0, 1);
            const to = new Date(today.getFullYear(), 11, 31);
            return { from: startOfDay(from), to: endOfDay(to) };
        }
        default: return null;
    }
}

const SHORTCUTS = ["Today", "Yesterday", "Tomorrow", "This week", "Last week", "This month", "Last month", "This year"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

// ─── SINGLE CALENDAR MONTH ───────────────────────────────────────────────────
function CalendarMonth({ year, month, from, to, hoverDate, onDayClick, onDayHover }) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDow = getFirstDayOfWeek(year, month);
    const today = startOfDay(new Date());

    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const rangeEnd = to || hoverDate;

    return (
        <div className="drp__month">
            <div className="drp__weekdays">
                {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
            </div>
            <div className="drp__days">
                {cells.map((day, idx) => {
                    if (!day) return <span key={`e-${idx}`} className="drp__day drp__day--empty" />;
                    const d = startOfDay(new Date(year, month, day));
                    const isFrom = sameDay(d, from);
                    const isTo = sameDay(d, to);
                    const isToday = sameDay(d, today);
                    const inRange = from && rangeEnd && isBetween(d, from, rangeEnd);
                    const isHover = sameDay(d, hoverDate) && !to;

                    let cls = "drp__day";
                    if (isFrom || isTo) cls += " drp__day--selected";
                    if (inRange) cls += " drp__day--in-range";
                    if (isToday && !isFrom && !isTo) cls += " drp__day--today";
                    if (isHover) cls += " drp__day--hover";

                    return (
                        <span
                            key={day}
                            className={cls}
                            onClick={() => onDayClick(d)}
                            onMouseEnter={() => onDayHover(d)}
                        >
                            {day}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

// ─── DATE RANGE PICKER ───────────────────────────────────────────────────────
export default function DateRangePicker({ from, to, onChange }) {
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);
    const [tempFrom, setTempFrom] = useState(from || null);
    const [tempTo, setTempTo] = useState(to || null);
    const [hoverDate, setHoverDate] = useState(null);
    const [activeShortcut, setActiveShortcut] = useState(null);

    const today = new Date();
    const [leftYear, setLeftYear] = useState(today.getFullYear());
    const [leftMonth, setLeftMonth] = useState(today.getMonth());

    const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
    const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;

    const wrapperRef = useRef(null);

    useEffect(() => {
        function handler(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (open) { setTempFrom(from || null); setTempTo(to || null); }
    }, [open]);

    function handleDayClick(d) {
        if (!tempFrom || (tempFrom && tempTo)) {
            setTempFrom(d); setTempTo(null); setActiveShortcut(null);
        } else {
            const [a, b] = d >= tempFrom ? [tempFrom, d] : [d, tempFrom];
            setTempFrom(a); setTempTo(b);
            setActiveShortcut(null);
        }
    }

    function handleShortcut(label) {
        const preset = getPreset(label);
        if (!preset) return;
        setTempFrom(preset.from);
        setTempTo(preset.to);
        setActiveShortcut(label);
        setLeftYear(preset.from.getFullYear());
        setLeftMonth(preset.from.getMonth());
    }

    function handleApply() {
        if (tempFrom && tempTo) {
            const fromISO = tempFrom.toISOString();
            const toISO = tempTo.toISOString();

            // Redux mein date range set karo
            dispatch(setDateRange({ from: fromISO, to: toISO }));

            dispatch(fetchDashboardData({ from: fromISO, to: toISO }));
            dispatch(fetchChartsData({ from: fromISO, to: toISO }));

            onChange({ from: tempFrom, to: tempTo });
            setOpen(false);
        }
    }

    function prevMonth() {
        if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); }
        else setLeftMonth(m => m - 1);
    }
    function nextMonth() {
        if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); }
        else setLeftMonth(m => m + 1);
    }
    function prevYear() { setLeftYear(y => y - 1); }
    function nextYear() { setLeftYear(y => y + 1); }

    const labelFrom = from ? formatLabel(from) : "Start Date";
    const labelTo = to ? formatLabel(to) : "End Date";

    return (
        <div className="drp__wrapper" ref={wrapperRef}>
            <button className="drp__trigger" onClick={() => setOpen(v => !v)}>
                <svg viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{labelFrom}</span>
                <span className="drp__dash">–</span>
                <span>{labelTo}</span>
            </button>

            {open && (
                <div className="drp__dropdown">
                    <div className="drp__shortcuts">
                        {SHORTCUTS.map(s => (
                            <div
                                key={s}
                                className={`drp__shortcut${activeShortcut === s ? " drp__shortcut--active" : ""}`}
                                onClick={() => handleShortcut(s)}
                            >
                                {s}
                            </div>
                        ))}
                    </div>

                    <div className="drp__calendars">
                        <div className="drp__cal-nav">
                            <div className="drp__cal-header">
                                <button className="drp__nav-btn" onClick={prevYear} title="Prev year">«</button>
                                <button className="drp__nav-btn" onClick={prevMonth} title="Prev month">‹</button>
                                <span className="drp__cal-title">{leftYear} {MONTHS[leftMonth]}</span>
                            </div>
                            <div className="drp__cal-header">
                                <span className="drp__cal-title">{rightYear} {MONTHS[rightMonth]}</span>
                                <button className="drp__nav-btn" onClick={nextMonth} title="Next month">›</button>
                                <button className="drp__nav-btn" onClick={nextYear} title="Next year">»</button>
                            </div>
                        </div>

                        <div className="drp__cal-body">
                            <CalendarMonth
                                year={leftYear} month={leftMonth}
                                from={tempFrom} to={tempTo}
                                hoverDate={hoverDate}
                                onDayClick={handleDayClick}
                                onDayHover={setHoverDate}
                            />
                            <div className="drp__cal-divider" />
                            <CalendarMonth
                                year={rightYear} month={rightMonth}
                                from={tempFrom} to={tempTo}
                                hoverDate={hoverDate}
                                onDayClick={handleDayClick}
                                onDayHover={setHoverDate}
                            />
                        </div>

                        <div className="drp__footer">
                            <button
                                className="drp__apply-btn"
                                onClick={handleApply}
                                disabled={!tempFrom || !tempTo}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
