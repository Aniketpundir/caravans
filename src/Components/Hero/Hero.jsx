import "./Hero.css";
import { Link } from "react-router-dom";
import image1 from "../../assets/5.jpeg";

export default function Hero() {
    return (
        <section className="hero">

            {/* Background Image */}
            <div
                className="hero__bg"
                style={{ backgroundImage: `url(${image1})` }}
            />

            {/* Overlay (desktop only) */}
            <div className="hero__overlay" />

            {/* Content */}
            <div className="container hero__content">
                <div className="hero__text">

                    <h1 className="hero__title">
                        All you are looking for caravan storage on central coast?
                    </h1>

                    <div className="hero__actions">
                        <Link to="/book-online" className="btn-primary">
                            VIEW SERVICES
                        </Link>
                    </div>

                    <p className="hero__subtitle">
                        Safe, secure and conveniently located caravan storage that won't break the bank
                    </p>

                    {/* <div className="hero__trust">
                        <div>✓ Fully Fenced & Gated Facility</div>
                        <div>✓ Spacious Yard for Large Vans</div>
                        <div>✓ No Lock-In Contracts</div>
                        <div>✓ Easy Access 7 Days</div>
                    </div> */}

                </div>
            </div>

        </section>
    );
}