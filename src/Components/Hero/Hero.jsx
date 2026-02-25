import "./Hero.css";
import { Link } from "react-router-dom";
import image1 from "../../assets/5.jpeg";

export default function Hero() {
    return (
        <section className="hero">

            <div
                className="hero__bg"
                style={{ backgroundImage: `url(${image1})` }}
            />

            <div className="container hero__content">
                <div className="hero__text">

                    <h1 className="hero__title">
                        Are you looking for caravan storage on Central Coast?
                    </h1>

                    <div className="hero__actions">
                        <Link to="/book-online" className="btn-primary">
                            View Options
                        </Link>
                    </div>

                </div>
            </div>

            {/* Scrolling Line */}
            <div className="hero__scroll">
                <div className="scroll__text">
                    Safe • Secure • Conveniently Located • Affordable • 24/7 Access • Fully Fenced • Monitored Facility •
                </div>
            </div>

        </section>
    );
}