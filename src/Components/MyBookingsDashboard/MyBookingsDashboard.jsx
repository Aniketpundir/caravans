import { useState } from "react";
import "./MyBookingsDashboard.css";

const Avatar = () => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <rect width="80" height="80" rx="8" fill="#d0e8f0" />
        <circle cx="40" cy="30" r="14" fill="#8bbccf" />
        <ellipse cx="40" cy="65" rx="22" ry="14" fill="#8bbccf" />
    </svg>
);

const BookingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
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

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

function MyBookingsSection() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    return (
        <div>
            <h2 className="section-heading">My Bookings</h2>

            <div className="field-wrap">
                <div className="date-input-wrap">
                    <span className="date-icon"><CalendarIcon /></span>
                    <input type="date" className="field-input with-icon" value={startDate}
                        onChange={e => setStartDate(e.target.value)} placeholder="Please select date" />
                </div>
            </div>

            <div className="field-wrap">
                <div className="date-input-wrap">
                    <span className="date-icon"><CalendarIcon /></span>
                    <input type="date" className="field-input with-icon" value={endDate}
                        onChange={e => setEndDate(e.target.value)} placeholder="Please select date" />
                </div>
            </div>

            <button className="btn-teal full-width">✓</button>

            <div className="empty-state">
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                    <circle cx="55" cy="45" r="8" fill="#3dbcb8" opacity="0.8" />
                    <rect x="30" y="55" width="50" height="8" rx="4" fill="#b0d8f5" opacity="0.7" />
                    <rect x="30" y="67" width="35" height="6" rx="3" fill="#3dbcb8" opacity="0.5" />
                    <rect x="30" y="77" width="45" height="6" rx="3" fill="#b0d8f5" opacity="0.5" />
                    <circle cx="88" cy="20" r="3" fill="#3dbcb8" opacity="0.5" />
                    <circle cx="25" cy="30" r="2" fill="#b0d8f5" opacity="0.6" />
                    <text x="80" y="25" fontSize="12" fill="#3dbcb8" opacity="0.7">+</text>
                    <text x="18" y="60" fontSize="10" fill="#b0d8f5" opacity="0.5">·</text>
                    <text x="100" y="55" fontSize="10" fill="#3dbcb8" opacity="0.4">·</text>
                </svg>
            </div>
        </div>
    );
}

function EditAccountSection() {
    const [form, setForm] = useState({
        firstName: "", lastName: "",
        email: "website@carvanstoragecentralcoast.com.au", phone: ""
    });

    return (
        <div>
            <h2 className="section-heading">My Profile</h2>

            <div className="field-wrap">
                <label className="field-label">First Name <span className="required-star">*</span></label>
                <input className="field-input" placeholder="Enter your first name" value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>

            <div className="field-wrap">
                <label className="field-label">Last Name <span className="required-star">*</span></label>
                <input className="field-input" placeholder="Enter your last name" value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>

            <div className="field-wrap">
                <label className="field-label">Email Address <span className="required-star">*</span></label>
                <input className="field-input readonly" value={form.email} readOnly />
            </div>

            <div className="field-wrap">
                <label className="field-label">Phone Number <span className="required-star">*</span></label>
                <input className="field-input" placeholder="Enter your phone number" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>

            <button className="btn-teal">Update Profile</button>

            <div className="delete-account-box">
                <span className="delete-account-label">Delete Your Account</span>
                <button className="btn-outline">Delete Account</button>
            </div>
        </div>
    );
}

function ChangePasswordSection() {
    const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });

    return (
        <div>
            <h2 className="section-heading">Change Password</h2>

            <div className="field-wrap">
                <label className="field-label">Enter Current Password <span className="required-star">*</span></label>
                <input className="field-input" type="password" placeholder="Enter Current Password" value={form.current}
                    onChange={e => setForm({ ...form, current: e.target.value })} />
            </div>

            <div className="field-wrap">
                <label className="field-label">Enter New Password <span className="required-star">*</span></label>
                <input className="field-input" type="password" placeholder="Enter new password" value={form.newPass}
                    onChange={e => setForm({ ...form, newPass: e.target.value })} />
            </div>

            <div className="field-wrap">
                <label className="field-label">Confirm Password <span className="required-star">*</span></label>
                <input className="field-input" type="password" placeholder="Enter confirm password" value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })} />
            </div>

            <button className="btn-teal">Update Password</button>
        </div>
    );
}

const navItems = [
    { key: "bookings", label: "My Bookings", icon: <BookingsIcon /> },
    { key: "edit", label: "Edit Account", icon: <EditIcon /> },
    { key: "password", label: "Change Password", icon: <LockIcon /> },
    { key: "logout", label: "Logout", icon: <LogoutIcon /> },
];

export default function MyBookingsDashboard() {
    const [active, setActive] = useState("edit");
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleNav = (key) => {
        if (key === "logout") return;
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

            {/* Page Title */}
            <div className="page-title-wrap">
                <h1 className="page-title">My Bookings</h1>
            </div>

            {/* DESKTOP LAYOUT */}
            <div className="desktop-layout">

                {/* Sidebar */}
                <div className="desktop-sidebar">
                    <div className="sidebar-avatar"><Avatar /></div>
                    <div className="sidebar-username">caravanstoragecc</div>
                    <div className="sidebar-email">website@carvanstoragecentralcoast.com.au</div>

                    <nav className="sidebar-nav">
                        {navItems.map(item => (
                            <div key={item.key} className={`nav-item ${active === item.key ? "active" : ""}`}
                                onClick={() => handleNav(item.key)}>
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="desktop-content">
                    {renderContent()}
                </div>
            </div>

            {/* MOBILE LAYOUT */}
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
                                <div key={item.key} className={`nav-item mobile-nav-item ${active === item.key ? "active" : ""}`}
                                    onClick={() => handleNav(item.key)}>
                                    <span className="nav-icon">{item.icon}</span>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mobile-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}