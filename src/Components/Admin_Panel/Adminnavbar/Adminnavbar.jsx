import "./AdminNavbar.css";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const CalendarIcon = () => (
    <svg viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const AppointmentsIcon = () => (
    <svg viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="16" y2="14" />
        <line x1="8" y1="18" x2="12" y2="18" />
    </svg>
);

const PaymentsIcon = () => (
    <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v2M12 16v2" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const CustomersIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const ServicesIcon = () => (
    <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

const DiscountsIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);

const ReportsIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const CustomizeIcon = () => (
    <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
);

const MoreIcon = () => (
    <svg viewBox="0 0 24 24">
        <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
);

const LogoIcon = () => (
    <svg viewBox="0 0 28 28" fill="white">
        <rect x="2" y="2" width="10" height="10" rx="2" />
        <rect x="16" y="2" width="10" height="10" rx="2" />
        <rect x="2" y="16" width="10" height="10" rx="2" />
        <line x1="16" y1="21" x2="26" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="21" y1="16" x2="21" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

const NAV_LINKS = [
    { label: "Calendar", Icon: CalendarIcon },
    { label: "Appointments", Icon: AppointmentsIcon },
    { label: "Payments", Icon: PaymentsIcon },
    { label: "Customers", Icon: CustomersIcon },
    { label: "Services", Icon: ServicesIcon },
    { label: "Discounts", Icon: DiscountsIcon },
    { label: "Reports", Icon: ReportsIcon },
    { label: "Customize", Icon: CustomizeIcon },
    { label: "More", Icon: MoreIcon },
];

export default function AdminNavbar() {
    return (
        <nav className="admin_navbar">
            <div className="admin_navbar__logo">
                <LogoIcon />
            </div>
            <div className="admin_navbar__items">
                {NAV_LINKS.map(({ label, Icon }) => (
                    <a key={label} className="admin_navbar__link" href="#">
                        <Icon />
                        <span>{label}</span>
                    </a>
                ))}
            </div>
        </nav>
    );
}