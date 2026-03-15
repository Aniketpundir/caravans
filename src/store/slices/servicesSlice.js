import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://16.16.213.67:4000/api/admin";

/* ─────────────────────────────────────────────
   GET  –  fetch all services
───────────────────────────────────────────── */
export const fetchServices = createAsyncThunk(
    "services/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE}/services`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* ─────────────────────────────────────────────
   POST  –  add new service
   API expects multipart/form-data
   Fields (exact names from backend):
     serviceName, category, description,
     bufferTimeBefore, bufferTimeAfter,
     maxCapacity, unitDurationValue, unitDurationUnit,
     unitPrice, minDuration, maxDuration,
     minTimeBeforeBooking, minTimeBeforeReschedule, minTimeBeforeCancel,
     availabilityStartDate, availabilityExpirationDate,
     isDisabled, tax, image (file)
───────────────────────────────────────────── */
export const addService = createAsyncThunk(
    "services/add",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/service`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/* ─────────────────────────────────────────────
   SLICE
───────────────────────────────────────────── */
const servicesSlice = createSlice({
    name: "services",
    initialState: {
        list: [],
        loading: false,
        error: null,
        adding: false,       // POST loading
        addError: null,

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
        /* GET */
        builder
            .addCase(fetchServices.pending, state => { state.loading = true; state.error = null; })
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

        /* POST */
        builder
            .addCase(addService.pending, state => { state.adding = true; state.addError = null; })
            .addCase(addService.fulfilled, (state, { payload }) => {
                state.adding = false;
                // Add new service to top of list
                const newSvc = payload?.data || payload?.service || payload;
                if (newSvc && newSvc._id) state.list.unshift(newSvc);
            })
            .addCase(addService.rejected, (state, { payload }) => {
                state.adding = false; state.addError = payload;
            });
    },
});

export const {
    setFilterName, setFilterCategory,
    applyFilters, resetFilters,
    clearAddError,
    deleteServiceLocal, updateServiceLocal,
} = servicesSlice.actions;

/* ── SELECTORS ── */
export const selectServicesLoading = s => s.services.loading;
export const selectServicesError = s => s.services.error;
export const selectAdding = s => s.services.adding;
export const selectAddError = s => s.services.addError;
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