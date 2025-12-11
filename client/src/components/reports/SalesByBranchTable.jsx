// client/src/components/reports/SalesByBranchTable.jsx
import React from "react";

function SalesByBranchTable({ date, salesByBranch, locationTypeLabel }) {
    return (
        <div className="page-section">
            <div className="page-section-header">
                <h2 className="page-section-title">
                    Filial va do‘konlar bo‘yicha kunlik savdo
                </h2>
                <p className="page-section-subtitle">Sana: {date}</p>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Turi</th>
                                <th>Filial / Do‘kon nomi</th>
                                <th>Cheklar soni</th>
                                <th>Savdo summasi (so‘m)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!salesByBranch || salesByBranch.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center" }}>
                                        Ushbu sana uchun savdo topilmadi.
                                    </td>
                                </tr>
                            ) : (
                                salesByBranch.map((row, index) => (
                                    <tr key={(row.branch_id || "null") + "-" + index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {locationTypeLabel(
                                                row.location_type || row.branch_type
                                            )}
                                        </td>
                                        <td>{row.branch_name || "—"}</td>
                                        <td>{row.sale_count}</td>
                                        <td>
                                            {(row.total_amount || 0).toLocaleString("uz-UZ")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SalesByBranchTable;
