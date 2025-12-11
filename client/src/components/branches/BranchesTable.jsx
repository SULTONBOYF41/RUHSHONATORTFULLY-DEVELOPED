// client/src/components/branches/BranchesTable.jsx
import React from "react";

function branchTypeLabel(t) {
    const v = String(t || "").toUpperCase();
    if (v === "OUTLET") return "Do‘kon / ulgurji";
    return "Filial";
}

function BranchesTable({ branches, loading, saving, onEdit, onDelete }) {
    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Filial va do‘konlar ro‘yxati</h2>
            </div>

            {loading ? (
                <p>Yuklanmoqda...</p>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nomi</th>
                                <th>Turi</th>
                                <th>Ombor</th>
                                <th>Holati</th>
                                <th style={{ width: 180 }}>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branches.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center" }}>
                                        Birorta joy topilmadi.
                                    </td>
                                </tr>
                            ) : (
                                branches.map((branch, index) => (
                                    <tr key={branch.id}>
                                        <td>{index + 1}</td>
                                        <td>{branch.name}</td>
                                        <td>{branchTypeLabel(branch.branch_type)}</td>
                                        <td>
                                            {branch.branch_type === "OUTLET" ? (
                                                <span className="badge badge-info">
                                                    Do‘kon – ombor yo‘q
                                                </span>
                                            ) : branch.use_central_stock ? (
                                                <span className="badge badge-info">
                                                    Markaziy bilan birga
                                                </span>
                                            ) : (
                                                <span className="badge badge-secondary">
                                                    Alohida ombor
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {branch.is_active ? (
                                                <span className="badge badge-success">Faol</span>
                                            ) : (
                                                <span className="badge badge-danger">Nofaol</span>
                                            )}
                                        </td>
                                        <td>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                    justifyContent: "flex-start",
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    className="btn button-primary"
                                                    onClick={() => onEdit(branch)}
                                                    style={{
                                                        padding: "3px 10px",
                                                        fontSize: 12,
                                                        borderRadius: 999,
                                                    }}
                                                >
                                                    ✏️ Tahrirlash
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-small button-danger"
                                                    onClick={() => onDelete(branch)}
                                                    disabled={saving}
                                                    style={{
                                                        padding: "3px 10px",
                                                        fontSize: 12,
                                                        borderRadius: 999,
                                                    }}
                                                >
                                                    🗑 O‘chirish
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BranchesTable;
