import React from 'react'
import "./ScrollText.css"
import { Link } from 'react-router-dom'

const ScrollText = () => {


    return (
        <>
            <div className='scroll-text'>
                <Link to="/book-online/book-online/book-online" className='scroll-quote .btn-primary'>
                    Book online here
                </Link>
                <marquee className="scroll-text-content" >Safe • Secure • Conveniently Located • Affordable • 24/7 Access • Fully Fenced • Monitored Facility</marquee>
            </div>
        </>
    )
}

export default ScrollText