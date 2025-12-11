// client/src/components/warehouse/WarehouseFilters.jsx
import React from "react";

function WarehouseFilters({
    isAdmin,
    branches,
    branchFilter,
    onBranchFilterChange,
    products,
    productFilter,
    onProductFilterChange,
}) {
    return (
        <div className="page-header-actions">
            {isAdmin && (
                <select
                    className="input"
                    value={branchFilter}
                    onChange={(e) => onBranchFilterChange(e.target.value)}
                >
                    {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
            )}

            <select
                className="input"
                value={productFilter}
                onChange={(e) => onProductFilterChange(e.target.value)}
            >
                {products.map((p) => (
                    <option key={p.id} value={p.id}>
                        {p.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default WarehouseFilters;
