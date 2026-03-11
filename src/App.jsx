import React, { useEffect } from 'react'
import AOS from "aos";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from './Components/Layout/Layout'
import Home from './Pages/Home/Home'
import CaravanStorageLogo from "./Components/CaravansLogo/CaravanStorageLogo"
import StoreContextProvider from './Context/Storecontext'
import ContactUs from './Pages/ContactUs/ContactUs';
import BookOnline from './Pages/BookOnline/BookOnline';
import MyBooking from './Pages/MyBooking/MyBooking';
import MyBookingsDashboard from './Components/Mybookingsdashboard/Mybookingsdashboard';

const App = () => {

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
      <StoreContextProvider>
        <Router>
          <Routes>
            <Route path='/logo' element={<CaravanStorageLogo size={80} />} />
            <Route path='/' element={<Layout />}>
              <Route index element={<Home />} />
              <Route path='/contact-us' element={<ContactUs />} />
              <Route path='/my-booking' element={<MyBooking />} />
              {/* <Route path='/my-booking-dashboard' element={<MyBookingsDashboard />} /> */}
              <Route path='/book-online' element={<BookOnline />} />
            </Route>

          </Routes>
        </Router>
      </StoreContextProvider>
    </>
  )
}

export default App