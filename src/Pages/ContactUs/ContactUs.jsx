import "./ContactUs.css";
import hero from "../../assets/6.jpeg";
import { FaPhoneAlt, FaEnvelope, FaBuilding } from "react-icons/fa";

export default function ContactUs() {
    return (
        <section className="contact-page">

            {/* HERO SECTION */}

            <div
                className="contact-hero"
                style={{ backgroundImage: `url(${hero})` }}
            >

                <div className="contact-hero-overlay">
                    <h1>Contact US</h1>
                    <p>
                        Connect with us for more information about our
                        Caravan / Boat / Bus storage
                    </p>
                </div>

                {/* image for tablet/mobile */}
                <img src={hero} alt="hero" className="mobile-hero-img" />

            </div>

            {/* CONTACT INTRO */}

            <div className="contact-intro">

                {/* <h2>We'd Love to hear from you.</h2>
                <p>Or just reach out manually via</p> */}

                <div className="contact-cards">

                    <div className="contact-card">
                        <div className="card-icon">
                            <FaPhoneAlt />
                        </div>
                        <h4>Call Us Directly</h4>
                        <span> Jimmy - 0412 260 525</span>
                        <span> Sean - 0402 438 063</span>
                    </div>

                    <div className="contact-card">
                        <div className="card-icon">
                            <FaEnvelope />
                        </div>
                        <h4>Email Support</h4>
                        {/* <p>Our team can respond in real time</p> */}
                        <span>info@caravanstorage.com.au</span>
                    </div>

                    <div className="contact-card">
                        <div className="card-icon">
                            <FaBuilding />
                        </div>
                        <h4>Visit Our</h4>
                        <h4>location in real life</h4>
                        <span>77 Lakes Rd, Tuggerah, NSW 2259</span>
                    </div>

                </div>

            </div>

            {/* CONTACT FORM */}

            <div className="contact-form-section">

                <h3>Let's Get In Touch</h3>

                <form className="contact-form">

                    <div className="form-row">
                        <input type="text" placeholder="Name" />
                        <input type="email" placeholder="Your Mail" />
                    </div>

                    <div className="form-row">
                        <input type="text" placeholder="Phone" />
                    </div>

                    <textarea placeholder="Enter your message here..." />

                    <button type="submit">Send Request</button>

                </form>

            </div>

        </section>
    );
}