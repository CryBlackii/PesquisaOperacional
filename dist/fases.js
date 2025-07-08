"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseValida = baseValida;
exports.adicionarVariaveisArtificiais = adicionarVariaveisArtificiais;
exports.executarFase1 = executarFase1;
exports.executarFase2 = executarFase2;
// fases.ts
const det_1 = __importDefault(require("./det"));
const mult_1 = __importDefault(require("./mult"));
const inversa_1 = __importDefault(require("./inversa"));
const TOLERANCIA = 1e-8;
const MAX_ITERACOES = 50;
function baseValida(matrizA, base, m) {
    if (base.length !== m)
        return false;
    const B = base.map(j => matrizA.map(row => row[j]));
    try {
        return Math.abs((0, det_1.default)(B)) > TOLERANCIA;
    }
    catch (_a) {
        return false;
    }
}
function adicionarVariaveisArtificiais(A, b, c, tipos) {
    const m = A.length;
    const n = A[0].length;
    const A_art = A.map(row => [...row]);
    const artificiais = [];
    for (let i = 0; i < m; i++) {
        const novaColuna = Array(m).fill(0);
        novaColuna[i] = tipos[i] === ">=" || tipos[i] === "=" ? 1 : 0;
        if (tipos[i] === ">=" || tipos[i] === "=") {
            for (let j = 0; j < m; j++)
                A_art[j].push(j === i ? 1 : 0);
            artificiais.push(n + artificiais.length);
        }
        else {
            for (let j = 0; j < m; j++)
                A_art[j].push(0);
        }
    }
    const c_art = new Array(A_art[0].length).fill(0);
    artificiais.forEach(j => (c_art[j] = 1));
    const baseInicial = artificiais.slice();
    return [A_art, b, c_art, baseInicial];
}
function executarFase1(cOriginal, A, b, tipos) {
    const m = A.length;
    const n = A[0].length;
    const { A_art, c_art, artificiais } = (() => {
        const [A_, b_, c_, base_] = adicionarVariaveisArtificiais(A, b, cOriginal, tipos);
        return {
            A_art: A_,
            c_art: c_,
            artificiais: base_,
        };
    })();
    let base = [...artificiais];
    if (!baseValida(A_art, base, m)) {
        return { solucao: null, base, valor: null, status: "infactível" };
    }
    let solucao = [];
    for (let iter = 0; iter < MAX_ITERACOES; iter++) {
        const B = base.map(j => A_art.map(row => row[j]));
        let B_inv;
        try {
            B_inv = (0, inversa_1.default)(B);
        }
        catch (_a) {
            return { solucao: null, base, valor: null, status: "erro inversa" };
        }
        const x_B = (0, mult_1.default)(B_inv, b.map(x => [x])).map(row => row[0]);
        solucao = Array(A_art[0].length).fill(0);
        base.forEach((j, i) => (solucao[j] = x_B[i]));
        const c_B = base.map(j => c_art[j]);
        const lambda = (0, mult_1.default)([c_B], B_inv)[0];
        const naoBase = [...Array(A_art[0].length).keys()].filter(j => !base.includes(j));
        const custosRelativos = naoBase.map(j => c_art[j] - lambda.reduce((acc, lmbd, i) => acc + lmbd * A_art[i][j], 0));
        const j_entra_idx = custosRelativos.findIndex(cj => cj < -TOLERANCIA);
        if (j_entra_idx === -1) {
            const valor = solucao.reduce((acc, xj, j) => acc + c_art[j] * xj, 0);
            if (Math.abs(valor) > TOLERANCIA) {
                return { solucao: null, base, valor, status: "infactível" };
            }
            return { solucao, base, valor, status: "ok" };
        }
        const j_entra = naoBase[j_entra_idx];
        const direcao = (0, mult_1.default)(B_inv, A_art.map(row => row[j_entra]).map(x => [x]));
        const razoes = [];
        for (let i = 0; i < m; i++) {
            if (direcao[i][0] > TOLERANCIA) {
                razoes.push({ i, valor: x_B[i] / direcao[i][0] });
            }
        }
        if (razoes.length === 0)
            return { solucao: null, base, valor: null, status: "ilimitado" };
        const { i: i_sai } = razoes.reduce((min, atual) => atual.valor < min.valor ? atual : min);
        base[i_sai] = j_entra;
    }
    const valorFinal = solucao.reduce((acc, xj, j) => acc + c_art[j] * xj, 0);
    return { solucao, base, valor: valorFinal, status: "ok" };
}
function executarFase2(vetorC, matrizA, vetorB, base, tipos) {
    const m = matrizA.length;
    const n = matrizA[0].length;
    if (!baseValida(matrizA, base, m)) {
        return { solucao: [], valor: 0, status: "base inválida" };
    }
    let solucao = [];
    for (let iter = 0; iter < MAX_ITERACOES; iter++) {
        const B = base.map(j => matrizA.map(row => row[j]));
        let B_inv;
        try {
            B_inv = (0, inversa_1.default)(B);
        }
        catch (_a) {
            return { solucao: [], valor: 0, status: "erro" };
        }
        const x_B = (0, mult_1.default)(B_inv, vetorB.map(x => [x])).map(row => row[0]);
        solucao = Array(n).fill(0);
        base.forEach((j, i) => (solucao[j] = x_B[i]));
        const c_B = base.map(j => vetorC[j]);
        const lambda = (0, mult_1.default)([c_B], B_inv)[0];
        const naoBase = [...Array(n).keys()].filter(j => !base.includes(j));
        const custosRelativos = naoBase.map(j => vetorC[j] - lambda.reduce((acc, lmbd, i) => acc + lmbd * matrizA[i][j], 0));
        const j_entra_idx = custosRelativos.findIndex(cj => cj < -TOLERANCIA);
        if (j_entra_idx === -1) {
            const valor = solucao.reduce((acc, xj, j) => acc + vetorC[j] * xj, 0);
            return { solucao, valor, status: "ok" };
        }
        const j_entra = naoBase[j_entra_idx];
        const direcao = (0, mult_1.default)(B_inv, matrizA.map(row => row[j_entra]).map(x => [x]));
        const razoes = [];
        for (let i = 0; i < m; i++) {
            if (direcao[i][0] > TOLERANCIA) {
                razoes.push({ i, valor: x_B[i] / direcao[i][0] });
            }
        }
        if (razoes.length === 0)
            return { solucao: [], valor: 0, status: "ilimitado" };
        const { i: i_sai } = razoes.reduce((min, atual) => atual.valor < min.valor ? atual : min);
        base[i_sai] = j_entra;
    }
    return { solucao, valor: 0, status: "max_iter" };
}
