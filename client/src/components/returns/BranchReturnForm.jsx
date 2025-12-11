// client/src/components/returns/BranchReturnForm.jsx
import React from "react";

function BranchReturnForm({
    isBranch,
    branchName,
    editingId,
    editLoading,
    saving,
    date,
    comment,
    items,
    productOptions,
    onDateChange,
    onCommentChange,
    onItemChange,
    onAddRow,
    onRemoveRow,
    onSubmit,
    onCancelEdit,
}) {
    if (!isBranch) return null;

    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
                <div>
                    <div className="card-title">
                        {editingId
                            ? `Vazvratni tahrirlash #${editingId}`
                            : "Yangi vazvrat kiritish"}
                    </div>
                    <div className="card-subtitle">
                        {branchName || "Filial"} ➜ Markaziy ombor
                    </div>
                </div>
                {editingId && (
                    <div className="badge badge-info">
                        Tahrirlash rejimi
                    </div>
                )}
            </div>

            {editLoading ? (
                <div style={{ padding: 12 }}>Tahrirlash ma’lumoti yuklanmoqda...</div>
            ) : (
                <form onSubmit={onSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Sana</label>
                            <input
                                className="input"
                                type="date"
                                value={date}
                                onChange={(e) => onDateChange(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Izoh (ixtiyoriy)</label>
                            <input
                                className="input"
                                type="text"
                                value={comment}
                                onChange={(e) => onCommentChange(e.target.value)}
                                placeholder="Masalan: yaroqlilik muddati, noto‘g‘ri kelgan mahsulot..."
                            />
                        </div>
                    </div>

                    <div className="table-wrapper" style={{ marginTop: 16 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mahsulot</th>
                                    <th>Miqdor</th>
                                    <th>O‘lchov</th>
                                    <th>Sabab / Izoh</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((row, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <select
                                                className="input"
                                                value={row.product_id}
                                                onChange={(e) =>
                                                    onItemChange(index, "product_id", e.target.value)
                                                }
                                            >
                                                <option value="">Tanlang...</option>
                                                {productOptions.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
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
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="input"
                                                type="text"
                                                value={row.unit}
                                                onChange={(e) =>
                                                    onItemChange(index, "unit", e.target.value)
                                                }
                                                placeholder="kg / dona ..."
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="input"
                                                type="text"
                                                value={row.reason}
                                                onChange={(e) =>
                                                    onItemChange(index, "reason", e.target.value)
                                                }
                                                placeholder="Sabab (ixtiyoriy)"
                                            />
                                        </td>
                                        <td>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-small btn-danger"
                                                    onClick={() => onRemoveRow(index)}
                                                    disabled={saving}
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
                        className="form-actions"
                        style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}
                    >
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onAddRow}
                            disabled={saving}
                        >
                            + Qator qo‘shish
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onCancelEdit}
                                disabled={saving}
                            >
                                Tahrirlashni bekor qilish
                            </button>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saqlanmoqda..."
                                : editingId
                                    ? "Vazvratni saqlash"
                                    : "Vazvratni yuborish"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default BranchReturnForm;
