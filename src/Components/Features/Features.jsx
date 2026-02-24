import './Features.css';

const features = [
    {
        icon: '🛡️',
        title: '24h Security',
        desc: 'State-of-the-art CCTV and 24/7 monitoring systems with pin-coded keypad entry.',
    },
    {
        icon: '🚪',
        title: 'Easy Drop Off',
        desc: 'Ultra-wide roller doors and complex designed to accommodate large vehicles with ease.',
    },
    {
        icon: '👷',
        title: 'On-site Management',
        desc: 'Dedicated professional staff on-site, ready to assist with your storage needs.',
    },
];

export default function Features() {
    return (
        <section id="features" className="features" aria-labelledby="features-heading">
            <div className="container">
                <header className="features__header">
                    <h2 id="features-heading" className="section-title">Premium Storage Features</h2>
                    <p className="section-sub">
                        Our facility is designed with your caravan's safety and accessibility in mind,
                        using the latest in security technology.
                    </p>
                </header>

                <div data-aos="fade-down" className="features__grid" role="list">
                    {features.map((f) => (
                        <article className="feature-card" key={f.title} role="listitem">
                            <div className="feature-card__icon" aria-hidden="true">{f.icon}</div>
                            <h3 className="feature-card__title">{f.title}</h3>
                            <p className="feature-card__desc">{f.desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
