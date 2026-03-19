// pages/BookingSuccess.jsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function BookingSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = params.get("session_id");

    return (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="" style={{ width: 80 }} />
            <h2>Booking Confirmed!</h2>
            <p>Thank you for your payment. A confirmation has been sent to your email.</p>
            <p style={{ fontSize: "12px", color: "#999" }}>Reference: {sessionId}</p>
            <button onClick={() => navigate("/")}>Back to Home</button>
        </div>
    );
}