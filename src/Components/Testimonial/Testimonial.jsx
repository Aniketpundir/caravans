import './Testimonial.css';

const reviews = [
    {
        text: "The easiest storage access I've ever experienced with my 22ft van. Highly recommend to any caravan owner!",
        author: 'Louise Donaldson',
        stars: 5,
    },
    {
        text: "Incredibly secure and affordable. The staff are friendly and always available. Best decision we made for our caravan.",
        author: 'Mark T.',
        stars: 5,
    },
    {
        text: "Spotlessly clean facility, amazing value. We've been customers for 3 years and will never go anywhere else.",
        author: 'Sarah & Paul R.',
        stars: 5,
    },
];

export default function Testimonial() {
    return (
        <section className="testimonials" aria-labelledby="testimonials-heading">
            <div className="container">
                <header className="testimonials__header">
                    <h2 id="testimonials-heading" className="section-title">What Our Customers Say</h2>
                    <p className="section-sub">Trusted by hundreds of caravan owners across Central Coast.</p>
                </header>

                <div className="testimonials__grid" role="list">
                    {reviews.map((r, i) => (
                        <figure className="testimonial-card" key={i} role="listitem">
                            <div className="testimonial-card__stars" aria-label={`${r.stars} out of 5 stars`}>
                                {'⭐'.repeat(r.stars)}
                            </div>
                            <blockquote className="testimonial-card__text">"{r.text}"</blockquote>
                            <figcaption className="testimonial-card__author">— {r.author}</figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
