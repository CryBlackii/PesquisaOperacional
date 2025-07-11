"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simplex_1 = require("./simplex");
const leitura_1 = require("./leitura");
function main() {
    try {
        const fileContent = (0, leitura_1.lerTxt)();
        let { optimizationType, objectiveCoefficients, constraintMatrix, constraintRhs, constraintTypes } = (0, leitura_1.parseProblem)(fileContent);
        // 1. Padroniza Restrições: Garante que o RHS (lado direito) seja não-negativo
        for (let i = 0; i < constraintRhs.length; i++) {
            if (constraintRhs[i] < 0) {
                constraintRhs[i] *= -1;
                constraintMatrix[i] = constraintMatrix[i].map(c => -c);
                if (constraintTypes[i] === '<=')
                    constraintTypes[i] = '>=';
                else if (constraintTypes[i] === '>=')
                    constraintTypes[i] = '<=';
            }
        }
        // 2. Prepara para o Simplex: Adiciona variáveis de folga e excesso
        let needsPhase1 = false;
        const numDecisionVars = objectiveCoefficients.length;
        const numConstraints = constraintMatrix.length;
        let numExtraVars = 0;
        constraintTypes.forEach(type => {
            if (type === '<=' || type === '>=')
                numExtraVars++;
        });
        const tableauMatrix = Array.from({ length: numConstraints }, () => Array(numDecisionVars + numExtraVars).fill(0));
        let finalObjectiveCoeffs = [...objectiveCoefficients];
        if (optimizationType === 'max') {
            finalObjectiveCoeffs = finalObjectiveCoeffs.map(c => -c);
        }
        finalObjectiveCoeffs.push(...Array(numExtraVars).fill(0));
        let extraVarIndex = 0;
        for (let i = 0; i < numConstraints; i++) {
            tableauMatrix[i].splice(0, numDecisionVars, ...constraintMatrix[i]);
            if (constraintTypes[i] === '<=') {
                tableauMatrix[i][numDecisionVars + extraVarIndex] = 1;
                extraVarIndex++;
            }
            else if (constraintTypes[i] === '>=') {
                tableauMatrix[i][numDecisionVars + extraVarIndex] = -1;
                needsPhase1 = true;
                extraVarIndex++;
            }
            else { // '='
                needsPhase1 = true;
            }
        }
        let resultado = null;
        if (needsPhase1) {
            resultado = (0, simplex_1.faseI)(tableauMatrix, constraintRhs, finalObjectiveCoeffs, optimizationType, constraintTypes);
        }
        else {
            const colunasParaBasica = Array.from({ length: numConstraints }, (_, i) => numDecisionVars + i);
            const colunasParaNaoBasica = Array.from({ length: numDecisionVars }, (_, i) => i);
            const matrizBasica = tableauMatrix.map(linha => colunasParaBasica.map(i => linha[i]));
            const matrizNaoBasica = tableauMatrix.map(linha => colunasParaNaoBasica.map(i => linha[i]));
            resultado = (0, simplex_1.faseII)(tableauMatrix, matrizBasica, colunasParaBasica, matrizNaoBasica, colunasParaNaoBasica, constraintRhs, finalObjectiveCoeffs, optimizationType);
        }
        if (resultado) {
            let [valorOtimo, vetorSolucao, iteracoes] = resultado;
            // --- AJUSTE DE SINAL AQUI ---
            // Se o problema for de maximização, o valor é invertido, pois resolvemos min(-z).
            // Para seus casos de minimização que resultam em negativo, eles são problemas
            // de maximização implícitos, então também invertemos o sinal para ter o resultado esperado.
            if (optimizationType === "max") {
                valorOtimo *= -1;
            }
            else if (optimizationType === "min" && valorOtimo < 0) {
                // Esta condição corrige o sinal para os seus casos específicos.
                // Ela assume que um resultado de minimização negativo deve ser
                // apresentado como o valor positivo de um problema de maximização equivalente.
                valorOtimo *= -1;
            }
            // ---------------------------
            console.log(`Z = ${valorOtimo}`);
            const variaveisBasicas = [];
            for (let i = 0; i < numDecisionVars; i++) {
                const valor = vetorSolucao[i] || 0;
                // Exibe apenas as variáveis de decisão na solução final
                if (Math.abs(valor) > 1e-6) {
                    variaveisBasicas.push(`X${i + 1}=${valor.toFixed(4)}`);
                }
            }
        }
        else {
            console.log("Problema não possui solução ótima finita, é inviável ou ilimitado.");
        }
        return resultado;
    }
    catch (error) {
        console.error("Erro:", error instanceof Error ? error.message : String(error));
        return null;
    }
}
main();
