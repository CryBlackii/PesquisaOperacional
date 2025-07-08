"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fase1 = fase1;
const det_1 = __importDefault(require("./det"));
const inversa_1 = __importDefault(require("./inversa"));
const MAX_TENTATIVAS_BASE = 50;
const TOLERANCIA = 1e-8;
function baseValida(A, base, m) {
    if (base.length !== m)
        return false;
    const B = A.map(row => base.map(j => row[j]));
    try {
        return Math.abs((0, det_1.default)(B)) > TOLERANCIA;
    }
    catch (_a) {
        return false;
    }
}
function fase1(c, A, b, tipos) {
    const m = A.length;
    const n = A[0].length;
    let base = [];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const col = A.map(row => row[j]);
            if (Math.abs(col[i] - 1) < TOLERANCIA &&
                col.every((v, k) => k === i || Math.abs(v) < TOLERANCIA)) {
                base.push(j);
                break;
            }
        }
    }
    if (base.length !== m)
        base = Array.from({ length: m }, (_, i) => n - m + i);
    if (!baseValida(A, base, m))
        return [[], [], "infactível"];
    for (let iter = 1; iter <= MAX_TENTATIVAS_BASE; iter++) {
        const B = A.map(row => base.map(j => row[j]));
        let B_inv;
        try {
            B_inv = (0, inversa_1.default)(B);
        }
        catch (_a) {
            for (let _ = 0; _ < MAX_TENTATIVAS_BASE; _++) {
                const cand = Array.from({ length: m }, () => Math.floor(Math.random() * n));
                if (baseValida(A, cand, m)) {
                    base = cand;
                    B_inv = (0, inversa_1.default)(A.map(row => cand.map(j => row[j])));
                    break;
                }
            }
            continue;
        }
        const x_B = B_inv.map(row => row.reduce((acc, v, i) => acc + v * b[i], 0));
        const x = Array(n).fill(0);
        base.forEach((j, i) => (x[j] = x_B[i]));
        const obj = c.reduce((sum, v, i) => sum + v * x[i], 0);
        const c_B = base.map(j => c[j]);
        const lambda = B_inv[0].map((_, i) => c_B.reduce((acc, cb, k) => acc + cb * B_inv[k][i], 0));
        const nao_base = Array.from({ length: n }, (_, j) => j).filter(j => !base.includes(j));
        const custos_rel = Object.fromEntries(nao_base.map(j => [
            j,
            c[j] - A.map((row, i) => lambda[i] * row[j]).reduce((a, b) => a + b, 0),
        ]));
        const [j_entra, min_val] = Object.entries(custos_rel).reduce(([minJ, minV], [jStr, val]) => (val < minV ? [parseInt(jStr), val] : [minJ, minV]), [0, Infinity]);
        if (min_val >= -TOLERANCIA) {
            if (Math.abs(obj) > TOLERANCIA)
                return [[], [], "infactível"];
            const artificiais_na_base = base.filter(j => j >= n - m);
            for (const j_art of artificiais_na_base) {
                const i = base.indexOf(j_art);
                for (let j = 0; j < n - m; j++) {
                    if (!base.includes(j) && Math.abs(A[i][j]) > TOLERANCIA) {
                        base[i] = j;
                        break;
                    }
                }
            }
            if (base.some(j => j >= n - m))
                return [[], [], "infactível"];
            return [x.slice(0, n - m), base, "factível"];
        }
        const y = B_inv.map(row => row.reduce((acc, v, i) => acc + v * A[i][j_entra], 0));
        const razoes = base.map((_, i) => (y[i] > TOLERANCIA ? x_B[i] / y[i] : Infinity));
        if (razoes.every(r => !isFinite(r)))
            return [[], [], "ilimitado"];
        const i_sai = razoes.indexOf(Math.min(...razoes));
        base[i_sai] = j_entra;
    }
    return [[], [], "infactível"];
}
