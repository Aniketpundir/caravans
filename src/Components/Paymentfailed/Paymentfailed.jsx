import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentFailed.css";

export default function PaymentFailed() {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="pf-page">
            <div className={`pf-card ${visible ? "pf-card--visible" : ""}`}>

                {/* Failed icon */}
                <div className="pf-icon-wrap">
                    <div className="pf-circle">
                        <svg viewBox="0 0 52 52" fill="none" className="pf-cross">
                            <circle cx="26" cy="26" r="25" stroke="currentColor" strokeWidth="2" />
                            <path className="pf-cross-path"
                                d="M16 16 L36 36 M36 16 L16 36"
                                stroke="currentColor" strokeWidth="3"
                                strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                <h1 className="pf-title">Payment Failed!</h1>
                <p className="pf-subtitle">
                    Something went wrong with your payment.<br />
                    Please try again or use a different payment method.
                </p>

                {/* Possible reasons */}
                <div className="pf-reasons">
                    <p className="pf-reasons-title">Possible reasons:</p>
                    <ul>
                        <li>❌ Insufficient funds</li>
                        <li>❌ Card declined by bank</li>
                        <li>❌ Incorrect card details</li>
                        <li>❌ Payment session expired</li>
                    </ul>
                </div>

                {/* Buttons */}
                <div className="pf-actions">
                    <button
                        className="pf-btn pf-btn--primary"
                        onClick={() => navigate("/book-online")}
                    >
                        Try Again
                    </button>
                    <button
                        className="pf-btn pf-btn--outline"
                        onClick={() => navigate("/")}
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}