import React, { useContext, useState } from "react";
import "./ReserveSection.css";
import { Storecontext } from "../../Context/Storecontext";

const ReserveSection = () => {
    const { size } = useContext(Storecontext);

    const PRICE_PER_DAY = 7;
    const TAX_RATE = 0.10;

    const [days, setDays] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const subtotal = days ? days * PRICE_PER_DAY : 0;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     setLoading(true);
    //     setSuccess(false);

    //     const formData = new FormData(e.target);

    //     const bookingData = {
    //         fullName: formData.get("fullName"),
    //         email: formData.get("email"),
    //         phoneCode: formData.get("phoneCode"),
    //         phone: formData.get("phone"),
    //         vehicleLength: formData.get("vehicleLength"),
    //         vehicleMake: formData.get("vehicleMake"),
    //         vehicleModel: formData.get("vehicleModel"),
    //         vehicleYear: formData.get("vehicleYear"),
    //         vehicleReg: formData.get("vehicleReg"),
    //         startDate: formData.get("startDate"),
    //         durationDays: days,
    //         findUs: formData.get("findUs"),
    //         size: size, // from context
    //         subtotal,
    //         tax,
    //         total
    //     };

    //     try {
    //         const response = await fetch("http://localhost:5000/api/bookings", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify(bookingData)
    //         });

    //         const data = await response.json();

    //         if (response.ok) {
    //             setSuccess(true);
    //             e.target.reset();
    //             setDays("");
    //         } else {
    //             alert(data.message || "Something went wrong");
    //         }

    //     } catch (error) {
    //         console.error(error);
    //         alert("Server error");
    //     }

    //     setLoading(false);
    // };
    return (
        <section className="premium-reserve">
            <div className="container premium-grid">

                {/* LEFT FORM */}
                <div className="premium-card">

                    <div className="card-header">
                        <span className="badge">SECURE BOOKING</span>
                        <h2>Reserve Your Storage Space</h2>
                    </div>

                    <form className="premium-form" /*onSubmit={handleSubmit}*/>

                        <div className="form-grid">
                            <div className="floating-group">
                                <input name="fullName" type="text" required />
                                <label>Full Name</label>
                            </div>

                            <div className="floating-group">
                                <input name="email" type="email" required />
                                <label>Email Address</label>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="phone-group">
                                <select name="phoneCode" className="country-code">
                                    <option value="+61">+61</option>
                                    <option value="+91">+91</option>
                                    <option value="+1">+1</option>
                                </select>
                                <input name="phone" type="text" placeholder="Phone Number" required />
                            </div>

                            <div className="floating-group">
                                <input name="vehicleLength" type="number" required />
                                <label>Vehicle Length (m)</label>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="floating-group">
                                <input name="vehicleMake" type="text" required />
                                <label>Vehicle Make</label>
                            </div>

                            <div className="floating-group">
                                <input name="vehicleModel" type="text" required />
                                <label>Vehicle Model</label>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="floating-group">
                                <input name="vehicleYear" type="number" required />
                                <label>Vehicle Built Year</label>
                            </div>

                            <div className="floating-group">
                                <input name="vehicleReg" type="text" required />
                                <label>Vehicle Registration</label>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="floating-group">
                                <input name="startDate" type="date" required />
                                <label className="active">Start Date</label>
                            </div>

                            <div className="floating-group">
                                <select
                                    value={days}
                                    onChange={(e) => setDays(Number(e.target.value))}
                                    required
                                >
                                    <option value="">Select Duration</option>
                                    <option value={7}>7 Days</option>
                                    <option value={14}>14 Days</option>
                                    <option value={30}>30 Days</option>
                                    <option value={60}>60 Days</option>
                                    <option value={90}>90 Days</option>
                                </select>
                                <label className="active">Storage Duration</label>
                            </div>
                        </div>

                        <div className="floating-group full">
                            <select name="findUs" required>
                                <option value="">Select Option</option>
                                <option>Google</option>
                                <option>Flyer</option>
                                <option>Word of Mouth</option>
                                <option>Coast Community News</option>
                            </select>
                            <label>How did you find us?</label>
                        </div>

                        <div className="price-box">
                            <div className="price-row">
                                <span>Price per day</span>
                                <span>${PRICE_PER_DAY}</span>
                            </div>

                            <div className="price-row">
                                <span>Days Selected</span>
                                <span>{days}</span>
                            </div>

                            <div className="price-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            <div className="price-row">
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>

                            <div className="price-total">
                                <span>Total Amount</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="terms-check">
                            <input type="checkbox" required />
                            <span>I agree to Terms & Conditions</span>
                        </div>

                        <button className="premium-btn" disabled={loading}>
                            {loading ? "Processing..." : "Reserve My Spot"}
                        </button>

                        {success && <p style={{ color: "green" }}>Booking Submitted Successfully!</p>}

                    </form>
                </div>

                {/* RIGHT SIDE */}
                <div className="premium-right">

                    <div className="image-card">
                        <img
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                            alt="Caravan Storage"
                        />
                        <div className="image-content">
                            <span className="rating">⭐ Premium Rated</span>
                            <h3>Australia’s Most Trusted Caravan Storage</h3>
                            <p>Secure, accessible and purpose-built for caravan owners.</p>
                        </div>
                    </div>

                    <div className="benefits">

                        <div className="benefit-item">
                            <div className="icon">🛡</div>
                            <div>
                                <h4>24/7 Monitored CCTV</h4>
                                <p>Round-the-clock high-definition surveillance.</p>
                            </div>
                        </div>

                        <div className="benefit-item">
                            <div className="icon">🚐</div>
                            <div>
                                <h4>Wide Access Lanes</h4>
                                <p>Designed for easy reversing and maneuvering.</p>
                            </div>
                        </div>

                        <div className="benefit-item">
                            <div className="icon">✔</div>
                            <div>
                                <h4>Fully Insured Facility</h4>
                                <p>Meets Australian compliance & safety standards.</p>
                            </div>
                        </div>

                        <div className="benefit-item">
                            <div className="icon">📍</div>
                            <div>
                                <h4>Prime Tuggerah Location</h4>
                                <p>Quick access to major highways for weekend getaways.</p>
                            </div>
                        </div>

                    </div>

                    <div className="social-proof">
                        👥 Join <strong>500+ happy caravan owners</strong> storing safely with us.
                    </div>

                </div>

            </div>
        </section>
    );
};

export default ReserveSection;