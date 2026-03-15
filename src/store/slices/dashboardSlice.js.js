import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function getDefaultRange() {
    const to = startOfDay(new Date());
    const from = new Date(to);
    from.setDate(to.getDate() - 6);
    return {
        from: from.toISOString(),
        to: to.toISOString(),
    };
}

const defaultRange = getDefaultRange();

// ── Helper: ISO string se YYYY-MM-DD ─────────────────────────────────────────
function toYMD(isoString) {
    return isoString.split("T")[0];
}

// ── Async Thunk: API hit karega ───────────────────────────────────────────────
export const fetchDashboardData = createAsyncThunk(
    "dashboard/fetchData",
    async ({ from, to }, { rejectWithValue }) => {
        const startDate = toYMD(from);
        const endDate = toYMD(to);

        const url = `http://16.16.213.67:4000/api/admin/dashboard/summary?startDate=${startDate}&endDate=${endDate}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error("❌ API Error:", err.message);
            return rejectWithValue(err.message);
        }
    }
);

// ── Thunk 2: Charts API ───────────────────────────────────────────────────────

export const fetchChartsData = createAsyncThunk(
    "dashboard/fetchChartsData",
    async ({ from, to }, { rejectWithValue }) => {
        const startDate = toYMD(from);
        const endDate = toYMD(to);
        const url = `http://16.16.213.67:4000/api/admin/dashboard/charts?startDate=${startDate}&endDate=${endDate}`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ── Thunk 3: Upcoming Appointments API ───────────────────────────────────────
export const fetchUpcomingAppointments = createAsyncThunk(
    "dashboard/fetchUpcomingAppointments",
    async (_, { rejectWithValue }) => {
        const url = `http://16.16.213.67:4000/api/admin/appointments/upcoming?limit=5`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error("❌ Upcoming Appointments API Error:", err.message);
            return rejectWithValue(err.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
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
        // Summary
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

        // Charts
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

        // Upcoming Appointments
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