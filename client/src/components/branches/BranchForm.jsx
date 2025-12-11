// client/src/components/branches/BranchForm.jsx
import React from "react";

function BranchForm({
    editingBranch,
    name,
    branchType,
    useCentralStock,
    isActive,
    saving,
    onNameChange,
    onBranchTypeChange,
    onUseCentralStockChange,
    onIsActiveChange,
    onSubmit,
    onReset,
}) {
    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
                <h2 className="card-title">
                    {editingBranch
                        ? "Filial / do‘konni tahrirlash"
                        : "Yangi filial yoki do‘kon qo‘shish"}
                </h2>
            </div>

            <form onSubmit={onSubmit}>
                <div className="form-grid">
                    {/* Nomi */}
                    <div className="form-group">
                        <label className="form-label">Nomi</label>
                        <input
                            className="input"
                            type="text"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder="Masalan: 1-filial Chilonzor yoki Bek Market..."
                        />
                    </div>

                    {/* Turi: Filial / Do‘kon */}
                    <div className="form-group">
                        <label className="form-label">Joy turi</label>
                        <select
                            className="input"
                            value={branchType}
                            onChange={(e) => onBranchTypeChange(e.target.value)}
                        >
                            <option value="BRANCH">Filial</option>
                            <option value="OUTLET">Do‘kon / ulgurji</option>
                        </select>
                        <small className="form-hint">
                            Filial – o‘z ombori bo‘lgan nuqta. Do‘kon – faqat savdo nuqtasi
                            (ombor yuritilmaydi).
                        </small>
                    </div>

                    {/* Ombor turi – faqat FILIAL uchun */}
                    {branchType === "BRANCH" && (
                        <div className="form-group">
                            <label className="form-label">
                                Ombor turi (faqat filial)
                            </label>
                            <select
                                className="input"
                                value={useCentralStock ? "central" : "separate"}
                                onChange={(e) =>
                                    onUseCentralStockChange(e.target.value === "central")
                                }
                            >
                                <option value="separate">Alohida ombor</option>
                                <option value="central">Markaziy ombor bilan birga</option>
                            </select>
                            <small className="form-hint">
                                Agar filial markaziy ishlab chiqarish yonida bo‘lsa va alohida
                                ombor yuritilmasa, “Markaziy ombor bilan birga” ni tanlang.
                            </small>
                        </div>
                    )}

                    {/* Holati */}
                    <div className="form-group">
                        <label className="form-label">Holati</label>
                        <select
                            className="input"
                            value={isActive ? "1" : "0"}
                            onChange={(e) => onIsActiveChange(e.target.value === "1")}
                        >
                            <option value="1">Faol</option>
                            <option value="0">Nofaol</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions" style={{ marginTop: 12 }}>
                    <button
                        type="submit"
                        className="btn button-primary"
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
                            className="btn button-primary"
                            style={{
                                background: "transparent",
                                border: "1px solid rgba(148,163,184,0.7)",
                                color: "#e5e7eb",
                                boxShadow: "none",
                                marginLeft: 10,
                            }}
                            onClick={onReset}
                            disabled={saving}
                        >
                            Bekor qilish
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default BranchForm;
