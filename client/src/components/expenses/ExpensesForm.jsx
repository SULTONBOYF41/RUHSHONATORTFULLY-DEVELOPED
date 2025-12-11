// client/src/components/expenses/ExpensesForm.jsx
import React from "react";

function ExpensesForm({
    typeLabel,
    currentTabInfo,
    productLabel,
    items,
    isIngredients,
    isDecor,
    isUtility,
    ingredientProducts,
    decorProducts,
    utilityProducts,
    loadingIngredientProducts,
    loadingDecorProducts,
    loadingUtilityProducts,
    totalCalculated,
    saving,
    editingId,
    onSubmit,
    onCancelEdit,
    onAddRow,
    onRemoveRow,
    onItemChange,
}) {
    const productOptions = isIngredients
        ? ingredientProducts
        : isDecor
            ? decorProducts
            : utilityProducts;

    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <div className="card-title">{typeLabel} xarajati</div>
                    <div className="card-subtitle">{currentTabInfo}</div>
                </div>
            </div>

            <form onSubmit={onSubmit}>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{productLabel}</th>

                                {/* Miqdor – masalliqlar va bezaklar uchun */}
                                {!isUtility && <th>Miqdor</th>}

                                {/* Birlik narxi – faqat masalliqlar */}
                                {isIngredients && <th>Birlik narxi</th>}

                                {/* Jami / Jami summa kolonkalari */}
                                {isIngredients && <th>Jami</th>}
                                {!isIngredients && <th>Jami summa</th>}

                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((row, index) => {
                                const q = Number(row.quantity || 0);
                                const p = Number(row.unit_price || 0);
                                const total = isIngredients && q && p ? q * p : 0;

                                const loadingProducts = isIngredients
                                    ? loadingIngredientProducts
                                    : isDecor
                                        ? loadingDecorProducts
                                        : loadingUtilityProducts;

                                const placeholder = isIngredients
                                    ? "Masalliqni tanlang"
                                    : isDecor
                                        ? "Bezak mahsulotini tanlang"
                                        : "Kommunal mahsulotni tanlang";

                                return (
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
                                                <option value="">
                                                    {loadingProducts ? "Yuklanmoqda..." : placeholder}
                                                </option>
                                                {productOptions.map((pOpt) => (
                                                    <option key={pOpt.id} value={pOpt.id}>
                                                        {pOpt.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        {!isUtility && (
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
                                                    placeholder="Miqdor"
                                                />
                                            </td>
                                        )}

                                        {isIngredients && (
                                            <td>
                                                <input
                                                    className="input"
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={row.unit_price}
                                                    onChange={(e) =>
                                                        onItemChange(index, "unit_price", e.target.value)
                                                    }
                                                    placeholder="Birlik narxi"
                                                />
                                            </td>
                                        )}

                                        {isIngredients ? (
                                            <td>
                                                {total
                                                    ? total.toLocaleString("uz-UZ") + " so‘m"
                                                    : "—"}
                                            </td>
                                        ) : (
                                            <td>
                                                <input
                                                    className="input"
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={row.unit_price}
                                                    onChange={(e) =>
                                                        onItemChange(index, "unit_price", e.target.value)
                                                    }
                                                    placeholder="Jami summa"
                                                />
                                            </td>
                                        )}

                                        <td>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="button-primary"
                                                    style={{
                                                        padding: "4px 8px",
                                                        fontSize: 11,
                                                        boxShadow: "none",
                                                        borderRadius: 999,
                                                        background:
                                                            "radial-gradient(circle at 0 0,#f97373,#ef4444)",
                                                    }}
                                                    onClick={() => onRemoveRow(index)}
                                                >
                                                    O‘chirish
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
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
                    <div style={{ fontSize: 14 }}>
                        Umumiy summa (hisoblangan):{" "}
                        <strong>
                            {totalCalculated.toLocaleString("uz-UZ")} so‘m
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="button-primary"
                        style={{
                            boxShadow: "none",
                            borderRadius: 999,
                        }}
                        onClick={onAddRow}
                    >
                        + Qator qo‘shish
                    </button>
                </div>

                <div
                    style={{
                        marginTop: 14,
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                    }}
                >
                    <button className="button-primary" type="submit" disabled={saving}>
                        {saving
                            ? "Saqlanmoqda..."
                            : editingId
                                ? "O‘zgartirishni saqlash"
                                : "Xarajatni saqlash"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            className="button-primary"
                            style={{
                                background: "transparent",
                                border: "1px solid rgba(148,163,184,0.7)",
                                color: "#e5e7eb",
                                boxShadow: "none",
                                borderRadius: 999,
                            }}
                            onClick={onCancelEdit}
                        >
                            Bekor qilish
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default ExpensesForm;
