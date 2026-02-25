import React from 'react'
import Hero from "../../Components/Hero/Hero"
import ScrollText from "../../Components/ScrollText/ScrollText"
import Features from "../../Components/Features/Features"
import Pricing from "../../Components/Pricing/Pricing"
import Stats from "../../Components/Stats/Stats"
import FindUs from "../../Components/FindUs/FindUs"
import InfoSection from '../../Components/InfoSection/InfoSection'
import image1 from "../../assets/3.jpeg"


const Home = () => {
    return (
        <>
            <Hero />
            <ScrollText />
            <InfoSection
                title="All Caravan Sizes Catered For"
                description="Pricing from $7 per m² per month (ex GST)"
                image={image1}
            />
            <Features />
            <Pricing />
            <Stats />
            <FindUs />
        </>
    )
}

export default Home