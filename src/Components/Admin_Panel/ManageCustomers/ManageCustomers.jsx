import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "../../../store/slices/customersSlice";
import { downloadCsv } from "../../../utils/exportCsv";
import "./ManageCustomers.css";

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const BOOKING_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
});

// ── Normalize API data ────────────────────────────────────────────────────────
function normalizeCustomer(c) {
    return {
        id: c._id ?? c.id ?? "",
        name: c.name ?? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() ?? "",
        email: c.email ?? "",
        phone: c.phone ?? c.phoneNumber ?? "",
        date: c.recentAppointment ?? c.lastAppointment ?? c.createdAt ?? c.date ?? "",
        appts: c.totalAppointments ?? c.appointmentsCount ?? c.appts ?? 0,
        _raw: c,
    };
}

/* ── Icons ── */
function IconPlus() {
    return (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}
function IconUpload() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}
function IconDownload() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}
function IconUser() {
    return (
        <svg viewBox="0 0 24 24" fill="#94a3b8">
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
        </svg>
    );
}
function IconHelp() {
    return (
        <svg viewBox="0 0 24 24" fill="#fff">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 15a1.2 1.2 0 1 1 0-2.4A1.2 1.2 0 0 1 12 17zm1.3-5.3c-.6.3-1 .8-1 1.3v.5h-1.6v-.5c0-1.2.7-2.2 1.8-2.8.5-.3.8-.7.8-1.2a1.3 1.3 0 0 0-2.6 0H9.1a2.9 2.9 0 0 1 5.8 0c0 1-.6 1.9-1.6 2.7z" />
        </svg>
    );
}
function IconUploadBox() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
    );
}

/* ── Highlight match ─────────────────────────────────────────────────────────*/
function highlightMatch(text, query) {
    if (!query || !text) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <strong className="sugg-highlight">{text.slice(idx, idx + query.length)}</strong>
            {text.slice(idx + query.length)}
        </>
    );
}

/* ── Add Customer Panel ──────────────────────────────────────────────────────*/
function AddCustomerPanel({ open, onClose }) {
    const [form, setForm] = useState({
        wpUser: "", username: "", firstName: "",
        lastName: "", email: "", phone: "0412 345 678", note: "",
    });
    const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

    return (
        <>
            <div className={`panel-overlay${open ? " open" : ""}`} onClick={onClose} />
            <div className={`slide-panel${open ? " open" : ""}`}>
                <div className="panel-header">
                    <h2>Add New Customer</h2>
                    <button className="panel-close" onClick={onClose}>✕</button>
                </div>
                <div className="panel-body">
                    <div className="form-section">
                        <div className="form-section-title">Basic Details</div>
                        <div className="upload-area">
                            <div className="upload-box"><IconUploadBox /></div>
                            <span className="upload-hint">
                                Please upload jpg/png/webp file with a maximum size of 1 MB
                            </span>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>WordPress User</label>
                                <input type="text" placeholder="Start typing to fetch user."
                                    value={form.wpUser} onChange={set("wpUser")} />
                            </div>
                            <div className="form-group">
                                <label>Username <span className="req">*</span></label>
                                <input type="text" placeholder="Enter Username"
                                    value={form.username} onChange={set("username")} />
                            </div>
                            <div className="form-group">
                                <label>First Name <span className="req">*</span></label>
                                <input type="text" placeholder="Enter First Name"
                                    value={form.firstName} onChange={set("firstName")} />
                            </div>
                            <div className="form-group">
                                <label>Last Name <span className="req">*</span></label>
                                <input type="text" placeholder="Enter Last Name"
                                    value={form.lastName} onChange={set("lastName")} />
                            </div>
                            <div className="form-group">
                                <label>Email <span className="req">*</span></label>
                                <input type="email" placeholder="Enter Email"
                                    value={form.email} onChange={set("email")} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <div className="phone-wrapper">
                                    <div className="phone-flag">
                                        <span>🇦🇺</span>
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 3.5l3 3 3-3" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <input className="phone-input" type="tel"
                                        value={form.phone} onChange={set("phone")} />
                                </div>
                            </div>
                            <div className="form-group full">
                                <label>Note</label>
                                <textarea placeholder="Enter a note..."
                                    value={form.note} onChange={set("note")} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="panel-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={onClose}>Save Customer</button>
                </div>
            </div>
        </>
    );
}

/* ── Main Component ──────────────────────────────────────────────────────────*/
export default function ManageCustomers() {
    const dispatch = useDispatch();
    const { data: rawData, loading, error } = useSelector((state) => state.customers);

    // Normalize API data
    const allCustomers = useMemo(
        () => (Array.isArray(rawData) ? rawData.map(normalizeCustomer) : []),
        [rawData]
    );

    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selected, setSelected] = useState({});
    const [allChecked, setAllChecked] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    const handleExport = () => {
        downloadCsv(
            "customers.csv",
            allCustomers.map((customer) => ({
                fullName: customer.name,
                email: customer.email,
                phone: customer.phone,
                recentAppointment: customer.date,
                totalAppointments: customer.appts,
            }))
        );
    };

    // ── Fetch on mount ────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchCustomers());
    }, [dispatch]);

    // ── Name suggestions from API data ────────────────────────────────────────
    const suggestions = useMemo(() => {
        if (!search || search.length < 1) return [];
        const q = search.toLowerCase();
        return allCustomers
            .map((c) => c.name)
            .filter(Boolean)
            .filter((name, idx, arr) => arr.indexOf(name) === idx)
            .filter((name) => name.toLowerCase().includes(q))
            .slice(0, 6);
    }, [search, allCustomers]);

    // ── Filter applied ────────────────────────────────────────────────────────
    const totalPages = Math.ceil(allCustomers.length / perPage);
    const paginated = useMemo(() => {
        const start = (activePage - 1) * perPage;
        return allCustomers.slice(start, start + perPage);
    }, [allCustomers, activePage, perPage]);

    const toggleAll = (checked) => {
        setAllChecked(checked);
        const s = {};
        if (checked) paginated.forEach((c) => (s[c.id] = true));
        setSelected(s);
    };
    const toggleRow = (id, checked) => {
        setSelected((prev) => ({ ...prev, [id]: checked }));
        if (!checked) setAllChecked(false);
    };

    // ── Search handlers ───────────────────────────────────────────────────────
    function applySearch() {
        setAppliedSearch(search);
        setShowSuggestions(false);
        setActivePage(1);
        dispatch(fetchCustomers(search.trim() ? { q: search.trim() } : {}));
    }

    function resetSearch() {
        setSearch("");
        setAppliedSearch("");
        setShowSuggestions(false);
        setActivePage(1);
        dispatch(fetchCustomers());
    }

    function handleSuggestionClick(name) {
        setSearch(name);
        setAppliedSearch(name);
        setShowSuggestions(false);
        setActivePage(1);
        dispatch(fetchCustomers({ q: name }));
    }

    // ── Pagination pages ──────────────────────────────────────────────────────
    const pageNumbers = useMemo(() => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (activePage <= 4) return [1, 2, 3, 4, 5, "···", totalPages];
        if (activePage >= totalPages - 3) return [1, "···", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, "···", activePage - 1, activePage, activePage + 1, "···", totalPages];
    }, [totalPages, activePage]);

    // ── Format date ───────────────────────────────────────────────────────────
    function formatDate(dateStr) {
        if (!dateStr) return "?";
        if (typeof dateStr === "string" && DATE_ONLY_RE.test(dateStr)) {
            const [year, month, day] = dateStr.split("-").map(Number);
            return BOOKING_DATE_FORMATTER.format(new Date(year, month - 1, day));
        }
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
        }) + " " + d.toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit", hour12: true,
        });
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="cust-loading">
                    <div className="cust-spinner" />
                    <span>Loading customers...</span>
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="page-wrapper">
                <div className="cust-error">
                    <span>❌ Error: {error}</span>
                    <button onClick={() => dispatch(fetchCustomers())}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-wrapper">

                {/* ── Header ── */}
                <div className="page-header">
                    <h1 className="page-title">Manage Customers</h1>
                    <button className="btn-add" onClick={() => setPanelOpen(true)}>
                        <IconPlus />
                        Add New
                    </button>
                </div>

                {/* ── Filter Bar ── */}
                <div className="filter-bar">
                    {/* Search with suggestions */}
                    <div className="search-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search customer"
                            value={search}
                            autoComplete="off"
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            onKeyDown={(e) => e.key === "Enter" && applySearch()}
                        />
                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="sugg-dropdown">
                                {suggestions.map((name, idx) => (
                                    <div
                                        key={idx}
                                        className="sugg-item"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSuggestionClick(name)}
                                    >
                                        <span className="sugg-icon">👤</span>
                                        {highlightMatch(name, search)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="btn-reset" onClick={resetSearch}>Reset</button>
                    <button className="btn-apply" onClick={applySearch}>Apply</button>
                    <button className="btn-export" onClick={handleExport}><IconUpload /> Export</button>
                    <button className="btn-import"><IconDownload /> Import</button>
                </div>

                {/* ── Table ── */}
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th className="cb-cell">
                                    <input type="checkbox" checked={allChecked}
                                        onChange={(e) => toggleAll(e.target.checked)} />
                                </th>
                                <th>Full Name <span className="sort-icon">▲▼</span></th>
                                <th>Email <span className="sort-icon">▲▼</span></th>
                                <th>Phone</th>
                                <th>Recent Appointment <span className="sort-icon">▲▼</span></th>
                                <th style={{ textAlign: "right" }}>Total Appointments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "#b0bac9", fontStyle: "italic" }}>
                                        No customers found
                                    </td>
                                </tr>
                            ) : paginated.map((c) => (
                                <tr key={c.id}>
                                    <td className="cb-cell">
                                        <input type="checkbox" checked={!!selected[c.id]}
                                            onChange={(e) => toggleRow(c.id, e.target.checked)} />
                                    </td>
                                    <td>
                                        <div className="td-name">
                                            <div className="avatar"><IconUser /></div>
                                            {c.name || "—"}
                                        </div>
                                    </td>
                                    <td>{c.email || "—"}</td>
                                    <td>{c.phone || "—"}</td>
                                    <td>{formatDate(c.date)}</td>
                                    <td style={{ textAlign: "right" }}>{c.appts}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                <div className="pagination-row">
                    <div className="pagination-left">
                        <span className="showing-text">
                            Showing <strong>{paginated.length}</strong> out of <strong>{allCustomers.length}</strong>
                        </span>
                        <div className="per-page">
                            Per Page
                            <select value={perPage}
                                onChange={(e) => { setPerPage(Number(e.target.value)); setActivePage(1); }}>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="pages">
                        <button className="page-btn arrow"
                            disabled={activePage === 1}
                            onClick={() => setActivePage(p => p - 1)}>‹</button>
                        {pageNumbers.map((p, i) => (
                            <button key={i}
                                className={`page-btn${activePage === p ? " active" : ""}`}
                                onClick={() => typeof p === "number" && setActivePage(p)}>
                                {p}
                            </button>
                        ))}
                        <button className="page-btn arrow"
                            disabled={activePage === totalPages || totalPages === 0}
                            onClick={() => setActivePage(p => p + 1)}>›</button>
                        <span className="pages-mobile-label">{activePage} / {totalPages || 1}</span>
                    </div>
                </div>

            </div>

            <button className="help-btn" title="Help"><IconHelp /></button>
            <AddCustomerPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
        </>
    );
}
