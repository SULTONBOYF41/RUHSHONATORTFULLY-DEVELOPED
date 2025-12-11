// client/src/components/expenses/ExpensesTabs.jsx
import React from "react";

function ExpensesTabs({ tabs, activeTab, onTabChange }) {
    return (
        <div
            className="tabs"
            style={{
                marginBottom: 12,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
            }}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        className={
                            "button-primary" + (isActive ? "" : " button-secondary")
                        }
                        style={{
                            padding: "10px 18px",
                            fontSize: 14,
                            boxShadow: "none",
                            opacity: isActive ? 1 : 0.75,
                            borderRadius: 999,
                            minWidth: 180,
                            textAlign: "center",
                            transition: "transform 0.12s ease, opacity 0.12s ease",
                            transform: isActive ? "translateY(-1px)" : "none",
                        }}
                        onClick={() => onTabChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

export default ExpensesTabs;
