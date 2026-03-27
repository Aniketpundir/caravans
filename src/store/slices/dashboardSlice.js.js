// src/store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const BASE_URL = "https://16.16.213.67.sslip.io/api";
const BASE_URL = "https://api.caravanstoragecentralcoast.com.au/"

const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { Authorization: `Bearer ${token}` };
};

function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function getDefaultRange() {
    const from = startOfDay(new Date());
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return {
        from: from.toISOString(),
        to: to.toISOString(),
    };
}

const defaultRange = getDefaultRange();

function toYMD(isoString) {
    return isoString.split("T")[0];
}

// ─── Fetch Dashboard Summary ──────────────────────────────────────────────────
export const fetchDashboardData = createAsyncThunk(
    "dashboard/fetchData",
    async ({ from, to }, { rejectWithValue }) => {
        const startDate = toYMD(from);
        const endDate = toYMD(to);
        try {
            const response = await axios.get(
                `${BASE_URL}/admin/dashboard/summary?startDate=${startDate}&endDate=${endDate}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to fetch dashboard data."
            );
        }
    }
);

// ─── Fetch Charts Data ────────────────────────────────────────────────────────
export const fetchChartsData = createAsyncThunk(
    "dashboard/fetchChartsData",
    async ({ from, to }, { rejectWithValue }) => {
        const startDate = toYMD(from);
        const endDate = toYMD(to);
        try {
            const response = await axios.get(
                `${BASE_URL}/admin/dashboard/charts?startDate=${startDate}&endDate=${endDate}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to fetch charts data."
            );
        }
    }
);

// ─── Fetch Upcoming Appointments ──────────────────────────────────────────────
export const fetchUpcomingAppointments = createAsyncThunk(
    "dashboard/fetchUpcomingAppointments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/admin/appointments/upcoming?limit=5`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to fetch upcoming appointments."
            );
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
        from: defaultRange.from,
        to: defaultRange.to,

        // Summary
        data: null,
        loading: false,
        error: null,

        // Charts
        chartsData: null,
        chartsLoading: false,
        chartsError: null,

        // Upcoming Appointments
        upcomingData: null,
        upcomingLoading: false,
        upcomingError: null,
    },
    reducers: {
        setDateRange(state, action) {
            state.from = action.payload.from;
            state.to = action.payload.to;
        },
    },
    extraReducers: (builder) => {
        // ── Summary ──
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── Charts ──
        builder
            .addCase(fetchChartsData.pending, (state) => {
                state.chartsLoading = true;
                state.chartsError = null;
            })
            .addCase(fetchChartsData.fulfilled, (state, action) => {
                state.chartsLoading = false;
                state.chartsData = action.payload;
            })
            .addCase(fetchChartsData.rejected, (state, action) => {
                state.chartsLoading = false;
                state.chartsError = action.payload;
            });

        // ── Upcoming Appointments ──
        builder
            .addCase(fetchUpcomingAppointments.pending, (state) => {
                state.upcomingLoading = true;
                state.upcomingError = null;
            })
            .addCase(fetchUpcomingAppointments.fulfilled, (state, action) => {
                state.upcomingLoading = false;
                state.upcomingData = action.payload;
            })
            .addCase(fetchUpcomingAppointments.rejected, (state, action) => {
                state.upcomingLoading = false;
                state.upcomingError = action.payload;
            });
    },
});

export const { setDateRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;
