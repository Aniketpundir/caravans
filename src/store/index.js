import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "../store/slices/dashboardSlice.js";
import appointmentsReducer from "../store/slices/appointmentsSlice";
import customersReducer from "../store/slices/customersSlice";
import servicesReducer from "../store/slices/servicesSlice.js";
import authReducer from "../store/slices/authSlice.js"
import adminReducer from "./slices/adminSlice";

const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        appointments: appointmentsReducer,
        customers: customersReducer,
        services: servicesReducer,
        auth: authReducer,
        admin: adminReducer,
    },
});

export default store;
