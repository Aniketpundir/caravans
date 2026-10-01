import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./CreatePost.css";
import { getValidAdminToken } from "../../../store/slices/adminSlice";

const API_BASE = "http://localhost:4000/api";

// 👇 Toolbar options — Word jaisa formatting
const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "link"],
        ["clean"],
    ],
};

export default function CreatePost() {
    const [heading, setHeading] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [recipientMode, setRecipientMode] = useState("all");
    const [customerSearch, setCustomerSearch] = useState("");
    const [customerResults, setCustomerResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchingCustomers, setSearchingCustomers] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        if (recipientMode !== "single" || customerSearch.trim().length < 2) {
            setCustomerResults([]);
            setSearchingCustomers(false);
            return undefined;
        }

        const controller = new AbortController();
        const searchTimer = window.setTimeout(async () => {
            try {
                setSearchingCustomers(true);
                const token = getValidAdminToken();
                if (!token) throw new Error("Your admin session has expired. Please log in again.");
                const response = await axios.get(`${API_BASE}/admin/customers`, {
                    params: { q: customerSearch.trim(), limit: 10 },
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                });
                setCustomerResults(response.data?.data || []);
            } catch (requestError) {
                if (requestError.code !== "ERR_CANCELED") setCustomerResults([]);
            } finally {
                if (!controller.signal.aborted) setSearchingCustomers(false);
            }
        }, 300);

        return () => {
            window.clearTimeout(searchTimer);
            controller.abort();
        };
    }, [customerSearch, recipientMode]);

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);

        if (selected && selected.type.startsWith("image/")) {
            setPreview(URL.createObjectURL(selected));
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sending) return;

        setMessage("");
        setError("");

        if (recipientMode === "single" && !selectedCustomer) {
            setError("Search for and select a customer before sending.");
            return;
        }

        const formData = new FormData();
        formData.append("heading", heading);
        formData.append("description", description);
        if (file) formData.append("attachment", file);
        if (recipientMode === "single") formData.append("recipientUserId", selectedCustomer._id);

        try {
            setSending(true);
            const token = getValidAdminToken();
            if (!token) throw new Error("Your admin session has expired. Please log in again.");

            const response = await axios.post(`${API_BASE}/admin/broadcast-email`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`${response.data?.message || "Email queued"}. ${response.data?.recipientCount || 0} recipient${response.data?.recipientCount === 1 ? "" : "s"}.`);
            setHeading("");
            setDescription("");
            setFile(null);
            setPreview(null);
            setRecipientMode("all");
            setCustomerSearch("");
            setSelectedCustomer(null);
            formRef.current?.reset();
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.message || "Unable to send website email broadcast.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="cp-page-wrapper">
            <h1 className="cp-title">Create Post</h1>

            <form ref={formRef} className="cp-form" onSubmit={handleSubmit}>
                <div className="cp-field">
                    <label htmlFor="heading">Heading <span className="cp-req">*</span></label>
                    <input
                        id="heading"
                        type="text"
                        placeholder="Enter heading"
                        value={heading}
                        onChange={(e) => setHeading(e.target.value)}
                        required
                    />
                </div>

                <div className="cp-field">
                    <label>Description <span className="cp-req">*</span></label>
                    <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        modules={QUILL_MODULES}
                        placeholder="Write your description here..."
                        className="cp-quill"
                    />
                </div>

                <div className="cp-field">
                    <label>Email Recipients <span className="cp-req">*</span></label>
                    <div className="cp-recipient-options">
                        <label>
                            <input
                                type="radio"
                                name="recipientMode"
                                value="all"
                                checked={recipientMode === "all"}
                                onChange={() => {
                                    setRecipientMode("all");
                                    setCustomerSearch("");
                                    setSelectedCustomer(null);
                                }}
                            />
                            All active customers
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="recipientMode"
                                value="single"
                                checked={recipientMode === "single"}
                                onChange={() => setRecipientMode("single")}
                            />
                            Particular customer
                        </label>
                    </div>

                    {recipientMode === "single" && (
                        <div className="cp-customer-search">
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone"
                                value={selectedCustomer ? `${selectedCustomer.fullName} (${selectedCustomer.email})` : customerSearch}
                                onChange={(e) => {
                                    setSelectedCustomer(null);
                                    setCustomerSearch(e.target.value);
                                }}
                            />
                            {searchingCustomers && <span className="cp-search-status">Searching...</span>}
                            {!selectedCustomer && customerSearch.trim().length >= 2 && !searchingCustomers && (
                                <div className="cp-customer-results">
                                    {customerResults.length ? customerResults.map((customer) => (
                                        <button
                                            type="button"
                                            key={customer._id}
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setCustomerResults([]);
                                            }}
                                        >
                                            <strong>{customer.fullName}</strong>
                                            <span>{customer.email}</span>
                                        </button>
                                    )) : <p>No customers found.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="cp-field">
                    <label htmlFor="attachment">Image / Video / File</label>
                    <input
                        id="attachment"
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                    />
                    {file && <span className="cp-file-name">📎 {file.name}</span>}
                    {preview && (
                        <img src={preview} alt="Preview" className="cp-preview" />
                    )}
                </div>

                {message && <p className="cp-message cp-success">{message}</p>}
                {error && <p className="cp-message cp-error">{error}</p>}
                <button type="submit" className="cp-submit-btn" disabled={sending}>
                    {sending ? "Queueing emails..." : recipientMode === "single" ? "Send to Selected Customer" : "Send to All Customers"}
                </button>
            </form>
        </div>
    );
}
