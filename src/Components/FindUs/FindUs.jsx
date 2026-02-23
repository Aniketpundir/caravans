import './FindUs.css';

export default function FindUs() {
    return (
        <section id="location" className="findus" aria-labelledby="findus-heading">
            <div className="container findus__inner">
                <div className="findus__info">
                    <h2 id="findus-heading" className="section-title">Find Us</h2>
                    <p className="findus__desc">
                        Conveniently located just off the M1 highway for easy caravan towing and transit.
                    </p>

                    <address className="findus__address">
                        <div className="findus__address-item">
                            <span className="findus__icon" aria-hidden="true">📍</span>
                            <div>
                                <strong>77 Lakes Rd, Tuggerah NSW</strong><br />
                                Central Coast, 2259
                            </div>
                        </div>
                        <div className="findus__address-item">
                            <span className="findus__icon" aria-hidden="true">📞</span>
                            <a href="tel:0254301324">(02) 5430 1324</a>
                        </div>
                    </address>

                    <blockquote className="findus__quote">
                        <p>"The easiest storage access I've ever experienced with my 22ft van."</p>
                        <cite>— Louise Donaldson</cite>
                    </blockquote>
                </div>

                <div className="findus__map" role="img" aria-label="Map showing storage location in Tuggerah NSW">
                    <iframe
                        title="Caravan Storage location map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3322.2!2d151.41!3d-33.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI1JzQ4LjAiUyAxNTHCsDI0JzM2LjAiRQ!5e0!3m2!1sen!2sau!4v1700000000000!5m2!1sen!2sau"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </section>
    );
}
