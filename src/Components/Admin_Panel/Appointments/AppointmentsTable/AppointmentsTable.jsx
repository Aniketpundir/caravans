import { useState, useRef, useEffect } from "react";
import "./AppointmentsTable.css";

const STATUS_OPTIONS = ["Approved", "Pending", "Cancelled", "Rejected", "No-Show", "Completed"];
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const BOOKING_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
});

function SortIcon() {
    return (
        <span className="sort-icon">
            <span className="up" />
            <span className="down" />
        </span>
    );
}

function StatusDropdown({ current, onSelect }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <div className="status-dropdown-wrapper" ref={ref}>
            <button className="status-btn" onClick={() => setOpen((v) => !v)}>
                {current}
                <span className="chevron">▾</span>
            </button>
            {open && (
                <div className="status-menu">
                    <div className="status-menu-header">Change status</div>
                    {STATUS_OPTIONS.map((s) => (
                        <div key={s}
                            className={`status-menu-item ${s === current ? "active" : ""}`}
                            onClick={() => { onSelect(s); setOpen(false); }}>
                            {s === current && <span className="checkmark">✓</span>}
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function formatBookingDate(dateStr) {
    if (!dateStr) return "?";
    if (typeof dateStr === "string" && DATE_ONLY_RE.test(dateStr)) {
        const [year, month, day] = dateStr.split("-").map(Number);
        return BOOKING_DATE_FORMATTER.format(new Date(year, month - 1, day));
    }
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return BOOKING_DATE_FORMATTER.format(d);
}

function formatTimestamp(dateStr) {
    if (!dateStr) return "?";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
    }) + " " + d.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
}

export default function AppointmentsTable({
    appointments,
    selected,
    onToggleSelect,
    onToggleAll,
    onUpdateStatus,
    onDelete,
    perPage,
    onPerPageChange,
    currentPage,
    onPageChange,
    totalRows = 0,
    totalPages = 1,
}) {
    const [hoveredRow, setHoveredRow] = useState(null);

    return (
        <div className="table-card">
            <div className="table-scroll">
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th className="th-expand"></th>
                            <th className="th-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={
                                        selected.length === appointments.length &&
                                        appointments.length > 0
                                    }
                                    onChange={onToggleAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Date <SortIcon /></th>
                            <th>Customer <SortIcon /></th>
                            <th>Service <SortIcon /></th>
                            <th>Duration <SortIcon /></th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Created Date <SortIcon /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="no-data">
                                    No appointments found
                                </td>
                            </tr>
                        ) : (
                            appointments.map((appt) => (
                                <tr key={appt.id}
                                    onMouseEnter={() => setHoveredRow(appt.id)}
                                    onMouseLeave={() => setHoveredRow(null)}>
                                    <td className="td-expand">
                                        <button className="expand-btn">+</button>
                                    </td>
                                    <td className="td-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={selected.includes(appt.id)}
                                            onChange={() => onToggleSelect(appt.id)}
                                        />
                                    </td>
                                    <td className="id-cell">#{String(appt.id).slice(-6)}</td>
                                    <td>{formatBookingDate(appt.date)}</td>
                                    <td>{appt.customer || "—"}</td>
                                    <td>{appt.service || "—"}</td>
                                    <td>{appt.duration || "—"}</td>
                                    <td>
                                        <StatusDropdown
                                            current={appt.status}
                                            onSelect={(s) => onUpdateStatus(appt.id, s)}
                                        />
                                    </td>
                                    <td>{appt.payment || "—"}</td>
                                    <td>
                                        {hoveredRow === appt.id ? (
                                            <div className="row-actions">
                                                <button className="action-btn" title="Edit">✏️</button>
                                                <button className="action-btn" title="Copy">📋</button>
                                                <button
                                                    className="action-btn delete"
                                                    title="Delete"
                                                    onClick={() => onDelete(appt.id)}
                                                >🗑️</button>
                                            </div>
                                        ) : (
                                            formatTimestamp(appt.createdDate)
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="table-footer">
                <div className="footer-left">
                    <span className="showing-info">
                        Showing <strong>{appointments.length}</strong> of <strong>{totalRows}</strong>
                    </span>
                    <div className="per-page-group">
                        Per Page
                        <select className="per-page-select" value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
                <div className="pagination-controls">
                    <button className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}>‹</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <button key={page}
                                className={`page-btn${currentPage === page ? " active" : ""}`}
                                onClick={() => onPageChange(page)}>
                                {page}
                            </button>
                        );
                    })}
                    {totalPages > 5 && <span className="page-dots">...</span>}
                    <button className="page-btn"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => onPageChange(currentPage + 1)}>›</button>
                </div>
            </div>
        </div>
    );
}