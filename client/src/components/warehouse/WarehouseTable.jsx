// client/src/components/warehouse/WarehouseTable.jsx
import React from "react";

function getStatus(qty) {
    if (qty <= 0) return { label: "Tugagan", type: "danger" };
    if (qty <= 3) return { label: "Kam qoldi", type: "warning" };
    return { label: "Yaxshi", type: "success" };
}

function WarehouseTable({ loading, stocks }) {
    return (
        <div className="card">
            {loading && <p>Yuklanmoqda...</p>}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mahsulot</th>
                            <th>Filial / Ombor</th>
                            <th>Miqdor</th>
                            <th>O‘lchov birligi</th>
                            <th>Holati</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    Hech narsa topilmadi.
                                </td>
                            </tr>
                        ) : (
                            stocks.map((item, index) => {
                                const status = getStatus(item.quantity);
                                return (
                                    <tr
                                        key={`${item.product_id}-${item.branch_id || "central"}`}
                                    >
                                        <td>{index + 1}</td>
                                        <td>{item.product_name}</td>
                                        <td>{item.branch_name || "Markaziy ombor"}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.unit}</td>
                                        <td>
                                            <span className={`badge badge-${status.type}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default WarehouseTable;
