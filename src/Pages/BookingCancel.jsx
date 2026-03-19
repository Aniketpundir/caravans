// pages/BookingCancel.jsx
import { useNavigate } from "react-router-dom";

export default function BookingCancel() {
    const navigate = useNavigate();
    return (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <img src="https://cdn-icons-png.flaticon.com/512/753/753345.png" alt="" style={{ width: 80 }} />
            <h2>Payment Cancelled</h2>
            <p>Your booking was not completed. No payment was taken.</p>
            <button onClick={() => navigate("/book-online")}>Try Again</button>
        </div>
    );
}