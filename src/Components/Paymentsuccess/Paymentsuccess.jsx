import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingCredentials } from "../../store/slices/authSlice";
import "./Paymentsuccess.css";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const [visible, setVisible] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Redux state
    const { credentials, credLoading, credError } = useSelector(s => s.auth);

    // URL params
    const sessionId = searchParams.get("session_id") || "";
    const bookingId = searchParams.get("bookingId") || searchParams.get("booking_id") || "N/A";
    const amount = searchParams.get("amount") || "N/A";
    const serviceName = searchParams.get("service") || "Caravan Storage";
    const date = new Date().toLocaleDateString("en-AU", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    // Fetch credentials using session_id
    useEffect(() => {
        if (!sessionId) return;
        dispatch(fetchBookingCredentials(sessionId));
    }, [sessionId, dispatch]);

    // Card animation
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="ps-page">
            {/* Confetti */}
            <div className="ps-confetti" aria-hidden="true">
                {[...Array(18)].map((_, i) => (
                    <span key={i} className="ps-dot" style={{ "--i": i }} />
                ))}
            </div>

            <div className={`ps-card ${visible ? "ps-card--visible" : ""}`}>

                {/* Success icon */}
                <div className="ps-icon-wrap">
                    <div className="ps-circle">
                        <svg className="ps-check" viewBox="0 0 52 52" fill="none">
                            <circle cx="26" cy="26" r="25" stroke="currentColor" strokeWidth="2" />
                            <path className="ps-check-path" d="M14 26l8 8 16-16"
                                stroke="currentColor" strokeWidth="3"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <h1 className="ps-title">Payment Successful!</h1>
                <p className="ps-subtitle">
                    Your booking has been confirmed.<br />
                    A confirmation email has been sent to you.
                </p>

                {/* Booking Details */}
                <div className="ps-details">
                    {bookingId !== "N/A" && (
                        <>
                            <div className="ps-detail-row">
                                <span className="ps-detail-label">Booking ID</span>
                                <span className="ps-detail-value ps-detail-id">#{bookingId}</span>
                            </div>
                            <div className="ps-divider" />
                        </>
                    )}
                    <div className="ps-detail-row">
                        <span className="ps-detail-label">Service</span>
                        <span className="ps-detail-value">{serviceName}</span>
                    </div>
                    {amount !== "N/A" && (
                        <>
                            <div className="ps-divider" />
                            <div className="ps-detail-row">
                                <span className="ps-detail-label">Amount Paid</span>
                                <span className="ps-detail-value ps-detail-amount">${amount}</span>
                            </div>
                        </>
                    )}
                    <div className="ps-divider" />
                    <div className="ps-detail-row">
                        <span className="ps-detail-label">Date & Time</span>
                        <span className="ps-detail-value">{date}</span>
                    </div>
                </div>

                {/* ── Login Credentials ── */}
                <div className="ps-cred-section">
                    <h3 className="ps-cred-title">🔐 Your Login Credentials</h3>
                    <p className="ps-cred-subtitle">Use these to access your bookings dashboard</p>

                    {/* Loading */}
                    {credLoading && (
                        <div className="ps-cred-loading">
                            <span className="ps-spinner" />
                            Fetching your credentials...
                        </div>
                    )}

                    {/* Error */}
                    {credError && (
                        <div className="ps-cred-error">⚠️ {credError}</div>
                    )}

                    {/* Credentials */}
                    {credentials && (
                        <div className="ps-cred-box">
                            {/* Login ID */}
                            <div className="ps-cred-row">
                                <span className="ps-cred-label">Login ID</span>
                                <div className="ps-cred-value-wrap">
                                    <span className="ps-cred-value">{credentials.loginId}</span>
                                    <button className="ps-copy-btn"
                                        onClick={() => handleCopy(credentials.loginId)}
                                        title="Copy Login ID">📋</button>
                                </div>
                            </div>

                            <div className="ps-cred-divider" />

                            {/* Password */}
                            <div className="ps-cred-row">
                                <span className="ps-cred-label">Password</span>
                                <div className="ps-cred-value-wrap">
                                    <span className="ps-cred-value ps-cred-password">
                                        {showPass ? credentials.password : "••••••••"}
                                    </span>
                                    <button className="ps-copy-btn"
                                        onClick={() => setShowPass(p => !p)}
                                        title={showPass ? "Hide" : "Show"}>
                                        {showPass ? "🙈" : "👁️"}
                                    </button>
                                    <button className="ps-copy-btn"
                                        onClick={() => handleCopy(credentials.password)}
                                        title="Copy Password">📋</button>
                                </div>
                            </div>

                            <p className="ps-cred-note">
                                ⚠️ Please save these credentials. You will need them to login.
                            </p>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="ps-actions">
                    <button className="ps-btn ps-btn--primary"
                        onClick={() => navigate("/my-booking")}>
                        Login to My Bookings
                    </button>
                    <button className="ps-btn ps-btn--outline"
                        onClick={() => navigate("/")}>
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}