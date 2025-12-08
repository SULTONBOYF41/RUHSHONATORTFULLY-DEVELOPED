// client/src/pages/ProductsPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const FILTER_ALL = "ALL";
const FILTER_KG = "KG";
const FILTER_PIECE = "PIECE";
const FILTER_DECOR = "DECOR";

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [filter, setFilter] = useState(FILTER_ALL);

    const [form, setForm] = useState({
        name: "",
        unit: "dona", // 'dona' yoki 'kg'
        price: "",
        category: "PRODUCT", // PRODUCT yoki DECORATION
    });

    const formatUnit = (unit) => {
        if (!unit) return "-";
        if (unit === "piece") return "dona";
        return unit;
    };

    const formatCategory = (category) => {
        if (!category) return "-";
        if (category === "DECORATION") return "Dekoratsiya";
        if (category === "PRODUCT") return "Mahsulot";
        return category;
    };

    // Productlarni yuklash
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/products");
            const data = res.data || [];
            // Yangi qo'shilganlar tepada ko'rinsin
            setProducts(data.slice().reverse());
        } catch (err) {
            console.error(err);
            setError("Mahsulotlarni yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Form o‘zgarishlari
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({
            name: "",
            unit: "dona",
            price: "",
            category: "PRODUCT",
        });
        setEditingId(null);
    };

    // Mahsulot qo‘shish / tahrirlash
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Mahsulot nomi majburiy");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: form.name.trim(),
                unit: form.unit, // 'kg' yoki 'dona'
                price: Number(form.price) || 0,
                category: form.category, // PRODUCT / DECORATION
            };

            if (editingId) {
                const res = await api.put(`/products/${editingId}`, payload);
                const updated = res.data;
                setProducts((prev) =>
                    prev.map((p) => (p.id === editingId ? updated : p))
                );
            } else {
                const res = await api.post("/products", payload);
                // yangi mahsulotni TEPAga qo'yamiz
                setProducts((prev) => [res.data, ...prev]);
            }

            resetForm();
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message || "Mahsulotni saqlashda xatolik";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setForm({
            name: product.name || "",
            unit: product.unit === "kg" ? "kg" : "dona",
            price: product.price ?? "",
            category: product.category || "PRODUCT",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `"${product.name}" mahsulotini haqiqatan ham o'chirmoqchimisiz?`
        );
        if (!confirmed) return;

        try {
            await api.delete(`/products/${product.id}`);
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message || "Mahsulotni o'chirishda xatolik";
            setError(msg);
        }
    };

    const filteredProducts = useMemo(
        () =>
            products.filter((p) => {
                if (filter === FILTER_KG) return p.unit === "kg";
                if (filter === FILTER_PIECE) return p.unit === "piece";
                if (filter === FILTER_DECOR) return p.category === "DECORATION";
                return true;
            }),
        [products, filter]
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mahsulotlar</h1>
                    <p className="page-subtitle">
                        Asosiy mahsulotlar va bezaklar ro&apos;yxati.
                    </p>
                </div>
            </div>

            <div className="card">
                {/* Error box */}
                {error && (
                    <div
                        style={{
                            marginBottom: 12,
                            padding: 8,
                            borderRadius: 6,
                            background: "#ffe5e5",
                            color: "#a20000",
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Add / edit product form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div>
                            <label>Mahsulot nomi</label>
                            <input
                                className="input"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label>Birlik</label>
                            <select
                                className="input"
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                            >
                                <option value="dona">dona</option>
                                <option value="kg">kg</option>
                            </select>
                        </div>

                        <div>
                            <label>Kategoriya</label>
                            <select
                                className="input"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="PRODUCT">Asosiy mahsulot</option>
                                <option value="DECORATION">Dekoratsiya / bezak</option>
                            </select>
                        </div>

                        <div>
                            <label>Narx (ixtiyoriy)</label>
                            <input
                                className="input"
                                name="price"
                                type="number"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: 10,
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                        }}
                    >
                        <button className="button-primary" disabled={saving}>
                            {saving
                                ? "Saqlanmoqda..."
                                : editingId
                                    ? "O'zgartirishni saqlash"
                                    : "Mahsulot qo‘shish"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="button-primary"
                                style={{
                                    background: "transparent",
                                    border: "1px solid rgba(148,163,184,0.7)",
                                    color: "#e5e7eb",
                                    boxShadow: "none",
                                }}
                                onClick={handleCancelEdit}
                            >
                                Bekor qilish
                            </button>
                        )}
                    </div>
                </form>

                <hr style={{ margin: "20px 0" }} />

                {/* Filter panel */}
                <div
                    style={{
                        marginBottom: 10,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                        Jami: <strong>{products.length}</strong> ta mahsulot
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => setFilter(FILTER_ALL)}
                            style={{
                                padding: "4px 10px",
                                fontSize: 12,
                                boxShadow: "none",
                                opacity: filter === FILTER_ALL ? 1 : 0.6,
                            }}
                        >
                            Hammasi
                        </button>
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => setFilter(FILTER_KG)}
                            style={{
                                padding: "4px 10px",
                                fontSize: 12,
                                boxShadow: "none",
                                opacity: filter === FILTER_KG ? 1 : 0.6,
                            }}
                        >
                            Faqat kg
                        </button>
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => setFilter(FILTER_PIECE)}
                            style={{
                                padding: "4px 10px",
                                fontSize: 12,
                                boxShadow: "none",
                                opacity: filter === FILTER_PIECE ? 1 : 0.6,
                            }}
                        >
                            Faqat dona
                        </button>
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => setFilter(FILTER_DECOR)}
                            style={{
                                padding: "4px 10px",
                                fontSize: 12,
                                boxShadow: "none",
                                opacity: filter === FILTER_DECOR ? 1 : 0.6,
                            }}
                        >
                            Faqat bezaklar
                        </button>
                    </div>
                </div>

                {/* Products list */}
                {loading ? (
                    <p>Yuklanmoqda...</p>
                ) : filteredProducts.length === 0 ? (
                    <p>Ko‘rsatiladigan mahsulot yo‘q.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>T/r</th>
                                    <th>Nomi</th>
                                    <th>Birlik</th>
                                    <th>Kategoriya</th>
                                    <th>Narx</th>
                                    <th style={{ width: 120 }}>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p, index) => (
                                    <tr key={p.id}>
                                        <td>{index + 1}</td>
                                        <td>{p.name}</td>
                                        <td>{formatUnit(p.unit)}</td>
                                        <td>{formatCategory(p.category)}</td>
                                        <td>
                                            {typeof p.price === "number"
                                                ? p.price.toLocaleString("uz-UZ")
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
                                                        padding: "3px 8px",
                                                        fontSize: 11,
                                                        boxShadow: "none",
                                                    }}
                                                    onClick={() => handleEdit(p)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button-primary"
                                                    style={{
                                                        padding: "3px 8px",
                                                        fontSize: 11,
                                                        boxShadow: "none",
                                                        background: "#dc2626",
                                                    }}
                                                    onClick={() => handleDelete(p)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
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

export default ProductsPage;
