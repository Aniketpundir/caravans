import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setStep,
    setEmail,
    setOtpDigit,
    setOtpFull,
    decrementTimer,
    clearPwError,
} from "../../store/slices/PasswordSlice";
import {
    sendOtp,
    resetPassword,
} from "../../store/slices/PasswordSlice";
import "./ForgotPassword.css";
import { Link } from "react-router-dom";

const OTP_LENGTH = 6;

const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const CheckIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

function getStrength(pw) {
    if (!pw) return { level: 0, label: "", cls: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: "Weak", cls: "weak" };
    if (score <= 3) return { level: 2, label: "Fair", cls: "fair" };
    return { level: 3, label: "Strong", cls: "strong" };
}

export default function ForgotPassword() {
    const dispatch = useDispatch();

    const {
        step,
        email,
        otp,
        sending,
        submitting,
        otpSent,
        resendTimer,
        emailError,
        otpError,
        pwError,
    } = useSelector((state) => state.password);

    const [newPw, setNewPw] = React.useState("");
    const [confirmPw, setConfirmPw] = React.useState("");
    const [showNew, setShowNew] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const otpRefs = useRef([]);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setTimeout(() => dispatch(decrementTimer()), 1000);
        return () => clearTimeout(t);
    }, [resendTimer, dispatch]);

    function validateEmail(val) {
        if (!val) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email address.";
        return "";
    }

    function handleSendOtp() {
        const err = validateEmail(email);
        if (err) {
            dispatch({ type: "password/setEmailError", payload: err });
            return;
        }
        dispatch(sendOtp(email));
    }

    function handleProceedToOtp() {
        const err = validateEmail(email);
        if (err) {
            dispatch({ type: "password/setEmailError", payload: err });
            return;
        }
        if (!otpSent) {
            dispatch({ type: "password/setEmailError", payload: "Please send OTP first." });
            return;
        }
        dispatch(setStep(2));
    }

    function handleOtpChange(idx, val) {
        const digit = val.replace(/\D/g, "").slice(-1);
        dispatch(setOtpDigit({ idx, digit }));
        if (digit && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
    }

    function handleOtpKeyDown(idx, e) {
        if (e.key === "Backspace") {
            if (otp[idx]) {
                dispatch(setOtpDigit({ idx, digit: "" }));
            } else if (idx > 0) {
                otpRefs.current[idx - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft" && idx > 0) otpRefs.current[idx - 1]?.focus();
        if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
    }

    function handleOtpPaste(e) {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        const next = Array(OTP_LENGTH).fill("");
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        dispatch(setOtpFull(next));
        otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    }


    function handleVerifyOtp() {
        if (otp.some((d) => !d)) {
            dispatch({ type: "password/setOtpError", payload: "Please enter the complete 6-digit OTP." });
            return;
        }
        dispatch(setStep(3));
    }

    function handleResetPassword() {
        dispatch(clearPwError());

        if (!newPw) { dispatch({ type: "password/setPwError", payload: "New password is required." }); return; }
        if (newPw.length < 8) { dispatch({ type: "password/setPwError", payload: "Password must be at least 8 characters." }); return; }
        if (!confirmPw) { dispatch({ type: "password/setPwError", payload: "Please confirm your password." }); return; }
        if (newPw !== confirmPw) { dispatch({ type: "password/setPwError", payload: "Passwords do not match." }); return; }

        dispatch(resetPassword({
            email,
            otp: otp.join(""),
            newPassword: newPw,
        }));
    }

    const strength = getStrength(newPw);
    const passwordsMatch = newPw && confirmPw && newPw === confirmPw;
    const passwordsMismatch = confirmPw && newPw !== confirmPw;

    return (
        <div className="fp-page">
            <div className="fp-body">
                <div className="fp-card">

                    {step < 4 && (
                        <>
                            <h1 className="fp-title">Forgot Password</h1>
                            <p className="fp-subtitle">
                                {step === 1 && "Enter your email to receive a one-time password."}
                                {step === 2 && `Enter the 6-digit OTP sent to ${email}`}
                                {step === 3 && "Create a strong new password for your account."}
                            </p>

                            <div className="fp-steps">
                                {[1, 2, 3].map((s, i) => (
                                    <React.Fragment key={s}>
                                        <div className={`fp-step-dot ${step === s ? "active" : step > s ? "done" : ""}`}>
                                            {step > s ? "✓" : s}
                                        </div>
                                        {i < 2 && (
                                            <div className={`fp-step-line ${(s === 1 && step > 1) || (s === 2 && step > 2) ? "done" : ""
                                                }`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <div>
                            <div className="fp-group">
                                <label className="fp-label">
                                    Email Address <span className="req">*</span>
                                </label>
                                <div className="fp-input-wrap">
                                    <input
                                        className={`fp-input${emailError ? " error" : otpSent ? " success" : ""}`}
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => dispatch(setEmail(e.target.value))}
                                        disabled={sending}
                                    />
                                    <button
                                        className="fp-send-btn"
                                        onClick={handleSendOtp}
                                        disabled={sending || resendTimer > 0}
                                    >
                                        {sending
                                            ? <><span className="fp-spinner" />Sending…</>
                                            : resendTimer > 0
                                                ? `Resend (${resendTimer}s)`
                                                : otpSent ? "Resend OTP" : "Send OTP"}
                                    </button>
                                </div>
                                {emailError && <p className="fp-error-text">{emailError}</p>}
                                {otpSent && !emailError && (
                                    <div className="fp-sent-badge">✓ OTP sent to your email</div>
                                )}
                            </div>

                            <button
                                className="fp-main-btn"
                                onClick={handleProceedToOtp}
                                disabled={!otpSent}
                            >
                                Continue
                            </button>

                            <p className="fp-back">
                                Remember your password? <Link to="/my-booking">Login</Link>
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="fp-group">
                                <label className="fp-label" style={{ textAlign: "center", display: "block" }}>
                                    Enter OTP <span className="req">*</span>
                                </label>
                                <div className="fp-otp-row" onPaste={handleOtpPaste}>
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => (otpRefs.current[idx] = el)}
                                            className={`fp-otp-box${digit ? " filled" : ""}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                        />
                                    ))}
                                </div>
                                {otpError && (
                                    <p className="fp-error-text" style={{ textAlign: "center" }}>{otpError}</p>
                                )}
                                {/* <div className="fp-resend">
                                    Didn't receive it?{" "}
                                    {resendTimer > 0
                                        ? `Resend in ${resendTimer}s`
                                        : <button onClick={handleResend} disabled={sending}>
                                            {sending ? "Sending…" : "Resend OTP"}
                                        </button>
                                    }
                                </div> */}
                            </div>

                            <button
                                className="fp-main-btn"
                                onClick={handleVerifyOtp}
                                disabled={otp.some((d) => !d)}
                            >
                                Continue
                            </button>

                            <p className="fp-back">
                                <a href="#" onClick={(e) => { e.preventDefault(); dispatch(setStep(1)); }}>← Back</a>
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div className="fp-group">
                                <label className="fp-label">
                                    New Password <span className="req">*</span>
                                </label>
                                <div className="fp-pw-wrap">
                                    <input
                                        className={`fp-input${pwError && !newPw ? " error" : newPw ? " success" : ""}`}
                                        type={showNew ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPw}
                                        onChange={(e) => { setNewPw(e.target.value); dispatch(clearPwError()); }}
                                    />
                                    <button className="fp-pw-eye" onClick={() => setShowNew((v) => !v)} type="button">
                                        {showNew ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                                {newPw && (
                                    <>
                                        <div className="fp-strength-bar">
                                            {[1, 2, 3].map((seg) => (
                                                <div
                                                    key={seg}
                                                    className={`fp-strength-seg${strength.level >= seg ? ` ${strength.cls}` : ""}`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`fp-strength-label ${strength.cls}`}>
                                            Password strength: {strength.label}
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="fp-group">
                                <label className="fp-label">
                                    Confirm Password <span className="req">*</span>
                                </label>
                                <div className="fp-pw-wrap">
                                    <input
                                        className={`fp-input${passwordsMismatch ? " error" : passwordsMatch ? " success" : ""}`}
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Re-enter new password"
                                        value={confirmPw}
                                        onChange={(e) => { setConfirmPw(e.target.value); dispatch(clearPwError()); }}
                                    />
                                    <button className="fp-pw-eye" onClick={() => setShowConfirm((v) => !v)} type="button">
                                        {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                                {passwordsMatch && <p className="fp-match ok">✓ Passwords match</p>}
                                {passwordsMismatch && <p className="fp-match bad">✗ Passwords do not match</p>}
                            </div>

                            {pwError && <p className="fp-error-text">{pwError}</p>}

                            <button
                                className="fp-main-btn"
                                onClick={handleResetPassword}
                                disabled={submitting}
                            >
                                {submitting
                                    ? <><span className="fp-spinner" />Resetting…</>
                                    : "Reset Password"}
                            </button>

                            <p className="fp-back">
                                <a href="#" onClick={(e) => { e.preventDefault(); dispatch(setStep(2)); }}>← Back</a>
                            </p>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="fp-success">
                            <div className="fp-success-icon"><CheckIcon /></div>
                            <h2>Password Reset!</h2>
                            <p>
                                Your password has been reset successfully.<br />
                                You can now log in with your new password.
                            </p>
                            <button
                                className="fp-main-btn"
                                onClick={() => window.location.href = "/my-booking"}
                            >
                                Back to Login
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}