// client/src/components/returns/ReturnDetailDrawer.jsx
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

function ReturnDetailDrawer({
    isAdmin,
    selectedReturn,
    loadingDetail,
    approving,
    itemActionLoading,
    onClose,
    onApproveAll,
    onApproveItem,
    onCancelItem,
}) {
    if (!isAdmin || !selectedReturn) return null;

    return (
        <div className="drawer drawer-right">
            <div className="drawer-backdrop" onClick={onClose} />
            <div className="drawer-content">
                <div className="drawer-header">
                    <h2 className="drawer-title">
                        Vazvrat #{selectedReturn.header.id}
                    </h2>
                    <button
                        className="btn btn-small button-primary"
                        onClick={onClose}
                    >
                        Yopish
                    </button>
                </div>

                {loadingDetail ? (
                    <p>Yuklanmoqda...</p>
                ) : (
                    <>
                        <div className="drawer-section">
                            <div>
                                <b>Sana:</b> {selectedReturn.header.return_date}
                            </div>
                            <div>
                                <b>Filial / Do‘kon:</b>{" "}
                                {selectedReturn.header.branch_name || "—"}
                            </div>
                            <div>
                                <b>Status:</b>{" "}
                                <span
                                    className={`badge ${statusBadgeClass(
                                        selectedReturn.header.status
                                    )}`}
                                >
                                    {statusLabel(selectedReturn.header.status)}
                                </span>
                            </div>
                            <div>
                                <b>Izoh:</b>{" "}
                                {selectedReturn.header.comment || "—"}
                            </div>
                        </div>

                        <div className="drawer-section">
                            <h3>Mahsulotlar</h3>
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Mahsulot</th>
                                            <th>Miqdor</th>
                                            <th>O‘lchov</th>
                                            <th>Sabab</th>
                                            <th>Status</th>
                                            <th>Amallar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedReturn.items.map((it, idx) => (
                                            <tr key={it.id}>
                                                <td>{idx + 1}</td>
                                                <td>{it.product_name}</td>
                                                <td>{it.quantity}</td>
                                                <td>{it.unit || "—"}</td>
                                                <td>{it.reason || "—"}</td>
                                                <td>
                                                    <span
                                                        className={`badge ${statusBadgeClass(it.status)}`}
                                                    >
                                                        {statusLabel(it.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    {selectedReturn.header.status === "PENDING" &&
                                                        it.status === "PENDING" && (
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    gap: 6,
                                                                    flexWrap: "wrap",
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-small btn-primary"
                                                                    onClick={() => onApproveItem(it)}
                                                                    disabled={itemActionLoading}
                                                                >
                                                                    Qabul qilish
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-small btn-secondary"
                                                                    onClick={() => onCancelItem(it)}
                                                                    disabled={itemActionLoading}
                                                                >
                                                                    Bekor qilish
                                                                </button>
                                                            </div>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {selectedReturn.header.status === "PENDING" && (
                            <div
                                className="drawer-footer"
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 8,
                                }}
                            >
                                <button
                                    className="btn btn-primary btn-small"
                                    onClick={onApproveAll}
                                    disabled={approving || itemActionLoading}
                                >
                                    {approving
                                        ? "Qabul qilinmoqda..."
                                        : "Barchasini qabul qilish"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ReturnDetailDrawer;
