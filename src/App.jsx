import React, { useEffect } from 'react'
import AOS from "aos";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { HelmetProvider } from 'react-helmet-async';
import Layout from './Components/Layout/Layout'
import Home from './Pages/Home/Home'
import CaravanStorageLogo from "./Components/CaravansLogo/CaravanStorageLogo"
import ContactUs from './Pages/ContactUs/ContactUs';
import BookOnline from './Pages/BookOnline/BookOnline';
import MyBooking from './Pages/MyBooking/MyBooking';
import Dashboard from './Components/Admin_Panel/Dashboard/Dashboard';
import AdminLayout from './Components/Admin_Panel/AdminLayout/AdminLayout';
import Appointments from './Components/Admin_Panel/Appointments/Appointments';
import ManagePayments from './Components/Admin_Panel/Managepayments/Managepayments';
import ManageCustomers from './Components/Admin_Panel/ManageCustomers/ManageCustomers';
import ManageServices from './Components/Admin_Panel/ManageServices/ManageServices';
import CouponManagement from './Components/Admin_Panel/CouponManagement/CouponManagement';
import Reports from './Components/Admin_Panel/Reports/Reports';
import MyBookingsDashboard from './Components/MyBookingsDashboard/MyBookingsDashboard';
import PaymentFailed from './Components/Paymentfailed/Paymentfailed';
import PaymentSuccess from './Components/Paymentsuccess/Paymentsuccess';
import AdminLogin from './Components/Admin_Panel/AdminLogin/AdminLogin';
import TermsAndConditions from './Components/TermsAndConditions/TermsAndConditions';
import ForgotPassword from './Components/ForgotPassword/ForgotPassword';
import { checkTokenExpiry, fetchProfile } from "./store/slices/authSlice"
import { useDispatch } from "react-redux";

const App = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(checkTokenExpiry());
    }, 10 * 1000); // har 10 second check karega

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchProfile());
    }
  }, [token, dispatch]);

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 600,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);



  return (
    <>
      <HelmetProvider>
        <Router>
          <Routes>
            <Route path='/admin-login' element={<AdminLogin />} />
            <Route path='/admin-dashboard' element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path='/admin-dashboard/appointments' element={<Appointments />} />
              <Route path='/admin-dashboard/payments' element={<ManagePayments />} />
              <Route path='/admin-dashboard/customers' element={<ManageCustomers />} />
              <Route path='/admin-dashboard/service' element={<ManageServices />} />
              <Route path='/admin-dashboard/coupan' element={<CouponManagement />} />
              <Route path='/admin-dashboard/report' element={<Reports />} />
            </Route>


            <Route path='/logo' element={<CaravanStorageLogo size={80} />} />
            <Route path='/' element={<Layout />}>
              <Route index element={<Home />} />
              <Route path='contact/' element={<ContactUs />} />
              <Route path='/my-booking' element={<MyBooking />} />
              <Route path='/my-booking-dashboard' element={<MyBookingsDashboard />} />
              <Route path='/book-online' element={<BookOnline />} />
              <Route path='/payment-failed' element={<PaymentFailed />} />
              <Route path='/payment-success' element={<PaymentSuccess />} />
              <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
            </Route>

          </Routes>
        </Router>
      </HelmetProvider>
    </>
  )
}

export default App