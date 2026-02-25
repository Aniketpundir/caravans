import "./Stats.css";
import { FaWarehouse, FaCalendarAlt, FaSmile, FaClock } from "react-icons/fa";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const stats = [
    { icon: <FaWarehouse />, value: 230, suffix: "+", label: "Caravan Spaces Available" },
    { icon: <FaCalendarAlt />, value: 365, suffix: "", label: "Days per year accessible" },
    { icon: <FaSmile />, value: 70, suffix: "+", label: "Happy Customers" },
    { icon: <FaClock />, value: 24, suffix: "/7", label: "Hours per day accessible" },
];

export default function Stats() {

    const { ref, inView } = useInView({
        triggerOnce: false,
        threshold: 0.3,
    });

    return (
        <section className="stats-section" ref={ref}>

            <div className="container stats-top">
                <div className="stats-top__left">
                    <span className="stats-eyebrow">EASY ACCESS</span>
                    <h2 className="stats-heading">
                        Very conveniently located
                    </h2>
                </div>

                <div className="stats-top__right">
                    <p>
                        Storing your caravan at 77 Lakes Rd, Tuggerah, NSW offers unmatched convenience with secure,
                        accessible storage in a prime location.
                    </p>
                </div>
            </div>

            <div className="container stats__grid">
                {stats.map((item, index) => (
                    <div className="stat-item" key={index}>
                        <div className="stat-icon">{item.icon}</div>

                        <div className="stat-item__value">
                            {inView && (
                                <CountUp
                                    end={item.value}
                                    duration={2}
                                    suffix={item.suffix}
                                />
                            )}
                        </div>

                        <div className="stat-item__label">{item.label}</div>
                    </div>
                ))}
            </div>

        </section>
    );
}