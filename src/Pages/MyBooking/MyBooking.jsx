import { useState } from "react";
import "./MyBooking.css"

const MyBooking = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        // your login logic here
    };

    return (
        <div className="my-bookings-page">
            <h2 className="bookings-title">My Bookings</h2>
            <div className="login-card">
                <h3 className="login-heading">Please Login</h3>

                <div className="login-field">
                    <label>Username <span className="required">*</span></label>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="login-field">
                    <label>Password <span className="required">*</span></label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="remember-row">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                    />
                    <label htmlFor="remember">Remember Me</label>
                </div>

                <button className="login-btn" onClick={handleLogin}>LOGIN</button>

                <p className="lost-password">Lost Your Password</p>
            </div>
        </div>
    );
};

export default MyBooking