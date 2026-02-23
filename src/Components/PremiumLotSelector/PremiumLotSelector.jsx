import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./PremiumLotSelector.css";
import { Storecontext } from "../../Context/Storecontext";

const lots = [
    {
        id: "large",
        title: "Large Lot",
        size: "9m x 3m (27m²)",
        price: "$12",
        desc: "Ideal for large caravans and motorhomes.",
        recommended: true
    },
    {
        id: "medium",
        title: "Medium Lot",
        size: "7m x 3m (21m²)",
        price: "$9",
        desc: "Perfect for standard caravans.",
        recommended: false
    },
    {
        id: "small",
        title: "Small Lot",
        size: "6m x 3m (18m²)",
        price: "$7",
        desc: "Best suited for compact trailers.",
        recommended: false
    }
];

const PremiumLotSelector = () => {
    const [selected, setSelected] = useState("large");
    const { setSize } = useContext(Storecontext)

    return (
        <section className="lot-section">
            <div className="container">

                {/* Section Header */}
                <div className="lot-header">
                    <p className="lot-eyebrow">BOOK YOUR SPACE</p>
                    <h2 className="section-title">Choose the Right Parking Size</h2>
                    <p className="lot-sub">
                        Select the lot size that best fits your caravan. All bookings
                        require a minimum of 7 days and include 24/7 secure access.
                    </p>
                </div>

                {/* Cards */}
                <div className="lot-grid">
                    {lots.map((lot) => (
                        <div
                            key={lot.id}
                            className={`lot-card ${selected === lot.id ? "active" : ""
                                }`}
                            onClick={() => { setSize(lot.title), setSelected(lot.id) }}
                        >
                            {lot.recommended && (
                                <div className="lot-badge">Most Popular</div>
                            )}

                            <h3>{lot.title}</h3>
                            <p className="lot-size">{lot.size}</p>

                            <div className="lot-price">
                                <span>{lot.price}</span>
                                <small>/ day</small>
                            </div>

                            <p className="lot-desc">{lot.desc}</p>
                            <Link to="/book-online/reserve-section">
                                <div className="lot-select">
                                    {selected === lot.id ? "Selected ✓" : "Select Option"}
                                </div>
                            </Link>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PremiumLotSelector;