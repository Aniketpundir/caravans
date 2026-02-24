import "./Features.css";

const features = [
    {
        icon: "📹",
        title: "24/7 CCTV Monitoring",
        desc: "Fully fenced and continuously monitored facility to keep your caravan safe at all times.",
    },
    {
        icon: "🚐",
        title: "Easy Vehicle Access",
        desc: "Wide entry points and spacious layout designed for caravans and motorhomes of all sizes.",
    },
    {
        icon: "🔐",
        title: "Secure Gated Entry",
        desc: "Controlled access system ensuring only authorised vehicles can enter the facility.",
    },
];

export default function Features() {
    return (
        <section id="features" className="features" aria-labelledby="features-heading">
            <div className="container">
                <header className="features__header">
                    <h2 id="features-heading" className="section-title">
                        Secure & Accessible Storage Facility
                    </h2>
                    <p className="section-sub">
                        Designed for safety, convenience and reliable access for caravan
                        owners across Central Coast NSW.
                    </p>
                </header>

                <div className="features__grid" role="list">
                    {features.map((f) => (
                        <article className="feature-card" key={f.title} role="listitem">
                            <div className="feature-card__icon" aria-hidden="true">
                                {f.icon}
                            </div>
                            <h3 className="feature-card__title">{f.title}</h3>
                            <p className="feature-card__desc">{f.desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}