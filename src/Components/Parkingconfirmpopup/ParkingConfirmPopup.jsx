import React, { useState } from "react";
import "./ParkingConfirmPopup.css";
import { useNavigate } from "react-router-dom";

const ParkingConfirmPopup = () => {
    const [isOpen, setIsOpen] = useState(true)
    const navigate = useNavigate();

    if (!isOpen) return null;
    return (
        <div className="pcp-overlay">
            <div className="pcp-box">
                <div className="pcp-icon">
                    <svg
                        width="56"
                        height="56"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Body */}
                        <path
                            d="M4 22C4 19.7909 5.79086 18 8 18H42C44.2091 18 46 19.7909 46 22V40C46 41.1046 45.1046 42 44 42H6C4.89543 42 4 41.1046 4 40V22Z"
                            fill="#1B3A6B"
                        />
                        {/* Rounded front nose */}
                        <path
                            d="M46 24H54C56.2091 24 58 25.7909 58 28V38C58 40.2091 56.2091 42 54 42H46V24Z"
                            fill="#5AB4EA"
                        />
                        {/* Window - body */}
                        <rect x="10" y="23" width="10" height="8" rx="1.5" fill="#EAF6FD" />
                        <rect x="24" y="23" width="10" height="8" rx="1.5" fill="#EAF6FD" />
                        {/* Window - nose */}
                        <rect x="48.5" y="27" width="7" height="7" rx="1.5" fill="#0B1E3A" />
                        {/* Door */}
                        <rect x="38" y="30" width="6" height="12" rx="1" fill="#0B1E3A" />
                        {/* Stripe */}
                        <rect x="4" y="34" width="54" height="3" fill="#5AB4EA" />
                        {/* Wheels */}
                        <circle cx="16" cy="44" r="6" fill="#0B1E3A" />
                        <circle cx="16" cy="44" r="2.4" fill="#EAF6FD" />
                        <circle cx="46" cy="44" r="6" fill="#0B1E3A" />
                        <circle cx="46" cy="44" r="2.4" fill="#EAF6FD" />
                        {/* Ground shadow */}
                        <ellipse cx="31" cy="52" rx="26" ry="2.2" fill="#1B3A6B" opacity="0.15" />
                    </svg>
                </div>

                <h2 className="pcp-title">If your caravan is already parked, click "Yes"; otherwise, click "No" to create a new booking.</h2>
                <div className="pcp-actions">
                    <button className="pcp-btn pcp-btn-yes" onClick={() => { navigate("/my-booking"), setIsOpen(false) }}>
                        Yes
                    </button>
                    <button className="pcp-btn pcp-btn-no" onClick={() => { navigate("/book-online/"), setIsOpen(false) }}>
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParkingConfirmPopup;