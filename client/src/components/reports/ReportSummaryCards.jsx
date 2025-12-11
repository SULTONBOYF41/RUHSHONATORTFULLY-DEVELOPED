// client/src/components/reports/ReportSummaryCards.jsx
import React from "react";

function ReportSummaryCards({ cards }) {
    if (!cards || cards.length === 0) return null;

    return (
        <div className="card-grid card-grid-4">
            {cards.map((card, idx) => (
                <div key={idx} className="card">
                    <div className="card-title">{card.title}</div>
                    <div className="card-value">{card.value}</div>
                    <div className="card-subtitle">{card.subtitle}</div>
                </div>
            ))}
        </div>
    );
}

export default ReportSummaryCards;
