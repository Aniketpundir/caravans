import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchServices,
    addService,
    setFilterName,
    setFilterCategory,
    applyFilters,
    resetFilters,
    deleteServiceLocal,
    updateServiceLocal,
    clearAddError,
    selectFilteredServices,
    selectCategories,
    selectServicesLoading,
    selectServicesError,
    selectAdding,
    selectAddError,
    selectFilterName,
    selectFilterCategory,
} from "../../../store/slices/servicesSlice";
import "./ManageServices.css";

/* ─── EMPTY FORM ─── */
const EMPTY_FORM = {
    _id: null,
    serviceName: "",
    category: "",
    unitPrice: "",
    unitDurationValue: 1,
    unitDurationUnit: "days",
    bufferTimeBefore: 0,
    bufferTimeAfter: 0,
    maxCapacity: 100,
    description: "",
    availabilityStartDate: "",
    availabilityExpirationDate: "",
    minDuration: 7,
    maxDuration: 365,
    minTimeBeforeBooking: 0,
    minTimeBeforeReschedule: 0,
    minTimeBeforeCancel: 0,
    tax: 0,
    isDisabled: false,
    imageFile: null,       // File object
    imagePreview: "",      // Local preview URL
};

/* ─── Grip Icon ─── */
function GripIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="4" cy="3" r="1.2" fill="currentColor" />
            <circle cx="4" cy="7" r="1.2" fill="currentColor" />
            <circle cx="4" cy="11" r="1.2" fill="currentColor" />
            <circle cx="10" cy="3" r="1.2" fill="currentColor" />
            <circle cx="10" cy="7" r="1.2" fill="currentColor" />
            <circle cx="10" cy="11" r="1.2" fill="currentColor" />
        </svg>
    );
}

/* ─── Service Image ─── */
function ServiceImage({ url, name = "" }) {
    const [imgErr, setImgErr] = useState(false);
    const colors = ["#93c5fd", "#86efac", "#fda4af", "#fde68a", "#c4b5fd", "#6ee7b7"];
    const bg = colors[(name.charCodeAt(0) || 0) % colors.length];

    if (url && !imgErr) {
        return (
            <div className="ms-avatar">
                <img src={url} alt={name} onError={() => setImgErr(true)} />
            </div>
        );
    }
    return (
        <div className="ms-avatar" style={{ background: bg, color: "#fff", fontWeight: 700, fontSize: 13 }}>
            {name[0]?.toUpperCase() || "?"}
        </div>
    );
}

/* ─── Stepper ─── */
function Stepper({ value, onChange }) {
    return (
        <div className="ms-stepper">
            <button className="ms-stepper-btn" onClick={() => onChange(Math.max(0, value - 1))}>−</button>
            <input className="ms-stepper-val" value={value}
                onChange={e => onChange(Number(e.target.value) || 0)} />
            <button className="ms-stepper-btn" onClick={() => onChange(value + 1)}>+</button>
        </div>
    );
}

/* ─── Loading Skeleton ─── */
function LoadingSkeleton() {
    return (
        <>
            {[1, 2, 3].map(i => (
                <div className="ms-table-row" key={i}>
                    <div className="ms-drag-handle"><GripIcon /></div>
                    <div><input type="checkbox" className="ms-checkbox" disabled /></div>
                    <div className="ms-service-info">
                        <div className="ms-avatar ms-skeleton" />
                        <div className="ms-skeleton" style={{ width: 140, height: 14, borderRadius: 4 }} />
                    </div>
                    <div className="ms-cell"><div className="ms-skeleton" style={{ width: 100, height: 14, borderRadius: 4 }} /></div>
                    <div className="ms-cell"><div className="ms-skeleton" style={{ width: 60, height: 14, borderRadius: 4 }} /></div>
                    <div className="ms-cell"><div className="ms-skeleton" style={{ width: 50, height: 14, borderRadius: 4 }} /></div>
                    <div />
                </div>
            ))}
        </>
    );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function ManageServices() {
    const dispatch = useDispatch();
    const imageRef = useRef(null);

    /* Redux */
    const filtered = useSelector(selectFilteredServices);
    const apiCategories = useSelector(selectCategories);
    const loading = useSelector(selectServicesLoading);
    const error = useSelector(selectServicesError);
    const adding = useSelector(selectAdding);
    const addError = useSelector(selectAddError);
    const filterName = useSelector(selectFilterName);
    const filterCategory = useSelector(selectFilterCategory);

    /* Local */
    const [localCats, setLocalCats] = useState([]);
    const [selected, setSelected] = useState([]);
    const [showCatModal, setShowCatModal] = useState(false);
    const [showAddCat, setShowAddCat] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [editCatId, setEditCatId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [activeTab, setActiveTab] = useState("Service Settings");

    /* Fetch on mount */
    useEffect(() => { dispatch(fetchServices()); }, [dispatch]);

    /* Close form after successful add */
    useEffect(() => {
        if (!adding && !addError && showForm && !isEditMode) {
            // addService fulfilled — close form & refresh
            // (we check via a flag set before dispatch)
        }
    }, [adding]);

    const allCats = [...new Set([...apiCategories, ...localCats.map(c => c.name)])];

    /* Select */
    const toggleAll = checked => setSelected(checked ? filtered.map(s => s._id) : []);
    const toggleOne = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

    /* Filters */
    const handleApply = () => dispatch(applyFilters());
    const handleReset = () => dispatch(resetFilters());

    /* Open Add form */
    const openAdd = () => {
        setForm(EMPTY_FORM);
        setIsEditMode(false);
        dispatch(clearAddError());
        setShowForm(true);
    };

    /* Open Edit form — uses existing svc data (no POST) */
    const openEdit = svc => {
        setForm({
            ...EMPTY_FORM,
            _id: svc._id,
            serviceName: svc.serviceName || "",
            category: svc.category || "",
            unitPrice: svc.unitPrice || "",
            unitDurationValue: svc.unitDuration?.value || 1,
            unitDurationUnit: svc.unitDuration?.unit || "days",
            bufferTimeBefore: svc.bufferTimeBefore || 0,
            bufferTimeAfter: svc.bufferTimeAfter || 0,
            maxCapacity: svc.maxCapacity || 100,
            description: svc.description || "",
            availabilityStartDate: svc.availability?.startDate?.slice(0, 10) || "",
            availabilityExpirationDate: svc.availability?.expirationDate?.slice(0, 10) || "",
            minDuration: svc.minDuration || 7,
            maxDuration: svc.maxDuration || 365,
            minTimeBeforeBooking: svc.bookingRules?.minTimeBeforeBooking || 0,
            minTimeBeforeReschedule: svc.bookingRules?.minTimeBeforeReschedule || 0,
            minTimeBeforeCancel: svc.bookingRules?.minTimeBeforeCancel || 0,
            tax: svc.tax || 0,
            isDisabled: svc.isDisabled || false,
            imageFile: null,
            imagePreview: svc.image?.url || "",
        });
        setIsEditMode(true);
        setShowForm(true);
    };

    const handleDel = svc => dispatch(deleteServiceLocal(svc._id));

    /* ── IMAGE SELECTION ── */
    const handleImageChange = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setForm(p => ({ ...p, imageFile: file, imagePreview: preview }));
    };

    const removeImage = () => {
        setForm(p => ({ ...p, imageFile: null, imagePreview: "" }));
        if (imageRef.current) imageRef.current.value = "";
    };

    /* ── SAVE ── */
    const saveService = async () => {
        if (!form.serviceName?.trim()) return;

        if (isEditMode) {
            /* Edit: local update only (PUT API not in scope) */
            dispatch(updateServiceLocal({
                _id: form._id,
                serviceName: form.serviceName,
                category: form.category,
                unitPrice: form.unitPrice,
                unitDuration: { value: form.unitDurationValue, unit: form.unitDurationUnit },
                bufferTimeBefore: form.bufferTimeBefore,
                bufferTimeAfter: form.bufferTimeAfter,
                maxCapacity: form.maxCapacity,
                description: form.description,
                tax: form.tax,
                isDisabled: form.isDisabled,
                availability: {
                    startDate: form.availabilityStartDate,
                    expirationDate: form.availabilityExpirationDate,
                },
                bookingRules: {
                    minTimeBeforeBooking: form.minTimeBeforeBooking,
                    minTimeBeforeReschedule: form.minTimeBeforeReschedule,
                    minTimeBeforeCancel: form.minTimeBeforeCancel,
                },
            }));
            setShowForm(false);
            return;
        }

        /* ── ADD NEW: POST to API with multipart/form-data ── */
        const fd = new FormData();
        fd.append("serviceName", form.serviceName);
        fd.append("category", form.category);
        fd.append("description", form.description);
        fd.append("bufferTimeBefore", form.bufferTimeBefore);
        fd.append("bufferTimeAfter", form.bufferTimeAfter);
        fd.append("maxCapacity", form.maxCapacity);
        fd.append("unitDurationValue", form.unitDurationValue);
        fd.append("unitDurationUnit", form.unitDurationUnit);
        fd.append("unitPrice", form.unitPrice);
        fd.append("minDuration", form.minDuration);
        fd.append("maxDuration", form.maxDuration);
        fd.append("minTimeBeforeBooking", form.minTimeBeforeBooking);
        fd.append("minTimeBeforeReschedule", form.minTimeBeforeReschedule);
        fd.append("minTimeBeforeCancel", form.minTimeBeforeCancel);
        fd.append("availabilityStartDate", form.availabilityStartDate);
        fd.append("availabilityExpirationDate", form.availabilityExpirationDate);
        fd.append("isDisabled", form.isDisabled);
        fd.append("tax", form.tax);
        if (form.imageFile) {
            fd.append("image", form.imageFile);
        }

        const result = await dispatch(addService(fd));
        if (addService.fulfilled.match(result)) {
            setShowForm(false);
            dispatch(fetchServices()); // Refresh list
        }
    };

    /* Category CRUD (local) */
    const openAddCat = () => { setNewCatName(""); setEditCatId(null); setShowAddCat(true); };
    const startEditCat = cat => { setEditCatId(cat.id); setNewCatName(cat.name); setShowAddCat(true); };
    const deleteCat = id => setLocalCats(p => p.filter(c => c.id !== id));
    const saveCat = () => {
        if (!newCatName.trim()) return;
        if (editCatId !== null) setLocalCats(p => p.map(c => c.id === editCatId ? { ...c, name: newCatName } : c));
        else setLocalCats(p => [...p, { id: Date.now(), name: newCatName }]);
        setShowAddCat(false); setNewCatName(""); setEditCatId(null);
    };

    const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div className="ms-root">
            <div className="ms-page">

                {/* PAGE HEADER */}
                <div className="ms-page-header">
                    <h1 className="ms-page-title">Manage Services</h1>
                    <div className="ms-header-actions">
                        <button className="btn btn-outline" onClick={() => setShowCatModal(true)}>
                            ☰ &nbsp;Manage Categories
                        </button>
                        <button className="btn btn-green" onClick={openAdd}>+ Add New</button>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="ms-filter-bar">
                    <div className="ms-filter-group">
                        <label className="ms-filter-label">Service Name</label>
                        <input
                            className="ms-filter-input"
                            placeholder="Enter Service Name"
                            value={filterName}
                            onChange={e => dispatch(setFilterName(e.target.value))}
                        />
                    </div>
                    <div className="ms-filter-group">
                        <label className="ms-filter-label">Service Category</label>
                        <select
                            className="ms-filter-select"
                            value={filterCategory}
                            onChange={e => dispatch(setFilterCategory(e.target.value))}
                        >
                            <option value="">Select Category</option>
                            <option value="All">All</option>
                            {allCats.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    <div className="ms-filter-actions">
                        <button className="btn btn-outline" onClick={handleReset}>Reset</button>
                        <button className="btn btn-green" onClick={handleApply}>Apply</button>
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="ms-error-banner">
                        ⚠️ {error}
                        <button className="ms-retry-btn" onClick={() => dispatch(fetchServices())}>Retry</button>
                    </div>
                )}

                {/* TABLE */}
                <div className="ms-table-card">
                    <div className="ms-table-head">
                        <div />
                        <div>
                            <input type="checkbox" className="ms-checkbox"
                                checked={selected.length === filtered.length && filtered.length > 0}
                                onChange={e => toggleAll(e.target.checked)} />
                        </div>
                        <div className="ms-th">Name</div>
                        <div className="ms-th">Category</div>
                        <div className="ms-th">Duration</div>
                        <div className="ms-th">Price</div>
                        <div />
                    </div>

                    {loading && <LoadingSkeleton />}

                    {!loading && filtered.map(svc => (
                        <div className="ms-table-row" key={svc._id}>
                            <div className="ms-drag-handle"><GripIcon /></div>
                            <div>
                                <input type="checkbox" className="ms-checkbox"
                                    checked={selected.includes(svc._id)}
                                    onChange={() => toggleOne(svc._id)} />
                            </div>
                            <div className="ms-service-info">
                                <ServiceImage url={svc.image?.url} name={svc.serviceName || ""} />
                                <div>
                                    <span className="ms-service-name">{svc.serviceName} </span>
                                    <span className="ms-service-id">(ID: {svc._id})</span>
                                </div>
                            </div>
                            <div className="ms-cell">{svc.category || "—"}</div>
                            <div className="ms-cell">
                                {svc.unitDuration?.value ?? "—"} {svc.unitDuration?.unit || ""}
                            </div>
                            <div className="ms-cell">${Number(svc.unitPrice ?? 0).toFixed(2)}</div>
                            <div className="ms-row-actions">
                                <button className="ms-act-btn" title="Staff">&#128100;</button>
                                <button className="ms-act-btn edit" title="Edit" onClick={() => openEdit(svc)}>&#9998;</button>
                                <button className="ms-act-btn" title="Clone">&#128203;</button>
                                <button className="ms-act-btn" title="Schedule">&#128197;</button>
                                <button className="ms-act-btn delete" title="Delete" onClick={() => handleDel(svc)}>&#128465;</button>
                            </div>
                        </div>
                    ))}

                    {!loading && filtered.length === 0 && (
                        <div className="ms-empty">
                            {error ? "Could not load services." : "No services found."}
                        </div>
                    )}
                </div>

                {/* ── EDIT / ADD FORM ── */}
                {showForm && (
                    <div className="ms-edit-wrap">

                        {/* Form title */}
                        <div className="ms-form-title">
                            {isEditMode ? "Edit Service" : "Add New Service"}
                        </div>

                        {/* ADD ERROR */}
                        {addError && (
                            <div className="ms-error-banner" style={{ marginBottom: 12 }}>
                                ⚠️ {addError}
                                <button className="ms-retry-btn" onClick={() => dispatch(clearAddError())}>✕</button>
                            </div>
                        )}

                        {/* Card 1 – main fields */}
                        <div className="ms-edit-card">

                            {/* ── IMAGE UPLOAD SECTION ── */}
                            <div className="ms-img-section">
                                <div
                                    className={`ms-img-drop ${form.imagePreview ? "has-image" : ""}`}
                                    onClick={() => imageRef.current?.click()}
                                >
                                    {form.imagePreview ? (
                                        <img src={form.imagePreview} alt="preview" className="ms-img-preview" />
                                    ) : (
                                        <div className="ms-img-placeholder">
                                            <span className="ms-img-icon">🖼️</span>
                                            <span className="ms-img-hint">Click to upload image</span>
                                            <span className="ms-img-sub">PNG, JPG up to 5MB</span>
                                        </div>
                                    )}
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={imageRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    style={{ display: "none" }}
                                    onChange={handleImageChange}
                                />

                                {/* Image action buttons */}
                                <div className="ms-img-actions">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => imageRef.current?.click()}
                                    >
                                        📁 &nbsp;{form.imagePreview ? "Change Image" : "Select Image"}
                                    </button>
                                    {form.imagePreview && (
                                        <button className="btn btn-danger btn-sm" onClick={removeImage}>
                                            🗑️ &nbsp;Remove
                                        </button>
                                    )}
                                </div>

                                {form.imageFile && (
                                    <div className="ms-img-filename">
                                        ✅ {form.imageFile.name}
                                    </div>
                                )}
                            </div>

                            {/* Row 1 */}
                            <div className="ms-form-row">
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Service Name <span className="req">*</span></label>
                                    <input className="ms-form-control" placeholder="e.g. Large Lot - 9mx3m"
                                        value={form.serviceName}
                                        onChange={e => f("serviceName", e.target.value)} />
                                </div>
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Category <span className="req">*</span></label>
                                    <select className="ms-form-control" value={form.category}
                                        onChange={e => f("category", e.target.value)}>
                                        <option value="">Select Category</option>
                                        {allCats.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Price ($) <span className="req">*</span></label>
                                    <input className="ms-form-control" type="number" placeholder="0.00"
                                        value={form.unitPrice}
                                        onChange={e => f("unitPrice", e.target.value)} />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="ms-form-row">
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Duration <span className="req">*</span></label>
                                    <div className="ms-duration-row">
                                        <Stepper value={form.unitDurationValue}
                                            onChange={v => f("unitDurationValue", v)} />
                                        <select className="ms-form-control"
                                            value={form.unitDurationUnit}
                                            onChange={e => f("unitDurationUnit", e.target.value)}>
                                            {["mins", "hours", "days", "weeks"].map(u =>
                                                <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Buffer Time Before</label>
                                    <div className="ms-duration-row">
                                        <Stepper value={form.bufferTimeBefore}
                                            onChange={v => f("bufferTimeBefore", v)} />
                                        <select className="ms-form-control"><option value="mins">Mins</option></select>
                                    </div>
                                </div>
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Buffer Time After</label>
                                    <div className="ms-duration-row">
                                        <Stepper value={form.bufferTimeAfter}
                                            onChange={v => f("bufferTimeAfter", v)} />
                                        <select className="ms-form-control"><option value="mins">Mins</option></select>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="ms-form-row">
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Max Capacity <span className="req">*</span></label>
                                    <Stepper value={form.maxCapacity} onChange={v => f("maxCapacity", v)} />
                                </div>
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Tax (%)</label>
                                    <input className="ms-form-control" type="number" placeholder="0"
                                        value={form.tax}
                                        onChange={e => f("tax", e.target.value)} />
                                </div>
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Status</label>
                                    <select className="ms-form-control"
                                        value={form.isDisabled ? "true" : "false"}
                                        onChange={e => f("isDisabled", e.target.value === "true")}>
                                        <option value="false">Active</option>
                                        <option value="true">Disabled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="ms-form-group">
                                <label className="ms-form-label">Description</label>
                                <textarea className="ms-form-textarea" placeholder="Enter description..."
                                    value={form.description}
                                    onChange={e => f("description", e.target.value)} />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="ms-date-section">
                            <div className="ms-date-section-title">Set start and expiry date for the service</div>
                            <div className="ms-form-row-2">
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Service Start Date (optional)</label>
                                    <input type="date" className="ms-form-control"
                                        value={form.availabilityStartDate}
                                        onChange={e => f("availabilityStartDate", e.target.value)} />
                                </div>
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Service Expiration Date (optional)</label>
                                    <input type="date" className="ms-form-control"
                                        value={form.availabilityExpirationDate}
                                        onChange={e => f("availabilityExpirationDate", e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Duration range & Price per unit */}
                        <div className="ms-edit-card">
                            <div className="ms-form-row-2">
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Min Duration</label>
                                    <select className="ms-form-control" value={form.minDuration}
                                        onChange={e => f("minDuration", Number(e.target.value))}>
                                        {[1, 2, 3, 7, 14, 30].map(d => <option key={d} value={d}>{d} Days</option>)}
                                    </select>
                                </div>
                                <div className="ms-form-group">
                                    <label className="ms-form-label">Max Duration <span className="req">*</span></label>
                                    <select className="ms-form-control" value={form.maxDuration}
                                        onChange={e => f("maxDuration", Number(e.target.value))}>
                                        {[30, 60, 90, 180, 365].map(d => <option key={d} value={d}>{d} Days</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Advance Options */}
                        <div className="ms-advance-section">
                            <div className="ms-advance-title">Advance Options</div>
                            <div className="ms-advance-card">
                                <div className="ms-tabs">
                                    <button className={`ms-tab ${activeTab === "Service Settings" ? "active" : ""}`}
                                        onClick={() => setActiveTab("Service Settings")}>
                                        Service Settings
                                    </button>
                                </div>
                                <div className="ms-tab-content">
                                    <div className="ms-form-row-3">
                                        <div className="ms-form-group">
                                            <label className="ms-form-label">Min time before booking (mins)</label>
                                            <input className="ms-form-control" type="number"
                                                value={form.minTimeBeforeBooking}
                                                onChange={e => f("minTimeBeforeBooking", Number(e.target.value))} />
                                        </div>
                                        <div className="ms-form-group">
                                            <label className="ms-form-label">Min time before rescheduling (mins)</label>
                                            <input className="ms-form-control" type="number"
                                                value={form.minTimeBeforeReschedule}
                                                onChange={e => f("minTimeBeforeReschedule", Number(e.target.value))} />
                                        </div>
                                        <div className="ms-form-group">
                                            <label className="ms-form-label">Min time before cancelling (mins)</label>
                                            <input className="ms-form-control" type="number"
                                                value={form.minTimeBeforeCancel}
                                                onChange={e => f("minTimeBeforeCancel", Number(e.target.value))} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="ms-form-footer">
                            <button className="btn btn-outline" onClick={() => setShowForm(false)}
                                disabled={adding}>
                                Cancel
                            </button>
                            <button className="btn btn-green" onClick={saveService}
                                disabled={adding}>
                                {adding ? (
                                    <><span className="ms-spinner" /> Saving...</>
                                ) : (
                                    isEditMode ? "Update" : "Save"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* CATEGORIES MODAL */}
                {showCatModal && (
                    <div className="ms-overlay" onClick={() => setShowCatModal(false)}>
                        <div className="ms-modal" onClick={e => e.stopPropagation()}>
                            <div className="ms-modal-header">
                                <span className="ms-modal-title">Manage Categories</span>
                                <button className="btn btn-green btn-sm" onClick={openAddCat}>+ Add New</button>
                            </div>

                            {showAddCat && (
                                <div className="ms-popover">
                                    <div className="ms-popover-title">
                                        {editCatId !== null ? "Edit Category" : "Add Category"}
                                    </div>
                                    <label className="ms-pop-label">Category Name <span>*</span></label>
                                    <input className="ms-pop-input" autoFocus
                                        placeholder="Enter Category Name"
                                        value={newCatName}
                                        onChange={e => setNewCatName(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && saveCat()} />
                                    <div className="ms-pop-actions">
                                        <button className="btn btn-green btn-sm" onClick={saveCat}>Save</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => { setShowAddCat(false); setEditCatId(null); setNewCatName(""); }}>Cancel</button>
                                    </div>
                                </div>
                            )}

                            <div className="ms-modal-body">
                                <div className="ms-cat-head">
                                    <div>Category Name</div>
                                    <div>Total Services</div>
                                    <div />
                                </div>
                                {apiCategories.map(name => (
                                    <div className="ms-cat-row" key={name}>
                                        <div className="ms-cat-name">
                                            <span className="ms-cat-drag"><GripIcon /></span>
                                            {name}
                                            <span className="ms-cat-badge">API</span>
                                        </div>
                                        <div className="ms-cat-total">
                                            {filtered.filter(s => s.category === name).length}
                                        </div>
                                        <div />
                                    </div>
                                ))}
                                {localCats.map(cat => (
                                    <div className="ms-cat-row" key={cat.id}>
                                        <div className="ms-cat-name">
                                            <span className="ms-cat-drag"><GripIcon /></span>
                                            {cat.name}
                                        </div>
                                        <div className="ms-cat-total">0</div>
                                        <div className="ms-cat-actions">
                                            <button className="ms-cat-btn edit" onClick={() => startEditCat(cat)}>✏️</button>
                                            <button className="ms-cat-btn del" onClick={() => deleteCat(cat.id)}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                                {apiCategories.length === 0 && localCats.length === 0 && (
                                    <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px 0" }}>No categories yet.</div>
                                )}
                            </div>
                            <div className="ms-modal-footer">
                                <button className="btn btn-outline btn-sm" onClick={() => setShowCatModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}