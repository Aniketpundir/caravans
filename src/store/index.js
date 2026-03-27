import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "../store/slices/dashboardSlice.js";
import appointmentsReducer from "../store/slices/appointmentsSlice";
import couponsReducer from "../store/slices/couponsSlice";
import customersReducer from "../store/slices/customersSlice";
import paymentsReducer from "../store/slices/paymentsSlice";
import servicesReducer from "../store/slices/servicesSlice.js";
import authReducer from "../store/slices/authSlice.js"
import adminReducer from "./slices/adminSlice";
import passwordReducer from "./slices/PasswordSlice.js";
import contactReducer from "./slices/contactSlice.js"


const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        appointments: appointmentsReducer,
        coupons: couponsReducer,
        customers: customersReducer,
        payments: paymentsReducer,
        services: servicesReducer,
        auth: authReducer,
        admin: adminReducer,
        password: passwordReducer,
        contact: contactReducer,
    },
});

export default store;
