import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CaravanStorageLogo from "../CaravansLogo/CaravanStorageLogo"
import "./Navbar.css";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    };

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "auto";
    }, [menuOpen]);

    return (
        <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
            <nav className="container navbar__inner">
                <Link to="/" className="navbar__logo">
                    <CaravanStorageLogo size={100} />
                </Link>

                <ul className={`navbar__links ${menuOpen ? "open" : ""}`}>
                    <li>
                        <Link to="/" onClick={() => { closeMenu(), handleClick() }}>
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="book-online/" onClick={() => { closeMenu(), handleClick() }}>
                            Book Online
                        </Link>
                    </li>
                    <li>
                        <Link to="my-booking/" onClick={() => { closeMenu(), handleClick() }}
                        >
                            My Bookings
                        </Link>
                    </li>
                    <li>
                        <Link to="contact/" onClick={() => { closeMenu(), handleClick() }}>
                            Contact Us
                        </Link>
                    </li>
                </ul>

                <Link to="/book-online" onClick={() => { handleClick() }} className="btn-primary navbar__cta">
                    Check Availability
                </Link>

                <button
                    className={`navbar__hamburger ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(prev => !prev)}
                    aria-label="Toggle Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

            </nav>
        </header>
    );
}