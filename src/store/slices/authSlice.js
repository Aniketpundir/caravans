import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const BASE_URL = "http://localhost:4000/api";

const BASE_URL = "http://16.16.213.67:4000/api"

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
            if (data?.token) localStorage.setItem("token", data.token);
            return data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Invalid email or password.");
        }
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
            const response = await axios.post(
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
            console.log(response)
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Failed to reschedule booking.");
        }
    }
);

// // ─── Reschedule Booking ──────────────────────────────────────────────────────
// export const rescheduleBooking = createAsyncThunk(
//     "auth/rescheduleBooking",
//     async ({ bookingId, startDate, endDate }, { rejectWithValue }) => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.patch(
//                 `${BASE_URL}/auth/booking/${bookingId}/reschedule`,
//                 { startDate, endDate },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(error?.response?.data?.message || "Failed to reschedule booking.");
//         }
//     }
// );

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
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.profile = action.payload;
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
            });
    },
});

export const { logout, clearError, clearUpdateSuccess, clearPasswordSuccess, clearReschedule } = authSlice.actions;
export default authSlice.reducer;