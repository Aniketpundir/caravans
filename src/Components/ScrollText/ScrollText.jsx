import React from 'react'
import "./ScrollText.css"
import { Link } from 'react-router-dom'

const ScrollText = () => {
    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    };

    return (
        <>
            <div className='scroll-text'>
                <Link to="/book-online" onClick={() => { handleClick() }} className='scroll-quote .btn-primary'>
                    Book online here
                </Link>
                <marquee className="scroll-text-content" >Safe • Secure • Conveniently Located • Affordable • 24/7 Access • Fully Fenced • Monitored Facility</marquee>
            </div>
        </>
    )
}

export default ScrollText