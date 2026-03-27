import React from "react";
import "./TermsAndConditions.css";

export default function TermsAndConditions() {
    return (
        <div className="tnc-wrapper">
            <div className="tnc-bg-circle tnc-bg-circle--1" />
            <div className="tnc-bg-circle tnc-bg-circle--2" />

            <div className="tnc-container">
                <header className="tnc-header">
                    <div className="tnc-header-text">
                        <p className="tnc-doc-label">Storage Agreement</p>
                        <h1 className="tnc-title">Terms &amp; Conditions</h1>
                        <p className="tnc-subtitle">Central Coast Caravan Storage — April 2025</p>
                    </div>
                </header>

                <div className="tnc-divider" />

                <section className="tnc-intro">
                    <p>
                        Thank you for choosing to store your caravan at{" "}
                        <strong>Central Coast Caravan Storage</strong>, Lake Rd Tuggerah.
                    </p>
                    <p>
                        We wish to advise all customers that while we take all due care in the
                        operation and management of the storage park, Central Coast Caravan
                        Storage accepts <strong>no responsibility or liability</strong> for
                        loss, theft, damage, or destruction to any caravan, vehicle, or personal
                        property stored on the premises.
                    </p>
                    <p>
                        It is a <strong>strict condition</strong> of storing your caravan with
                        us that you hold your own insurance cover. This includes (but is not
                        limited to) cover for fire, theft, vandalism, storm damage, and
                        accidental damage.
                    </p>
                </section>

                <div className="tnc-security-banner">
                    <div className="tnc-security-icon">🔒</div>
                    <p>
                        Central Coast Caravan Storage provides security fencing, lighting,
                        CCTV &amp; periodic security patrols to minimise any incidents occurring.
                        We will endeavour to ensure your choice of storing your valued asset with
                        us is as smooth as possible.
                    </p>
                </div>

                <section className="tnc-acknowledgements">
                    <h2 className="tnc-section-title">
                        By continuing to store your caravan with us, you acknowledge and accept:
                    </h2>
                    <ol className="tnc-list">
                        <li className="tnc-list-item">
                            <span className="tnc-list-number">01</span>
                            <div className="tnc-list-content">
                                <strong>Insurance Responsibility</strong>
                                <p>
                                    You are responsible for insuring your own property stored at our
                                    facility.
                                </p>
                            </div>
                        </li>
                        <li className="tnc-list-item">
                            <span className="tnc-list-number">02</span>
                            <div className="tnc-list-content">
                                <strong>Limitation of Liability</strong>
                                <p>
                                    Central Coast Caravan Storage, its owners, and staff are not liable
                                    for any damage or loss to your property.
                                </p>
                            </div>
                        </li>
                        <li className="tnc-list-item">
                            <span className="tnc-list-number">03</span>
                            <div className="tnc-list-content">
                                <strong>Storage at Own Risk</strong>
                                <p>You agree that storage is entirely at your own risk.</p>
                            </div>
                        </li>
                    </ol>
                </section>

                <div className="tnc-notice">
                    <span className="tnc-notice-icon">⚠️</span>
                    <p>
                        Please ensure your insurance is <strong>current</strong> and covers the
                        full value of your caravan and any contents stored within it.
                    </p>
                </div>

                <section className="tnc-contact">
                    <h2 className="tnc-section-title">Contact Us</h2>
                    <p className="tnc-contact-sub">
                        If you have any questions or need clarification, feel free to reach out.
                    </p>
                    <div className="tnc-contact-cards">
                        <div className="tnc-contact-card">
                            <div className="tnc-contact-avatar">JC</div>
                            <div>
                                <p className="tnc-contact-name">Jimmy Crehan</p>
                                <a href="tel:0412260525" className="tnc-contact-phone">
                                    0412 260 525
                                </a>
                            </div>
                        </div>
                        <div className="tnc-contact-card">
                            <div className="tnc-contact-avatar">SC</div>
                            <div>
                                <p className="tnc-contact-name">Sean Crosby</p>
                                <a href="tel:0402438063" className="tnc-contact-phone">
                                    0402 438 063
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}