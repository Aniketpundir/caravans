import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://16.16.213.67.sslip.io/api";

const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { Authorization: `Bearer ${token}` };
};

export const fetchPayments = createAsyncThunk(
    "payments/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/payments`, {
                headers: getAuthHeader(),
                params,
            });
            return response.data?.data ?? response.data ?? [];
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to fetch payments."
            );
        }
    }
);

export const updatePaymentStatus = createAsyncThunk(
    "payments/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            await axios.patch(
                `${BASE_URL}/admin/payments/${id}/status`,
                { status },
                { headers: getAuthHeader() }
            );
            return { id, status };
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to update payment status."
            );
        }
    }
);

const paymentsSlice = createSlice({
    name: "payments",
    initialState: {
        data: [],
        loading: false,
        error: null,
        updateError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updatePaymentStatus.fulfilled, (state, action) => {
                const { id, status } = action.payload;
                const payment = state.data.find((item) => (item._id ?? item.id) === id);
                if (payment) payment.status = status;
            })
            .addCase(updatePaymentStatus.rejected, (state, action) => {
                state.updateError = action.payload;
            });
    },
});

export default paymentsSlice.reducer;
