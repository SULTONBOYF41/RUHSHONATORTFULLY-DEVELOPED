// client/src/components/history/HistoryFilters.jsx
import React from "react";

function HistoryFilters({
    isAdmin,
    typeFilter,
    branchFilter,
    fromDate,
    toDate,
    onTypeChange,
    onBranchChange,
    onFromDateChange,
    onToDateChange,
    onRefresh,
}) {
    if (!isAdmin) return null;

    return (
        <div
            className="filters"
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 12,
            }}
        >
            <select
                className="input"
                value={typeFilter}
                onChange={(e) => onTypeChange(e.target.value)}
            >
                <option value="all">Turlar: barchasi</option>
                <option value="sale">Sotuv</option>
                <option value="transfer">Transfer</option>
                <option value="production">Ishlab chiqarish</option>
                <option value="return">Vazvrat</option>
            </select>

            <select
                className="input"
                value={branchFilter}
                onChange={(e) => onBranchChange(e.target.value)}
            >
                <option value="all">Filiallar: barchasi</option>
                {/* Agar keyinchalik filiallar ro'yxatini API'dan olsak, shu yerda map qilamiz */}
            </select>

            <input
                type="date"
                className="input"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
            />

            <input
                type="date"
                className="input"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
            />

            <button className="btn button-primary" onClick={onRefresh}>
                Yangilash
            </button>
        </div>
    );
}

export default HistoryFilters;
