import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://api.caravanstoragecentralcoast.com.au";


export const sendOtp = createAsyncThunk(
    "password/sendOtp",
    async (email, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/forgot-password/send-otp`, { email });
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to send OTP. Please try again."
            );
        }
    }
);

export const resendOtp = createAsyncThunk(
    "password/resendOtp",
    async (email, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/forgot-password/send-otp`, { email });
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to resend OTP."
            );
        }
    }
);

export const resetPassword = createAsyncThunk(
    "password/resetPassword",
    async ({ email, otp, newPassword }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/forgot-password/reset`, {
                email,
                otp,
                newPassword,
            });
            return res.data;
        } catch (err) {
            return rejectWithValue({
                message: err.response?.data?.message || "Something went wrong. Please try again.",
                status: err.response?.status,
            });
        }
    }
);

const initialState = {
    step: 1,
    email: "",
    otp: Array(6).fill(""),

    sending: false,
    submitting: false,

    otpSent: false,

    resendTimer: 0,

    emailError: "",
    otpError: "",
    pwError: "",
};

const passwordSlice = createSlice({
    name: "password",
    initialState,
    reducers: {
        setStep(state, action) {
            state.step = action.payload;
        },

        setEmail(state, action) {
            state.email = action.payload;
            state.emailError = "";
            state.otpSent = false;
        },

        setOtpDigit(state, action) {
            const { idx, digit } = action.payload;
            state.otp[idx] = digit;
            state.otpError = "";
        },

        setOtpFull(state, action) {
            state.otp = action.payload;
            state.otpError = "";
        },

        clearOtp(state) {
            state.otp = Array(6).fill("");
            state.otpError = "";
        },

        decrementTimer(state) {
            if (state.resendTimer > 0) state.resendTimer -= 1;
        },

        clearEmailError(state) { state.emailError = ""; },
        clearOtpError(state) { state.otpError = ""; },
        clearPwError(state) { state.pwError = ""; },

        resetState() {
            return initialState;
        },
    },

    extraReducers: (builder) => {

        builder
            .addCase(sendOtp.pending, (state) => {
                state.sending = true;
                state.emailError = "";
            })
            .addCase(sendOtp.fulfilled, (state) => {
                state.sending = false;
                state.otpSent = true;
                state.resendTimer = 30;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.sending = false;
                state.emailError = action.payload;
            });

        /* ── resendOtp ── */
        builder
            .addCase(resendOtp.pending, (state) => {
                state.sending = true;
                state.otp = Array(6).fill("");
                state.otpError = "";
                state.resendTimer = 30;
            })
            .addCase(resendOtp.fulfilled, (state) => {
                state.sending = false;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.sending = false;
                state.otpError = action.payload;
            });

        /* ── resetPassword ── */
        builder
            .addCase(resetPassword.pending, (state) => {
                state.submitting = true;
                state.pwError = "";
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.submitting = false;
                state.step = 4;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.submitting = false;
                const { message, status } = action.payload || {};

                if (status === 400 || status === 401) {
                    state.otp = Array(6).fill("");
                    state.otpError = message || "Invalid or expired OTP. Please try again.";
                    state.step = 2;
                } else {
                    state.pwError = message || "Something went wrong. Please try again.";
                }
            });
    },
});

export const {
    setStep,
    setEmail,
    setOtpDigit,
    setOtpFull,
    clearOtp,
    decrementTimer,
    clearEmailError,
    clearOtpError,
    clearPwError,
    resetState,
} = passwordSlice.actions;

export default passwordSlice.reducer;