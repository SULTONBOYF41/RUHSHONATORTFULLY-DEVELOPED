import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Agar allaqachon login bo'lgan bo'lsa, default route ga yuboramiz
    useEffect(() => {
        if (user) {
            // "/" ga otamiz, App.jsx ichidagi "*" route
            // getDefaultPathForUser() ni ishlatib beradi
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);
            await login(form.username, form.password);
            // Endi products emas, umumiy "/" ga
            navigate("/", { replace: true });
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Login xatosi";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-logo">
                <div className="app-logo">R</div>
            </div>

            <div className="card auth-card">
                <div className="auth-header">
                    <div className="auth-title">Ruxshona Tort Admin</div>
                    <div className="auth-subtitle">Ichki tizimga kirish</div>
                </div>

                {error && <div className="info-box info-box--error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-field">
                            <label>Username</label>
                            <input
                                className="input auth-input"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="admin"
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label>Password</label>
                            <input
                                className="input auth-input"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-actions">
                        <button
                            className="button-primary auth-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Kirilmoqda..." : "Kirish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
