import React from 'react'
import Navbar from "../../Components/Navbar/Navbar"
import Hero from "../../Components/Hero/Hero"
import Features from "../../Components/Features/Features"
import Pricing from "../../Components/Pricing/Pricing"
import Stats from "../../Components/Stats/Stats"
import Testimonial from "../../Components/Testimonial/Testimonial"
import FindUs from "../../Components/FindUs/FindUs"
import Footer from "../../Components/Footer/Footer"


const Home = () => {
    return (
        <>
            <Hero />
            <Features />
            <Pricing />
            <Stats />
            <Testimonial />
            <FindUs />
        </>
    )
}

export default Home