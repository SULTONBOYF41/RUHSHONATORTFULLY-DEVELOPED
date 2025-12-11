// client/src/components/returns/ReturnsTable.jsx
import React from "react";

function statusBadgeClass(status) {
    switch (status) {
        case "PENDING":
            return "badge-warning";
        case "APPROVED":
            return "badge-success";
        case "CANCELED":
            return "badge-danger";
        default:
            return "badge-secondary";
    }
}

function statusLabel(status) {
    switch (status) {
        case "PENDING":
            return "Kutilmoqda";
        case "APPROVED":
            return "Qabul qilingan";
        case "CANCELED":
            return "Bekor qilingan";
        default:
            return status || "—";
    }
}

function ReturnsTable({
    isAdmin,
    mode,
    visibleList,
    loadingList,
    isBranch,
    saving,
    outletSaving,
    onOpenDetail,
    onEditRow,
    onDeleteRow,
}) {
    const isBusy = saving || outletSaving;

    // Qaysi qatorda tugma bo'lishini belgilaymiz
    const canEditRow = (row) => {
        const isPending = row.status === "PENDING";
        if (!isPending) return false;

        // Filial useri – o'z vazvratini tahrirlay oladi
        if (isBranch) return true;

        // Admin ham filial vazvratlarini (BRANCH rejimida) tahrirlashi mumkin
        if (isAdmin && mode === "BRANCH") return true;

        return false;
    };

    const canDeleteRow = (row) => {
        const isPending = row.status === "PENDING";
        // PENDING bo'lsa, admin ham, filial user ham o'chira oladi
        return isPending && (isBranch || isAdmin);
    };

    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <div className="card-title">
                        {isAdmin
                            ? mode === "BRANCH"
                                ? "Filiallardan kelayotgan vazvratlar"
                                : "Do‘konlardan kelayotgan vazvratlar"
                            : "Mening vazvratlarim"}
                    </div>
                    <div className="card-subtitle">
                        So‘nggi yuborilgan va qabul qilingan qaytishlar.
                    </div>
                </div>
            </div>

            {loadingList ? (
                <p>Yuklanmoqda...</p>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Sana</th>
                                <th>{isAdmin ? "Filial / Do‘kon" : "Filial"}</th>
                                <th>Bandlar</th>
                                <th>Umumiy miqdor</th>
                                <th>Status</th>
                                <th>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleList.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center" }}>
                                        Hali vazvrat yo‘q.
                                    </td>
                                </tr>
                            ) : (
                                visibleList.map((row, index) => {
                                    const editable = canEditRow(row);
                                    const deletable = canDeleteRow(row);

                                    return (
                                        <tr
                                            key={row.id}
                                            onClick={() => onOpenDetail && onOpenDetail(row)}
                                            style={{
                                                cursor: isAdmin ? "pointer" : "default",
                                            }}
                                        >
                                            <td>{index + 1}</td>
                                            <td>{row.return_date}</td>
                                            <td>{row.branch_name || "—"}</td>
                                            <td>{row.item_count}</td>
                                            <td>{row.total_quantity}</td>
                                            <td>
                                                <span
                                                    className={`badge ${statusBadgeClass(row.status)}`}
                                                >
                                                    {statusLabel(row.status)}
                                                </span>
                                            </td>
                                            <td
                                                onClick={(e) => e.stopPropagation()} // tugma bosilganda row onClick ishlamasin
                                            >
                                                {editable || deletable ? (
                                                    <div
                                                        className="history-actions"
                                                        style={{
                                                            display: "inline-flex",
                                                            gap: 6,
                                                            flexWrap: "wrap",
                                                            justifyContent: "flex-start",
                                                        }}
                                                    >
                                                        {editable && (
                                                            <button
                                                                type="button"
                                                                className="btn-icon btn-icon--edit"
                                                                onClick={() => onEditRow && onEditRow(row)}
                                                                disabled={isBusy}
                                                                title="Tahrirlash"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}

                                                        {deletable && (
                                                            <button
                                                                type="button"
                                                                className="btn-icon btn-icon--delete"
                                                                onClick={() => onDeleteRow && onDeleteRow(row)}
                                                                disabled={isBusy}
                                                                title="O‘chirish"
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
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ReturnsTable;
