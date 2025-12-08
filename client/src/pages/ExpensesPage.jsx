// client/src/pages/ExpensesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const TYPE_INGREDIENTS = "ingredients";
const TYPE_DECOR = "decor";
const TYPE_UTILITY = "utility";

function ExpensesPage() {
    const { user } = useAuth();

    const [expenseDate, setExpenseDate] = useState(() => {
        const now = new Date();
        return now.toISOString().slice(0, 10);
    });

    const [type, setType] = useState(TYPE_INGREDIENTS);

    // Umumiy summa (ingredients, utility uchun)
    const [amount, setAmount] = useState("");

    // Umumiy description
    const [description, setDescription] = useState("");

    // Bezaklar satrlari
    const [decorItems, setDecorItems] = useState([
        { product_id: "", quantity: "", total_price: "" },
    ]);

    // Dekor mahsulotlar ro'yxati
    const [decorationProducts, setDecorationProducts] = useState([]);
    const [loadingDecorProducts, setLoadingDecorProducts] = useState(false);

    // Jadval uchun
    const [expenses, setExpenses] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);

    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const decorTotal = useMemo(
        () =>
            decorItems.reduce(
                (sum, row) => sum + (Number(row.total_price) || 0),
                0
            ),
        [decorItems]
    );

    const handleDecorChange = (index, field, value) => {
        setDecorItems((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const addDecorRow = () => {
        setDecorItems((prev) => [
            ...prev,
            { product_id: "", quantity: "", total_price: "" },
        ]);
    };

    const removeDecorRow = (index) => {
        setDecorItems((prev) => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setAmount("");
        setDescription("");
        setDecorItems([{ product_id: "", quantity: "", total_price: "" }]);
        setEditingId(null);
        setExpenseDate(new Date().toISOString().slice(0, 10));
    };

    // Dekor mahsulotlar
    useEffect(() => {
        if (type !== TYPE_DECOR) return;

        setLoadingDecorProducts(true);
        api
            .get("/products/decorations")
            .then((res) => {
                setDecorationProducts(res.data || []);
            })
            .catch((err) => {
                console.error(err);
                setError(
                    "Bezak mahsulotlar ro'yxatini olishda xatolik. Iltimos, sahifani yangilang yoki keyinroq urinib ko'ring."
                );
            })
            .finally(() => {
                setLoadingDecorProducts(false);
            });
    }, [type]);

    // Tanlangan type bo'yicha expenses ro'yxatini yuklash
    const fetchExpenses = async (currentType = type) => {
        try {
            setLoadingExpenses(true);
            const res = await api.get("/expenses", {
                params: { type: currentType },
            });
            setExpenses(res.data || []);
        } catch (err) {
            console.error(err);
            setError("Xarajatlar ro'yxatini yuklashda xatolik");
        } finally {
            setLoadingExpenses(false);
        }
    };

    useEffect(() => {
        fetchExpenses(type);
    }, [type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const basePayload = {
                expense_date: expenseDate,
                type,
                description: description || null,
                created_by: user?.id || null,
            };

            let payload = basePayload;

            if (type === TYPE_INGREDIENTS || type === TYPE_UTILITY) {
                const val = Number(amount);
                if (!val || val <= 0) {
                    throw new Error("Summani to'g'ri kiriting");
                }
                payload = { ...basePayload, amount: val };
            }

            if (type === TYPE_DECOR) {
                const itemsPayload = decorItems
                    .map((row) => {
                        const productId = row.product_id ? Number(row.product_id) : null;
                        const quantity = Number(row.quantity) || 0;
                        const totalPrice = Number(row.total_price) || 0;

                        const product = decorationProducts.find(
                            (p) => p.id === productId
                        );

                        return {
                            product_id: productId,
                            name: product?.name || "",
                            quantity,
                            total_price: totalPrice,
                        };
                    })
                    .filter(
                        (r) =>
                            r.product_id &&
                            r.quantity > 0 &&
                            r.total_price > 0
                    );

                if (itemsPayload.length === 0) {
                    throw new Error(
                        "Bezaklar uchun kamida bitta to'g'ri satr kiritish kerak (mahsulot, miqdor, summa)."
                    );
                }

                payload = { ...basePayload, items: itemsPayload };
            }

            setSaving(true);

            if (editingId) {
                await api.put(`/expenses/${editingId}`, payload);
                setSuccess("Xarajat muvaffaqiyatli yangilandi.");
            } else {
                await api.post("/expenses", payload);
                setSuccess("Xarajat muvaffaqiyatli saqlandi.");
            }

            resetForm();
            fetchExpenses(type);
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Xarajatni saqlashda xatolik.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (expense) => {
        setEditingId(expense.id);
        setExpenseDate(expense.expense_date || expenseDate);
        setType(expense.type);
        setDescription(expense.description || "");

        if (
            expense.type === TYPE_INGREDIENTS ||
            expense.type === TYPE_UTILITY
        ) {
            setAmount(
                expense.total_amount != null ? String(expense.total_amount) : ""
            );
        }

        if (expense.type === TYPE_DECOR && Array.isArray(expense.items)) {
            setDecorItems(
                expense.items.length
                    ? expense.items.map((item) => ({
                        product_id: item.product_id || "",
                        quantity: item.quantity ?? "",
                        total_price: item.total_price ?? "",
                    }))
                    : [{ product_id: "", quantity: "", total_price: "" }]
            );
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleDelete = async (expense) => {
        const confirmed = window.confirm(
            `Ushbu xarajatni (${expense.expense_date}, ${expense.total_amount} so'm) haqiqatan ham o'chirmoqchimisiz?`
        );
        if (!confirmed) return;

        try {
            await api.delete(`/expenses/${expense.id}`);
            setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message ||
                "Xarajatni o'chirishda xatolik.";
            setError(msg);
        }
    };

    const typeLabel = (() => {
        if (type === TYPE_INGREDIENTS) return "Masalliqlar";
        if (type === TYPE_DECOR) return "Bezaklar / salyut";
        if (type === TYPE_UTILITY) return "Kommunal to'lovlar";
        return "";
    })();

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Xarajatlar</h1>
                    <p className="page-subtitle">
                        Masalliqlar, bezaklar va kommunal to&apos;lovlar bo&apos;yicha
                        xarajatlarni kiritish va ko&apos;rish.
                    </p>
                </div>

                <div className="page-header-actions">
                    <input
                        className="input"
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                    />
                    <select
                        className="input"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value={TYPE_INGREDIENTS}>Masalliqlar</option>
                        <option value={TYPE_DECOR}>Bezaklar / salyut</option>
                        <option value={TYPE_UTILITY}>Kommunal to&apos;lovlar</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="info-box info-box--error" style={{ marginBottom: 8 }}>
                    {error}
                </div>
            )}

            {success && (
                <div className="info-box info-box--muted" style={{ marginBottom: 8 }}>
                    {success}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {/* Masalliqlar yoki kommunal uchun umumiy summa */}
                    {(type === TYPE_INGREDIENTS || type === TYPE_UTILITY) && (
                        <>
                            <div className="form-row">
                                <div>
                                    <label>
                                        Umumiy summa (so&apos;m)
                                        {type === TYPE_INGREDIENTS && " – masalliqlar"}
                                        {type === TYPE_UTILITY && " – kommunal to'lovlar"}
                                    </label>
                                    <input
                                        className="input"
                                        type="number"
                                        min="0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: 8, marginBottom: 8 }}>
                                <label>Eslatma (ixtiyoriy)</label>
                                <textarea
                                    className="input"
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={
                                        type === TYPE_INGREDIENTS
                                            ? "Masalliqlar xarajati haqida izoh..."
                                            : "Qaysi kommunal to'lov uchun to'landi (masalan: Tok, gaz)..."
                                    }
                                />
                            </div>
                        </>
                    )}

                    {/* Bezaklar uchun jadval */}
                    {type === TYPE_DECOR && (
                        <>
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Mahsulot *</th>
                                            <th>Miqdor</th>
                                            <th>Jami summa</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {decorItems.map((row, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <select
                                                        className="input"
                                                        value={row.product_id}
                                                        onChange={(e) =>
                                                            handleDecorChange(
                                                                index,
                                                                "product_id",
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            {loadingDecorProducts
                                                                ? "Yuklanmoqda..."
                                                                : "Bezak mahsulotini tanlang"}
                                                        </option>
                                                        {decorationProducts.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        className="input"
                                                        type="number"
                                                        min="0"
                                                        value={row.quantity}
                                                        onChange={(e) =>
                                                            handleDecorChange(
                                                                index,
                                                                "quantity",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Miqdor"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="input"
                                                        type="number"
                                                        min="0"
                                                        value={row.total_price}
                                                        onChange={(e) =>
                                                            handleDecorChange(
                                                                index,
                                                                "total_price",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Jami summa"
                                                    />
                                                </td>
                                                <td>
                                                    {decorItems.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="button-primary"
                                                            style={{
                                                                padding: "4px 8px",
                                                                fontSize: 11,
                                                                boxShadow: "none",
                                                            }}
                                                            onClick={() => removeDecorRow(index)}
                                                        >
                                                            O‘chirish
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div
                                style={{
                                    marginTop: 10,
                                    marginBottom: 8,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <div style={{ fontSize: 14 }}>
                                    Bezaklar bo‘yicha umumiy summa:{" "}
                                    <strong>
                                        {decorTotal.toLocaleString("uz-UZ")} so‘m
                                    </strong>
                                </div>

                                <button
                                    type="button"
                                    className="button-primary"
                                    style={{ boxShadow: "none" }}
                                    onClick={addDecorRow}
                                >
                                    Qator qo‘shish
                                </button>
                            </div>

                            <div style={{ marginTop: 8, marginBottom: 8 }}>
                                <label>Eslatma (ixtiyoriy)</label>
                                <textarea
                                    className="input"
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Masalan: Tug'ilgan kun bezaklari uchun xarajat..."
                                />
                            </div>
                        </>
                    )}

                    <div
                        style={{
                            marginTop: 14,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                        }}
                    >
                        <button className="button-primary" type="submit" disabled={saving}>
                            {saving
                                ? "Saqlanmoqda..."
                                : editingId
                                    ? "O'zgartirishni saqlash"
                                    : "Xarajatni saqlash"}
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
            </div>

            {/* Pastdagi jadval – tanlangan type bo'yicha */}
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
                        {typeLabel} xarajatlari
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                        Jami: <strong>{expenses.length}</strong> ta yozuv
                    </div>
                </div>

                {loadingExpenses ? (
                    <p>Yuklanmoqda...</p>
                ) : expenses.length === 0 ? (
                    <p>Hozircha bu bo‘lim bo‘yicha xarajatlar yo‘q.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>SANA</th>
                                    <th>UMUMIY SUMMA</th>
                                    {type === TYPE_DECOR && <th>MAHSULOTLAR</th>}
                                    <th>IZOH</th>
                                    <th style={{ width: 120 }}>AMALLAR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((exp) => {
                                    // decor bo'lsa mahsulotlar stringini tayyorlaymiz
                                    let productsSummary = "-";
                                    if (
                                        type === TYPE_DECOR &&
                                        Array.isArray(exp.items) &&
                                        exp.items.length > 0
                                    ) {
                                        productsSummary = exp.items
                                            .map((it) => {
                                                const name = it.name || "Noma'lum";
                                                const qty =
                                                    typeof it.quantity === "number" && it.quantity > 0
                                                        ? ` (${it.quantity})`
                                                        : "";
                                                return name + qty;
                                            })
                                            .join(", ");
                                    }

                                    return (
                                        <tr key={exp.id}>
                                            <td>{exp.expense_date}</td>
                                            <td>
                                                {typeof exp.total_amount === "number"
                                                    ? exp.total_amount.toLocaleString("uz-UZ")
                                                    : "-"}
                                            </td>
                                            {type === TYPE_DECOR && <td>{productsSummary}</td>}
                                            <td>{exp.description || "-"}</td>
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
                                                        onClick={() => handleEdit(exp)}
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
                                                        onClick={() => handleDelete(exp)}
                                                    >
                                                        Delete
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
        </div>
    );
}

export default ExpensesPage;
