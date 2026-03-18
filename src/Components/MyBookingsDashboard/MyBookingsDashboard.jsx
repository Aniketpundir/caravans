import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    logout, fetchProfile, updateProfile, clearUpdateSuccess,
    changePassword, clearPasswordSuccess,
    rescheduleBooking, clearReschedule,
} from "../../store/slices/authSlice";
import "./MyBookingsDashboard.css";
import { Helmet } from "react-helmet-async";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Avatar = () => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <rect width="80" height="80" rx="8" fill="#d0e8f0" />
        <circle cx="40" cy="30" r="14" fill="#8bbccf" />
        <ellipse cx="40" cy="65" rx="22" ry="14" fill="#8bbccf" />
    </svg>
);
const BookingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <rect x="7" y="14" width="3" height="3" />
    </svg>
);
const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
);
const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);
const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// ─── Calendar Helpers ─────────────────────────────────────────────────────────
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfWeek(year, month) { return (new Date(year, month, 1).getDay() + 6) % 7; }
function isSameDay(a, b) {
    return a && b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}
function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}
function formatDate(date) {
    if (!date) return "";
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function toAPIDate(date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// ─── CalendarMonth ────────────────────────────────────────────────────────────
function CalendarMonth({ year, month, rangeStart, rangeEnd, onSelect, allowedNights }) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDow = getFirstDayOfWeek(year, month);
    const prevDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validEnd = rangeStart && !rangeEnd && allowedNights
        ? addDays(rangeStart, allowedNights - 1) : null;

    const cells = [];
    for (let i = 0; i < firstDow; i++)
        cells.push({ day: prevDays - firstDow + i + 1, current: false });
    for (let d = 1; d <= daysInMonth; d++)
        cells.push({ day: d, current: true });
    let t = 1;
    while (cells.length % 7 !== 0) cells.push({ day: t++, current: false });

    return (
        <div className="cal-month">
            <div className="cal-month-title">{MONTH_NAMES[month]} {year}</div>
            <div className="cal-grid">
                {WEEK_DAYS.map(d => <div key={d} className="cal-dow">{d}</div>)}
                {cells.map((cell, i) => {
                    if (!cell.current)
                        return <div key={i} className="cal-day cal-day--other">{cell.day}</div>;

                    const date = new Date(year, month, cell.day);
                    const isStart = isSameDay(date, rangeStart);
                    const isEnd = rangeEnd && isSameDay(date, rangeEnd);
                    const isInRange = rangeStart && rangeEnd && date > rangeStart && date < rangeEnd;
                    const isToday = isSameDay(date, today);
                    const isPast = date < today && !isToday;
                    const isValidEnd = validEnd && isSameDay(date, validEnd);

                    let isDisabled = isPast;
                    if (rangeStart && !rangeEnd) {
                        isDisabled = isPast || (!isStart && !isValidEnd);
                    }

                    let cls = "cal-day";
                    if (isStart) cls += " cal-day--start";
                    else if (isEnd) cls += " cal-day--end";
                    else if (isInRange) cls += " cal-day--range";
                    else if (isToday) cls += " cal-day--today";
                    if (isDisabled) cls += " cal-day--disabled";
                    if (isValidEnd && !rangeEnd) cls += " cal-day--valid-end";

                    return (
                        <div key={i} className={cls}
                            onClick={() => !isDisabled && onSelect(date)}>
                            {cell.day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────
function DateRangePicker({ value, onChange, onClose, allowedNights }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [rangeStart, setRangeStart] = useState(value?.start || null);
    const [rangeEnd, setRangeEnd] = useState(value?.end || null);

    const handleSelect = (date) => {
        if (!rangeStart || (rangeStart && rangeEnd)) {
            setRangeStart(date);
            setRangeEnd(null);
        } else {
            const exactEnd = addDays(rangeStart, allowedNights - 1);
            if (isSameDay(date, exactEnd)) setRangeEnd(date);
        }
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const handleApply = () => {
        if (rangeStart && rangeEnd) {
            onChange({ start: rangeStart, end: rangeEnd }); // API call hogi
            // onClose is called by BookingCard's handleReschedule after API dispatch
        }
    };

    return (
        <div className="drp-overlay">
            <div className="drp-card">
                <div className="drp-header">
                    <div className="drp-range-display">
                        <span className="drp-range-icon">📅</span>
                        <span className={!rangeStart ? "drp-placeholder" : ""}>
                            {rangeStart ? formatDate(rangeStart) : "Start Date"}
                        </span>
                        <span className="drp-dash">–</span>
                        <span className={!rangeEnd ? "drp-placeholder" : ""}>
                            {rangeEnd ? formatDate(rangeEnd) : "End Date"}
                        </span>
                    </div>
                </div>
                <div className="drp-body">
                    <button className="drp-nav" onClick={prevMonth}>‹</button>
                    <CalendarMonth year={viewYear} month={viewMonth}
                        rangeStart={rangeStart} rangeEnd={rangeEnd}
                        onSelect={handleSelect} allowedNights={allowedNights} />
                    <div className="drp-divider" />
                    <button className="drp-nav" onClick={nextMonth}>›</button>
                </div>
                <div className="drp-footer">
                    <button className="drp-btn drp-btn--cancel" onClick={onClose}>Cancel</button>
                    <button className="drp-btn drp-btn--apply"
                        onClick={handleApply} disabled={!rangeStart || !rangeEnd}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── BookingCard ──────────────────────────────────────────────────────────────
// FIX 1: "function" keyword missing tha
function BookingCard({ booking }) {
    const dispatch = useDispatch();
    const { rescheduleLoading, rescheduleSuccess, rescheduleError } = useSelector(s => s.auth);

    const [topup, setTopup] = useState("");
    const [showCal, setShowCal] = useState(false);
    const [reschedule, setReschedule] = useState(null);

    const allowedNights = booking?.bookingDuration || booking?.minDuration || 1;
    const isCompleted = booking?.bookingStatus === "Completed";

    const statusClass = {
        Active: "badge--active",
        Upcoming: "badge--upcoming",
        Completed: "badge--completed",
    }[booking?.bookingStatus] || "";

    useEffect(() => {
        if (!rescheduleSuccess) return;
        const timer = setTimeout(() => {
            dispatch(clearReschedule());
            dispatch(fetchProfile());
        }, 2000);
        return () => clearTimeout(timer);
    }, [rescheduleSuccess]);

    const handleReschedule = (range) => {
        setReschedule(range);
        // Pehle API call karo, phir calendar band karo
        dispatch(rescheduleBooking({
            bookingId: booking?._id,
            startDate: toAPIDate(range.start),
            endDate: toAPIDate(range.end),
        })).then(() => {
            setShowCal(false);
        });
    };

    return (
        <div className="bk-card">
            <div className="bk-card__header">
                <div className="bk-card__name">{booking?.serviceName}</div>
                <span className={`bk-badge ${statusClass}`}>{booking?.bookingStatus}</span>
            </div>

            <div className="bk-info-grid">
                <div className="bk-info-item">
                    <span className="bk-info-label">Start Date</span>
                    <span className="bk-info-value">
                        📅 {reschedule?.start
                            ? formatDate(reschedule.start)
                            : booking?.startDate
                                ? formatDate(new Date(booking.startDate))
                                : "—"}
                    </span>
                </div>
                <div className="bk-info-item">
                    <span className="bk-info-label">End Date</span>
                    <span className="bk-info-value">
                        📅 {reschedule?.end
                            ? formatDate(reschedule.end)
                            : booking?.endDate
                                ? formatDate(new Date(booking.endDate))
                                : "—"}
                    </span>
                </div>
                <div className="bk-info-item">
                    <span className="bk-info-label">Duration</span>
                    <span className="bk-info-value">🌙 {allowedNights} days</span>
                </div>
            </div>

            {rescheduleSuccess && (
                <div className="alert alert--success">✅ Booking rescheduled successfully!</div>
            )}
            {rescheduleError && (
                <div className="alert alert--error">⚠️ {rescheduleError}</div>
            )}

            <div className={`bk-topup-row ${isCompleted ? "bk-topup-row--disabled" : ""}`}>
                <label className="bk-topup-label">➕ Extend Booking (nights)</label>
                <div className="bk-topup-input-wrap">
                    <input type="number" min="1" placeholder="e.g. 2"
                        value={topup} onChange={e => setTopup(e.target.value)}
                        className="bk-topup-input" disabled={isCompleted} />
                    <button className="bk-topup-btn" disabled={!topup || isCompleted}>TopUp</button>
                </div>
            </div>

            <button className="bk-reschedule-btn"
                onClick={() => setShowCal(true)}
                disabled={isCompleted || rescheduleLoading}>
                {rescheduleLoading ? "⏳ Rescheduling..." : "🗓 Reschedule"}
            </button>

            {reschedule && !isCompleted && (
                <div className="bk-rescheduled-note">
                    ✅ Rescheduled: {formatDate(reschedule.start)} – {formatDate(reschedule.end)}
                </div>
            )}

            {showCal && (
                <DateRangePicker
                    value={reschedule}
                    onChange={handleReschedule}
                    onClose={() => setShowCal(false)}
                    allowedNights={allowedNights}
                />
            )}
        </div>
    );
}

// ─── MyBookingsSection ────────────────────────────────────────────────────────
function MyBookingsSection() {
    const { token, profile } = useSelector(s => s.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!token) return;
        dispatch(fetchProfile());
    }, [token]);

    const bookings = Array.isArray(profile?.data)
        ? profile.data
        : Array.isArray(profile?.data?.bookings)
            ? profile.data.bookings
            : [];

    return (
        <div>
            <h2 className="section-heading">My Bookings</h2>
            <div className="bk-grid">
                {bookings.map(b => <BookingCard key={b._id} booking={b} />)}
            </div>
        </div>
    );
}

// ─── EditAccountSection ───────────────────────────────────────────────────────
function EditAccountSection() {
    const dispatch = useDispatch();
    const { token, profile, updateLoading, updateSuccess, updateError } = useSelector(s => s.auth);
    const profileUser = profile?.data?.user;

    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });

    useEffect(() => {
        if (!token) return;
        dispatch(fetchProfile());
    }, [token]);

    useEffect(() => {
        if (!profileUser) return;
        setForm({
            firstName: profileUser.firstName || "",
            lastName: profileUser.lastName || "",
            email: profileUser.email || "",
            phone: profileUser.phone || "",
        });
    }, [profileUser]);

    useEffect(() => {
        if (!updateSuccess) return;
        const timer = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
        return () => clearTimeout(timer);
    }, [updateSuccess]);

    const handleSubmit = () => {
        if (!form.firstName.trim() || !form.lastName.trim()) return;
        dispatch(updateProfile({ firstName: form.firstName, lastName: form.lastName, phone: form.phone }));
    };

    return (
        <div>
            <h2 className="section-heading">My Profile</h2>
            {updateSuccess && <div className="alert alert--success">✅ Profile successfully updated!</div>}
            {updateError && <div className="alert alert--error">⚠️ {updateError}</div>}

            <div className="field-wrap">
                <label className="field-label">First Name <span className="required-star">*</span></label>
                <input className="field-input" placeholder="Enter your first name"
                    value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="field-wrap">
                <label className="field-label">Last Name <span className="required-star">*</span></label>
                <input className="field-input" placeholder="Enter your last name"
                    value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="field-wrap">
                <label className="field-label">Email Address</label>
                <input className="field-input readonly" value={form.email} readOnly />
            </div>
            <div className="field-wrap">
                <label className="field-label">Phone Number <span className="required-star">*</span></label>
                <input className="field-input" placeholder="Enter your phone number"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>

            <button className="btn-teal" onClick={handleSubmit} disabled={updateLoading}>
                {updateLoading ? "Updating..." : "Update Profile"}
            </button>

            <div className="delete-account-box">
                <span className="delete-account-label">Delete Your Account</span>
                <button className="btn-outline">Delete Account</button>
            </div>
        </div>
    );
}

// ─── ChangePasswordSection ────────────────────────────────────────────────────
function ChangePasswordSection() {
    const dispatch = useDispatch();
    const { passwordLoading, passwordSuccess, passwordError } = useSelector(s => s.auth);
    const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        if (!passwordSuccess) return;
        const timer = setTimeout(() => {
            dispatch(clearPasswordSuccess());
            setForm({ current: "", newPass: "", confirm: "" });
        }, 3000);
        return () => clearTimeout(timer);
    }, [passwordSuccess]);

    const handleSubmit = () => {
        setValidationError("");
        if (!form.current.trim()) { setValidationError("Current password is required."); return; }
        if (!form.newPass.trim()) { setValidationError("New password is required."); return; }
        if (form.newPass.length < 6) { setValidationError("New password must be at least 6 characters."); return; }
        if (form.newPass !== form.confirm) { setValidationError("Passwords do not match."); return; }

        // ✅ FIX: oldPassword key use karo — slice se match hoga
        dispatch(changePassword({ oldPassword: form.current, newPassword: form.newPass }));
    };

    return (
        <div>
            <h2 className="section-heading">Change Password</h2>
            {passwordSuccess && <div className="alert alert--success">✅ Password changed successfully!</div>}
            {passwordError && <div className="alert alert--error">⚠️ {passwordError}</div>}
            {validationError && <div className="alert alert--error">⚠️ {validationError}</div>}

            <div className="field-wrap">
                <label className="field-label">Current Password <span className="required-star">*</span></label>
                <input className="field-input" type="password" placeholder="Enter current password"
                    value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} />
            </div>
            <div className="field-wrap">
                <label className="field-label">New Password <span className="required-star">*</span></label>
                <input className="field-input" type="password" placeholder="Enter new password"
                    value={form.newPass} onChange={e => setForm({ ...form, newPass: e.target.value })} />
            </div>
            <div className="field-wrap">
                <label className="field-label">Confirm Password <span className="required-star">*</span></label>
                <input className="field-input" type="password" placeholder="Confirm new password"
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
            </div>

            <button className="btn-teal" onClick={handleSubmit} disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : "Update Password"}
            </button>
        </div>
    );
}
// ─── Nav Items ────────────────────────────────────────────────────────────────
const navItems = [
    { key: "bookings", label: "My Bookings", icon: <BookingsIcon /> },
    { key: "edit", label: "Edit Account", icon: <EditIcon /> },
    { key: "password", label: "Change Password", icon: <LockIcon /> },
    { key: "logout", label: "Logout", icon: <LogoutIcon /> },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function MyBookingsDashboard() {
    const [active, setActive] = useState("bookings");
    const [mobileOpen, setMobileOpen] = useState(false);

    const dispatch = useDispatch(); // FIX 2: dispatch missing tha
    const navigate = useNavigate();
    const { user, token } = useSelector(s => s.auth);

    useEffect(() => {
        if (!token) navigate("/my-booking");
    }, [token, navigate]);

    const handleNav = (key) => {
        if (key === "logout") {
            dispatch(logout());
            navigate("/my-booking");
            return;
        }
        setActive(key);
        setMobileOpen(false);
    };

    const renderContent = () => {
        if (active === "bookings") return <MyBookingsSection />;
        if (active === "edit") return <EditAccountSection />;
        if (active === "password") return <ChangePasswordSection />;
        return null;
    };

    return (
        <div className="dashboard-page">
            <Helmet><title>My Bookings</title></Helmet>
            <div className="page-title-wrap">
                <h1 className="page-title">My Bookings</h1>
            </div>

            {/* ── DESKTOP ── */}
            <div className="desktop-layout">
                <div className="desktop-sidebar">
                    <div className="sidebar-avatar"><Avatar /></div>
                    <div className="sidebar-username">
                        {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                    </div>
                    <div className="sidebar-email">{user?.email || ""}</div>
                    <nav className="sidebar-nav">
                        {navItems.map(item => (
                            <div key={item.key}
                                className={`nav-item ${active === item.key ? "active" : ""}`}
                                onClick={() => handleNav(item.key)}>
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="desktop-content">{renderContent()}</div>
            </div>

            {/* ── MOBILE ── */}
            <div className="mobile-layout">
                <div className="mobile-dropdown-wrap">
                    <div className="mobile-dropdown-header" onClick={() => setMobileOpen(!mobileOpen)}>
                        <span className="mobile-dropdown-title">My Bookings</span>
                        <div className="mobile-dropdown-right">
                            <div className="mobile-avatar"><Avatar /></div>
                            <span className={`mobile-chevron ${mobileOpen ? "open" : ""}`}>
                                <ChevronDown />
                            </span>
                        </div>
                    </div>
                    {mobileOpen && (
                        <div className="mobile-nav-list">
                            {navItems.map(item => (
                                <div key={item.key}
                                    className={`nav-item mobile-nav-item ${active === item.key ? "active" : ""}`}
                                    onClick={() => handleNav(item.key)}>
                                    <span className="nav-icon">{item.icon}</span>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mobile-content">{renderContent()}</div>
            </div>
        </div>
    );
}