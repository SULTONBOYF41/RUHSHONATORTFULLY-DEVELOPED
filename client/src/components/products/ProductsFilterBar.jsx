// client/src/components/products/ProductsFilterBar.jsx
import React from "react";

function ProductsFilterBar({
    totalCount,
    filter,
    onFilterChange,
    filterOptions,
}) {
    return (
        <div
            style={{
                marginBottom: 10,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <div style={{ fontSize: 13, opacity: 0.85 }}>
                Jami: <strong>{totalCount}</strong> ta mahsulot
            </div>

            <div style={{ minWidth: 220 }}>
                <label
                    style={{
                        fontSize: 12,
                        display: "block",
                        marginBottom: 4,
                        opacity: 0.8,
                    }}
                >
                    Filter
                </label>
                <select
                    className="input"
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                >
                    {filterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default ProductsFilterBar;
