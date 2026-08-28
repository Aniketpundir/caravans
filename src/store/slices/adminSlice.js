import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const BASE_URL = "https://16.16.213.67.sslip.io/api";
const BASE_URL = "https://api.caravanstoragecentralcoast.com.au/api";

const ADMIN_TOKEN_MAX_AGE_MS = 6 * 24 * 60 * 60 * 1000;

const decodeJwtPayload = (token) => {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, "=");
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

const clearAdminTokenData = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminTokenCreatedAt");
    localStorage.removeItem("adminTokenExpiresAt");
};

const setAdminTokenWithExpiry = (token) => {
    const now = Date.now();
    const payload = decodeJwtPayload(token);
    const jwtExpiry = payload?.exp ? payload.exp * 1000 : null;
    const maxExpiry = now + ADMIN_TOKEN_MAX_AGE_MS;
    const expiryTime = jwtExpiry ? Math.min(jwtExpiry, maxExpiry) : maxExpiry;

    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminTokenCreatedAt", now.toString());
    localStorage.setItem("adminTokenExpiresAt", expiryTime.toString());
};

export const getValidAdminToken = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return null;

    const storedExpiry = Number(localStorage.getItem("adminTokenExpiresAt"));
    const storedCreatedAt = Number(localStorage.getItem("adminTokenCreatedAt"));
    const payload = decodeJwtPayload(token);
    if (!payload && !storedExpiry) {
        clearAdminTokenData();
        return null;
    }

    const jwtExpiry = payload?.exp ? payload.exp * 1000 : null;
    const tokenIssuedAt = payload?.iat ? payload.iat * 1000 : null;
    const sixDayExpiry = (storedCreatedAt || tokenIssuedAt)
        ? (storedCreatedAt || tokenIssuedAt) + ADMIN_TOKEN_MAX_AGE_MS
        : null;
    const expiryCandidates = [storedExpiry, jwtExpiry, sixDayExpiry].filter(Boolean);

    if (expiryCandidates.length === 0) {
        clearAdminTokenData();
        return null;
    }

    if (Date.now() > Math.min(...expiryCandidates)) {
        clearAdminTokenData();
        return null;
    }

    return token;
};

export const adminLoginUser = createAsyncThunk(
    "admin/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/admin/auth/login`, {
                loginId: email,
                password: password,
            });
            const data = response.data;
            if (data?.token) setAdminTokenWithExpiry(data.token);
            return data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Invalid credentials. Please try again."
            );
        }
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        admin: null,
        token: getValidAdminToken(),
        loading: false,
        error: null,
    },
    reducers: {
        adminLogout(state) {
            state.admin = null;
            state.token = null;
            state.error = null;
            clearAdminTokenData();
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
