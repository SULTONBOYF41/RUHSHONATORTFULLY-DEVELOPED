// client/src/components/expenses/ExpensesList.jsx
import React from "react";

function ExpensesList({ typeLabel, expenses, loading, onEdit, onDelete }) {
    return (
        <div className="card" style={{ marginTop: 16 }}>
            <div
                style={{
                    marginBottom: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div className="card-title" style={{ marginBottom: 0 }}>
                    {typeLabel} bo‘yicha so‘nggi xarajatlar
                </div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>
                    Jami: <strong>{expenses.length}</strong> ta yozuv
                </div>
            </div>

            {loading ? (
                <p>Yuklanmoqda...</p>
            ) : expenses.length === 0 ? (
                <p>Hozircha bu bo‘lim bo‘yicha xarajatlar yo‘q.</p>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>SANA</th>
                                <th>NOMLAR</th>
                                <th>UMUMIY SUMMA</th>
                                <th style={{ width: 160 }}>AMALLAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((exp) => {
                                const itemsSummary =
                                    Array.isArray(exp.items) && exp.items.length > 0
                                        ? exp.items
                                            .map((it) => it.name || it.product_name || "")
                                            .filter(Boolean)
                                            .join(", ")
                                        : "-";

                                return (
                                    <tr key={exp.id}>
                                        <td>{exp.expense_date}</td>
                                        <td>{itemsSummary}</td>
                                        <td>
                                            {typeof exp.total_amount === "number"
                                                ? exp.total_amount.toLocaleString("uz-UZ")
                                                : "-"}
                                        </td>
                                        <td>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 6,
                                                    justifyContent: "flex-start",
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    className="button-primary"
                                                    style={{
                                                        padding: "3px 10px",
                                                        fontSize: 11,
                                                        boxShadow: "none",
                                                        borderRadius: 999,
                                                    }}
                                                    onClick={() => onEdit(exp)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button-primary"
                                                    style={{
                                                        padding: "3px 10px",
                                                        fontSize: 11,
                                                        boxShadow: "none",
                                                        borderRadius: 999,
                                                        background:
                                                            "radial-gradient(circle at 0 0,#f97373,#dc2626)",
                                                    }}
                                                    onClick={() => onDelete(exp)}
                                                >
                                                    🗑 Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ExpensesList;
