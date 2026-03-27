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
import { Helmet } from "react-helmet-async";

// const API_BASE = "https://16.16.213.67.sslip.io/api";

const API_BASE = "https://api.caravanstoragecentralcoast.com.au/"

/* ==== PRICING HELPERS ==== */
const calcSubtotal = (unitPrice, days) => (unitPrice || 0) * (days || 0);
const calcTax = (subtotal, taxRate) => subtotal * ((taxRate || 0) / 100);
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const BOOKING_DATE_FORMATTER = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
});

const toYMD = (value) => {
    if (!value) return "";
    if (typeof value === "string" && DATE_ONLY_RE.test(value)) return value;
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "";
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const addDaysToYMD = (dateStr, days) => {
    const base = new Date(`${dateStr}T00:00:00`);
    base.setDate(base.getDate() + days);
    return toYMD(base);
};

const formatBookingDate = (value) => {
    const ymd = toYMD(value);
    if (!ymd) return "—";
    const [year, month, day] = ymd.split("-").map(Number);
    return BOOKING_DATE_FORMATTER.format(new Date(year, month - 1, day));
};

/* ==== SCROLL TO TOP ==== */
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
        >▲</button>
    );
};

const handleClick = () => window.scrollTo({ top: 0, behavior: "smooth" });

/* ==== STEP 1 — Fetch lots from API ==== */
const Step1 = ({ next, data, setData }) => {
    const Navigate = useNavigate();
    const [lots, setLots] = React.useState([]);
    const [loadingLots, setLoadingLots] = React.useState(true);
    const [fetchError, setFetchError] = React.useState("");

    React.useEffect(() => {
        const fetchLots = async () => {
            try {
                const res = await fetch(`${API_BASE}/user/services`);
                const json = await res.json();
                if (!json.success) {
                    setFetchError("Failed to load lots. Please try again.");
                    return;
                }
                setLots(json.data.filter((lot) => !lot.isDisabled));
            } catch {
                setFetchError("Network error. Please check your connection.");
            } finally {
                setLoadingLots(false);
            }
        };
        fetchLots();
    }, []);

    const handleSelect = (lot) => {
        setData({
            ...data,
            serviceId: lot._id,
            typeName: lot.serviceName,
            unitPrice: lot.unitPrice,
            taxRate: lot.tax,
            minDuration: lot.minDuration,
            maxDuration: lot.maxDuration,
        });
        next();
        handleClick();
    };

    return (
        <>
            <h2 className="title">Select Option</h2>

            {loadingLots && (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    Loading available lots...
                </div>
            )}

            {!loadingLots && fetchError && (
                <div className="cd-error" style={{ margin: "20px 0" }}>
                    <span className="dot">!</span> {fetchError}
                </div>
            )}

            {!loadingLots && !fetchError && (
                <div className="lot-grid">
                    {lots.map((lot) => (
                        <div
                            key={lot._id}
                            className={`lot-card ${data.serviceId === lot._id ? "active" : ""}`}
                            onClick={() => handleSelect(lot)}
                        >
                            <img src={lot.image?.url} alt={lot.serviceName} />
                            <div>
                                <h4>{lot.serviceName}</h4>
                                <p>{lot.description}</p>
                                <p style={{ marginTop: "8px", fontWeight: 600 }}>
                                    ${lot.unitPrice.toFixed(2)} / day
                                </p>
                                <p style={{ fontSize: "12px", color: "#888" }}>
                                    Min: {lot.minDuration} days · Max: {lot.maxDuration} days
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bottom-nav right">
                <button
                    onClick={() => { next(); handleClick(); }}
                    disabled={!data.serviceId}
                >
                    Next: Booking Date →
                </button>
            </div>

            <div className="booking-info-banner">
                <p>
                    Your booking confirmation and Booking ID will be sent to your email shortly after completing
                    your reservation. If you wish to reschedule or cancel your booking, or if you have any
                    questions regarding your reservation, our team will be happy to assist you.
                    Please feel free to contact us.
                </p>
                <button className="contact-btn" onClick={() => { Navigate("/contact-us"); handleClick(); }}>
                    Contact Us
                </button>
                <h5 className="thank-you-text">
                    Thank you for choosing us. We truly appreciate your trust and look forward to taking care
                    of your storage needs.
                </h5>
            </div>
        </>
    );
};

/* ==== STEP 2 — Booking Date with real availability ==== */
const Step2 = ({ next, back, data, setData }) => {
    const [showCalendar, setShowCalendar] = React.useState(false);
    const [startDate, setStartDate] = React.useState(null);
    const [selectedDays, setSelectedDays] = React.useState(null);
    const [availability, setAvailability] = React.useState({});
    const [availLoading, setAvailLoading] = React.useState(false);

    const min = data.minDuration || 7;
    const max = data.maxDuration || 365;
    const daysList = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    // Fetch for the visible month + 2 more months ahead
    const fetchAvailability = React.useCallback(async (anchor, days) => {
        if (!data.serviceId) return;
        setAvailLoading(true);
        try {
            const base = anchor ? new Date(anchor) : new Date();

            // Start = today
            const start = new Date();
            start.setHours(0, 0, 0, 0);

            // End = last day of anchor+2 months OR anchor+days+15, whichever is further
            const threeMonthEnd = new Date(base.getFullYear(), base.getMonth() + 3, 0);
            const durationEnd = new Date(base);
            durationEnd.setDate(base.getDate() + (days || min) + 15);
            const end = threeMonthEnd > durationEnd ? threeMonthEnd : durationEnd;

            const res = await fetch(
                `${API_BASE}/user/availability?serviceId=${data.serviceId}&startDate=${toYMD(start)}&endDate=${toYMD(end)}`
            );
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                const map = {};
                json.data.forEach((item) => { map[item.date] = item; });
                setAvailability((prev) => ({ ...prev, ...map }));
            }
        } catch (err) {
            console.error("Failed to fetch availability:", err);
        } finally {
            setAvailLoading(false);
        }
    }, [data.serviceId, min]);

    // Fetch when calendar becomes visible
    React.useEffect(() => {
        if (showCalendar) fetchAvailability(new Date(), selectedDays);
    }, [showCalendar, fetchAvailability]);

    // Re-fetch when duration changes to ensure range is covered
    React.useEffect(() => {
        if (showCalendar && selectedDays) fetchAvailability(startDate || new Date(), selectedDays);
    }, [selectedDays]);

    // When user navigates months on calendar — fetch that month's data
    const handleActiveStartDateChange = ({ activeStartDate }) => {
        fetchAvailability(activeStartDate, selectedDays);
    };

    // First dropdown — select duration, show calendar
    const handleSelect = (val) => {
        if (!val) return;
        const days = Number(val);
        const today = new Date();
        const start = toYMD(today);
        const end = addDaysToYMD(start, days - 1);
        setSelectedDays(days);
        setShowCalendar(true);
        setStartDate(today);
        setData({ ...data, days, start, end });
    };

    // Bar dropdown — change duration while calendar is visible
    const handleDaysChange = (val) => {
        if (!val) return;
        const days = Number(val);
        setSelectedDays(days);
        const base = toYMD(startDate || new Date());
        const end = addDaysToYMD(base, days - 1);
        setData({ ...data, days, end });
    };

    const handleDateChange = (date) => {
        if (!selectedDays) return;
        const start = toYMD(date);
        const end = addDaysToYMD(start, selectedDays - 1);
        setStartDate(new Date(date));
        setData({ ...data, start, end });
        fetchAvailability(date, selectedDays);
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
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (date < today) return null;
        const key = toYMD(date);
        const info = availability[key];
        if (availLoading && !info) return <div className="slot-text" style={{ color: "#bbb" }}>—</div>;
        if (!info) return null;
        const { available, capacity } = info;
        const pct = capacity > 0 ? available / capacity : 1;
        const color = pct === 0 ? "#e74c3c" : pct <= 0.2 ? "#e67e22" : pct <= 0.5 ? "#f1c40f" : "#27ae60";
        return (
            <div className="slot-text" style={{ color, fontWeight: 600 }}>
                {available === 0 ? "Full" : `${available} left`}
            </div>
        );
    };

    const tileDisabled = ({ date, view }) => {
        if (view !== "month") return false;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (date < today) return true;
        const key = toYMD(date);
        const info = availability[key];
        return info ? info.available === 0 : false;
    };

    const subtotal = calcSubtotal(data.unitPrice, selectedDays);

    return (
        <>
            <h2 className="title">Booking Date</h2>

            {/* SCREEN 1: Duration picker */}
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

            {/* SCREEN 2: Calendar with slot availability */}
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

                    {/* Availability legend */}
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", padding: "8px 0 4px", fontSize: "12px" }}>
                        <span><span style={{ color: "#27ae60", fontWeight: 700 }}>●</span> Available</span>
                        <span><span style={{ color: "#f1c40f", fontWeight: 700 }}>●</span> Filling up</span>
                        <span><span style={{ color: "#e67e22", fontWeight: 700 }}>●</span> Almost full</span>
                        <span><span style={{ color: "#e74c3c", fontWeight: 700 }}>●</span> Full</span>
                        {availLoading && <span style={{ color: "#999" }}>Loading slots...</span>}
                    </div>

                    <div className="real-calendar">
                        <Calendar
                            onChange={handleDateChange}
                            value={startDate}
                            tileClassName={tileClassName}
                            tileContent={tileContent}
                            tileDisabled={tileDisabled}
                            minDate={new Date()}
                            onActiveStartDateChange={handleActiveStartDateChange}
                        />
                    </div>

                    <div className="bottom-nav">
                        <span onClick={back}>← Go Back</span>
                        <button onClick={() => { next(); handleClick(); }}>
                            Next: Customer Details →
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

/* ==== COUNTRIES ==== */
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

/* ==== STEP 3 — Customer Details ==== */
const Step3 = ({ next, back, data, setData }) => {
    const [error, setError] = React.useState("");
    const [termsChecked, setTermsChecked] = React.useState(false);
    const [howFound, setHowFound] = React.useState("");
    const [showHowDropdown, setShowHowDropdown] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState(COUNTRIES[0]);
    const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
    const [countrySearch, setCountrySearch] = React.useState("");

    const howOptions = ["Google/Website", "Flyer", "Word of mouth", "Facebook", "Other"];

    const filteredCountries = COUNTRIES.filter((c) =>
        c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dial.includes(countrySearch)
    );

    const handleNext = () => {
        if (!data.first) { setError("Please enter your first name"); return; }
        if (!data.last) { setError("Please enter your last name"); return; }
        if (!data.email) { setError("Please enter your email address"); return; }
        if (!data.phone) { setError("Please enter your phone number"); return; }
        if (!termsChecked) { setError("Please agree to the terms & conditions"); return; }
        if (!data.vehicleMake) { setError("Please enter vehicle make"); return; }
        if (!data.vehicleModel) { setError("Please enter vehicle model"); return; }
        if (!data.vehicleYear) { setError("Please enter vehicle built year"); return; }
        if (!data.vehicleReg) { setError("Please enter vehicle registration"); return; }
        if (!data.vehicleLength) { setError("Please enter vehicle length"); return; }
        if (!data.howFound) { setError("Please select how you found us"); return; }
        setError("");
        next();
    };

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
                <input type="text" required placeholder="Enter your first name" value={data.first}
                    onChange={(e) => setData({ ...data, first: e.target.value })} />
                {error && <div className="cd-error"><span className="dot">!</span> {error}</div>}
            </div>

            <div className="cd-field">
                <label>Last Name <span>*</span></label>
                <input type="text" required placeholder="Enter your last name" value={data.last}
                    onChange={(e) => setData({ ...data, last: e.target.value })} />
            </div>

            <div className="cd-field">
                <label>Email Address <span>*</span></label>
                <input type="email" required placeholder="Enter your email address" value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })} />
            </div>

            <div className="cd-field" style={{ position: "relative" }}>
                <label>Phone Number <span>*</span></label>
                <div className="cd-phone">
                    <div
                        className={`cd-flag-select ${showCountryDropdown ? "open" : ""}`}
                        onClick={() => { setShowCountryDropdown(!showCountryDropdown); setCountrySearch(""); }}
                    >
                        <span className="flag-emoji">{selectedCountry.flag}</span>
                        <span className="flag-arrow">▾</span>
                    </div>
                    <input required
                        type="number"
                        placeholder="0412 345 678"
                        value={data.phone}
                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                    />
                </div>

                {showCountryDropdown && (
                    <div className="country-dropdown">
                        <div className="country-search-wrap">
                            <input
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
                                            setData({ ...data, countryCode: c.dial });
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
                <label>Vehicle Built Year <span>*</span></label>
                <input type="number" required placeholder="Enter Vehicle Built Year" value={data.vehicleYear || ""}
                    onChange={(e) => setData({ ...data, vehicleYear: e.target.value })} />
            </div>

            <div className="cd-field">
                <label>Vehicle Registration <span>*</span></label>
                <input required placeholder="Enter Vehicle Registration" value={data.vehicleReg || ""}
                    onChange={(e) => setData({ ...data, vehicleReg: e.target.value })} />
            </div>

            <div className="cd-field">
                <label>Vehicle Length <span>*</span></label>
                <input type="number" required placeholder="Enter Vehicle Length Including Drawbar" value={data.vehicleLength || ""}
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
                                onClick={() => {
                                    setHowFound(opt);
                                    setData({ ...data, howFound: opt });
                                    setShowHowDropdown(false);
                                }}>
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="cd-field">
                <label>Note</label>
                <input placeholder="Enter note details" value={data.note || ""}
                    onChange={(e) => setData({ ...data, note: e.target.value })} />
            </div>

            <div className="bottom-nav">
                <span onClick={back}>← Go Back</span>
                <button onClick={() => { handleNext(); handleClick(); }}>Next: Payment →</button>
            </div>
        </>
    );
};

/* ==== STEP 4 — Payment summary + Stripe Checkout redirect ==== */
const Step4 = ({ back, data }) => {
    const [coupon, setCoupon] = React.useState("");
    const [couponApplied, setCouponApplied] = React.useState(false);
    const [couponLoading, setCouponLoading] = React.useState(false);
    const [couponError, setCouponError] = React.useState("");
    const [couponSuccess, setCouponSuccess] = React.useState("");
    const [discount, setDiscount] = React.useState(0);
    const [bookingLoading, setBookingLoading] = React.useState(false);
    const [bookingError, setBookingError] = React.useState("");

    const subtotal = calcSubtotal(data.unitPrice, data.days);
    const taxAmount = calcTax(subtotal, data.taxRate);
    const total = subtotal + taxAmount - discount;

    const formatDate = (d) => formatBookingDate(d);

    // Validate coupon against database
    const handleApplyCoupon = async () => {
        if (!coupon.trim()) return;
        setCouponError("");
        setCouponSuccess("");
        setCouponLoading(true);

        try {
            const res = await fetch(`${API_BASE}/user/coupon/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: coupon.trim(),
                    serviceId: data.serviceId,
                    email: data.email,
                }),
            });

            const json = await res.json();

            if (!json.success) {
                setCouponError(json.message || "Invalid coupon code.");
                setDiscount(0);
                setCouponApplied(false);
                return;
            }

            // Calculate discount from API response
            const { discountType, discountValue } = json.data;
            const totalBeforeDiscount = subtotal + taxAmount;
            const discountAmount = discountType === "percent"
                ? (totalBeforeDiscount * discountValue) / 100
                : discountValue;                              // "amount" = fixed dollar off

            setDiscount(discountAmount);
            setCouponApplied(true);
            setCouponSuccess(
                discountType === "percent"
                    ? `Coupon applied! ${discountValue}% off — you save $${discountAmount.toFixed(2)}`
                    : `Coupon applied! $${discountValue.toFixed(2)} off — you save $${discountAmount.toFixed(2)}`
            );

        } catch {
            setCouponError("Could not validate coupon. Please try again.");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCoupon("");
        setCouponApplied(false);
        setDiscount(0);
        setCouponError("");
        setCouponSuccess("");
    };

    const handleBooking = async () => {
        setBookingLoading(true);
        setBookingError("");

        try {
            const payload = {
                serviceId: data.serviceId,
                duration: data.days,
                currency: "aud",
                startDate: toYMD(data.start),
                endDate: toYMD(data.end),
                firstName: data.first,
                lastName: data.last,
                email: data.email,
                phone: data.phone,
                countryCode: data.countryCode || "+61",
                vMake: data.vehicleMake,
                vModel: data.vehicleModel,
                vBuiltYear: data.vehicleYear,
                vRegistration: data.vehicleReg,
                vlength: data.vehicleLength,
                howfind: data.howFound,
                note: data.note || "",
                coupon: couponApplied ? coupon.trim() : "",
            };


            const res = await fetch(`${API_BASE}/user/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (!json.success) {
                setBookingError(json.message || "Something went wrong. Please try again.");
                return;
            }

            // Redirect to Stripe Checkout
            window.location.href = json.url;

        } catch (err) {
            console.error("Checkout error:", err);
            setBookingError("Network error. Please check your connection and try again.");
        } finally {
            setBookingLoading(false);
        }
    };

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

                <div className="pay-booking">
                    <div className="pay-booking-inner">
                        <p className="pay-booking-label">Booking Details</p>
                        <p className="pay-booking-type">{data.typeName || "—"}</p>
                        <p className="pay-booking-dates">
                            {formatDate(data.start)} - {formatDate(data.end)}
                        </p>
                    </div>
                </div>

                <div className="line"></div>

                <div className="pay-amount">
                    <div className="pay-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="pay-row"><span>Tax ({data.taxRate || 0}%)</span><span>+${taxAmount.toFixed(2)}</span></div>
                    {discount > 0 && (
                        <div className="pay-row" style={{ color: "green" }}>
                            <span>Discount</span><span>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className="line"></div>

                <div className="pay-coupon">
                    <span>Have a coupon code?</span>
                    <div className="coupon-input">
                        <input
                            placeholder="Enter your coupon code"
                            value={coupon}
                            onChange={(e) => {
                                setCoupon(e.target.value);
                                setCouponApplied(false);
                                setCouponError("");
                                setCouponSuccess("");
                                setDiscount(0);
                            }}
                            disabled={couponApplied || couponLoading}
                        />
                        {!couponApplied ? (
                            <button
                                className="coupon-btn"
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !coupon.trim()}
                            >
                                {couponLoading ? "..." : "✓"}
                            </button>
                        ) : (
                            <button
                                className="coupon-btn"
                                onClick={handleRemoveCoupon}
                                style={{ background: "#e74c3c" }}
                                title="Remove coupon"
                            >✕</button>
                        )}
                    </div>
                    {couponError && (
                        <p style={{ fontSize: "12px", color: "red", marginTop: "4px" }}>
                            {couponError}
                        </p>
                    )}
                    {couponSuccess && (
                        <p style={{ fontSize: "12px", color: "green", marginTop: "4px" }}>
                            ✓ {couponSuccess}
                        </p>
                    )}
                </div>

                <div className="line"></div>

                <div className="pay-total">
                    <span>Total Amount Payable</span>
                    <h2 className="total-amount">${total.toFixed(2)}</h2>
                </div>

                {bookingError && (
                    <div className="cd-error" style={{ marginTop: "12px" }}>
                        <span className="dot">!</span> {bookingError}
                    </div>
                )}
            </div>

            <div className="bottom-nav">
                <span onClick={back}>← Go Back</span>
                <button onClick={handleBooking} disabled={bookingLoading}>
                    {bookingLoading ? "Redirecting to payment..." : "Book Lot →"}
                </button>
            </div>
        </>
    );
};

/* ==== MAIN ==== */
export default function BookOnline() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        // Service info (from API)
        serviceId: "",
        typeName: "",
        unitPrice: 0,
        taxRate: 10,
        minDuration: 7,
        maxDuration: 365,
        // Booking dates
        days: "",
        start: null,
        end: null,
        // Customer details
        first: "", last: "", email: "", phone: "", countryCode: "+61",
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
            <Helmet>
                <title>Book Online</title>
            </Helmet>
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
