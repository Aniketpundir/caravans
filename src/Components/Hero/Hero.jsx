import "./Hero.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import image1 from "../../assets/3.jpeg";
import image2 from "../../assets/4.jpeg";
import image3 from "../../assets/5.jpeg";

const slides = [
    {
        title: "Secure Caravan Storage in Central Coast NSW",
        subtitle:
            "Fully fenced, gated & 24/7 CCTV monitored facility with easy highway access.",
        image: image1,
    },
    {
        title: "Affordable Outdoor Storage From $7 per m²",
        subtitle:
            "Flexible monthly terms. No hidden fees. Easy access for large caravans & motorhomes.",
        image: image2,
    },
    {
        title: "Safe, Convenient & Locally Operated",
        subtitle:
            "Spacious yard, well-lit grounds and simple online booking in minutes.",
        image: image3,
    },
];

export default function Hero() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero">
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
                    <h1 key={current} className="hero__title">
                        {slides[current].title}
                    </h1>

                    <p key={current + "-sub"} className="hero__subtitle">
                        {slides[current].subtitle}
                    </p>

                    <div className="hero__actions">
                        <Link to="/book-online" className="btn-primary">
                            Check Availability
                        </Link>

                        <a href="tel:0400000000" className="btn-outline">
                            Call Now
                        </a>
                    </div>

                    <div className="hero__trust">
                        ✓ Fully Fenced & Gated &nbsp; | &nbsp;
                        ✓ 24/7 CCTV Monitoring &nbsp; | &nbsp;
                        ✓ Easy Highway Access
                    </div>
                </div>
            </div>

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