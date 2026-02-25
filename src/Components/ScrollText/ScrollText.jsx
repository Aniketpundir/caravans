import React from 'react'
import "./ScrollText.css"
import { Link } from 'react-router-dom'

const ScrollText = () => {
    return (
        <>
            <div className='scroll-text'>
                <Link className='scroll-quote .btn-primary'>
                    Book online here
                </Link>
                <marquee className="scroll-text-content" >Safe • Secure • Conveniently Located • Affordable • 24/7 Access • Fully Fenced • Monitored Facility</marquee>
                {/* <div>
                    <Link className='scroll-quote .btn-primary'>
                        Request A quote
                    </Link>
                </div> */}
            </div>
        </>
    )
}

export default ScrollText