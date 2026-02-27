import "./Hero.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import image1 from "../../assets/5.jpeg";
import image2 from "../../assets/4.jpeg";

export default function Hero() {

    const images = [image1, image2];
    const [current, setCurrent] = useState(0);

    // Auto slide every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero">

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

            {/* Slider Background */}
            <div
                className="hero__bg"
                style={{ backgroundImage: `url(${images[current]})` }}
            />
        </section>
    );
}