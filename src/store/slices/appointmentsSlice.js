// src/store/slices/appointmentsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://caravans-project.onrender.com/api";

const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { Authorization: `Bearer ${token}` };
};

// ─── Fetch All Appointments ───────────────────────────────────────────────────
export const fetchAppointments = createAsyncThunk(
    "appointments/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/appointments`, {
                headers: getAuthHeader(),
            });
            return response.data?.data ?? response.data ?? [];
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to fetch appointments."
            );
        }
    }
);

// ─── Update Appointment Status ────────────────────────────────────────────────
export const updateAppointmentStatus = createAsyncThunk(
    "appointments/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            await axios.patch(
                `${BASE_URL}/admin/appointments/${id}/status`,
                { status },
                { headers: getAuthHeader() }
            );
            return { id, status };
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to update status."
            );
        }
    }
);

// ─── Delete Appointment ───────────────────────────────────────────────────────
export const deleteAppointment = createAsyncThunk(
    "appointments/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/admin/appointments/${id}`, {
                headers: getAuthHeader(),
            });
            return id;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to delete appointment."
            );
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const appointmentsSlice = createSlice({
    name: "appointments",
    initialState: {
        data: [],
        loading: false,
        error: null,
        updateError: null,
        deleteError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ── Fetch All ──
            .addCase(fetchAppointments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAppointments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── Update Status ──
            .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
                const { id, status } = action.payload;
                const appt = state.data.find((a) => (a._id ?? a.id) === id);
                if (appt) appt.status = status;
            })
            .addCase(updateAppointmentStatus.rejected, (state, action) => {
                state.updateError = action.payload;
            })

            // ── Delete ──
            .addCase(deleteAppointment.fulfilled, (state, action) => {
                state.data = state.data.filter(
                    (a) => (a._id ?? a.id) !== action.payload
                );
            })
            .addCase(deleteAppointment.rejected, (state, action) => {
                state.deleteError = action.payload;
            });
    },
});

export default appointmentsSlice.reducer;