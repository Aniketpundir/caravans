import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://16.16.213.67.sslip.io/api";

// ─── Admin Login ──────────────────────────────────────────────────────────────
export const adminLoginUser = createAsyncThunk(
    "admin/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/admin/auth/login`, {
                loginId: email,
                password: password,
            });
            const data = response.data;
            if (data?.token) localStorage.setItem("adminToken", data.token);
            return data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Invalid credentials. Please try again."
            );
        }
    }
);

// ─── Admin Slice ──────────────────────────────────────────────────────────────
const adminSlice = createSlice({
    name: "admin",
    initialState: {
        admin: null,
        token: localStorage.getItem("adminToken") || null,
        loading: false,
        error: null,
    },
    reducers: {
        adminLogout(state) {
            state.admin = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem("adminToken");
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(adminLoginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminLoginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload?.token || null;
                state.admin = action.payload?.admin || null;
            })
            .addCase(adminLoginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Login failed.";
            });
    },
});

export const { adminLogout, clearError } = adminSlice.actions;
export default adminSlice.reducer;