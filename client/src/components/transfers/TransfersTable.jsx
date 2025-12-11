// client/src/components/transfers/TransfersTable.jsx
import React from "react";

const STATUS_LABELS = {
    PENDING: "Davom qilmoqda",
    PARTIAL: "Qisman bajarildi",
    COMPLETED: "To‘liq bajarildi",
    CANCELLED: "Bekor qilingan",
};

const STATUS_COLORS = {
    PENDING: "#f59e0b", // orange
    PARTIAL: "#eab308", // yellow
    COMPLETED: "#22c55e", // green
    CANCELLED: "#ef4444", // red
};

function renderStatusBadge(status) {
    const label = STATUS_LABELS[status] || status;
    const bg = STATUS_COLORS[status] || "#6b7280";
    return (
        <span
            style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 12,
                background: bg,
                color: "#0b1120",
            }}
        >
            {label}
        </span>
    );
}

function TransfersTable({
    mode,
    destinationOptions,
    filterToId,
    onFilterToIdChange,
    loadingTransfers,
    filteredTransfers,
    selectedTransfer,
    selectedTransferId,
    onSelectTransferId,
    selectedIsOutlet,
    onAcceptItem,
    onRejectItem,
    actionLoadingItemId,
    onEditTransfer,
    onDeleteTransfer,
}) {
    const filterLabel = mode === "BRANCH" ? "Filial:" : "Do‘kon:";
    const listTitle =
        mode === "BRANCH" ? "Filiallarga transferlar" : "Do‘konlarga transferlar";

    const canEditTransfer = (t) => t.status === "PENDING";
    const canDeleteTransfer = (t) => t.status === "PENDING";

    return (
        <div className="card" style={{ marginTop: 16 }}>
            <div
                className="card-title"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <span>{listTitle}</span>

                {/* Filial / do'kon bo‘yicha filter */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#9ca3af" }}>{filterLabel}</span>
                    <select
                        className="input"
                        style={{ minWidth: 140 }}
                        value={filterToId}
                        onChange={(e) => onFilterToIdChange(e.target.value)}
                    >
                        <option value="all">Barchasi</option>
                        {destinationOptions.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name} {b.code ? `(${b.code})` : ""}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loadingTransfers ? (
                <p>Yuklanmoqda...</p>
            ) : filteredTransfers.length === 0 ? (
                <p>Tanlangan filtrlarga mos transfer topilmadi.</p>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Sana</th>
                                <th>{mode === "BRANCH" ? "Filial" : "Do‘kon"}</th>
                                <th>Status</th>
                                <th>Amal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransfers.map((t, idx) => {
                                const editable = canEditTransfer(t);
                                const deletable = canDeleteTransfer(t);

                                return (
                                    <tr
                                        key={t.id}
                                        onClick={() =>
                                            onSelectTransferId(
                                                t.id === selectedTransferId ? null : t.id
                                            )
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{idx + 1}</td>
                                        <td>{t.transfer_date}</td>
                                        <td>{t.to_branch_name || t.to_branch_id}</td>
                                        <td>{renderStatusBadge(t.status)}</td>
                                        <td
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {editable || deletable ? (
                                                <div className="history-actions">
                                                    {editable && (
                                                        <button
                                                            type="button"
                                                            className="btn-icon btn-icon--edit"
                                                            title="Tahrirlash"
                                                            onClick={() => onEditTransfer && onEditTransfer(t)}
                                                        >
                                                            ✏️
                                                        </button>
                                                    )}
                                                    {deletable && (
                                                        <button
                                                            type="button"
                                                            className="btn-icon btn-icon--delete"
                                                            title="Bekor qilish"
                                                            onClick={() =>
                                                                onDeleteTransfer && onDeleteTransfer(t)
                                                            }
                                                        >
                                                            🗑
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="table-cell-muted">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detallar – tanlangan transfer ostida mahsulotlar holati */}
            {selectedTransfer && (
                <div
                    style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: "1px solid rgba(148,163,184,0.3)",
                    }}
                >
                    <div
                        style={{
                            marginBottom: 6,
                            fontSize: 14,
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <span>
                            Transfer ID: <strong>{selectedTransfer.id}</strong> –{" "}
                            {STATUS_LABELS[selectedTransfer.status] ||
                                selectedTransfer.status}
                        </span>
                        <span style={{ fontSize: 13, color: "#9ca3af" }}>
                            {selectedTransfer.note || ""}
                        </span>
                    </div>

                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mahsulot / bezak</th>
                                    <th>Miqdor</th>
                                    <th>Status</th>
                                    {selectedIsOutlet && <th style={{ width: 220 }}>Amal</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedTransfer.items || []).map((it, idx) => (
                                    <tr key={it.id}>
                                        <td>{idx + 1}</td>
                                        <td>{it.product_name}</td>
                                        <td>
                                            {it.quantity}{" "}
                                            {it.product_unit === "kg" ? "kg" : "dona"}
                                        </td>
                                        <td>
                                            {it.status === "PENDING" && (
                                                <span style={{ fontSize: 13, color: "#facc15" }}>
                                                    Kutilmoqda
                                                </span>
                                            )}
                                            {it.status === "ACCEPTED" && (
                                                <span style={{ fontSize: 13, color: "#22c55e" }}>
                                                    Qabul qilingan
                                                </span>
                                            )}
                                            {it.status === "REJECTED" && (
                                                <span style={{ fontSize: 13, color: "#f97316" }}>
                                                    Bekor qilingan (markaziyga qaytdi)
                                                </span>
                                            )}
                                        </td>

                                        {selectedIsOutlet && (
                                            <td>
                                                {it.status === "PENDING" ? (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 6,
                                                            justifyContent: "flex-start",
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="btn button-primary"
                                                            style={{
                                                                padding: "3px 8px",
                                                                fontSize: 11,
                                                                boxShadow: "none",
                                                                backgroundColor: "#22c55e",
                                                            }}
                                                            disabled={actionLoadingItemId === it.id}
                                                            onClick={() =>
                                                                onAcceptItem && onAcceptItem(selectedTransfer, it)
                                                            }
                                                        >
                                                            {actionLoadingItemId === it.id
                                                                ? "..."
                                                                : "Qabul qilish"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn button-primary"
                                                            style={{
                                                                padding: "3px 8px",
                                                                fontSize: 11,
                                                                boxShadow: "none",
                                                                backgroundColor: "#f97316",
                                                            }}
                                                            disabled={actionLoadingItemId === it.id}
                                                            onClick={() =>
                                                                onRejectItem && onRejectItem(selectedTransfer, it)
                                                            }
                                                        >
                                                            {actionLoadingItemId === it.id
                                                                ? "..."
                                                                : "Bekor qilish"}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TransfersTable;
