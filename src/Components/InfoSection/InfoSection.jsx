import { useEffect, useRef, useState } from "react";
import "./InfoSection.css";

export default function InfoSection({
    title,
    description,
    image,
    reverse = false
}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.35 }
        );

        if (ref.current) observer.observe(ref.current);
    }, []);

    return (
        <section
            ref={ref}
            className={`info ${reverse ? "reverse" : ""} ${visible ? "show" : ""}`}
        >
            <div className="container info__grid">

                <div className="info__image">
                    <img src={image} alt={title} />
                </div>

                <div className="info__content">
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>

            </div>
        </section>
    );
}