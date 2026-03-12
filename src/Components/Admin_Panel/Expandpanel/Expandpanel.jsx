import "./ExpandPanel.css";

// ─── CLOSE ICON ───────────────────────────────────────────────────────────────
const CloseIcon = () => (
    <svg viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ─── EXPAND PANEL COMPONENT ───────────────────────────────────────────────────
export default function ExpandPanel({ appt, onClose }) {
    return (
        <div className="admin_expand__panel">

            {/* ── Header ── */}
            <div className="admin_expand__header">
                <div className="admin_expand__header-left">
                    <div>
                        <div className="admin_expand__booking-id">Booking ID: {appt.id}</div>
                        <div className="admin_expand__service-name">{appt.service}</div>
                    </div>
                    <div className="admin_expand__price-badge">{appt.payment}</div>
                </div>
            </div>

            {/* ── 3-Column Details ── */}
            <div className="admin_expand__details-grid">

                {/* Basic Details */}
                <div className="admin_expand__details-col">
                    <div className="admin_expand__col-title">Basic Details</div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Date</span>
                        <span className="admin_expand__detail-value">{appt.bookingDate}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Time</span>
                        <span className="admin_expand__detail-value">{appt.time}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Service</span>
                        <span className="admin_expand__detail-value">{appt.service}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Duration</span>
                        <span className="admin_expand__detail-value">{appt.duration}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Status</span>
                        <span className="admin_expand__detail-value admin_expand__detail-value--green">{appt.status}</span>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="admin_expand__details-col">
                    <div className="admin_expand__col-title">Customer Details</div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">First Name</span>
                        <span className="admin_expand__detail-value">{appt.firstName}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Last Name</span>
                        <span className="admin_expand__detail-value">{appt.lastName}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Email Address</span>
                        <span className="admin_expand__detail-value">{appt.email}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Phone</span>
                        <span className="admin_expand__detail-value">{appt.phone}</span>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="admin_expand__details-col">
                    <div className="admin_expand__col-title">Payment Details</div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Payment Method</span>
                        <span className="admin_expand__detail-value">{appt.paymentMethod}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Status</span>
                        <span className="admin_expand__detail-value admin_expand__detail-value--blue">{appt.status}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Tax</span>
                        <span className="admin_expand__detail-value">{appt.tax}</span>
                    </div>
                    <div className="admin_expand__detail-row">
                        <span className="admin_expand__detail-label">Total</span>
                        <span className="admin_expand__detail-value admin_expand__detail-value--green">{appt.payment}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}