import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitContactForm, resetContactState } from "../../store/slices/contactSlice";
import "./ContactUs.css";
import hero from "../../assets/6.jpeg";
import { FaPhoneAlt, FaEnvelope, FaBuilding } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

function validate({ name, email, phone, message }) {
    if (!name.trim()) return "Name is required.";
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return "Enter a valid email address.";
    if (!phone.trim()) return "Phone number is required.";
    if (!message.trim()) return "Message cannot be empty.";
    return "";
}

export default function ContactUs() {
    const dispatch = useDispatch();

    const { loading, successMsg, errorMsg } = useSelector((state) => state.contact);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [localError, setLocalError] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setLocalError("");
        if (successMsg || errorMsg) {
            dispatch(resetContactState());
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const err = validate(form);
        if (err) { setLocalError(err); return; }

        const result = await dispatch(submitContactForm(form));

        if (submitContactForm.fulfilled.match(result)) {
            setForm({ name: "", email: "", phone: "", message: "" });
            setLocalError("");
        }
    }

    return (
        <section className="contact-page">

            <Helmet><title>Contact us</title></Helmet>

            <div
                className="contact-hero"
                style={{ backgroundImage: `url(${hero})` }}
            >
                <div className="contact-hero-overlay">
                    <h1>Contact us</h1>
                    <p>
                        Connect with us for more information about our
                        Caravan / Boat / Bus storage
                    </p>
                </div>
                <img src={hero} alt="hero" className="mobile-hero-img" />
            </div>

            <div className="contact-intro">
                <div className="contact-cards">

                    <div className="contact-card">
                        <div className="card-icon"><FaPhoneAlt /></div>
                        <h4>Call Us Directly</h4>
                        <span><a href="tel:0412260525">0412 260 525 - Jimmy</a></span>
                        <span><a href="tel:0402438063">0402 438 063 - Sean</a></span>
                    </div>

                    <div className="contact-card">
                        <div className="card-icon"><FaEnvelope /></div>
                        <h4>Email Support</h4>
                        <span>
                            <a href="mailto:info@caravanstorage.com.au">
                                info@caravanstorage.com.au
                            </a>
                        </span>
                    </div>

                    <div className="contact-card">
                        <div className="card-icon"><FaBuilding /></div>
                        <h4>Visit Our</h4>
                        <h4>location in real life</h4>
                        <span>77 Lakes Rd, Tuggerah, NSW 2259</span>
                    </div>

                </div>
            </div>

            <div className="contact-form-section">
                <h3>Let's Get In Touch</h3>

                <form className="contact-form" onSubmit={handleSubmit} noValidate>

                    <div className="form-row">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Mail"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-row">
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <textarea
                        name="message"
                        placeholder="Enter your message here..."
                        value={form.message}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    {localError && (
                        <p className="form-error">{localError}</p>
                    )}

                    {errorMsg && !localError && (
                        <p className="form-error">{errorMsg}</p>
                    )}

                    {successMsg && (
                        <p className="form-success">✓ {successMsg}</p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? (
                            <><span className="btn-spinner" /> Sending…</>
                        ) : (
                            "Send Request"
                        )}
                    </button>

                </form>
            </div>

        </section>
    );
}