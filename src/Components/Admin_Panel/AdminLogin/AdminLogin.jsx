// src/components/AdminLogin/AdminLogin.jsx
import { useState, useEffect } from "react";
import "./AdminLogin.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLoginUser, clearError } from "../../../store/slices/adminSlice";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Admin slice se state lo
    const { token, loading, error } = useSelector((state) => state.admin);

    // Token hai toh dashboard pe redirect karo
    useEffect(() => {
        if (token) {
            navigate("/admin-dashboard");
        }
    }, [token, navigate]);

    // Component unmount pe error clear karo
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        dispatch(adminLoginUser({ email, password })).then((result) => {
            // Remember me nahi checked toh sessionStorage use karo
            if (!remember && result.type === "admin/loginUser/fulfilled") {
                sessionStorage.setItem("adminToken", result.payload.token);
                localStorage.removeItem("adminToken");
            }
        });
    };

    return (
        <div className="my-bookings-page">
            <h2 className="bookings-title">Admin Panel</h2>
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

export default AdminLogin;