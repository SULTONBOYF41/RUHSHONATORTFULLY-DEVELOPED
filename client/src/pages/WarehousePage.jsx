import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function getStatus(qty) {
    if (qty <= 0) return { label: "Tugagan", type: "danger" };
    if (qty <= 3) return { label: "Kam qoldi", type: "warning" };
    return { label: "Yaxshi", type: "success" };
}

function WarehousePage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const isBranch = user?.role === "branch";

    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [branchFilter, setBranchFilter] = useState("all");
    const [productFilter, setProductFilter] = useState("all");

    const fetchStock = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (isBranch && user?.branch_id) {
                // filial user - faqat o'z filialini ko'radi
                params.branch_id = user.branch_id;
            } else if (isAdmin && branchFilter !== "all") {
                // admin: 'central' yoki aniq filial id
                params.branch_id = branchFilter;
            }

            const res = await api.get("/warehouse/stock", { params });
            setStock(res.data || []);
        } catch (err) {
            console.error(err);
            setError("Ombor qoldiqlarini yuklashda xatolik.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStock();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchFilter, isBranch, user?.branch_id]);

    // Filiallar ro'yxati faqat admin uchun
    const branches = useMemo(() => {
        if (!isAdmin) return [];

        const map = new Map();

        stock.forEach((item) => {
            const id = item.branch_id ?? "central";
            const name = item.branch_name || "Markaziy ombor";
            if (!map.has(id)) {
                map.set(id, name);
            }
        });

        const result = [
            { id: "all", name: "Barchasi" },
            { id: "central", name: "Markaziy ombor" },
        ];

        for (const [id, name] of map.entries()) {
            if (id === "central") continue; // yuqorida qo'shib bo'ldik
            result.push({ id, name });
        }

        return result;
    }, [stock, isAdmin]);

    // Mahsulotlar dropdown ro'yxati
    const products = useMemo(() => {
        const map = new Map();

        stock.forEach((item) => {
            if (!map.has(item.product_id)) {
                map.set(item.product_id, item.product_name);
            }
        });

        const result = [{ id: "all", name: "Barchasi" }];

        for (const [id, name] of map.entries()) {
            result.push({ id, name });
        }

        return result;
    }, [stock]);

    const filteredStocks = useMemo(() => {
        return stock.filter((item) => {
            const byProduct =
                productFilter === "all" ||
                String(item.product_id) === String(productFilter);

            return byProduct;
        });
    }, [stock, productFilter]);

    const title =
        isBranch && user?.branch_id
            ? `Omborxona (${user.branch_name || "Filial"})`
            : "Omborxona";

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">
                        Mahsulot qoldiqlari va ombor holatini kuzatish bo‘limi.
                    </p>
                </div>

                <div className="page-header-actions">
                    {isAdmin && (
                        <select
                            className="input"
                            value={branchFilter}
                            onChange={(e) => {
                                setBranchFilter(e.target.value);
                                // filial o'zgarsa mahsulot filterini reset qilamiz
                                setProductFilter("all");
                            }}
                        >
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <select
                        className="input"
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                    >
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="info-box info-box--error" style={{ marginBottom: 8 }}>
                    {error}
                </div>
            )}

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
                            {filteredStocks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center" }}>
                                        Hech narsa topilmadi.
                                    </td>
                                </tr>
                            ) : (
                                filteredStocks.map((item, index) => {
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
        </div>
    );
}

export default WarehousePage;
