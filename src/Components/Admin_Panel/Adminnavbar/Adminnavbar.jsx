import "./Adminnavbar.css";

import {
    FaMoneyBillWave,
    FaUsers,
    FaThLarge,
    FaTag,
    FaChartBar,
} from "react-icons/fa";

import { MdEventNote } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminNavbar() {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const links = [
        { to: "/admin-dashboard", icon: <FaThLarge />, label: "Dashboard" },
        { to: "/admin-dashboard/appointments", icon: <MdEventNote />, label: "Appointments" },
        { to: "/admin-dashboard/payments", icon: <FaMoneyBillWave />, label: "Payments" },
        { to: "/admin-dashboard/customers", icon: <FaUsers />, label: "Customers" },
        { to: "/admin-dashboard/service", icon: <FaThLarge />, label: "Services" },
        { to: "/admin-dashboard/coupan", icon: <FaTag />, label: "Discounts" },
        { to: "/admin-dashboard/report", icon: <FaChartBar />, label: "Reports" },
    ];

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/admin-login")
        }
    }, [])

    return (
        <nav className="admin_navbar">
            <div className="admin_navbar__logo">
                <NavLink to="/admin-dashboard"><FaThLarge /></NavLink>
            </div>

            {/* Desktop nav */}
            <div className="admin_navbar__items">
                {links.map(({ to, icon, label }) => (
                    <NavLink key={to} to={to}
                        className={({ isActive }) => `admin_navbar__link${isActive ? " active" : ""}`}>
                        {icon}<span>{label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Hamburger button */}
            <button className={`hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}>
                <span /><span /><span />
            </button>

            {/* Mobile dropdown */}
            <div className={`admin_navbar__mobile ${menuOpen ? "open" : ""}`}>
                {links.map(({ to, icon, label }) => (
                    <NavLink key={to} to={to} onClick={closeMenu}
                        className={({ isActive }) => `admin_navbar__link${isActive ? " active" : ""}`}>
                        {icon}<span>{label}</span>
                    </NavLink>
                ))}
            </div>


        </nav>
    );
}