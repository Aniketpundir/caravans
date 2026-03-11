import "./BannerCTA.css";
import { Link } from "react-router-dom";

export default function CTA() {

    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    };


    return (
        <section className="cta">
            <div className="container cta__inner">

                <div className="cta__content">
                    <h2 className="cta__title">
                        Want to book a spot for your caravan?
                    </h2>
                    <p className="cta__subtitle">
                        Bookings available from 1st March 2025 – Book your Caravan/Boat/RV storage now!
                    </p>
                </div>

                <div className="cta__action">
                    <Link onClick={() => { handleClick() }} to="/book-online" className="cta__btn">
                        Book Online Here
                    </Link>
                </div>

            </div>
        </section>
    );
}