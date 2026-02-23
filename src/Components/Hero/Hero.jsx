import './Hero.css';
import { Link } from 'react-router-dom';

const trustItems = [
    { icon: '🔒', label: '24/7 Secure Access' },
    { icon: '📹', label: 'CCTV Monitoring' },
    { icon: '🏗️', label: 'Fully Fenced Perimeter' },
];

export default function Hero() {
    return (
        <section id="home" className="hero" aria-label="Hero section">
            <div className="hero__overlay" />
            <div className="hero__bg-pattern" aria-hidden="true" />

            <div className="container hero__content">
                <div className="hero__text">
                    <h1 className="hero__title">
                        Secure Caravan<br />Storage in<br />
                        <span className="hero__title-accent">Central Coast</span>
                    </h1>
                    <p className="hero__tagline">Safe. Accessible. Affordable.</p>
                    <div className="hero__actions">
                        <Link to="/book-online" className="btn-primary hero__btn">Book Storage Now</Link>
                        <Link to="/book-online" className="btn-outline hero__btn">Get a Quote</Link>
                    </div>
                </div>
            </div>

            <div className="hero__trust" aria-label="Trust indicators">
                <div className="container hero__trust-inner">
                    {trustItems.map((item) => (
                        <div className="hero__trust-item" key={item.label}>
                            <span className="hero__trust-icon" aria-hidden="true">{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
