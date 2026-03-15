import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAppointments = createAsyncThunk(
    "appointments/fetchAll",
    async (_, { rejectWithValue }) => {
        const url = `http://16.16.213.67:4000/api/admin/appointments`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const json = await res.json();
            return json?.data ?? json ?? [];
        } catch (err) {
            console.error("❌ Error:", err.message);
            return rejectWithValue(err.message);
        }
    }
);

export const updateAppointmentStatus = createAsyncThunk(
    "appointments/updateStatus",
    async ({ id, status }) => {
        try {
            await fetch(
                `http://16.16.213.67:4000/api/admin/appointments/${id}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status }),
                }
            );
        } catch (err) {
            console.error("Status update error:", err.message);
        }
        return { id, status };
    }
);

export const deleteAppointment = createAsyncThunk(
    "appointments/delete",
    async (id, { rejectWithValue }) => {
        try {
            await fetch(
                `http://16.16.213.67:4000/api/admin/appointments/${id}`,
                { method: "DELETE" }
            );
            return id;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);



const appointmentsSlice = createSlice({
    name: "appointments",
    initialState: { data: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
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
            .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
                const { id, status } = action.payload;
                const appt = state.data.find((a) => (a._id ?? a.id) === id);
                if (appt) appt.status = status;
            })
            .addCase(deleteAppointment.fulfilled, (state, action) => {
                state.data = state.data.filter(
                    (a) => (a._id ?? a.id) !== action.payload
                );
            });
    },
});

export default appointmentsSlice.reducer;