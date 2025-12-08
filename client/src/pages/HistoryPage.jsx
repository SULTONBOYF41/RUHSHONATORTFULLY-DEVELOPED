import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function HistoryPage() {
    const { user } = useAuth(); // { id, role, branch_id }

    const isAdmin = user?.role === "admin";
    const isProduction = user?.role === "production";
    const isSales = user?.role === "sales";

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Admin filter states
    const [typeFilter, setTypeFilter] = useState("all");
    const [branchFilter, setBranchFilter] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const loadHistory = async () => {
        try {
            setLoading(true);

            let params = {};

            // 🔵 ADMIN KO‘RINISHI
            if (isAdmin) {
                if (typeFilter !== "all") params.type = typeFilter;
                if (branchFilter !== "all") params.branch_id = branchFilter;
                if (fromDate) params.from = fromDate;
                if (toDate) params.to = toDate;
            }

            // 🟣 PRODUCTION USER → faqat ishlab chiqarish tarixi
            if (isProduction) {
                params.type = "production";
            }

            // 🟢 SALES USER → faqat o‘z filialining sotuvlari
            if (isSales) {
                params.type = "sales";
                params.branch_id = user.branch_id; // boshqasi ko‘rinmaydi
            }

            const res = await api.get("/history/activities", { params });
            setItems(res.data || []);
        } catch (err) {
            console.error("History load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [typeFilter, branchFilter, fromDate, toDate]);

    return (
        <div className="page">
            <h1 className="page-title">Umumiy tarix</h1>

            {/* ------------------------- 
          ADMIN BO‘LSA FILTERLAR
      ------------------------- */}
            {isAdmin && (
                <div className="filters" style={{ display: "flex", gap: 12 }}>
                    <select
                        className="input"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">Barchasi</option>
                        <option value="sales">Sotuv</option>
                        <option value="transfer">Transfer</option>
                        <option value="production">Ishlab chiqarish</option>
                    </select>

                    <select
                        className="input"
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                    >
                        <option value="all">Barchasi</option>
                        {/* Markaziy omborni chiqarib tashlaymiz */}
                        {/* Faqat use_central_stock = 0 bo‘lgan filiallar */}
                        {/* Branchlar API’da kelgan bo‘lsa */}
                    </select>

                    <input
                        type="date"
                        className="input"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />

                    <input
                        type="date"
                        className="input"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />

                    <button className="btn btn-primary" onClick={loadHistory}>
                        Yangilash
                    </button>
                </div>
            )}

            {/* ------------------------- 
          PRODUCTION USER – FILTRLARSIZ
      ------------------------- */}
            {isProduction && (
                <p className="info">
                    Siz ishlab chiqarish bo‘limi xodimisiz. Faqat ishlab chiqarish tarixi ko‘rinadi.
                </p>
            )}

            {/* ------------------------- 
          SALES USER – FILTRLARSIZ
      ------------------------- */}
            {isSales && (
                <p className="info">
                    Siz <b>{user.branch_name}</b> filialining sotuvlarini ko‘ryapsiz.
                </p>
            )}

            {/* TARIX JADVALI */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-wrapper">
                    {loading ? (
                        <p>Yuklanmoqda...</p>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Sana</th>
                                    <th>Turi</th>
                                    <th>Filial / Yo‘nalish</th>
                                    <th>Izoh</th>
                                    <th>Summasi</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: "center" }}>
                                            Ma’lumot topilmadi
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((row, i) => (
                                        <tr key={row.id}>
                                            <td>{i + 1}</td>
                                            <td>{row.activity_date}</td>
                                            <td>{row.type}</td>
                                            <td>{row.branch_name || "—"}</td>
                                            <td>{row.description || "—"}</td>
                                            <td>{row.amount || "—"}</td>
                                            <td>{row.status || "—"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HistoryPage;
