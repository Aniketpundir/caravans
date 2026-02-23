import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="navbar" role="banner">
            <nav className="container navbar__inner" aria-label="Main navigation">
                <a href="#home" className="navbar__logo" aria-label="Caravan Storage home">
                    <span className="logo-icon">🚐</span>
                    <span>Caravan <strong>Storage</strong></span>
                </a>

                <button
                    className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    <span /><span /><span />
                </button>

                <ul className={`navbar__links ${menuOpen ? 'open' : ''}`} role="list">
                    <li><a href="#home" onClick={() => setMenuOpen(!menuOpen)}>Home</a></li>
                    <li><a href="#features" onClick={() => setMenuOpen(!menuOpen)}>Features</a></li>
                    <li><a href="#pricing" onClick={() => setMenuOpen(!menuOpen)}>Pricing</a></li>
                    <li><a href="#location" onClick={() => setMenuOpen(!menuOpen)}>Location</a></li>
                </ul>

                <Link to="/book-online" className="btn-primary navbar__cta">Book Now</Link>
            </nav>
        </header>
    );
}
