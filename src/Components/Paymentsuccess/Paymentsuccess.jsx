import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Paymentsuccess.css";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    // Card animation
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

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