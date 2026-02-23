import './Stats.css';

const stats = [
    { value: '230+', label: 'Total Spaces' },
    { value: '365', label: 'Days Access' },
    { value: '100%', label: 'Security Rating' },
    { value: '5-Star', label: 'Customer Support' },
];

export default function Stats() {
    return (
        <section className="stats" aria-label="Key statistics">
            <div className="container stats__grid" role="list">
                {stats.map((s) => (
                    <div className="stat-item" key={s.label} role="listitem">
                        <span className="stat-item__value">{s.value}</span>
                        <span className="stat-item__label">{s.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
