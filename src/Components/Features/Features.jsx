import './Features.css';

const features = [
    {
        icon: '🛡️',
        title: '24h Security',
        desc: 'State-of-the-art CCTV monitoring, secure gated entry with keypad access, and a fully fenced perimeter ensure your caravan remains protected at all times.',
    },
    {
        icon: '🚪',
        title: 'Easy Drop Off',
        desc: 'Wide driveways and spacious access areas make parking and retrieving your caravan simple, safe, and stress-free.',
    },
    {
        icon: '👷',
        title: 'On-site Management',
        desc: 'Professional on-site staff oversee daily operations, ensuring your storage experience is secure, smooth, and fully supported.',
    },
];

export default function Features() {
    return (
        <section id="features" className="features" aria-labelledby="features-heading">
            <div className="container">
                <header className="features__header">
                    <h2 id="features-heading" className="section-title">What We Do</h2>
                    <p className="section-sub">
                        Designed to deliver maximum security, effortless access, and complete peace of mind for every caravan owner.
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
