import "./Features.css";
import { FaShieldAlt, FaTruck, FaSun, FaMoneyBillWave, FaWarehouse, FaKey } from "react-icons/fa";

const features = [
    { icon: <FaShieldAlt />, title: "Fully Fenced 24 Hr Security" },
    { icon: <FaWarehouse />, title: "Outdoor Storage for Caravans" },
    { icon: <FaSun />, title: "Area Fully Lit" },
    { icon: <FaTruck />, title: "Drop Off & Pick Up" },
    { icon: <FaKey />, title: "Short & Long Term Storage Available" },
    { icon: <FaMoneyBillWave />, title: "All Caravan Sizes Catered For" },
];

export default function Features() {
    return (
        <section className="features">
            <div className="container">

                <header className="features__header">
                    <h2 className="features__title">
                        Why Choose Us <br /> Caravan Storage
                    </h2>
                </header>

                <div className="features__grid">
                    {features.map((item, index) => (
                        <div className={`feature-tile ${index % 2 === 0 ? "light" : "dark"}`} key={index}>
                            <div className="tile-icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}