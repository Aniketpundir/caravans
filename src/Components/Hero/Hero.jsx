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

    const nextSlide = () => {
        setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

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

            {/* Arrows */}
            <button className="hero__arrow hero__arrow--left" onClick={prevSlide}>
                ❮
            </button>

            <button className="hero__arrow hero__arrow--right" onClick={nextSlide}>
                ❯
            </button>

        </section>
    );
}