import "./Stats.css";

const stats = [
    { value: "230+", label: "Caravan Spaces Available" },
    { value: "365", label: "Days per year accessible" },
    { value: "70+", label: "Happy Customers" },
    { value: "24/7", label: "Hours per day accessible" },
];

export default function Stats() {
    return (
        <section className="stats-section">

            {/* Top Content */}
            <div className="container stats-top">

                <div className="stats-top__left">
                    <span className="stats-eyebrow">EASY ACCESS</span>
                    <h2 className="stats-heading">
                        Very conveniently <br /> located..
                    </h2>
                </div>

                <div className="stats-top__right">
                    <p>
                        Storing your caravan at 77 Lakes Rd, Tuggerah, NSW offers unmatched convenience with secure,
                        accessible storage in a prime location. With easy access to major roads, it's perfect for quick
                        getaways. The facility provides peace of mind, ensuring your caravan is safe and ready whenever
                        you're ready to hit the road.
                    </p>
                </div>

            </div>

            {/* Stats Grid */}
            <div className="container stats__grid">
                {stats.map((item, index) => (
                    <div className="stat-item" key={index}>
                        <div className="stat-item__value">{item.value}</div>
                        <div className="stat-item__label">{item.label}</div>
                    </div>
                ))}
            </div>

        </section>
    );
}