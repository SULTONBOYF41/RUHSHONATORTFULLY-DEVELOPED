// client/src/components/history/HistoryTable.jsx
import React from "react";

function formatTypeLabel(type) {
    if (!type) return "—";
    switch (type) {
        case "sale":
            return "Sotuv";
        case "transfer":
            return "Transfer";
        case "production":
            return "Ishlab chiqarish";
        case "return":
            return "Vazvrat";
        default:
            return type;
    }
}

function formatAmount(amount) {
    if (amount == null) return "—";
    const num = Number(amount);
    if (!Number.isFinite(num)) return "—";
    return num.toLocaleString("uz-UZ") + " so‘m";
}

function HistoryTable({ items, loading, isAdmin, onEdit, onDelete }) {
    const showActions = isAdmin; // hozircha faqat admin ko'radi

    const canEditRow = (row) => {
        // Hozircha faqat vazvratni tahrirlashga ruxsat beramiz
        return row.type === "return";
        // Keyinchalik transfer uchun: || row.type === "transfer"
    };

    const canDeleteRow = (row) => {
        // Hozircha faqat vazvratni o'chirishga ruxsat
        return row.type === "return";
    };

    return (
        <div className="card" style={{ marginTop: 20 }}>
            <div className="table-wrapper">
                {loading ? (
                    <p>Yuklanmoqda...</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Sana</th>
                                <th>Turi</th>
                                <th>Filial / Yo‘nalish</th>
                                <th>Izoh</th>
                                <th>Summasi</th>
                                <th>Status</th>
                                {showActions && <th>Amal</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {(!items || items.length === 0) ? (
                                <tr>
                                    <td colSpan={showActions ? 8 : 7} style={{ textAlign: "center" }}>
                                        Ma’lumot topilmadi
                                    </td>
                                </tr>
                            ) : (
                                items.map((row, i) => (
                                    <tr key={`${row.type}-${row.id}-${row.activity_date}`}>
                                        <td>{i + 1}</td>
                                        <td>{row.activity_date}</td>
                                        <td>{formatTypeLabel(row.type)}</td>
                                        <td>{row.branch_name || "—"}</td>
                                        <td>{row.description || "—"}</td>
                                        <td>{formatAmount(row.amount)}</td>
                                        <td>{row.status || "—"}</td>
                                        {showActions && (
                                            <td>
                                                <div className="history-actions">
                                                    {canEditRow(row) && (
                                                        <button
                                                            type="button"
                                                            className="btn-icon btn-icon--edit"
                                                            title="Tahrirlash"
                                                            onClick={() => onEdit && onEdit(row)}
                                                        >
                                                            ✏️
                                                        </button>
                                                    )}
                                                    {canDeleteRow(row) && (
                                                        <button
                                                            type="button"
                                                            className="btn-icon btn-icon--delete"
                                                            title="O‘chirish"
                                                            onClick={() => onDelete && onDelete(row)}
                                                        >
                                                            🗑
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default HistoryTable;
