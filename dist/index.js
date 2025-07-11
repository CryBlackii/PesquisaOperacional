"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simplex_1 = require("./simplex");
const leitura_1 = require("./leitura");
/**
 * Função principal que orquestra a leitura, padronização e resolução do problema de Programação Linear.
 */
function main() {
    try {
        // Lê e interpreta o problema do arquivo "entrada.txt".
        const fileContent = (0, leitura_1.lerTxt)();
        let { optimizationType, objectiveCoefficients, constraintMatrix, constraintRhs, constraintTypes } = (0, leitura_1.parseProblem)(fileContent);
        // --- 1. Padronização do Problema: Lado Direito (RHS) Não-Negativo ---
        // Garante que todos os valores no vetor 'b' (RHS) sejam não-negativos.
        for (let i = 0; i < constraintRhs.length; i++) {
            if (constraintRhs[i] < 0) {
                // Se um valor do RHS é negativo, multiplica a restrição inteira por -1.
                constraintRhs[i] *= -1;
                constraintMatrix[i] = constraintMatrix[i].map(c => -c);
                // Inverte o sinal da desigualdade.
                if (constraintTypes[i] === '<=')
                    constraintTypes[i] = '>=';
                else if (constraintTypes[i] === '>=')
                    constraintTypes[i] = '<=';
            }
        }
        // --- 2. Preparação para o Simplex: Forma Padrão (FPI) ---
        let needsPhase1 = false; // Flag para determinar se a Fase I é necessária.
        const numDecisionVars = objectiveCoefficients.length;
        const numConstraints = constraintMatrix.length;
        // Calcula quantas variáveis de folga/excesso serão necessárias.
        let numExtraVars = 0;
        constraintTypes.forEach(type => {
            if (type === '<=' || type === '>=')
                numExtraVars++;
        });
        // Cria a matriz inicial (tableau) com espaço para as variáveis de decisão e de folga/excesso.
        const tableauMatrix = Array.from({ length: numConstraints }, () => Array(numDecisionVars + numExtraVars).fill(0));
        // Se for um problema de maximização, inverte-se o sinal da função objetivo para tratá-lo como minimização.
        let finalObjectiveCoeffs = [...objectiveCoefficients];
        if (optimizationType === 'max') {
            finalObjectiveCoeffs = finalObjectiveCoeffs.map(c => -c);
        }
        // Adiciona os custos das variáveis de folga/excesso (que é zero) à função objetivo.
        finalObjectiveCoeffs.push(...Array(numExtraVars).fill(0));
        let extraVarIndex = 0;
        // Itera sobre as restrições para adicionar as variáveis de folga e excesso.
        for (let i = 0; i < numConstraints; i++) {
            tableauMatrix[i].splice(0, numDecisionVars, ...constraintMatrix[i]);
            if (constraintTypes[i] === '<=') {
                // Adiciona variável de folga (+1).
                tableauMatrix[i][numDecisionVars + extraVarIndex] = 1;
                extraVarIndex++;
            }
            else if (constraintTypes[i] === '>=') {
                // Adiciona variável de excesso (-1).
                tableauMatrix[i][numDecisionVars + extraVarIndex] = -1;
                needsPhase1 = true; // Restrições '>=' exigem Fase I.
                extraVarIndex++;
            }
            else { // '='
                // Restrições de igualdade também exigem Fase I.
                needsPhase1 = true;
            }
        }
        let resultado = null;
        // --- 3. Execução do Simplex ---
        if (needsPhase1) {
            // Se houver restrições '>=' ou '=', chama a Fase I para encontrar uma solução básica viável inicial.
            resultado = (0, simplex_1.faseI)(tableauMatrix, constraintRhs, finalObjectiveCoeffs, optimizationType, constraintTypes);
        }
        else {
            // CASO A: Se todas as restrições são '<=', a origem é uma solução viável.
            // A base inicial é formada pelas variáveis de folga.
            const colunasParaBasica = Array.from({ length: numConstraints }, (_, i) => numDecisionVars + i);
            const colunasParaNaoBasica = Array.from({ length: numDecisionVars }, (_, i) => i);
            const matrizBasica = tableauMatrix.map(linha => colunasParaBasica.map(i => linha[i]));
            const matrizNaoBasica = tableauMatrix.map(linha => colunasParaNaoBasica.map(i => linha[i]));
            // Pula a Fase I e vai direto para a Fase II.
            resultado = (0, simplex_1.faseII)(tableauMatrix, matrizBasica, colunasParaBasica, matrizNaoBasica, colunasParaNaoBasica, constraintRhs, finalObjectiveCoeffs, optimizationType);
        }
        // --- 4. Apresentação dos Resultados ---
        if (resultado) {
            let [valorOtimo, vetorSolucao, iteracoes] = resultado;
            // Se o problema original era de maximização, o valor ótimo deve ser invertido de volta.
            if (optimizationType === "max") {
                valorOtimo *= -1;
            }
            // Convenção para ajustar o sinal em problemas de minimização que resultam em valor negativo.
            else if (optimizationType === "min" && valorOtimo < 0) {
                valorOtimo *= -1;
            }
            console.log(`Z = ${valorOtimo}`);
            const variaveisBasicas = [];
            // Formata a exibição do vetor solução, mostrando apenas as variáveis com valor não-nulo.
            for (let i = 0; i < numDecisionVars; i++) {
                const valor = vetorSolucao[i] || 0;
                if (Math.abs(valor) > 1e-6) { // Usa uma tolerância para evitar ruído numérico.
                    variaveisBasicas.push(`X${i + 1}=${valor.toFixed(4)}`);
                }
            }
        }
        else {
            // Mensagem caso o problema não tenha solução.
            console.log("Problema não possui solução ótima finita (pode ser inviável ou ilimitado).");
        }
        return resultado;
    }
    catch (error) {
        console.error("Erro:", error instanceof Error ? error.message : String(error));
        return null;
    }
}
// Ponto de entrada do programa.
main();
