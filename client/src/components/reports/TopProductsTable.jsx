// client/src/components/reports/TopProductsTable.jsx
import React from "react";

function TopProductsTable({ date, topProducts, loading }) {
    return (
        <div className="page-section">
            <div className="page-section-header">
                <h2 className="page-section-title">Eng ko‘p sotilgan mahsulotlar</h2>
                <p className="page-section-subtitle">Sana: {date}</p>
            </div>

            <div className="card">
                {loading && (
                    <p style={{ marginBottom: 8 }}>Jadval yangilanmoqda...</p>
                )}

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mahsulot</th>
                                <th>Filial / Do‘kon</th>
                                <th>Soni</th>
                                <th>Summasi (so‘m)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center" }}>
                                        Ushbu sana uchun savdo topilmadi.
                                    </td>
                                </tr>
                            ) : (
                                topProducts.map((item, index) => (
                                    <tr key={item.product_id + "-" + index}>
                                        <td>{index + 1}</td>
                                        <td>{item.product_name}</td>
                                        <td>{item.branch_name || "—"}</td>
                                        <td>{item.sold_quantity}</td>
                                        <td>
                                            {(item.total_amount || 0).toLocaleString("uz-UZ")}
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

export default TopProductsTable;
