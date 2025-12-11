// client/src/components/transfers/TransferForm.jsx
import React from "react";

function TransferForm({
    mode,
    transferDate,
    onTransferDateChange,
    destinationOptions,
    loadingBranches,
    loadingProducts,
    toBranchId,
    onToBranchChange,
    items,
    onItemChange,
    onAddRow,
    onRemoveRow,
    note,
    onNoteChange,
    onSubmit,
    saving,
    editingId,
    onCancelEdit,
    productOptions,
}) {
    const isEdit = Boolean(editingId);

    const title =
        mode === "BRANCH"
            ? isEdit
                ? "Filial transferini tahrirlash"
                : "Filialga yangi transfer yaratish"
            : isEdit
                ? "Do‘kon transferini tahrirlash"
                : "Do‘konga yangi transfer yaratish";

    const targetLabel =
        mode === "BRANCH" ? "Filial" : "Do‘kon / supermarket";

    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <div className="card-title">{title}</div>
                    <div className="card-subtitle">
                        Markaziy ombordan {targetLabel.toLowerCase()} omboriga jo‘natma.
                    </div>
                </div>

                <div className="card-header-actions" style={{ gap: 8 }}>
                    <input
                        className="input"
                        type="date"
                        value={transferDate}
                        onChange={(e) => onTransferDateChange(e.target.value)}
                    />

                    {isEdit && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={onCancelEdit}
                        >
                            Tahrirni bekor qilish
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={onSubmit}>
                <div className="form-row">
                    <div style={{ flex: 1 }}>
                        <label className="form-label">{targetLabel}</label>
                        <select
                            className="input"
                            value={toBranchId}
                            onChange={(e) => onToBranchChange(e.target.value)}
                            disabled={loadingBranches}
                        >
                            <option value="">
                                {mode === "BRANCH"
                                    ? "Filial tanlang"
                                    : "Do‘kon / supermarket tanlang"}
                            </option>
                            {destinationOptions.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name} {b.code ? `(${b.code})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="table-wrapper" style={{ marginTop: 10 }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: "45%" }}>Mahsulot / bezak</th>
                                <th style={{ width: "25%" }}>Miqdor</th>
                                <th style={{ width: "10%" }} />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((row, index) => (
                                <tr key={index}>
                                    <td>
                                        <select
                                            className="input"
                                            value={row.product_id}
                                            onChange={(e) =>
                                                onItemChange(index, "product_id", e.target.value)
                                            }
                                            disabled={loadingProducts}
                                        >
                                            <option value="">Tanlang...</option>
                                            {productOptions.map((p) => {
                                                const cat = String(p.category || "").toUpperCase();
                                                const isDecor = cat === "DECORATION";
                                                return (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} {p.unit === "kg" ? "(kg)" : "(dona)"}{" "}
                                                        {isDecor ? "[dekor]" : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            className="input"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={row.quantity}
                                            onChange={(e) =>
                                                onItemChange(index, "quantity", e.target.value)
                                            }
                                            placeholder="Miqдор"
                                        />
                                    </td>
                                    <td>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-small btn-secondary"
                                                onClick={() => onRemoveRow(index)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div
                    style={{
                        marginTop: 10,
                        marginBottom: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <div style={{ fontSize: 13, color: "#9ca3af" }}>
                        Mahsulotlar va bezaklar ro‘yxatiga qatorlar qo‘shing va
                        miqdorlarini kiriting.
                    </div>
                    <button
                        type="button"
                        className="btn button-primary"
                        style={{ boxShadow: "none" }}
                        onClick={onAddRow}
                    >
                        + Qator qo‘shish
                    </button>
                </div>

                <div style={{ marginTop: 8, marginBottom: 8 }}>
                    <label className="form-label">Eslatma (ixtiyoriy)</label>
                    <textarea
                        className="input"
                        rows={2}
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value)}
                        placeholder={
                            mode === "BRANCH"
                                ? "Masalan: Xonqa filialiga ertalabki jo‘natma..."
                                : "Masalan: Korzinka Chilonzor savdo nuqtasiga jo‘natma..."
                        }
                    />
                </div>

                <div
                    style={{
                        marginTop: 14,
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                    }}
                >
                    <button className="btn button-primary" type="submit" disabled={saving}>
                        {saving
                            ? "Saqlanmoqda..."
                            : isEdit
                                ? "Transferni yangilash"
                                : "Transfer yaratish"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TransferForm;
