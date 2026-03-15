import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchCustomers = createAsyncThunk(
    "customers/fetchAll",
    async (_, { rejectWithValue }) => {
        const url = `https://caravans-project.onrender.com/api/admin/customers`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const json = await res.json();
            return json?.data ?? json ?? [];
        } catch (err) {
            console.error("❌ Customers Error:", err.message);
            return rejectWithValue(err.message);
        }
    }
);

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