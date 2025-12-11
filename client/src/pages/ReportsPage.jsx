// client/src/pages/ReportsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";

import ReportSummaryCards from "../components/reports/ReportSummaryCards";
import SalesByBranchTable from "../components/reports/SalesByBranchTable";
import ExpensesByTypeTable from "../components/reports/ExpensesByTypeTable";
import TopProductsTable from "../components/reports/TopProductsTable";
import MonthlySalesChart from "../components/reports/MonthlySalesChart";

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
        return now.toISOString().slice(0, 10);
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

        const totalBranches = stats.totalBranches ?? 0;
        const totalOutlets = stats.totalOutlets ?? 0;

        return [
            {
                title: "Filiallar",
                value: totalBranches,
                subtitle: "Faol filiallar soni",
            },
            {
                title: "Faol ulgurji do‘konlar",
                value: totalOutlets,
                subtitle: "Do‘kon modulidagi aktiv outletlar",
            },
            {
                title: "Foydalanuvchilar",
                value: stats.totalUsers ?? 0,
                subtitle: "Admin va xodimlar",
            },
            {
                title: "Mahsulotlar",
                value: stats.totalProducts ?? 0,
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
                    (stats.productionBatchCount || 0) +
                    " ta partiya (miqdor yig‘indisi)",
            },
        ];
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

    const locationTypeLabel = (rawType) => {
        const t = String(rawType || "").toUpperCase();
        if (t === "BRANCH") return "Filial";
        if (t === "OUTLET" || t === "SHOP" || t === "STORE") return "Do‘kon";
        return "—";
    };

    const monthLabel = date.slice(0, 7);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hisobotlar</h1>
                    <p className="page-subtitle">
                        Ruxshona Tort tarmog‘i bo‘yicha filiallar, do‘konlar, kunlik va
                        oylik statistik ma’lumotlar: savdo, xarajatlar, sof foyda va
                        ishlab chiqarish.
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
                <div
                    className="info-box info-box--error"
                    style={{ marginBottom: 8 }}
                >
                    {error}
                </div>
            )}

            {loading && !stats ? (
                <p>Yuklanmoqda...</p>
            ) : (
                <>
                    {/* Umumiy kartochkalar */}
                    <ReportSummaryCards cards={summaryCards} />

                    {/* Filial / do‘konlar bo‘yicha savdo */}
                    <SalesByBranchTable
                        date={date}
                        salesByBranch={salesByBranch}
                        locationTypeLabel={locationTypeLabel}
                    />

                    {/* Xarajat turlari bo‘yicha */}
                    <ExpensesByTypeTable
                        date={date}
                        expensesByType={expensesByType}
                        expenseTypeLabel={expenseTypeLabel}
                    />

                    {/* TOP mahsulotlar */}
                    <TopProductsTable
                        date={date}
                        topProducts={topProducts}
                        loading={loading}
                    />

                    {/* Oylik savdo bar-chart */}
                    <MonthlySalesChart
                        monthLabel={monthLabel}
                        monthlyChartData={monthlyChartData}
                    />
                </>
            )}
        </div>
    );
}

export default ReportsPage;
