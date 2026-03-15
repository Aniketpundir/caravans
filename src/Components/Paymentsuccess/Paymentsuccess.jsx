import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Paymentsuccess.css";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [visible, setVisible] = useState(false);

    // Stripe success_url mein ?session_id={CHECKOUT_SESSION_ID} aata hai
    // Ya backend redirect karte waqt query params bhejta hai
    const sessionId = searchParams.get("session_id") || "N/A";
    const bookingId = searchParams.get("bookingId") || searchParams.get("booking_id") || "N/A";
    const amount = searchParams.get("amount") || "N/A";
    const serviceName = searchParams.get("service") || "Caravan Storage";
    const date = new Date().toLocaleDateString("en-AU", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="ps-page">
            {/* Confetti dots */}
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

                {/* Details */}
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

                {/* Button */}
                <div className="ps-actions">
                    <button
                        className="ps-btn ps-btn--primary"
                        onClick={() => navigate("/")}
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}