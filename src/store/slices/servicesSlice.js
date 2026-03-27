// src/store/slices/servicesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const BASE = "https://16.16.213.67.sslip.io/api/admin";
const BASE = "https://api.caravanstoragecentralcoast.com.au/"

const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { Authorization: `Bearer ${token}` };
};

// ─── Fetch All Services ───────────────────────────────────────────────────────
export const fetchServices = createAsyncThunk(
    "services/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE}/services`, {
                headers: getAuthHeader(),
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ─── Add New Service (POST multipart/form-data) ───────────────────────────────
export const addService = createAsyncThunk(
    "services/add",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/service`, formData, {
                headers: {
                    ...getAuthHeader(),
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ─── Update Service (PUT multipart/form-data) ─────────────────────────────────
export const updateService = createAsyncThunk(
    "services/update",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${BASE}/service/${id}`, formData, {
                headers: {
                    ...getAuthHeader(),
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const servicesSlice = createSlice({
    name: "services",
    initialState: {
        list: [],
        loading: false,
        error: null,
        adding: false,
        addError: null,
        updating: false,
        updateError: null,

        filterName: "",
        filterCategory: "",
        appliedName: "",
        appliedCategory: "",
    },

    reducers: {
        setFilterName(state, action) { state.filterName = action.payload; },
        setFilterCategory(state, action) { state.filterCategory = action.payload; },
        applyFilters(state) {
            state.appliedName = state.filterName;
            state.appliedCategory = state.filterCategory;
        },
        resetFilters(state) {
            state.filterName = ""; state.filterCategory = "";
            state.appliedName = ""; state.appliedCategory = "";
        },
        clearAddError(state) { state.addError = null; },
        clearUpdateError(state) { state.updateError = null; },

        deleteServiceLocal(state, action) {
            state.list = state.list.filter(s => s._id !== action.payload);
        },
        updateServiceLocal(state, action) {
            state.list = state.list.map(s =>
                s._id === action.payload._id ? { ...s, ...action.payload } : s
            );
        },
    },

    extraReducers: builder => {
        // ── Fetch All ──
        builder
            .addCase(fetchServices.pending, state => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchServices.fulfilled, (state, { payload }) => {
                state.loading = false;
                if (Array.isArray(payload)) state.list = payload;
                else if (Array.isArray(payload?.data)) state.list = payload.data;
                else if (Array.isArray(payload?.services)) state.list = payload.services;
                else state.list = [];
            })
            .addCase(fetchServices.rejected, (state, { payload }) => {
                state.loading = false; state.error = payload;
            });

        // ── Add New ──
        builder
            .addCase(addService.pending, state => {
                state.adding = true; state.addError = null;
            })
            .addCase(addService.fulfilled, (state, { payload }) => {
                state.adding = false;
                const newSvc = payload?.data || payload?.service || payload;
                if (newSvc && newSvc._id) state.list.unshift(newSvc);
            })
            .addCase(addService.rejected, (state, { payload }) => {
                state.adding = false; state.addError = payload;
            });

        // ── Update ──
        builder
            .addCase(updateService.pending, state => {
                state.updating = true; state.updateError = null;
            })
            .addCase(updateService.fulfilled, (state, { payload }) => {
                state.updating = false;
                const updated = payload?.data || payload?.service || payload;
                if (updated && updated._id) {
                    state.list = state.list.map(s =>
                        s._id === updated._id ? { ...s, ...updated } : s
                    );
                }
            })
            .addCase(updateService.rejected, (state, { payload }) => {
                state.updating = false; state.updateError = payload;
            });
    },
});

export const {
    setFilterName, setFilterCategory,
    applyFilters, resetFilters,
    clearAddError, clearUpdateError,
    deleteServiceLocal, updateServiceLocal,
} = servicesSlice.actions;

// ── Selectors ──
export const selectServicesLoading = s => s.services.loading;
export const selectServicesError = s => s.services.error;
export const selectAdding = s => s.services.adding;
export const selectAddError = s => s.services.addError;
export const selectUpdating = s => s.services.updating;
export const selectUpdateError = s => s.services.updateError;
export const selectFilterName = s => s.services.filterName;
export const selectFilterCategory = s => s.services.filterCategory;

export const selectCategories = state =>
    [...new Set(state.services.list.map(s => s.category).filter(Boolean))];

export const selectFilteredServices = state => {
    const { list, appliedName, appliedCategory } = state.services;
    return list.filter(svc => {
        const nameOk = appliedName
            ? (svc.serviceName || "").toLowerCase().includes(appliedName.toLowerCase())
            : true;
        const catOk = (!appliedCategory || appliedCategory === "All")
            ? true : svc.category === appliedCategory;
        return nameOk && catOk;
    });
};

export default servicesSlice.reducer;