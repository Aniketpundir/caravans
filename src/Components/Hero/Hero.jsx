import './Hero.css';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import image1 from "../../assets/3.jpeg";
import image2 from "../../assets/4.jpeg";
import image3 from "../../assets/5.jpeg";

const slides = [
    {
        title: "Secure Caravan Storage You Can Rely On",
        subtitle: "Safe, secure & conveniently located caravan storage that won't break the bank.",
        image: image1
    },
    {
        title: "Premium Caravan Storage with Total Peace of Mind",
        subtitle: "Affordable, monitored & easily accessible caravan storage designed for stress-free ownership.",
        image: image2
    },
    {
        title: "Store Your Caravan the Smart Way",
        subtitle: "Protected, budget-friendly & ideally located storage built for modern caravan owners.",
        image: image3
    }
];

export default function Hero() {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [paused]);

    return (
        <section
            className="hero"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`hero__slide ${index === current ? "active" : ""}`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                />
            ))}

            <div className="hero__overlay" />

            <div className="container hero__content">
                <div className="hero__text">
                    <h1 key={current} className="hero__title animate">
                        {slides[current].title}
                    </h1>

                    <p key={current + "-sub"} className="hero__subtitle animate">
                        {slides[current].subtitle}
                    </p>

                    <div className="hero__actions">
                        <Link to="/book-online" className="btn-primary">
                            Book Storage Now
                        </Link>
                        <Link to="/book-online" className="btn-outline">
                            Get a Quote
                        </Link>
                    </div>
                </div>
            </div>

            {/* Dots */}
            <div className="hero__dots">
                {slides.map((_, index) => (
                    <span
                        key={index}
                        className={index === current ? "active" : ""}
                        onClick={() => setCurrent(index)}
                    />
                ))}
            </div>
        </section>
    );
}