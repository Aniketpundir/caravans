import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 80);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Prevent body scroll when mobile menu open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "auto";
    }, [menuOpen]);

    return (
        <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
            <nav className="container navbar__inner">

                <a href="#home" className="navbar__logo">
                    <span className="logo-icon">🚐</span>
                    <span className="logo-text">
                        Caravan <strong>Storage</strong>
                    </span>
                </a>

                <ul className={`navbar__links ${menuOpen ? 'open' : ''}`}>
                    <li><a href="#home" onClick={closeMenu}>Home</a></li>
                    <li><a href="#features" onClick={closeMenu}>Features</a></li>
                    <li><a href="#pricing" onClick={closeMenu}>Pricing</a></li>
                    <li><a href="#location" onClick={closeMenu}>Location</a></li>
                </ul>

                <Link to="/book-online" className="btn-primary navbar__cta">
                    Book Now
                </Link>

                <button
                    className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(prev => !prev)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

            </nav>
        </header>
    );
}