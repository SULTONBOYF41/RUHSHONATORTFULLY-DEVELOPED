// client/src/components/returns/OutletReturnForm.jsx
import React from "react";

function OutletReturnForm({
    visible,
    outletDate,
    outletBranchId,
    outletComment,
    outletItems,
    outletOptions,
    productOptions,
    outletSaving,
    onOutletDateChange,
    onOutletBranchChange,
    onOutletCommentChange,
    onOutletItemChange,
    onAddOutletRow,
    onRemoveOutletRow,
    onOutletSubmit,
}) {
    if (!visible) return null;

    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
                <div>
                    <div className="card-title">
                        Do‘kon / supermarketdan vazvrat kiritish
                    </div>
                    <div className="card-subtitle">
                        Do‘kon ➜ Markaziy ombor (yaratiladi va shu zahoti tasdiqlanadi).
                    </div>
                </div>
            </div>

            <form onSubmit={onOutletSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Do‘kon / supermarket</label>
                        <select
                            className="input"
                            value={outletBranchId}
                            onChange={(e) => onOutletBranchChange(e.target.value)}
                        >
                            <option value="">Do‘kon tanlang...</option>
                            {outletOptions.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Sana</label>
                        <input
                            className="input"
                            type="date"
                            value={outletDate}
                            onChange={(e) => onOutletDateChange(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Izoh (ixtiyoriy)</label>
                        <input
                            className="input"
                            type="text"
                            value={outletComment}
                            onChange={(e) => onOutletCommentChange(e.target.value)}
                            placeholder="Masalan: qaytib kelgan mahsulotlar ..."
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
                            {outletItems.map((row, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <select
                                            className="input"
                                            value={row.product_id}
                                            onChange={(e) =>
                                                onOutletItemChange(index, "product_id", e.target.value)
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
                                                onOutletItemChange(index, "quantity", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className="input"
                                            type="text"
                                            value={row.unit}
                                            onChange={(e) =>
                                                onOutletItemChange(index, "unit", e.target.value)
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
                                                onOutletItemChange(index, "reason", e.target.value)
                                            }
                                            placeholder="Sabab (ixtiyoriy)"
                                        />
                                    </td>
                                    <td>
                                        {outletItems.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-small btn-danger"
                                                onClick={() => onRemoveOutletRow(index)}
                                                disabled={outletSaving}
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
                    style={{ marginTop: 12, display: "flex", gap: 8 }}
                >
                    <button
                        type="button"
                        className="btn button-primary"
                        onClick={onAddOutletRow}
                        disabled={outletSaving}
                    >
                        + Qator qo‘shish
                    </button>

                    <button
                        type="submit"
                        className="btn button-primary"
                        disabled={outletSaving}
                    >
                        {outletSaving
                            ? "Saqlanmoqda..."
                            : "Vazvratni yaratish va qabul qilish"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default OutletReturnForm;
