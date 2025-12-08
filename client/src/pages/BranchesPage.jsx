import React, { useEffect, useState } from "react";
import api from "../services/api";

function BranchesPage() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [editingBranch, setEditingBranch] = useState(null); // null => yangi, object => edit
    const [name, setName] = useState("");
    const [useCentralStock, setUseCentralStock] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const resetForm = () => {
        setEditingBranch(null);
        setName("");
        setUseCentralStock(false);
        setIsActive(true);
    };

    const loadBranches = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/branches");
            setBranches(res.data || []);
        } catch (err) {
            console.error(err);
            setError("Filiallar ro‘yxatini yuklashda xatolik.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBranches();
    }, []);

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setName(branch.name || "");
        setUseCentralStock(!!branch.use_central_stock);
        setIsActive(branch.is_active !== 0);
        setSuccess("");
        setError("");
    };

    const handleDelete = async (branch) => {
        if (!window.confirm(`“${branch.name}” filialini o‘chirishni istaysizmi?`)) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await api.delete(`/branches/${branch.id}`);
            setSuccess("Filial o‘chirildi (faol emas holatiga o‘tkazildi).");
            await loadBranches();
            if (editingBranch && editingBranch.id === branch.id) {
                resetForm();
            }
        } catch (err) {
            console.error(err);
            setError("Filialni o‘chirishda xatolik.");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Filial nomini kiriting.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                name: name.trim(),
                is_active: isActive ? 1 : 0,
                use_central_stock: useCentralStock ? 1 : 0,
            };

            if (editingBranch) {
                await api.put(`/branches/${editingBranch.id}`, payload);
                setSuccess("Filial ma’lumotlari yangilandi.");
            } else {
                await api.post("/branches", payload);
                setSuccess("Yangi filial qo‘shildi.");
            }

            resetForm();
            await loadBranches();
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                "Filialni saqlashda xatolik.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const title = "Filiallar";

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">
                        Filiallar ro‘yxati va ularning ombor turi (alohida yoki markaziy bilan birga).
                    </p>
                </div>
            </div>

            {error && (
                <div className="info-box info-box--error" style={{ marginBottom: 8 }}>
                    {error}
                </div>
            )}

            {success && (
                <div className="info-box info-box--success" style={{ marginBottom: 8 }}>
                    {success}
                </div>
            )}

            {/* Form card */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                    <h2 className="card-title">
                        {editingBranch ? "Filialni tahrirlash" : "Yangi filial qo‘shish"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Filial nomi</label>
                            <input
                                className="input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Masalan: Chilonzor, Sergeli..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ombor turi</label>
                            <select
                                className="input"
                                value={useCentralStock ? "central" : "separate"}
                                onChange={(e) =>
                                    setUseCentralStock(e.target.value === "central")
                                }
                            >
                                <option value="separate">Alohida ombor</option>
                                <option value="central">Markaziy ombor bilan birga</option>
                            </select>
                            <small className="form-hint">
                                Agar filial markaziy ishlab chiqarish yonida bo‘lsa va alohida ombor yuritilmasa,
                                &quot;Markaziy ombor bilan birga&quot; ni tanlang.
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Holati</label>
                            <select
                                className="input"
                                value={isActive ? "1" : "0"}
                                onChange={(e) => setIsActive(e.target.value === "1")}
                            >
                                <option value="1">Faol</option>
                                <option value="0">Nofaol</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: 12 }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saqlanmoqda..."
                                : editingBranch
                                    ? "O‘zgartirish"
                                    : "Qo‘shish"}
                        </button>

                        {editingBranch && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ marginLeft: 8 }}
                                onClick={resetForm}
                                disabled={saving}
                            >
                                Bekor qilish
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Table card */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Filiallar ro‘yxati</h2>
                </div>

                {loading ? (
                    <p>Yuklanmoqda...</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Filial nomi</th>
                                    <th>Ombor turi</th>
                                    <th>Holati</th>
                                    <th style={{ width: 160 }}>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branches.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center" }}>
                                            Birorta filial topilmadi.
                                        </td>
                                    </tr>
                                ) : (
                                    branches.map((branch, index) => (
                                        <tr key={branch.id}>
                                            <td>{index + 1}</td>
                                            <td>{branch.name}</td>
                                            <td>
                                                {branch.use_central_stock ? (
                                                    <span className="badge badge-info">
                                                        Markaziy bilan birga
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-secondary">
                                                        Alohida ombor
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {branch.is_active ? (
                                                    <span className="badge badge-success">Faol</span>
                                                ) : (
                                                    <span className="badge badge-danger">Nofaol</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-small"
                                                    onClick={() => handleEdit(branch)}
                                                    style={{ marginRight: 8 }}
                                                >
                                                    Tahrirlash
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-small btn-danger"
                                                    onClick={() => handleDelete(branch)}
                                                    disabled={saving}
                                                >
                                                    O‘chirish
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BranchesPage;
    