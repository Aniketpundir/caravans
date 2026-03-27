import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://api.caravanstoragecentralcoast.com.au";

export const submitContactForm = createAsyncThunk(
    "contact/submitForm",
    async ({ name, email, phone, message }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/api/user/contact`, {
                name,
                email,
                phone,
                message,
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Something went wrong. Please try again."
            );
        }
    }
);

const initialState = {
    loading: false,
    successMsg: "",
    errorMsg: "",
};

const contactSlice = createSlice({
    name: "contact",
    initialState,
    reducers: {
        resetContactState(state) {
            state.loading = false;
            state.successMsg = "";
            state.errorMsg = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitContactForm.pending, (state) => {
                state.loading = true;
                state.successMsg = "";
                state.errorMsg = "";
            })
            .addCase(submitContactForm.fulfilled, (state, action) => {
                state.loading = false;
                state.successMsg = action.payload?.message || "Your request has been sent successfully.";
            })
            .addCase(submitContactForm.rejected, (state, action) => {
                state.loading = false;
                state.errorMsg = action.payload;
            });
    },
});

export const { resetContactState } = contactSlice.actions;
export default contactSlice.reducer;