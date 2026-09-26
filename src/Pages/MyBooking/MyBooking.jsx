import { useState, useEffect } from "react";
import "./MyBooking.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../store/slices/authSlice";
import { Helmet } from "react-helmet-async";

// 👇 value = backend ka accepted identifierType, label = UI par dikhne wala text
const IDENTIFIER_OPTIONS = [
    { value: "loginId", label: "Username" },
    { value: "phone", label: "Mobile Number" },
    { value: "email", label: "Email" },
    { value: "vehicleNumber", label: "Vehicle Registration Number" },
];

const MyBooking = () => {
    const [identifierType, setIdentifierType] = useState("loginId");
    const [identifier, setIdentifier] = useState("");
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

    // Radio change hote hi input field clear kar do (taaki galat type ka data na chala jaye)
    const handleIdentifierTypeChange = (value) => {
        setIdentifierType(value);
        setIdentifier("");
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (!identifier.trim() || !password.trim()) return;
        dispatch(loginUser({ identifierType, identifier, password }));
    };

    // Selected type ke hisaab se label/placeholder/input-type set karo
    const activeOption = IDENTIFIER_OPTIONS.find((opt) => opt.value === identifierType);

    const getInputType = () => {
        if (identifierType === "email") return "email";
        if (identifierType === "phone") return "tel";
        return "text";
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

                {/* 👇 Login type radio buttons */}
                <div className="identifier-type-row">
                    {IDENTIFIER_OPTIONS.map((opt) => (
                        <label key={opt.value} className="identifier-type-option">
                            <input
                                type="radio"
                                name="identifierType"
                                value={opt.value}
                                checked={identifierType === opt.value}
                                onChange={() => handleIdentifierTypeChange(opt.value)}
                                disabled={loading}
                            />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>

                <div className="login-field">
                    <label>{activeOption.label} <span className="required">*</span></label>
                    <input
                        type={getInputType()}
                        placeholder={`Enter your ${activeOption.label.toLowerCase()}`}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
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
                    disabled={loading || !identifier || !password}
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
                <Link to="/forgot-password"><p className="lost-password">Lost Your Password</p></Link>
            </div>
        </div>
    );
};

export default MyBooking;