import React, { useEffect } from 'react'
import AOS from "aos";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from './Components/Layout/Layout'
import Home from './Pages/Home/Home'
import PremiumLotSelector from './Components/PremiumLotSelector/PremiumLotSelector'
import ReserveSection from "./Components/ReserveSection/ReserveSection"
import CaravanStorageLogo from "./Components/CaravansLogo/CaravanStorageLogo"
import StoreContextProvider from './Context/Storecontext'
import ContactUs from './Pages/ContactUs/ContactUs';

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
              <Route path='/book-online' element={<PremiumLotSelector />} />
              <Route path='/book-online/reserve-section' element={<ReserveSection />} />
            </Route>
          </Routes>
        </Router>
      </StoreContextProvider>
    </>
  )
}

export default App