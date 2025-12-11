// client/src/components/reports/MonthlySalesChart.jsx
import React from "react";

function MonthlySalesChart({ monthLabel, monthlyChartData }) {
    return (
        <div className="page-section">
            <div className="page-section-header">
                <h2 className="page-section-title">
                    Oylik savdo dinamikasi (kunlar kesimida)
                </h2>
                <p className="page-section-subtitle">Sana bo‘yicha oy: {monthLabel}</p>
            </div>

            <div className="card">
                {monthlyChartData.length === 0 ? (
                    <p>Ushbu oy uchun savdo ma’lumotlari topilmadi.</p>
                ) : (
                    <div className="report-bar-chart">
                        {monthlyChartData.map((item) => (
                            <div
                                key={item.sale_date}
                                className="report-bar-row"
                            >
                                <div className="report-bar-label">{item.label}</div>
                                <div className="report-bar">
                                    <div
                                        className="report-bar-fill"
                                        style={{ width: item.width + "%" }}
                                    />
                                </div>
                                <div className="report-bar-value">
                                    {item.amount.toLocaleString("uz-UZ")} so‘m
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MonthlySalesChart;
