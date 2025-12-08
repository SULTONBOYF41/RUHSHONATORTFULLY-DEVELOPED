import { useEffect, useState } from "react";
import api from "../services/api";

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [form, setForm] = useState({
        full_name: "",
        username: "",
        password: "",
        role: "admin",
        branch_id: "",
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/users");
            setUsers(res.data || []);
        } catch (err) {
            console.error(err);
            setError("Userlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const res = await api.get("/branches");
            setBranches(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchBranches();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm({
            full_name: "",
            username: "",
            password: "",
            role: "admin",
            branch_id: "",
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const payload = {
            full_name: form.full_name.trim(),
            username: form.username.trim(),
            role: form.role,
            branch_id:
                form.role === "branch" && form.branch_id
                    ? Number(form.branch_id)
                    : null,
        };

        if (!payload.full_name || !payload.username) {
            setError("Ism va username majburiy");
            return;
        }

        // parol: yangi userda majburiy, editda ixtiyoriy
        if (!editingId) {
            if (!form.password) {
                setError("Parol majburiy");
                return;
            }
            payload.password = form.password;
        } else if (form.password) {
            payload.password = form.password; // faqat kiritilsa parol yangilanadi
        }

        try {
            setSaving(true);

            if (editingId) {
                const res = await api.put(`/users/${editingId}`, payload);
                const updated = res.data;
                setUsers((prev) =>
                    prev.map((u) => (u.id === editingId ? updated : u))
                );
            } else {
                const res = await api.post("/users", payload);
                setUsers((prev) => [res.data, ...prev]);
            }

            resetForm();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Userni saqlashda xatolik";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setForm({
            full_name: user.full_name || "",
            username: user.username || "",
            password: "",
            role: user.role || "admin",
            branch_id: user.branch_id ? String(user.branch_id) : "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `"${user.full_name}" foydalanuvchini haqiqatan ham o'chirmoqchimisiz?`
        );
        if (!confirmed) return;

        try {
            await api.delete(`/users/${user.id}`);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message || "Userni o'chirishda xatolik";
            setError(msg);
        }
    };

    const getBranchLabel = (user) => {
        // backend join bilan branch_name yuborgan bo'lishi mumkin
        if (user.branch_name) {
            if (user.branch_code) {
                return `${user.branch_name} (${user.branch_code})`;
            }
            return user.branch_name;
        }
        if (!user.branch_id) return "-";
        const b = branches.find((br) => br.id === user.branch_id);
        if (!b) return user.branch_id;
        return b.code ? `${b.name} (${b.code})` : b.name;
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Foydalanuvchilar</h1>
                    <p className="page-subtitle">
                        Tizimdagi foydalanuvchilar va ularning rollari.
                    </p>
                </div>
            </div>

            <div className="card">
                <div className="card-title">Foydalanuvchilar (Users)</div>

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

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div>
                            <label>To‘liq ism</label>
                            <input
                                className="input"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Username</label>
                            <input
                                className="input"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div>
                            <label>
                                Parol {editingId ? " (yangi parol, ixtiyoriy)" : ""}
                            </label>
                            <input
                                className="input"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={editingId ? "O'zgartirmaslik uchun bo'sh qoldiring" : ""}
                                required={!editingId}
                            />
                        </div>
                        <div>
                            <label>Role</label>
                            <select
                                className="input"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            >
                                <option value="admin">admin</option>
                                <option value="branch">branch</option>
                                <option value="production">production</option>
                                <option value="director">director</option>
                            </select>
                        </div>
                    </div>

                    {form.role === "branch" && (
                        <div className="form-row">
                            <div>
                                <label>Filial</label>
                                <select
                                    className="input"
                                    name="branch_id"
                                    value={form.branch_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Tanlang...</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} {b.code ? `(${b.code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        <button
                            type="submit"
                            className="button-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saqlanmoqda..."
                                : editingId
                                    ? "O'zgartirishni saqlash"
                                    : "User qo‘shish"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="button-primary"
                                style={{
                                    background: "transparent",
                                    border: "1px solid rgba(148,163,184,0.7)",
                                    boxShadow: "none",
                                    color: "#e5e7eb",
                                }}
                                onClick={handleCancelEdit}
                            >
                                Bekor qilish
                            </button>
                        )}
                    </div>
                </form>

                <hr style={{ margin: "20px 0" }} />

                {loading ? (
                    <p>Yuklanmoqda...</p>
                ) : users.length === 0 ? (
                    <p>Hali userlar yo‘q.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Ism</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Branch</th>
                                    <th style={{ width: 120 }}>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.full_name}</td>
                                        <td>{u.username}</td>
                                        <td>{u.role}</td>
                                        <td>{getBranchLabel(u)}</td>
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
                                                    onClick={() => handleEdit(u)}
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
                                                    onClick={() => handleDelete(u)}
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

export default UsersPage;
