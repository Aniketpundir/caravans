import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://16.16.213.67.sslip.io/api";

const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { Authorization: `Bearer ${token}` };
};

export const fetchCoupons = createAsyncThunk(
    "coupons/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/coupon`, {
                headers: getAuthHeader(),
                params,
            });
            return response.data?.data ?? [];
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to fetch coupons."
            );
        }
    }
);

export const addCoupon = createAsyncThunk(
    "coupons/add",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/admin/coupon`, payload, {
                headers: getAuthHeader(),
            });
            return response.data?.data;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to add coupon."
            );
        }
    }
);

export const updateCoupon = createAsyncThunk(
    "coupons/update",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/admin/coupon/${id}`, payload, {
                headers: getAuthHeader(),
            });
            return response.data?.data;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to update coupon."
            );
        }
    }
);

export const deleteCoupon = createAsyncThunk(
    "coupons/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/admin/coupon/${id}`, {
                headers: getAuthHeader(),
            });
            return id;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || "Failed to delete coupon."
            );
        }
    }
);

const couponsSlice = createSlice({
    name: "coupons",
    initialState: {
        data: [],
        loading: false,
        error: null,
        saving: false,
        saveError: null,
        deleting: false,
        deleteError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoupons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addCoupon.pending, (state) => {
                state.saving = true;
                state.saveError = null;
            })
            .addCase(addCoupon.fulfilled, (state, action) => {
                state.saving = false;
                if (action.payload?._id) state.data.unshift(action.payload);
            })
            .addCase(addCoupon.rejected, (state, action) => {
                state.saving = false;
                state.saveError = action.payload;
            })
            .addCase(updateCoupon.pending, (state) => {
                state.saving = true;
                state.saveError = null;
            })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                state.saving = false;
                const updated = action.payload;
                if (updated?._id) {
                    state.data = state.data.map((coupon) =>
                        coupon._id === updated._id ? updated : coupon
                    );
                }
            })
            .addCase(updateCoupon.rejected, (state, action) => {
                state.saving = false;
                state.saveError = action.payload;
            })
            .addCase(deleteCoupon.pending, (state) => {
                state.deleting = true;
                state.deleteError = null;
            })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.deleting = false;
                state.data = state.data.filter((coupon) => coupon._id !== action.payload);
            })
            .addCase(deleteCoupon.rejected, (state, action) => {
                state.deleting = false;
                state.deleteError = action.payload;
            });
    },
});

export default couponsSlice.reducer;
