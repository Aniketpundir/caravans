import React from 'react'
import Hero from "../../Components/Hero/Hero"
import Features from "../../Components/Features/Features"
import Pricing from "../../Components/Pricing/Pricing"
import Stats from "../../Components/Stats/Stats"
import Testimonial from "../../Components/Testimonial/Testimonial"
import FindUs from "../../Components/FindUs/FindUs"
import InfoSection from '../../Components/InfoSection/InfoSection'


const Home = () => {
    return (
        <>
            <Hero />
            <InfoSection
                title="Family Owned & Operated"
                description="Our Central Coast caravan storage facility is proudly family owned and operated. We provide secure, monitored storage with 24/7 access and fully fenced perimeter protection."
                image="https://media.istockphoto.com/id/2205185029/photo/compact-gray-cargo-commercial-mini-vans-standing-in-row-on-industrial-warehouse-parking-lot.webp?a=1&b=1&s=612x612&w=0&k=20&c=fyjCKhzx4Eakv1JK6MotSSmDj6jLGGwO5hjaik53adM="
            />
            <InfoSection
                title="Family Owned & Operated"
                description="Our Central Coast caravan storage facility is proudly family owned and operated. We provide secure, monitored storage with 24/7 access and fully fenced perimeter protection."
                image="https://plus.unsplash.com/premium_photo-1770146771007-0870d1a2a72b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FyYXZhbnMlMjBzdG9yYWdlfGVufDB8fDB8fHww"
                reverse
            />
            <Features />
            <Pricing />
            <Stats />
            <Testimonial />
            <FindUs />
        </>
    )
}

export default Home