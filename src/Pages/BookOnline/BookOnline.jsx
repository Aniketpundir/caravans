import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookOnline.css";
import {
    RectangleStackIcon,
    CalendarDaysIcon,
    IdentificationIcon,
    ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import StepLoader from "../../Components/Steploader/Steploader";
import Large from "../../assets/large.jpeg"
import Medium from "../../assets/medium.jpeg"
import Small from "../../assets/small.jpeg"

/* ==== PRICING ==== */
const RATES = {
    large: 6.1,
    medium: 4.74,
    small: 4.06,
};

const calcSubtotal = (type, days) => {
    const rate = RATES[type] || 0;
    return rate * (days || 0);
};

/* ==== SCROLL TO TOP BUTTON ==== */
const ScrollToTop = () => {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 200);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!visible) return null;
    return (
        <button
            className="scroll-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
            ▲
        </button>
    );
};


const handleClick = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};
/* ==== STEP 1 ==== */
const Step1 = ({ next, data, setData }) => {
    const Navigate = useNavigate()
    const lots = [
        {
            id: "large",
            title: "Large Lot – 9mx3m",
            desc: "Large Lots are 9m x 3m (27m2) in size. Price is on a per day basis. Minimum 7 day booking period.",
            img: Large,
        },
        {
            id: "medium",
            title: "Medium Lot – 7mx3m",
            desc: "Medium Lots are 7m x 3m (21m2) in size. Price is on a per day basis. Minimum 7 day booking period.",
            img: Medium,
        },
        {
            id: "small",
            title: "Small Lot – 6mx3m",
            desc: "Small Lots are 6m x 3m (18m2) in size. Price is on a per day basis. Minimum 7 day booking period.",
            img: Small,
        },
    ];

    return (
        <>
            <h2 className="title">Select Option</h2>
            <div className="lot-grid">
                {lots.map((lot) => (
                    <div
                        key={lot.id}
                        className={`lot-card ${data.type === lot.id ? "active" : ""}`}
                        onClick={() => { setData({ ...data, type: lot.id }), next() }}
                    >
                        <img src={lot.img} alt="" />
                        <div>
                            <h4>{lot.title}</h4>
                            <p>{lot.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bottom-nav right">
                <button onClick={() => { next(), handleClick() }}>Next: Booking Date →</button>
            </div>

            <div className="booking-info-banner">
                <p>
                    Your booking confirmation and Booking ID will be sent to your email shortly after completing your reservation.
                    If you wish to reschedule or cancel your booking, or if you have any questions regarding your reservation,
                    our team will be happy to assist you. Please feel free to contact us.
                </p>
                <button className="contact-btn" onClick={() => { Navigate("/contact-us"), handleClick() }}>
                    Contact Us
                </button>
                <h5 className="thank-you-text">Thank you for choosing us. We truly appreciate your trust and look forward to taking care of your storage needs.</h5>
            </div>
        </>
    );
};

/* ==== STEP 2 ==== */
const Step2 = ({ next, back, data, setData }) => {
    const [showCalendar, setShowCalendar] = React.useState(false);
    const [startDate, setStartDate] = React.useState(null);
    const [selectedDays, setSelectedDays] = React.useState(null);

    const daysList = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365];

    const handleSelect = (val) => {
        if (!val) return;
        const days = Number(val);
        const today = new Date();
        setSelectedDays(days);
        setShowCalendar(true);
        setStartDate(today);
        const end = new Date(today);
        end.setDate(today.getDate() + days - 1);
        setData({ ...data, days, start: today, end });
    };

    const handleDaysChange = (val) => {
        if (!val) return;
        const days = Number(val);
        setSelectedDays(days);
        const end = new Date(startDate);
        end.setDate(startDate.getDate() + days - 1);
        setData({ ...data, days, end });
    };

    const handleDateChange = (date) => {
        if (!selectedDays) return;
        const start = new Date(date);
        const end = new Date(start);
        end.setDate(start.getDate() + selectedDays - 1);
        setStartDate(start);
        setData({ ...data, start, end });
    };

    const tileClassName = ({ date }) => {
        if (!startDate || !selectedDays) return "";
        const d = new Date(date); d.setHours(0, 0, 0, 0);
        const s = new Date(startDate); s.setHours(0, 0, 0, 0);
        const e = new Date(s); e.setDate(s.getDate() + selectedDays - 1);
        if (d >= s && d <= e) return "range-highlight";
        return "";
    };

    const tileContent = ({ date, view }) => {
        if (view !== "month") return null;
        const slots = date.getDate() % 2 === 0 ? 99 : 100;
        return <div className="slot-text">{slots} Slots left</div>;
    };

    const subtotal = calcSubtotal(data.type, selectedDays);

    return (
        <>
            <h2 className="title">Booking Date</h2>

            {!showCalendar && (
                <div className="duration-center">
                    <div className="calendar-icon">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/2693/2693507.png"
                            alt=""
                            style={{ width: 64, opacity: 0.85 }}
                        />
                    </div>
                    <h3>Booking Duration</h3>
                    <p>Please select appropriate booking duration</p>
                    <div className="custom-select-wrap">
                        <select
                            className="duration-dropdown"
                            value={selectedDays || ""}
                            onChange={(e) => handleSelect(e.target.value)}
                        >
                            <option value="">Please select</option>
                            {daysList.map((d) => (
                                <option key={d} value={d}>{d} Days</option>
                            ))}
                        </select>
                        <span className="select-arrow">▾</span>
                    </div>
                </div>
            )}

            {showCalendar && (
                <>
                    <div className="duration-bar">
                        <div className="duration-bar-left">
                            <span className="clock-icon">🕒</span>
                            <div className="bar-select-wrap">
                                <select
                                    className="bar-days-select"
                                    value={selectedDays || ""}
                                    onChange={(e) => handleDaysChange(e.target.value)}
                                >
                                    {daysList.map((d) => (
                                        <option key={d} value={d}>{d} Days</option>
                                    ))}
                                </select>
                                <span className="bar-select-arrow">▾</span>
                            </div>
                        </div>
                        <div className="price">Price: ${subtotal.toFixed(2)}</div>
                    </div>

                    <div className="real-calendar">
                        <Calendar
                            onChange={handleDateChange}
                            value={startDate}
                            tileClassName={tileClassName}
                            tileContent={tileContent}
                            minDate={new Date()}
                        />
                    </div>

                    <div className="bottom-nav">
                        <span onClick={back}>← Go Back</span>
                        <button onClick={() => { next(), handleClick() }}>Next: Customer Details →</button>
                    </div>
                </>
            )}
        </>
    );
};

/* ==== STEP 3 ==== */
const COUNTRIES = [
    { code: "AU", flag: "🇦🇺", dial: "+61" },
    { code: "US", flag: "🇺🇸", dial: "+1" },
    { code: "GB", flag: "🇬🇧", dial: "+44" },
    { code: "IN", flag: "🇮🇳", dial: "+91" },
    { code: "NZ", flag: "🇳🇿", dial: "+64" },
    { code: "CA", flag: "🇨🇦", dial: "+1" },
    { code: "SG", flag: "🇸🇬", dial: "+65" },
    { code: "AE", flag: "🇦🇪", dial: "+971" },
    { code: "ZA", flag: "🇿🇦", dial: "+27" },
    { code: "DE", flag: "🇩🇪", dial: "+49" },
    { code: "FR", flag: "🇫🇷", dial: "+33" },
    { code: "IT", flag: "🇮🇹", dial: "+39" },
    { code: "ES", flag: "🇪🇸", dial: "+34" },
    { code: "PT", flag: "🇵🇹", dial: "+351" },
    { code: "NL", flag: "🇳🇱", dial: "+31" },
    { code: "BE", flag: "🇧🇪", dial: "+32" },
    { code: "CH", flag: "🇨🇭", dial: "+41" },
    { code: "AT", flag: "🇦🇹", dial: "+43" },
    { code: "SE", flag: "🇸🇪", dial: "+46" },
    { code: "NO", flag: "🇳🇴", dial: "+47" },
    { code: "DK", flag: "🇩🇰", dial: "+45" },
    { code: "FI", flag: "🇫🇮", dial: "+358" },
    { code: "PL", flag: "🇵🇱", dial: "+48" },
    { code: "RU", flag: "🇷🇺", dial: "+7" },
    { code: "JP", flag: "🇯🇵", dial: "+81" },
    { code: "CN", flag: "🇨🇳", dial: "+86" },
    { code: "KR", flag: "🇰🇷", dial: "+82" },
    { code: "PH", flag: "🇵🇭", dial: "+63" },
    { code: "MY", flag: "🇲🇾", dial: "+60" },
    { code: "ID", flag: "🇮🇩", dial: "+62" },
    { code: "TH", flag: "🇹🇭", dial: "+66" },
    { code: "VN", flag: "🇻🇳", dial: "+84" },
    { code: "PK", flag: "🇵🇰", dial: "+92" },
    { code: "BD", flag: "🇧🇩", dial: "+880" },
    { code: "LK", flag: "🇱🇰", dial: "+94" },
    { code: "NG", flag: "🇳🇬", dial: "+234" },
    { code: "KE", flag: "🇰🇪", dial: "+254" },
    { code: "GH", flag: "🇬🇭", dial: "+233" },
    { code: "EG", flag: "🇪🇬", dial: "+20" },
    { code: "MA", flag: "🇲🇦", dial: "+212" },
    { code: "BR", flag: "🇧🇷", dial: "+55" },
    { code: "MX", flag: "🇲🇽", dial: "+52" },
    { code: "AR", flag: "🇦🇷", dial: "+54" },
    { code: "CL", flag: "🇨🇱", dial: "+56" },
    { code: "CO", flag: "🇨🇴", dial: "+57" },
    { code: "PE", flag: "🇵🇪", dial: "+51" },
    { code: "TR", flag: "🇹🇷", dial: "+90" },
    { code: "SA", flag: "🇸🇦", dial: "+966" },
    { code: "QA", flag: "🇶🇦", dial: "+974" },
    { code: "KW", flag: "🇰🇼", dial: "+965" },
    { code: "IL", flag: "🇮🇱", dial: "+972" },
    { code: "IR", flag: "🇮🇷", dial: "+98" },
    { code: "IQ", flag: "🇮🇶", dial: "+964" },
    { code: "HK", flag: "🇭🇰", dial: "+852" },
    { code: "TW", flag: "🇹🇼", dial: "+886" },
    { code: "MM", flag: "🇲🇲", dial: "+95" },
    { code: "NP", flag: "🇳🇵", dial: "+977" },
    { code: "AF", flag: "🇦🇫", dial: "+93" },
    { code: "GR", flag: "🇬🇷", dial: "+30" },
    { code: "CZ", flag: "🇨🇿", dial: "+420" },
    { code: "HU", flag: "🇭🇺", dial: "+36" },
    { code: "RO", flag: "🇷🇴", dial: "+40" },
    { code: "UA", flag: "🇺🇦", dial: "+380" },
    { code: "IE", flag: "🇮🇪", dial: "+353" },
    { code: "SK", flag: "🇸🇰", dial: "+421" },
    { code: "HR", flag: "🇭🇷", dial: "+385" },
    { code: "RS", flag: "🇷🇸", dial: "+381" },
    { code: "BG", flag: "🇧🇬", dial: "+359" },
    { code: "LT", flag: "🇱🇹", dial: "+370" },
    { code: "LV", flag: "🇱🇻", dial: "+371" },
    { code: "EE", flag: "🇪🇪", dial: "+372" },
    { code: "IS", flag: "🇮🇸", dial: "+354" },
    { code: "CY", flag: "🇨🇾", dial: "+357" },
    { code: "MT", flag: "🇲🇹", dial: "+356" },
    { code: "LU", flag: "🇱🇺", dial: "+352" },
    { code: "FJ", flag: "🇫🇯", dial: "+679" },
    { code: "PG", flag: "🇵🇬", dial: "+675" },
    { code: "WS", flag: "🇼🇸", dial: "+685" },
    { code: "TO", flag: "🇹🇴", dial: "+676" },
    { code: "VU", flag: "🇻🇺", dial: "+678" },
];

const Step3 = ({ next, back, data, setData }) => {
    const [error, setError] = React.useState("");
    const [termsChecked, setTermsChecked] = React.useState(false);
    const [howFound, setHowFound] = React.useState("");
    const [showHowDropdown, setShowHowDropdown] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState(COUNTRIES[0]); // default AU
    const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
    const [countrySearch, setCountrySearch] = React.useState("");

    const howOptions = ["Google/Website", "Flyer", "Word of mouth", "Facebook", "Other"];

    const filteredCountries = COUNTRIES.filter((c) =>
        c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dial.includes(countrySearch)
    );

    const handleNext = () => {
        if (!data.first) { setError("Please enter your firstname"); return; }
        setError("");
        next();
    };

    // Close country dropdown when clicking outside
    React.useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest(".cd-flag-select") && !e.target.closest(".country-dropdown")) {
                setShowCountryDropdown(false);
                setCountrySearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <>
            <h2 className="cd-title">Customer Details</h2>

            <div className="cd-field">
                <label>First Name <span>*</span></label>
                <input required placeholder="Enter your first name" value={data.first}
                    onChange={(e) => setData({ ...data, first: e.target.value })} />
                {error && <div className="cd-error"><span className="dot">!</span> {error}</div>}
            </div>

            <div className="cd-field">
                <label>Last Name <span>*</span></label>
                <input required placeholder="Enter your last name" value={data.last}
                    onChange={(e) => setData({ ...data, last: e.target.value })} />
            </div>

            <div className="cd-field">
                <label>Email Address <span>*</span></label>
                <input required placeholder="Enter your email address" value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })} />
            </div>

            {/* PHONE WITH COUNTRY SELECTOR */}
            <div className="cd-field" style={{ position: "relative" }}>
                <label>Phone Number <span>*</span></label>
                <div className="cd-phone">

                    {/* FLAG + DIAL TRIGGER */}
                    <div
                        className={`cd-flag-select ${showCountryDropdown ? "open" : ""}`}
                        onClick={() => {
                            setShowCountryDropdown(!showCountryDropdown);
                            setCountrySearch("");
                        }}
                    >
                        <span className="flag-emoji">{selectedCountry.flag}</span>
                        <span className="flag-arrow">▾</span>
                    </div>

                    <input required
                        placeholder="0412 345 678"
                        value={data.phone}
                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                    />
                </div>

                {/* COUNTRY DROPDOWN */}
                {showCountryDropdown && (
                    <div className="country-dropdown">
                        <div className="country-search-wrap">
                            <input required
                                className="country-search"
                                placeholder="Search country or code..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="country-list">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((c) => (
                                    <div
                                        key={c.code}
                                        className={`country-option ${selectedCountry.code === c.code ? "selected" : ""}`}
                                        onClick={() => {
                                            setSelectedCountry(c);
                                            setData({ ...data, countryDial: c.dial });
                                            setShowCountryDropdown(false);
                                            setCountrySearch("");
                                        }}
                                    >
                                        <span className="co-flag">{c.flag}</span>
                                        <span className="co-dial">{c.dial}</span>
                                        <span className="co-code">{c.code}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="country-no-result">No results</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className={`cd-check ${termsChecked ? "checked" : ""}`}
                onClick={() => setTermsChecked(!termsChecked)}>
                <div className={`cd-checkbox ${termsChecked ? "active" : ""}`}>
                    {termsChecked && <span>✓</span>}
                </div>
                <p>I agree with the <span className="terms-link">terms & conditions</span></p>
            </div>

            <div className="cd-field">
                <label>Vehicle Make <span>*</span></label>
                <input required placeholder="Enter Vehicle Make" value={data.vehicleMake || ""}
                    onChange={(e) => setData({ ...data, vehicleMake: e.target.value })} />
            </div>

            <div className="cd-field">
                <label>Vehicle Model <span>*</span></label>
                <input required placeholder="Enter Vehicle Model" value={data.vehicleModel || ""}
                    onChange={(e) => setData({ ...data, vehicleModel: e.target.value })} />
            </div>

            <div className="cd-field">
                <label>Enter Vehicle Built Year <span>*</span></label>
                <input required placeholder="Enter Vehicle Built Year" value={data.vehicleYear || ""}
                    onChange={(e) => setData({ ...data, vehicleYear: e.target.value })} />
            </div>

            <div className="cd-field">
                <label>Vehicle Registration <span>*</span></label>
                <input required placeholder="Enter Vehicle Registration" value={data.vehicleReg || ""}
                    onChange={(e) => setData({ ...data, vehicleReg: e.target.value })} />
            </div>

            <div className="cd-field">
                <label>Vehicle Length <span>*</span></label>
                <input required placeholder="Enter Vehicle Length Including Drawbar" value={data.vehicleLength || ""}
                    onChange={(e) => setData({ ...data, vehicleLength: e.target.value })} />
            </div>

            <div className="cd-field" style={{ position: "relative" }}>
                <label>How did you find us? <span>*</span></label>
                <div className="how-select" onClick={() => setShowHowDropdown(!showHowDropdown)}>
                    <span className={howFound ? "" : "placeholder"}>{howFound || "Please Select"}</span>
                    <span className={`how-arrow ${showHowDropdown ? "open" : ""}`}>▾</span>
                </div>
                {showHowDropdown && (
                    <div className="how-dropdown">
                        {howOptions.map((opt) => (
                            <div key={opt} className="how-option"
                                onClick={() => { setHowFound(opt); setData({ ...data, howFound: opt }); setShowHowDropdown(false); }}>
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* NOTE FIELD */}
            <div className="cd-field">
                <label>Note</label>
                <input placeholder="Enter note details" value={data.note || ""}
                    onChange={(e) => setData({ ...data, note: e.target.value })} />
            </div>

            <div className="bottom-nav">
                <span onClick={back}>← Go Back</span>
                <button onClick={() => { handleNext(), handleClick() }}>Next: Payment →</button>
            </div>
        </>
    );
};
/* ==== STEP 4 ==== */
const Step4 = ({ back, data }) => {
    const subtotal = calcSubtotal(data.type, data.days);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const lotLabels = { large: "Large Lot - 9mx3m", medium: "Medium Lot - 7mx3m", small: "Small Lot - 6mx3m" };

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "—";

    return (
        <>
            <div className="pay-container">
                <div className="pay-illus">
                    <img src="https://cdn-icons-png.flaticon.com/512/4185/4185534.png" alt="" />
                </div>
                <h2 className="pay-heading">Payment</h2>
                <p className="pay-subtitle">Your Caravan Storage Booking Summary</p>

                <div className="pay-customer">
                    <span>Customer</span>
                    <h3>{data.first || "—"} {data.last || ""}</h3>
                </div>

                {/* DESKTOP: side by side | MOBILE: stacked under "Booking Details" */}
                <div className="pay-booking">
                    <div className="pay-booking-inner">
                        <p className="pay-booking-label">Booking Details</p>
                        <p className="pay-booking-type">{lotLabels[data.type] || "—"}</p>
                        <p className="pay-booking-dates">
                            {formatDate(data.start)} - {formatDate(data.end)}
                        </p>
                    </div>
                </div>

                <div className="line"></div>

                <div className="pay-amount">
                    <div className="pay-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="pay-row"><span>Tax</span><span>+${tax.toFixed(2)}</span></div>
                </div>

                <div className="line"></div>

                <div className="pay-coupon">
                    <span>Have a coupon code ?</span>
                    <div className="coupon-input">
                        <input placeholder="Enter your coupon code" />
                        <button className="coupon-btn">✓</button>
                    </div>
                </div>

                <div className="line"></div>

                <div className="pay-total">
                    <span>Total Amount Payable</span>
                    <h2 className="total-amount">${total.toFixed(2)}</h2>
                </div>
            </div>

            <div className="bottom-nav">
                <span onClick={back}>← Go Back</span>
                <button>Book Lot</button>
            </div>
        </>
    );
};

/* ==== MAIN ==== */
export default function BookOnline() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        type: "", days: "", start: null, end: null,
        first: "", last: "", email: "", phone: "",
        vehicleMake: "", vehicleModel: "", vehicleYear: "",
        vehicleReg: "", vehicleLength: "", howFound: "", note: "",
    });

    const goToStep = (newStep) => {
        setLoading(true);
        setTimeout(() => {
            setStep(newStep);
            setLoading(false);
        }, 700);
    };

    return (
        <div className="wizard-layout">

            {/* SIDEBAR */}
            <div className="sidebar">
                <div className={`step ${step === 1 ? "active" : ""}`}>
                    <span className="icon-box"><RectangleStackIcon /></span>
                    <span className="step-label">Booking Type</span>
                </div>
                <div className={`step ${step === 2 ? "active" : ""}`}>
                    <span className="icon-box"><CalendarDaysIcon /></span>
                    <span className="step-label">Booking Date</span>
                </div>
                <div className={`step ${step === 3 ? "active" : ""}`}>
                    <span className="icon-box"><IdentificationIcon /></span>
                    <span className="step-label">Customer Details</span>
                </div>
                <div className={`step ${step === 4 ? "active" : ""}`}>
                    <span className="icon-box"><ClipboardDocumentCheckIcon /></span>
                    <span className="step-label">Payment</span>
                </div>
            </div>

            {/* CONTENT */}
            <div className="content">
                {loading && <StepLoader />}
                {!loading && step === 1 && (
                    <Step1 next={() => goToStep(2)} data={data} setData={setData} />
                )}
                {!loading && step === 2 && (
                    <Step2 next={() => goToStep(3)} back={() => goToStep(1)} data={data} setData={setData} />
                )}
                {!loading && step === 3 && (
                    <Step3 next={() => goToStep(4)} back={() => goToStep(2)} data={data} setData={setData} />
                )}
                {!loading && step === 4 && (
                    <Step4 back={() => goToStep(3)} data={data} />
                )}
            </div>

            <ScrollToTop />
        </div>
    );
}