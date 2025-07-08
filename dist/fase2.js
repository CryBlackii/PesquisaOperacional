"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executarFase2 = executarFase2;
const MAX_TENTATIVAS_BASE = 50;
const TOLERANCIA = 1e-8;
function executarFase2(vetorC, matrizA, vetorB, baseInicial, tiposRestricao) {
    const m = matrizA.length;
    const n = matrizA[0].length;
    let iteracao = 1;
    let base = [...baseInicial];
    console.log("\n=== INÍCIO FASE II ===");
    while (iteracao <= MAX_TENTATIVAS_BASE) {
        console.log(`\n--- Iteração ${iteracao} ---`);
        console.log(`Base atual: ${base}`);
        // Passo 1: Calcular solução básica
        const B = matrizA.map(linha => base.map(j => linha[j]));
        let BInv;
        try {
            BInv = calcularInversa(B);
        }
        catch (_a) {
            console.log("Matriz básica singular. Tentando outra base...");
            let encontrouBase = false;
            for (let tentativa = 1; tentativa < MAX_TENTATIVAS_BASE; tentativa++) {
                const baseCandidata = Array.from({ length: n }, (_, j) => j)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, m);
                if (baseValida(matrizA, baseCandidata, m)) {
                    base = baseCandidata;
                    console.log(`Nova base encontrada: ${base}`);
                    BInv = calcularInversa(matrizA.map(linha => base.map(j => linha[j])));
                    encontrouBase = true;
                    break;
                }
            }
            if (!encontrouBase) {
                console.log("Não foi possível encontrar base viável após várias tentativas");
                return { solucao: null, valorObjetivo: null, status: "erro" };
            }
            continue;
        }
        const xB = BInv.map((linha, i) => linha.reduce((sum, val, k) => sum + val * vetorB[k], 0));
        const solucao = new Array(n).fill(0);
        base.forEach((j, i) => solucao[j] = xB[i]);
        console.log(`Solução básica: ${solucao.map(x => x.toFixed(4))}`);
        const valorObjetivo = solucao.reduce((sum, x, j) => sum + vetorC[j] * x, 0);
        console.log(`Valor objetivo atual: ${valorObjetivo.toFixed(4)}`);
        // Passo 2: Calcular custos relativos
        const cB = base.map(j => vetorC[j]);
        const lambda = BInv[0].map((_, i) => cB.reduce((sum, val, k) => sum + val * BInv[k][i], 0));
        const naoBase = Array.from({ length: n }, (_, j) => j).filter(j => !base.includes(j));
        const custosRelativos = new Map();
        naoBase.forEach(j => {
            custosRelativos.set(j, vetorC[j] -
                lambda.reduce((sum, val, i) => sum + val * matrizA[i][j], 0));
        });
        console.log(`Custos relativos: ${[...custosRelativos.entries()].map(([j, cr]) => [j, cr.toFixed(4)]).join(', ')}`);
        // Passo 3: Teste de otimalidade
        const [jEntra, menorCusto] = [...custosRelativos.entries()].reduce((min, entry) => entry[1] < min[1] ? entry : min);
        if (menorCusto >= -TOLERANCIA) {
            console.log("\nSolução ótima encontrada!");
            return {
                solucao,
                valorObjetivo,
                status: "ótimo"
            };
        }
        // Passo 4: Calcular direção simplex
        const y = BInv.map((linha, i) => linha.reduce((sum, val, k) => sum + val * matrizA[k][jEntra], 0));
        // Passo 5: Determinar variável que sai
        const razoes = new Map();
        for (let i = 0; i < m; i++) {
            if (y[i] > TOLERANCIA) {
                razoes.set(i, xB[i] / y[i]);
            }
        }
        if (razoes.size === 0) {
            console.log("Problema ilimitado");
            return { solucao: null, valorObjetivo: null, status: "ilimitado" };
        }
        const iSai = [...razoes.entries()].reduce((min, [i, razao]) => razao < min[1] ? [i, razao] : min)[0];
        const jSai = base[iSai];
        console.log(`Variável que entra: x${jEntra}, que sai: x${jSai}`);
        // Passo 6: Atualizar base
        base[iSai] = jEntra;
        iteracao++;
    }
    console.log("Número máximo de iterações na Fase II atingido");
    return { solucao: null, valorObjetivo: null, status: "erro" };
}
function baseValida(matrizA, base, m) {
    if (base.length !== m)
        return false;
    const B = matrizA.map(linha => base.map(j => linha[j]));
    try {
        const det = calcularDeterminante(B);
        return Math.abs(det) > TOLERANCIA;
    }
    catch (_a) {
        return false;
    }
}
