// src/store/slices/customersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://16.16.213.67.sslip.io/api";

const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { Authorization: `Bearer ${token}` };
};

// ─── Fetch All Customers ──────────────────────────────────────────────────────
export const fetchCustomers = createAsyncThunk(
    "customers/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/customers`, {
                headers: getAuthHeader(),
            });
            return response.data?.data ?? response.data ?? [];
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to fetch customers."
            );
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const customersSlice = createSlice({
    name: "customers",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default customersSlice.reducer;