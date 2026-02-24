import "./Hero.css";
import { Link } from "react-router-dom";
import image1 from "../../assets/3.jpeg";

export default function Hero() {
    return (
        <section className="hero">
            <div
                className="hero__bg"
                style={{ backgroundImage: `url(${image1})` }}
            />

            <div className="hero__overlay" />

            <div className="container hero__content">
                <div className="hero__text">

                    <h1 className="hero__title">
                        Secure Caravan & RV Storage on the Central Coast
                    </h1>

                    <p className="hero__subtitle">
                        Safe outdoor storage with 24/7 CCTV monitoring and easy access from
                        the Pacific Motorway. Flexible month-to-month terms.
                    </p>

                    <div className="hero__actions">
                        <Link to="/book-online" className="btn-primary">
                            Check Availability
                        </Link>

                        <a href="tel:0400000000" className="btn-outline hero__call">
                            Call Now
                        </a>
                    </div>

                    <div className="hero__trust">
                        <div>✓ Fully Fenced & Gated Facility</div>
                        <div>✓ Spacious Yard for Large Vans</div>
                        <div>✓ No Lock-In Contracts</div>
                        <div>✓ Easy Access 7 Days</div>
                    </div>

                </div>
            </div>
        </section>
    );
}