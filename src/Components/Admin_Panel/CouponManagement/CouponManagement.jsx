import { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCoupon, deleteCoupon, fetchCoupons, updateCoupon } from "../../../store/slices/couponsSlice";
import { fetchServices } from "../../../store/slices/servicesSlice";
import { fetchCustomers } from "../../../store/slices/customersSlice";
import "./CouponManagement.css";

const defaultForm = {
    title: "",
    couponCode: "",
    discount: "",
    discountType: "amount",
    startDate: "",
    endDate: "",
    services: [],
    usages: 0,
    maxUsages: 1,
    periodType: "Date Range",
    customer: "",
    customerId: "",
    isForAllUsers: true,
    isActive: true,
};

function generateCode(title) {
    return title
        ? title.toUpperCase().replace(/\s+/g, "") + Math.floor(Math.random() * 100)
        : `CODE${Math.floor(Math.random() * 10000)}`;
}

function formatDateOnly(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function normalizePeriodType(value) {
    if (value === "NeverExpires" || value === "Never Expires") return "Never Expires";
    return "Date Range";
}

function normalizeCoupon(coupon, servicesById, customersById) {
    const serviceIds = Array.isArray(coupon.services)
        ? coupon.services.map((service) => {
            if (typeof service === "string") return service;
            return service?._id || service?.id || "";
        }).filter(Boolean)
        : [];

    const serviceNames = serviceIds.map((id) => servicesById.get(id)?.serviceName || id);
    const customer = coupon.customerId && customersById.get(coupon.customerId)
        ? customersById.get(coupon.customerId)
        : null;

    return {
        id: coupon._id,
        title: coupon.title || "",
        couponCode: coupon.code || "",
        discount: coupon.discountValue ?? 0,
        discountType: coupon.discountType || "amount",
        startDate: coupon.startDate || "",
        endDate: coupon.endDate || "",
        services: serviceNames,
        serviceIds,
        usages: coupon.usageCount ?? 0,
        maxUsages: coupon.usageLimit ?? 0,
        periodType: normalizePeriodType(coupon.periodType),
        customer: customer?.name || "",
        customerId: coupon.customerId || "",
        isForAllUsers: coupon.isForAllUsers ?? false,
        isActive: coupon.isActive ?? true,
    };
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

    const label = selected.length === 0
        ? "Select services"
        : selected.length === 1
            ? selected[0]
            : `${selected[0]} +${selected.length - 1}`;

    return (
        <div className="cm-svc-dropdown" ref={ref}>
            <div className={`cm-svc-trigger ${open ? "open" : ""}`} onClick={() => setOpen((v) => !v)}>
                <span className={selected.length === 0 ? "cm-svc-placeholder" : "cm-svc-value"}>{label}</span>
                <span className="cm-svc-arrow">{open ? "^" : "v"}</span>
            </div>
            {open && (
                <div className="cm-svc-menu">
                    {options.map((svc) => {
                        const checked = selected.includes(svc.label);
                        return (
                            <div key={svc.value} className={`cm-svc-option ${checked ? "selected" : ""}`} onClick={() => onToggle(svc)}>
                                {checked && <span className="cm-svc-check">√</span>}
                                <span>{svc.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function CouponManagement() {
    const dispatch = useDispatch();
    const { data: rawCoupons, loading, error, saving, saveError, deleting, deleteError } = useSelector((state) => state.coupons);
    const services = useSelector((state) => state.services.list || []);
    const customers = useSelector((state) => state.customers.data || []);

    const [view, setView] = useState("list");
    const [form, setForm] = useState(defaultForm);
    const [editId, setEditId] = useState(null);
    const [perPage, setPerPage] = useState(20);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        dispatch(fetchCoupons());
        dispatch(fetchServices());
        dispatch(fetchCustomers());
    }, [dispatch]);

    const servicesById = useMemo(
        () => new Map((services || []).map((service) => [service._id, service])),
        [services]
    );
    const customersById = useMemo(
        () => new Map((customers || []).map((customer) => {
            const name = customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
            return [customer._id || customer.id, { ...customer, name }];
        })),
        [customers]
    );

    const serviceOptions = useMemo(
        () => (services || []).filter((service) => service?._id).map((service) => ({ value: service._id, label: service.serviceName || "Unnamed Service" })),
        [services]
    );
    const customerOptions = useMemo(
        () => (customers || []).map((customer) => {
            const id = customer._id || customer.id;
            return {
                value: id,
                label: customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || customer.email || id,
            };
        }),
        [customers]
    );

    const coupons = useMemo(
        () => (Array.isArray(rawCoupons) ? rawCoupons.map((coupon) => normalizeCoupon(coupon, servicesById, customersById)) : []),
        [rawCoupons, servicesById, customersById]
    );

    const pagedCoupons = useMemo(() => coupons.slice(0, perPage), [coupons, perPage]);

    const handleAddNew = () => {
        setForm(defaultForm);
        setEditId(null);
        setView("add");
    };

    const handleEdit = (coupon) => {
        setForm({
            title: coupon.title,
            couponCode: coupon.couponCode,
            discount: coupon.discount,
            discountType: coupon.discountType,
            startDate: coupon.startDate ? String(coupon.startDate).slice(0, 10) : "",
            endDate: coupon.endDate ? String(coupon.endDate).slice(0, 10) : "",
            services: coupon.services,
            serviceIds: coupon.serviceIds,
            usages: coupon.usages,
            maxUsages: coupon.maxUsages || 1,
            periodType: coupon.periodType,
            customer: coupon.customer,
            customerId: coupon.customerId,
            isForAllUsers: coupon.isForAllUsers,
            isActive: coupon.isActive,
        });
        setEditId(coupon.id);
        setView("edit");
    };

    const handleDelete = async (id) => {
        await dispatch(deleteCoupon(id));
        setDeleteConfirm(null);
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

    const toggleService = (service) => {
        setForm((prev) => {
            const exists = prev.serviceIds?.includes(service.value);
            const nextIds = exists
                ? prev.serviceIds.filter((id) => id !== service.value)
                : [...(prev.serviceIds || []), service.value];
            const nextNames = exists
                ? prev.services.filter((name) => name !== service.label)
                : [...prev.services, service.label];
            return {
                ...prev,
                serviceIds: nextIds,
                services: nextNames,
            };
        });
    };

    const changeMaxUsages = (delta) => {
        setForm((prev) => ({
            ...prev,
            maxUsages: Math.max(1, Number(prev.maxUsages || 1) + delta),
        }));
    };

    const handleSave = async () => {
        const payload = {
            title: form.title,
            code: form.couponCode,
            periodType: form.periodType === "Never Expires" ? "NeverExpires" : "DateRange",
            startDate: form.periodType === "Never Expires" ? undefined : form.startDate,
            endDate: form.periodType === "Never Expires" ? undefined : form.endDate,
            discountValue: Number(form.discount),
            discountType: form.discountType || "amount",
            customerId: form.isForAllUsers ? undefined : form.customerId || undefined,
            isForAllUsers: form.isForAllUsers,
            services: form.serviceIds || [],
            usageLimit: Number(form.maxUsages || 0),
            usageCount: Number(form.usages || 0),
            isActive: form.isActive,
        };

        const action = editId
            ? updateCoupon({ id: editId, payload })
            : addCoupon(payload);

        const result = await dispatch(action);
        if (!result.error) {
            handleCancel();
        }
    };

    if (loading && view === "list") {
        return <div className="cm-wrapper"><div className="cm-empty">Loading coupons...</div></div>;
    }

    if (view === "list") {
        return (
            <div className="cm-wrapper">
                <div className="cm-header">
                    <h2 className="cm-title">Coupon Management</h2>
                    <button className="cm-btn-add" onClick={handleAddNew}>+ Add New</button>
                </div>

                {error && <div className="cm-empty" style={{ color: "#dc2626" }}>{error}</div>}
                {deleteError && <div className="cm-empty" style={{ color: "#dc2626" }}>{deleteError}</div>}

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
                                    <td colSpan={7} className="cm-empty">No coupons found. Click "+ Add New" to create one.</td>
                                </tr>
                            ) : (
                                pagedCoupons.map((coupon) => (
                                    <tr key={coupon.id}>
                                        <td>{coupon.title}</td>
                                        <td><span className="cm-code-badge">{coupon.couponCode}</span></td>
                                        <td>
                                            <span className="cm-discount">
                                                {coupon.discountType === "percent" ? `${coupon.discount}%` : `$${coupon.discount}`}
                                                <span className="cm-discount-icon">{coupon.discountType === "percent" ? "%" : "$"}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <div className="cm-duration">
                                                <span>{coupon.periodType === "Never Expires" ? "Never Expires" : formatDateOnly(coupon.startDate)}</span>
                                                <span>{coupon.periodType === "Never Expires" ? "-" : formatDateOnly(coupon.endDate)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="cm-services">
                                                {coupon.services.slice(0, 3).map((service, i) => (
                                                    <div key={i} className="cm-service-item">{service}</div>
                                                ))}
                                                {coupon.services.length > 3 && (
                                                    <div className="cm-service-more">+{coupon.services.length - 3} more</div>
                                                )}
                                            </div>
                                        </td>
                                        <td><span className="cm-usages">{coupon.usages}/{coupon.maxUsages}</span></td>
                                        <td>
                                            <div className="cm-actions">
                                                <button className="cm-btn-edit" onClick={() => handleEdit(coupon)}>Edit</button>
                                                {deleteConfirm === coupon.id ? (
                                                    <span className="cm-delete-confirm">
                                                        <button className="cm-btn-confirm-del" onClick={() => handleDelete(coupon.id)} disabled={deleting}>Yes</button>
                                                        <button className="cm-btn-cancel-del" onClick={() => setDeleteConfirm(null)}>No</button>
                                                    </span>
                                                ) : (
                                                    <button className="cm-btn-delete" onClick={() => setDeleteConfirm(coupon.id)}>Delete</button>
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
                    <span className="cm-showing">Showing {Math.min(coupons.length, perPage)} out of {coupons.length}</span>
                    <div className="cm-perpage">
                        <span>Per Page</span>
                        <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cm-wrapper">
            <div className="cm-form-header">
                <h2 className="cm-title">{view === "edit" ? "Edit Coupon" : "Add Coupon"}</h2>
                <div className="cm-form-header-actions">
                    <button className="cm-btn-save" onClick={handleSave} disabled={saving}>Save</button>
                    <button className="cm-btn-cancel" onClick={handleCancel}>Cancel</button>
                </div>
            </div>

            {saveError && <div className="cm-empty" style={{ color: "#dc2626" }}>{saveError}</div>}

            <div className="cm-form-card">
                <div className="cm-field-group full">
                    <label className="cm-label">Coupon Period Type</label>
                    <div className="cm-radio-group">
                        <label className="cm-radio-label">
                            <input type="radio" name="periodType" value="Date Range" checked={form.periodType === "Date Range"} onChange={(e) => handleFormChange("periodType", e.target.value)} />
                            <span className="cm-radio-custom"></span>
                            Date Range
                        </label>
                        <label className="cm-radio-label">
                            <input type="radio" name="periodType" value="Never Expires" checked={form.periodType === "Never Expires"} onChange={(e) => handleFormChange("periodType", e.target.value)} />
                            <span className="cm-radio-custom"></span>
                            Never Expires
                        </label>
                    </div>
                </div>

                <div className="cm-form-grid">
                    <div className="cm-field-group">
                        <label className="cm-label">Title</label>
                        <input className="cm-input" type="text" placeholder="Enter title" value={form.title} onChange={(e) => handleFormChange("title", e.target.value)} />
                    </div>

                    <div className="cm-field-group">
                        <label className="cm-label">Start Date <span className="cm-required">*</span></label>
                        <input className="cm-input" type="date" value={form.startDate} onChange={(e) => handleFormChange("startDate", e.target.value)} disabled={form.periodType === "Never Expires"} />
                    </div>

                    <div className="cm-field-group">
                        <label className="cm-label">End Date <span className="cm-required">*</span></label>
                        <input className="cm-input" type="date" value={form.endDate} onChange={(e) => handleFormChange("endDate", e.target.value)} disabled={form.periodType === "Never Expires"} />
                    </div>

                    <div className="cm-field-group">
                        <label className="cm-label">Coupon Code <span className="cm-required">*</span></label>
                        <div className="cm-input-with-btn">
                            <input className="cm-input" type="text" placeholder="Enter coupon code" value={form.couponCode} onChange={(e) => handleFormChange("couponCode", e.target.value)} />
                            <button className="cm-btn-generate" onClick={handleGenerate}>Generate</button>
                        </div>
                    </div>

                    <div className="cm-field-group">
                        <label className="cm-label">Discount <span className="cm-required">*</span></label>
                        <div className="cm-input-suffix">
                            <input className="cm-input" type="number" placeholder="0" value={form.discount} onChange={(e) => handleFormChange("discount", e.target.value)} />
                            <span className="cm-suffix">{form.discountType === "percent" ? "%" : "$"}</span>
                        </div>
                    </div>

                    <div className="cm-field-group">
                        <label className="cm-label">Discount Type</label>
                        <select className="cm-input" value={form.discountType} onChange={(e) => handleFormChange("discountType", e.target.value)}>
                            <option value="amount">Amount</option>
                            <option value="percent">Percent</option>
                        </select>
                    </div>

                    <div className="cm-field-group">
                        <label className="cm-label">Coupon Scope</label>
                        <select className="cm-input" value={form.isForAllUsers ? "all" : "single"} onChange={(e) => handleFormChange("isForAllUsers", e.target.value === "all")}>
                            <option value="all">All Customers</option>
                            <option value="single">Specific Customer</option>
                        </select>
                    </div>

                    <div className="cm-field-group">
                        <label className="cm-label">Select Customer</label>
                        <select className="cm-input" value={form.customerId || ""} onChange={(e) => {
                            const selected = customerOptions.find((option) => option.value === e.target.value);
                            handleFormChange("customerId", e.target.value);
                            handleFormChange("customer", selected?.label || "");
                        }} disabled={form.isForAllUsers}>
                            <option value="">Select customer</option>
                            {customerOptions.map((customer) => (
                                <option key={customer.value} value={customer.value}>{customer.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="cm-field-group">
                        <label className="cm-label">Select Services</label>
                        <ServicesDropdown selected={form.services} options={serviceOptions} onToggle={toggleService} />
                    </div>

                    <div className="cm-field-group">
                        <label className="cm-label">No. Of times uses allowed</label>
                        <div className="cm-counter">
                            <button className="cm-counter-btn" onClick={() => changeMaxUsages(-1)}>−</button>
                            <span className="cm-counter-val">{form.maxUsages}</span>
                            <button className="cm-counter-btn" onClick={() => changeMaxUsages(1)}>+</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
