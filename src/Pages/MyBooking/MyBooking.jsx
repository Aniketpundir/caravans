import { useState, useEffect } from "react";
import "./MyBooking.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../store/slices/authSlice";
import { Helmet } from "react-helmet-async";

const MyBooking = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error, token } = useSelector((state) => state.auth);

    // Agar already logged in hai to redirect karo
    useEffect(() => {
        if (token) {
            navigate("/my-booking-dashboard");
        }
    }, [token, navigate]);

    // Component unmount hone par error clear karo
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        dispatch(loginUser({ email, password }));
    };

    return (
        <div className="my-bookings-page">
            <Helmet><title>My Bookings</title></Helmet>
            <h2 className="bookings-title">My Bookings</h2>
            <div className="login-card">
                <h3 className="login-heading">Please Login</h3>

                {/* API Error Message */}
                {error && (
                    <div className="login-error-box">
                        ⚠️ {error}
                    </div>
                )}

                <div className="login-field">
                    <label>Username <span className="required">*</span></label>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="login-field">
                    <label>Password <span className="required">*</span></label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="remember-row">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        disabled={loading}
                    />
                    <label htmlFor="remember">Remember Me</label>
                </div>

                <button
                    className="login-btn"
                    onClick={handleLogin}
                    disabled={loading || !email || !password}
                >
                    {loading ? (
                        <span className="login-spinner">
                            <span className="spinner-dot" />
                            Logging in...
                        </span>
                    ) : (
                        "LOGIN"
                    )}
                </button>

                <p className="lost-password">Lost Your Password</p>
            </div>
        </div>
    );
};

export default MyBooking;