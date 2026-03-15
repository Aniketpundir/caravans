import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAppointments,
    updateAppointmentStatus,
    deleteAppointment,
} from "../../../store/slices/appointmentsSlice";
import "./Appointments.css";
import AppointmentsHeader from "./AppointmentsHeader/AppointmentsHeader";
import AppointmentsTable from "./AppointmentsTable/AppointmentsTable";

// ── API field ko normalize karo ───────────────────────────────────────────────
function normalizeAppointment(appt) {
    return {
        id: appt._id ?? appt.id ?? "",
        date: appt.startDate ?? appt.appointmentDate ?? appt.date ?? "",
        customer:
            appt.customerName ??
            appt.customer ??
            `${appt.firstName ?? ""} ${appt.lastName ?? ""}`.trim() ??
            "",
        service: appt.serviceName ?? appt.service ?? appt.serviceType ?? "",
        duration: appt.duration ?? appt.days ?? "",
        status: appt.status ?? "Pending",
        payment:
            appt.totalAmount != null
                ? `$${Number(appt.totalAmount).toFixed(2)}`
                : appt.payment ?? "",
        createdDate: appt.createdAt ?? appt.createdDate ?? "",
        _raw: appt,
    };
}

// useEffect(() => {
//     if (allAppointments.length > 0) {
//         console.log("🔍 Service values from API:",
//             allAppointments.map(a => a.service)
//         );
//     }
// }, [allAppointments]);


export default function Appointments() {
    const dispatch = useDispatch();
    const { data: rawData, loading, error } = useSelector(
        (state) => state.appointments
    );

    // Normalize API data
    const allAppointments = useMemo(
        () => (Array.isArray(rawData) ? rawData.map(normalizeAppointment) : []),
        [rawData]
    );

    const [selected, setSelected] = useState([]);
    const [perPage, setPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState({
        dateRange: null,
        customerName: "",
        service: "",
        statusFilter: "",
        appointmentId: "",
        searchQuery: "",
    });

    const [appliedFilters, setAppliedFilters] = useState({
        dateRange: null,
        customerName: "",
        service: "",
        statusFilter: "",
        appointmentId: "",
        searchQuery: "",
    });

    // ── Page load par fetch ───────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAppointments());
    }, []);

    // ── Customer suggestions ──────────────────────────────────────────────────
    const customerSuggestions = useMemo(() => {
        if (!filters.customerName || filters.customerName.length < 1) return [];
        const q = filters.customerName.toLowerCase();
        return allAppointments
            .map((a) => a.customer)
            .filter(Boolean)
            .filter((name, idx, arr) => arr.indexOf(name) === idx)
            .filter((name) => name.toLowerCase().includes(q))
            .slice(0, 6);
    }, [filters.customerName, allAppointments]);

    // ── Unique services list for dropdown ────────────────────────────────────
    const serviceOptions = useMemo(() => {
        return [...new Set(
            allAppointments
                .map((a) => a.service)
                .filter(Boolean)
        )];
    }, [allAppointments]);

    // ── Filter handlers ───────────────────────────────────────────────────────
    function handleFilterChange(field, value) {
        setFilters((prev) => ({ ...prev, [field]: value }));
    }

    function handleReset() {
        const empty = {
            dateRange: null,
            customerName: "",
            service: "",
            statusFilter: "",
            appointmentId: "",
            searchQuery: "",
        };
        setFilters(empty);
        setAppliedFilters(empty);
        setCurrentPage(1);
    }

    function handleApply() {
        setAppliedFilters({ ...filters });
        setCurrentPage(1);
        console.log("✅ Filters Applied:", filters);
    }

    function handleExport() {
        console.log("📤 Exporting:", filteredAppointments);
    }

    // ── Frontend filter ───────────────────────────────────────────────────────
    const filteredAppointments = useMemo(() => {
        return allAppointments.filter((appt) => {
            // Customer Name
            if (
                appliedFilters.customerName &&
                !appt.customer
                    .toLowerCase()
                    .includes(appliedFilters.customerName.toLowerCase())
            ) return false;

            // Service
            if (
                appliedFilters.service &&
                appt.service !== appliedFilters.service
            ) return false;

            // Status
            if (
                appliedFilters.statusFilter &&
                appt.status !== appliedFilters.statusFilter
            ) return false;

            // Appointment ID
            if (
                appliedFilters.appointmentId &&
                !String(appt.id)
                    .toLowerCase()
                    .includes(appliedFilters.appointmentId.toLowerCase())
            ) return false;

            // Search Query
            if (appliedFilters.searchQuery) {
                const q = appliedFilters.searchQuery.toLowerCase();
                const match =
                    appt.customer.toLowerCase().includes(q) ||
                    appt.service.toLowerCase().includes(q) ||
                    String(appt.id).toLowerCase().includes(q);
                if (!match) return false;
            }

            // Date Range
            if (appliedFilters.dateRange?.start && appliedFilters.dateRange?.end) {
                const apptDate = new Date(appt.date);
                const start = new Date(appliedFilters.dateRange.start);
                const end = new Date(appliedFilters.dateRange.end);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                if (apptDate < start || apptDate > end) return false;
            }

            return true;
        });
    }, [allAppointments, appliedFilters]);

    // ── Pagination ────────────────────────────────────────────────────────────
    const paginatedAppointments = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredAppointments.slice(start, start + perPage);
    }, [filteredAppointments, currentPage, perPage]);

    const totalPages = Math.ceil(filteredAppointments.length / perPage);

    // ── Table handlers ────────────────────────────────────────────────────────
    function toggleSelect(id) {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    function toggleAll() {
        setSelected((prev) =>
            prev.length === paginatedAppointments.length
                ? []
                : paginatedAppointments.map((a) => a.id)
        );
    }

    function handleUpdateStatus(id, newStatus) {
        dispatch(updateAppointmentStatus({ id, status: newStatus }));
    }

    function handleDelete(id) {
        dispatch(deleteAppointment(id));
        setSelected((prev) => prev.filter((x) => x !== id));
    }

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="appointments-wrapper">
                <div className="appointments-loading">
                    <div className="loading-spinner" />
                    <span>Loading appointments...</span>
                </div>
            </div>
        );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="appointments-wrapper">
                <div className="appointments-error">
                    <span>❌ Error: {error}</span>
                    <button onClick={() => dispatch(fetchAppointments())}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="appointments-wrapper">
            <AppointmentsHeader
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                onApply={handleApply}
                onExport={handleExport}
                onAddNew={() => console.log("Add New clicked")}
                onShareUrl={() => console.log("Share URL clicked")}
                customerSuggestions={customerSuggestions}
                serviceOptions={serviceOptions}
            />
            <AppointmentsTable
                appointments={paginatedAppointments}
                selected={selected}
                onToggleSelect={toggleSelect}
                onToggleAll={toggleAll}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
                perPage={perPage}
                onPerPageChange={(val) => { setPerPage(val); setCurrentPage(1); }}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                totalRows={filteredAppointments.length}
                totalPages={totalPages}
            />
        </div>
    );
}