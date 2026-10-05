// src/store/slices/customersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const BASE_URL = "https://16.16.213.67.sslip.io/api";
const BASE_URL = "https://api.caravanstoragecentralcoast.com.au/api"
// const BASE_URL = "http://localhost:4000/api"

const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { Authorization: `Bearer ${token}` };
};

// ─── Fetch All Customers ──────────────────────────────────────────────────────
export const fetchCustomers = createAsyncThunk(
    "customers/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/customers`, {
                headers: getAuthHeader(),
                params,
            });
            return response.data?.data ?? response.data ?? [];
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to fetch customers."
            );
        }
    }
);

// ─── Fetch Single Customer Details ────────────────────────────────────────────
export const fetchCustomerDetails = createAsyncThunk(
    "customers/fetchDetails",
    async (customerId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/customers/${customerId}`, {
                headers: getAuthHeader(),
            });
            return response.data?.data ?? response.data ?? null;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to fetch customer details."
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
        // 👇 Single customer details (for popup)
        details: null,
        detailsLoading: false,
        detailsError: null,
    },
    reducers: {
        // 👇 Popup band karte waqt state clear karne ke liye
        clearCustomerDetails(state) {
            state.details = null;
            state.detailsLoading = false;
            state.detailsError = null;
        },
    },
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
            })

            // ── Fetch Single Customer Details ──
            .addCase(fetchCustomerDetails.pending, (state) => {
                state.detailsLoading = true;
                state.detailsError = null;
            })
            .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.details = action.payload;
            })
            .addCase(fetchCustomerDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.detailsError = action.payload;
            });
    },
});

export const { clearCustomerDetails } = customersSlice.actions;
export default customersSlice.reducer;