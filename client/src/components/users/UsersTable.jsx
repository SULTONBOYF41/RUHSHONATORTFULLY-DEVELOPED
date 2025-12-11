// client/src/components/users/UsersTable.jsx
import React from "react";

function getBranchLabel(user, branches) {
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
}

function UsersTable({ users, branches, loading, onEdit, onDelete }) {
    if (loading) {
        return <p>Yuklanmoqda...</p>;
    }

    if (!users.length) {
        return <p>Hali userlar yo‘q.</p>;
    }

    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ism</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Branch</th>
                        <th style={{ width: 140 }}>Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.full_name}</td>
                            <td>{u.username}</td>
                            <td>
                                <span
                                    className="badge"
                                    style={{
                                        textTransform: "uppercase",
                                        fontSize: 11,
                                        padding: "2px 10px",
                                        borderRadius: 999,
                                        background:
                                            u.role === "admin"
                                                ? "rgba(96,165,250,0.18)"
                                                : "rgba(148,163,184,0.18)",
                                    }}
                                >
                                    {u.role}
                                </span>
                            </td>
                            <td>{getBranchLabel(u, branches)}</td>
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
                                            borderRadius: 999,
                                        }}
                                        onClick={() => onEdit(u)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="button-primary"
                                        style={{
                                            padding: "3px 8px",
                                            fontSize: 11,
                                            boxShadow: "none",
                                            background:
                                                "radial-gradient(circle at 0 0,#f97373,#dc2626)",
                                            borderRadius: 999,
                                        }}
                                        onClick={() => onDelete(u)}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UsersTable;
