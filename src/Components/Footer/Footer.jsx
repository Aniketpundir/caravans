import './Footer.css';
import CaravanStorageLogo from "../CaravansLogo/CaravanStorageLogo"

const quickLinks = ['Home', 'Features', 'Pricing', 'Location'];

export default function Footer() {
    return (
        <footer className="footer" role="contentinfo">
            <div className="container footer__grid">
                <section className="footer__brand" aria-label="Brand info">
                    <div className="footer__logo">
                        <CaravanStorageLogo size={85} />
                    </div>
                    <p className="footer__brand-desc">
                        Providing premium, high-security storage solutions for caravan enthusiasts across the Central Coast, NSW.
                    </p>
                </section>

                <nav className="footer__nav" aria-label="Quick links">
                    <h3 className="footer__heading">Quick Links</h3>
                    <ul role="list">
                        {quickLinks.map((l) => (
                            <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
                        ))}
                    </ul>
                </nav>

                <address className="footer__contact" aria-label="Contact details">
                    <h3 className="footer__heading">Contact</h3>
                    <p>
                        <a href="mailto:info@caravanstorage.com.au">info@caravanstorage.com.au</a>
                    </p>
                    <p>77 Lakes Rd, Tuggerah NSW</p>
                    <p><a href="tel:0254301324">(02) 5430 1324</a></p>
                </address>

                {/* <section className="footer__newsletter" aria-label="Newsletter signup">
                    <h3 className="footer__heading">Newsletter</h3>
                    <p>Stay up to date on our latest offers.</p>
                    <form className="footer__form" onSubmit={(e) => e.preventDefault()} aria-label="Newsletter form">
                        <input
                            type="email"
                            placeholder="Your email"
                            aria-label="Email address"
                            className="footer__input"
                            required
                        />
                        <button type="submit" className="footer__submit" aria-label="Subscribe">→</button>
                    </form>
                </section> */}
            </div>

            <div className="footer__bottom">
                <div className="container footer__bottom-inner">
                    <small>© 2024 Caravan Storage Pty Ltd. All rights reserved.</small>
                    <nav aria-label="Legal links">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
