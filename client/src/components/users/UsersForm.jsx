// client/src/components/users/UsersForm.jsx
import React from "react";

function UsersForm({
    form,
    branches,
    editingId,
    saving,
    onChange,
    onSubmit,
    onCancelEdit,
}) {
    return (
        <form onSubmit={onSubmit}>
            <div className="form-row">
                <div>
                    <label>To‘liq ism</label>
                    <input
                        className="input"
                        name="full_name"
                        value={form.full_name}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label>Username</label>
                    <input
                        className="input"
                        name="username"
                        value={form.username}
                        onChange={onChange}
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
                        onChange={onChange}
                        placeholder={
                            editingId ? "O'zgartirmaslik uchun bo'sh qoldiring" : ""
                        }
                        required={!editingId}
                    />
                </div>
                <div>
                    <label>Role</label>
                    <select
                        className="input"
                        name="role"
                        value={form.role}
                        onChange={onChange}
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
                            onChange={onChange}
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
                            borderRadius: 999,
                        }}
                        onClick={onCancelEdit}
                    >
                        Bekor qilish
                    </button>
                )}
            </div>
        </form>
    );
}

export default UsersForm;
