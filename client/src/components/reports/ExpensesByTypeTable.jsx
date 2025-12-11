// client/src/components/reports/ExpensesByTypeTable.jsx
import React from "react";

function ExpensesByTypeTable({ date, expensesByType, expenseTypeLabel }) {
    return (
        <div className="page-section">
            <div className="page-section-header">
                <h2 className="page-section-title">
                    Xarajatlar taqsimoti (turlar bo‘yicha)
                </h2>
                <p className="page-section-subtitle">Sana: {date}</p>
            </div>

            <div className="card">
                {!expensesByType || expensesByType.length === 0 ? (
                    <p>Ushbu sana uchun xarajatlar topilmadi.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Turi</th>
                                    <th>Summasi (so‘m)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expensesByType.map((row, index) => (
                                    <tr key={row.expense_type || index}>
                                        <td>{index + 1}</td>
                                        <td>{expenseTypeLabel(row.expense_type)}</td>
                                        <td>
                                            {(row.total_amount || 0).toLocaleString("uz-UZ")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExpensesByTypeTable;
