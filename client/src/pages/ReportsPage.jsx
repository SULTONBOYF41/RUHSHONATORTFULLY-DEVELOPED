import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";

function ReportsPage() {
    const [stats, setStats] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [salesByBranch, setSalesByBranch] = useState([]);
    const [expensesByType, setExpensesByType] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [date, setDate] = useState(() => {
        const now = new Date();
        return now.toISOString().slice(0, 10); // YYYY-MM-DD
    });

    const fetchOverview = async (selectedDate) => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/reports/overview", {
                params: { date: selectedDate },
            });

            setStats(res.data.stats || null);
            setTopProducts(res.data.topProducts || []);
            setMonthlySales(res.data.monthlySales || []);
            setSalesByBranch(res.data.salesByBranch || []);
            setExpensesByType(res.data.expensesByType || []);
        } catch (err) {
            console.error(err);
            setError("Hisobot ma'lumotlarini yuklashda xatolik.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview(date);
    }, [date]);

    const summaryCards = useMemo(() => {
        if (!stats) return [];

        const cards = [
            {
                title: "Filiallar soni",
                value: stats.totalBranches,
                subtitle: "Faol filiallar",
            },
            {
                title: "Foydalanuvchilar",
                value: stats.totalUsers,
                subtitle: "Admin va xodimlar",
            },
            {
                title: "Mahsulotlar",
                value: stats.totalProducts,
                subtitle: "Aktiv menyu pozitsiyalari",
            },
            {
                title: "Kunlik savdo",
                value:
                    (stats.todaySalesAmount || 0).toLocaleString("uz-UZ") + " so‘m",
                subtitle: (stats.todaySalesCount || 0) + " ta chek",
            },
            {
                title: "Kunlik xarajatlar",
                value:
                    (stats.totalExpenses || 0).toLocaleString("uz-UZ") + " so‘m",
                subtitle: "Barcha turdagi xarajatlar",
            },
            {
                title: "Sof foyda",
                value: (stats.profit || 0).toLocaleString("uz-UZ") + " so‘m",
                subtitle: "Savdo − xarajatlar",
            },
            {
                title: "Ishlab chiqarish",
                value: (stats.productionQuantity || 0).toLocaleString("uz-UZ"),
                subtitle:
                    (stats.productionBatchCount || 0) + " ta partiya (miqdor yig‘indisi)",
            },
        ];

        return cards;
    }, [stats]);

    // Oylik savdo uchun bar-chart data
    const monthlyChartData = useMemo(() => {
        if (!monthlySales || monthlySales.length === 0) return [];

        const maxAmount = Math.max(
            ...monthlySales.map((d) => d.total_amount || 0)
        );

        return monthlySales.map((item) => {
            const amount = item.total_amount || 0;
            const width = maxAmount ? Math.round((amount / maxAmount) * 100) : 0;

            const label = item.sale_date ? item.sale_date.slice(5) : "";

            return {
                ...item,
                label,
                amount,
                width,
            };
        });
    }, [monthlySales]);

    const expenseTypeLabel = (t) => {
        switch (t) {
            case "ingredients":
                return "Masalliqlar";
            case "decor":
                return "Bezaklar";
            case "utility":
                return "Qo‘shimcha xarajatlar";
            default:
                return t || "—";
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hisobotlar</h1>
                    <p className="page-subtitle">
                        Ruxshona Tort tarmog‘i bo‘yicha kunlik va oylik statistik
                        ma’lumotlar: savdo, xarajatlar, sof foyda va ishlab chiqarish.
                    </p>
                </div>

                <div className="page-header-actions">
                    <input
                        className="input"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="info-box info-box--error" style={{ marginBottom: 8 }}>
                    {error}
                </div>
            )}

            {loading && !stats ? (
                <p>Yuklanmoqda...</p>
            ) : (
                <>
                    {/* Umumiy kartochkalar */}
                    <div className="card-grid card-grid-4">
                        {summaryCards.map((card, idx) => (
                            <div key={idx} className="card">
                                <div className="card-title">{card.title}</div>
                                <div className="card-value">{card.value}</div>
                                <div className="card-subtitle">{card.subtitle}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filiallar bo‘yicha savdo */}
                    <div className="page-section">
                        <div className="page-section-header">
                            <h2 className="page-section-title">
                                Filiallar bo‘yicha kunlik savdo
                            </h2>
                            <p className="page-section-subtitle">Sana: {date}</p>
                        </div>

                        <div className="card">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Filial</th>
                                            <th>Cheklar soni</th>
                                            <th>Savdo summasi (so‘m)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!salesByBranch || salesByBranch.length === 0) ? (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: "center" }}>
                                                    Ushbu sana uchun savdo topilmadi.
                                                </td>
                                            </tr>
                                        ) : (
                                            salesByBranch.map((row, index) => (
                                                <tr key={(row.branch_id || "null") + "-" + index}>
                                                    <td>{index + 1}</td>
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

                    {/* Xarajatlar turlari bo‘yicha */}
                    <div className="page-section">
                        <div className="page-section-header">
                            <h2 className="page-section-title">
                                Xarajatlar taqsimoti (turlar bo‘yicha)
                            </h2>
                            <p className="page-section-subtitle">Sana: {date}</p>
                        </div>

                        <div className="card">
                            {(!expensesByType || expensesByType.length === 0) ? (
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

                    {/* TOP mahsulotlar jadvali */}
                    <div className="page-section">
                        <div className="page-section-header">
                            <h2 className="page-section-title">
                                Eng ko‘p sotilgan mahsulotlar
                            </h2>
                            <p className="page-section-subtitle">Sana: {date}</p>
                        </div>

                        <div className="card">
                            {loading && <p>Jadval yangilanmoqda...</p>}

                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Mahsulot</th>
                                            <th>Filial</th>
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

                    {/* Oylik savdo bar-chart */}
                    <div className="page-section">
                        <div className="page-section-header">
                            <h2 className="page-section-title">
                                Oylik savdo dinamikasi (kunlar kesimida)
                            </h2>
                            <p className="page-section-subtitle">
                                Sana bo‘yicha oy: {date.slice(0, 7)}
                            </p>
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
                </>
            )}
        </div>
    );
}

export default ReportsPage;
