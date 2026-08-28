import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://api.caravanstoragecentralcoast.com.au/api"


// ─── Token Expiry Config ───────────────────────────────────────────────────
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 👈 time yahan se change karo (abhi 1 hour hai)

const setTokenWithExpiry = (token) => {
    const expiryTime = Date.now() + TOKEN_EXPIRY_MS;
    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiry", expiryTime.toString());
};

const clearTokenData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
};

const getValidToken = () => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("tokenExpiry");

    if (!token || !expiry) return null;

    if (Date.now() > Number(expiry)) {
        clearTokenData(); // time khatam, isliye clean kar do
        return null;
    }

    return token;
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                loginId: email,
                password,
            });
            const data = response.data;
            if (data?.token) setTokenWithExpiry(data.token); // 👈 yahan expiry ke sath save hoga
            return data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Invalid email or password.");
        }
    }
);

// ─── Check Token Expiry (auto logout ke liye) ─────────────────────────────
export const checkTokenExpiry = createAsyncThunk(
    "auth/checkTokenExpiry",
    async (_, { dispatch }) => {
        const token = getValidToken();
        if (!token) {
            dispatch(logout());
        }
        return null;
    }
);

// ─── Fetch Profile ────────────────────────────────────────────────────────────
export const fetchProfile = createAsyncThunk(
    "auth/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Failed to fetch profile.");
        }
    }
);

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async ({ firstName, lastName, phone }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.patch(
                `${BASE_URL}/auth/profile`,
                { firstName, lastName, phone },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Failed to update profile.");
        }
    }
);

// ─── Change Password ─────────────────────────────────────────────────────────
export const changePassword = createAsyncThunk(
    "auth/changePassword",
    async ({ currentPassword, newPassword }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.patch(
                `${BASE_URL}/auth/change-password`,
                { oldPassword: currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Failed to change password.");
        }
    }
);

// ─── Reschedule Booking ──────────────────────────────────────────────────────
export const rescheduleBooking = createAsyncThunk(
    "auth/rescheduleBooking",
    async ({ bookingId, startDate, endDate }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.patch(
                `${BASE_URL}/auth/booking/${bookingId}/reschedule`,
                { startDate, endDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Failed to reschedule booking.");
        }
    }
);

export const fetchBookingDetails = createAsyncThunk(
    "auth/fetchBookingDetails",
    async (bookingId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${BASE_URL}/auth/booking/${bookingId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Failed to fetch booking details.");
        }
    }
);

// ─── Auth Slice ───────────────────────────────────────────────────────────────
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: localStorage.getItem("token") || null,
        profile: null,
        loading: false,
        profileLoading: false,
        updateLoading: false,
        updateSuccess: false,
        error: null,
        updateError: null,
        passwordLoading: false,
        passwordSuccess: false,
        passwordError: null,
        rescheduleLoading: false,
        rescheduleSuccess: false,
        rescheduleError: null,
        bookingDetails: null,
        bookingDetailsLoading: false,
        bookingDetailsError: null,
        credentials: null,
        credLoading: false,
        credError: null,
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.profile = null;
            state.error = null;
            localStorage.removeItem("token");
        },
        clearError(state) { state.error = null; },
        clearUpdateSuccess(state) { state.updateSuccess = false; state.updateError = null; },
        clearPasswordSuccess(state) { state.passwordSuccess = false; state.passwordError = null; },
        clearReschedule(state) { state.rescheduleSuccess = false; state.rescheduleError = null; },
        clearBookingDetails(state) {
            state.bookingDetails = null;
            state.bookingDetailsLoading = false;
            state.bookingDetailsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ── Login ──
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload?.user || null;
                state.token = action.payload?.token || null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Login failed.";
            })

            // ── Fetch Profile ──
            .addCase(fetchProfile.pending, (state) => { state.profileLoading = true; })
            // .addCase(fetchProfile.fulfilled, (state, action) => {
            //     state.profileLoading = false;
            //     state.profile = action.payload;
            // })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.profile = action.payload;
                state.user = action.payload?.data?.user || action.payload?.user || state.user;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.error = action.payload;
            })

            // ── Update Profile ──
            .addCase(updateProfile.pending, (state) => {
                state.updateLoading = true;
                state.updateSuccess = false;
                state.updateError = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.updateSuccess = true;
                // Profile update ke baad naya data save karo
                if (action.payload?.data?.user) {
                    state.profile = {
                        ...state.profile,
                        data: {
                            ...state.profile?.data,
                            user: action.payload.data.user,
                        },
                    };
                }
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload || "Update failed.";
            })

            // ── Change Password ──
            .addCase(changePassword.pending, (state) => {
                state.passwordLoading = true;
                state.passwordSuccess = false;
                state.passwordError = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.passwordLoading = false;
                state.passwordSuccess = true;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.passwordLoading = false;
                state.passwordError = action.payload || "Password change failed.";
            })

            // ── Reschedule Booking ──
            .addCase(rescheduleBooking.pending, (state) => {
                state.rescheduleLoading = true;
                state.rescheduleSuccess = false;
                state.rescheduleError = null;
            })
            .addCase(rescheduleBooking.fulfilled, (state) => {
                state.rescheduleLoading = false;
                state.rescheduleSuccess = true;
            })
            .addCase(rescheduleBooking.rejected, (state, action) => {
                state.rescheduleLoading = false;
                state.rescheduleError = action.payload || "Reschedule failed.";
            })

            // â”€â”€ Booking Details â”€â”€
            .addCase(fetchBookingDetails.pending, (state) => {
                state.bookingDetailsLoading = true;
                state.bookingDetailsError = null;
                state.bookingDetails = null;
            })
            .addCase(fetchBookingDetails.fulfilled, (state, action) => {
                state.bookingDetailsLoading = false;
                state.bookingDetails = action.payload;
            })
            .addCase(fetchBookingDetails.rejected, (state, action) => {
                state.bookingDetailsLoading = false;
                state.bookingDetailsError = action.payload || "Failed to load booking details.";
            })
    },
});

export const { logout, clearError, clearUpdateSuccess, clearPasswordSuccess, clearReschedule, clearBookingDetails } = authSlice.actions;
export default authSlice.reducer;
