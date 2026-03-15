import { useState, useRef, useEffect } from "react";
import "./CouponManagement.css";

const initialCoupons = [
    {
        id: 1,
        title: "APRIL2025",
        couponCode: "APRIL2025",
        discount: 20,
        startDate: "March 28, 2025",
        endDate: "April 30, 2025",
        services: ["Large Lot - 9mx3m", "Medium Lot - 7mx3m", "Small Lot - 6mx3m"],
        usages: 1,
        maxUsages: 52,
        periodType: "Date Range",
        customer: "",
    },
];

const defaultForm = {
    title: "",
    couponCode: "",
    discount: "",
    startDate: "",
    endDate: "",
    services: [],
    usages: 0,
    maxUsages: 1,
    periodType: "Date Range",
    customer: "",
};

const serviceOptions = [
    "Large Lot - 9mx3m",
    "Medium Lot - 7mx3m",
    "Small Lot - 6mx3m",
    "Premium Lot - 12mx4m",
];

function generateCode(title) {
    return title
        ? title.toUpperCase().replace(/\s+/g, "") + Math.floor(Math.random() * 100)
        : "CODE" + Math.floor(Math.random() * 10000);
}

function ServicesDropdown({ selected, options, onToggle }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const label =
        selected.length === 0
            ? "Select services"
            : selected.length === 1
                ? selected[0]
                : `${selected[0]} +${selected.length - 1}`;

    return (
        <div className="cm-svc-dropdown" ref={ref}>
            <div
                className={`cm-svc-trigger ${open ? "open" : ""}`}
                onClick={() => setOpen((v) => !v)}
            >
                <span className={selected.length === 0 ? "cm-svc-placeholder" : "cm-svc-value"}>
                    {label}
                </span>
                <span className="cm-svc-arrow">{open ? "▲" : "▼"}</span>
            </div>
            {open && (
                <div className="cm-svc-menu">
                    {options.map((svc) => {
                        const checked = selected.includes(svc);
                        return (
                            <div
                                key={svc}
                                className={`cm-svc-option ${checked ? "selected" : ""}`}
                                onClick={() => onToggle(svc)}
                            >
                                {checked && <span className="cm-svc-check">✓</span>}
                                <span>{svc}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function CouponManagement() {
    const [coupons, setCoupons] = useState(initialCoupons);
    const [view, setView] = useState("list"); // 'list' | 'add' | 'edit'
    const [form, setForm] = useState(defaultForm);
    const [editId, setEditId] = useState(null);
    const [perPage, setPerPage] = useState(20);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleAddNew = () => {
        setForm(defaultForm);
        setEditId(null);
        setView("add");
    };

    const handleEdit = (coupon) => {
        setForm({ ...coupon });
        setEditId(coupon.id);
        setView("edit");
    };

    const handleDelete = (id) => {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        setDeleteConfirm(null);
    };

    const handleSave = () => {
        if (view === "edit") {
            setCoupons((prev) =>
                prev.map((c) => (c.id === editId ? { ...form, id: editId } : c))
            );
        } else {
            setCoupons((prev) => [
                ...prev,
                { ...form, id: Date.now(), usages: 0 },
            ]);
        }
        setView("list");
        setForm(defaultForm);
        setEditId(null);
    };

    const handleCancel = () => {
        setView("list");
        setForm(defaultForm);
        setEditId(null);
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleGenerate = () => {
        handleFormChange("couponCode", generateCode(form.title));
    };

    const toggleService = (svc) => {
        setForm((prev) => ({
            ...prev,
            services: prev.services.includes(svc)
                ? prev.services.filter((s) => s !== svc)
                : [...prev.services, svc],
        }));
    };

    const changeMaxUsages = (delta) => {
        setForm((prev) => ({
            ...prev,
            maxUsages: Math.max(1, (prev.maxUsages || 1) + delta),
        }));
    };

    if (view === "list") {
        return (
            <div className="cm-wrapper">
                <div className="cm-header">
                    <h2 className="cm-title">Coupon Management</h2>
                    <button className="cm-btn-add" onClick={handleAddNew}>
                        + Add New
                    </button>
                </div>

                <div className="cm-table-container">
                    <table className="cm-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Coupon Code</th>
                                <th>Discount</th>
                                <th>Coupon Duration</th>
                                <th>Services</th>
                                <th>Usages</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="cm-empty">
                                        No coupons found. Click "+ Add New" to create one.
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id}>
                                        <td>{coupon.title}</td>
                                        <td>
                                            <span className="cm-code-badge">{coupon.couponCode}</span>
                                        </td>
                                        <td>
                                            <span className="cm-discount">
                                                ${coupon.discount}
                                                <span className="cm-discount-icon">$</span>
                                            </span>
                                        </td>
                                        <td>
                                            <div className="cm-duration">
                                                <span>{coupon.startDate}</span>
                                                <span>{coupon.endDate}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="cm-services">
                                                {coupon.services.slice(0, 3).map((s, i) => (
                                                    <div key={i} className="cm-service-item">
                                                        {s}
                                                    </div>
                                                ))}
                                                {coupon.services.length > 3 && (
                                                    <div className="cm-service-more">
                                                        +{coupon.services.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="cm-usages">
                                                {coupon.usages}/{coupon.maxUsages}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="cm-actions">
                                                <button
                                                    className="cm-btn-edit"
                                                    onClick={() => handleEdit(coupon)}
                                                >
                                                    Edit
                                                </button>
                                                {deleteConfirm === coupon.id ? (
                                                    <span className="cm-delete-confirm">
                                                        <button
                                                            className="cm-btn-confirm-del"
                                                            onClick={() => handleDelete(coupon.id)}
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            className="cm-btn-cancel-del"
                                                            onClick={() => setDeleteConfirm(null)}
                                                        >
                                                            No
                                                        </button>
                                                    </span>
                                                ) : (
                                                    <button
                                                        className="cm-btn-delete"
                                                        onClick={() => setDeleteConfirm(coupon.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="cm-footer">
                    <span className="cm-showing">
                        Showing {Math.min(coupons.length, perPage)} out of {coupons.length}
                    </span>
                    <div className="cm-perpage">
                        <span>Per Page</span>
                        <select
                            value={perPage}
                            onChange={(e) => setPerPage(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    // Add / Edit Form View
    return (
        <div className="cm-wrapper">
            <div className="cm-form-header">
                <h2 className="cm-title">
                    {view === "edit" ? "Edit Coupon" : "Add Coupon"}
                </h2>
                <div className="cm-form-header-actions">
                    <button className="cm-btn-save" onClick={handleSave}>
                        Save
                    </button>
                    <button className="cm-btn-cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </div>

            <div className="cm-form-card">
                {/* Period Type */}
                <div className="cm-field-group full">
                    <label className="cm-label">Coupon Period Type</label>
                    <div className="cm-radio-group">
                        <label className="cm-radio-label">
                            <input
                                type="radio"
                                name="periodType"
                                value="Date Range"
                                checked={form.periodType === "Date Range"}
                                onChange={(e) => handleFormChange("periodType", e.target.value)}
                            />
                            <span className="cm-radio-custom"></span>
                            Date Range
                        </label>
                        <label className="cm-radio-label">
                            <input
                                type="radio"
                                name="periodType"
                                value="Never Expires"
                                checked={form.periodType === "Never Expires"}
                                onChange={(e) => handleFormChange("periodType", e.target.value)}
                            />
                            <span className="cm-radio-custom"></span>
                            Never Expires
                        </label>
                    </div>
                </div>

                <div className="cm-form-grid">
                    {/* Title */}
                    <div className="cm-field-group">
                        <label className="cm-label">Title</label>
                        <input
                            className="cm-input"
                            type="text"
                            placeholder="Enter title"
                            value={form.title}
                            onChange={(e) => handleFormChange("title", e.target.value)}
                        />
                    </div>

                    {/* Start Date */}
                    <div className="cm-field-group">
                        <label className="cm-label">
                            Start Date <span className="cm-required">*</span>
                        </label>
                        <input
                            className="cm-input"
                            type="date"
                            value={form.startDate}
                            onChange={(e) => handleFormChange("startDate", e.target.value)}
                            disabled={form.periodType === "Never Expires"}
                        />
                    </div>

                    {/* End Date */}
                    <div className="cm-field-group">
                        <label className="cm-label">
                            End Date <span className="cm-required">*</span>
                        </label>
                        <input
                            className="cm-input"
                            type="date"
                            value={form.endDate}
                            onChange={(e) => handleFormChange("endDate", e.target.value)}
                            disabled={form.periodType === "Never Expires"}
                        />
                    </div>

                    {/* Coupon Code */}
                    <div className="cm-field-group">
                        <label className="cm-label">
                            Coupon Code <span className="cm-required">*</span>
                        </label>
                        <div className="cm-input-with-btn">
                            <input
                                className="cm-input"
                                type="text"
                                placeholder="Enter coupon code"
                                value={form.couponCode}
                                onChange={(e) => handleFormChange("couponCode", e.target.value)}
                            />
                            <button className="cm-btn-generate" onClick={handleGenerate}>
                                Generate
                            </button>
                        </div>
                    </div>

                    {/* Discount */}
                    <div className="cm-field-group">
                        <label className="cm-label">
                            Discount <span className="cm-required">*</span>
                        </label>
                        <div className="cm-input-suffix">
                            <input
                                className="cm-input"
                                type="number"
                                placeholder="0"
                                value={form.discount}
                                onChange={(e) => handleFormChange("discount", e.target.value)}
                            />
                            <span className="cm-suffix">$</span>
                        </div>
                    </div>

                    {/* Select Customer */}
                    <div className="cm-field-group">
                        <label className="cm-label">Select Customer</label>
                        <input
                            className="cm-input"
                            type="text"
                            placeholder="Start typing to fetch customer"
                            value={form.customer}
                            onChange={(e) => handleFormChange("customer", e.target.value)}
                        />
                    </div>

                    {/* Select Services */}
                    <div className="cm-field-group">
                        <label className="cm-label">Select Services</label>
                        <ServicesDropdown
                            selected={form.services}
                            options={serviceOptions}
                            onToggle={toggleService}
                        />
                    </div>

                    {/* No of times used allowed */}
                    <div className="cm-field-group">
                        <label className="cm-label">No. Of times uses allowed</label>
                        <div className="cm-counter">
                            <button
                                className="cm-counter-btn"
                                onClick={() => changeMaxUsages(-1)}
                            >
                                −
                            </button>
                            <span className="cm-counter-val">{form.maxUsages}</span>
                            <button
                                className="cm-counter-btn"
                                onClick={() => changeMaxUsages(1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}