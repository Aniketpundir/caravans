import { Link } from 'react-router-dom';
import './Pricing.css';

const benefits = [
    'All space under surveillance',
    'Flexible monthly agreements',
    'Walk-down key access',
];

export default function Pricing() {
    return (
        <section id="pricing" className="pricing" aria-labelledby="pricing-heading">
            <div className="container pricing__inner">
                <div className="pricing__left">
                    <h2 id="pricing-heading" className="pricing__title">Transparent Pricing</h2>
                    <p className="pricing__sub">
                        Premium storage options at competitive rates. No hidden fees or long-term lock-ins.
                    </p>
                    <ul className="pricing__benefits" aria-label="Pricing benefits">
                        {benefits.map((b) => (
                            <li key={b} className="pricing__benefit">
                                <span className="pricing__check" aria-hidden="true">✓</span>
                                {b}
                            </li>
                        ))}
                    </ul>
                </div>

                <aside className="pricing__card" aria-label="Pricing details">
                    <p className="pricing__from">STARTING FROM</p>
                    <div className="pricing__amount">
                        <span className="pricing__dollar">$</span>
                        <span className="pricing__number">7</span>
                        <span className="pricing__unit">per m² / month</span>
                    </div>
                    <p className="pricing__note">Personalised Storage Plans Available</p>
                    <Link to="/book-online" className="btn-primary pricing__cta">Book Now</Link>
                </aside>
            </div>
        </section>
    );
}
