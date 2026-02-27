import "./ContactUs.css";
import hero from "../../assets/6.jpeg";
import { FaPhoneAlt, FaEnvelope, FaBuilding } from "react-icons/fa";

export default function ContactUs() {
    return (
        <section className="contact-page">

            <div
                className="contact-hero"
                style={{ backgroundImage: `url(${hero})` }}
            >

                <div className="contact-hero-overlay">
                    <h1>Contact</h1>
                    <p>
                        Connect with us for more information about our
                        Caravan / Boat / Bus storage
                    </p>
                </div>

            </div>

            <div className="contact-intro">
                <h2>We'd Love to hear from you .</h2>
                <p>Or just reach out manually via info@mmmlogistics.com.au</p>

                <div className="contact-cards">

                    <div className="contact-card">
                        <div className="card-icon">
                            <FaPhoneAlt />
                        </div>
                        <h4>Call Us Directly</h4>
                        <p>Available during working hours</p>
                        <span>(02) 9855 000</span>
                    </div>

                    <div className="contact-card">
                        <div className="card-icon">
                            <FaEnvelope />
                        </div>
                        <h4>Email Support</h4>
                        <p>Our team can respond in real time</p>
                        <span>info@mmmlogistics.com.au</span>
                    </div>

                    <div className="contact-card">
                        <div className="card-icon">
                            <FaBuilding />
                        </div>
                        <h4>Visit Our Office</h4>
                        <p>Visit our location in real life</p>
                        <span>38A Sutherland Road, Sydney NSW 2147</span>
                    </div>

                </div>
            </div>

            <div className="contact-form-section">

                <h3>Let's Get In Touch</h3>

                <form className="contact-form">

                    <div className="form-row">
                        <input type="text" placeholder="Name" />
                        <input type="email" placeholder="Your Mail" />
                    </div>

                    <div className="form-row">
                        <input type="text" placeholder="Phone" />
                        <input type="text" placeholder="Weight, kg" />
                    </div>

                    <select>
                        <option>Select Service</option>
                        <option>Caravan Storage</option>
                    </select>

                    <textarea placeholder="Enter your message here..." />

                    <button type="submit">Send Request</button>

                </form>

            </div>

        </section>
    );
}