import React from 'react'
import "./ScrollText.css"
import { Link } from 'react-router-dom'

const ScrollText = () => {
    return (
        <>
            <div className='scroll-text'>
                <marquee className="scroll-text-content" >Providing Safe, Secure and Professionally Managed Caravan Storage with 24/7 Surveillance and Easy Access</marquee>
                <div>
                    <Link className='scroll-quote btn-primary'>
                        Request A quote
                    </Link>
                </div>
            </div>
        </>
    )
}

export default ScrollText