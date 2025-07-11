import * as fs from "fs";
import { faseI, faseII } from "./simplex";
import { parseProblem, lerTxt } from "./leitura";

function main() {
    try {
        // vai ler o arquivo txt q foi mandando no leitura
        const fileContent = lerTxt();
        let {
            optimizationType,
            objectiveCoefficients,
            constraintMatrix,
            constraintRhs,
            constraintTypes
        } = parseProblem(fileContent);

        // Garante que todos os valores no vetor b sejam não negativo
        for (let i = 0; i < constraintRhs.length; i++) {
            if (constraintRhs[i] < 0) {
                // Se um valor do lado direito é negativo, multiplica a restrição inteira por -1.
                constraintRhs[i] *= -1;
                constraintMatrix[i] = constraintMatrix[i].map(c => -c);
                // Inverte o sinal da desigualdade.
                if (constraintTypes[i] === '<=') constraintTypes[i] = '>=';
                else if (constraintTypes[i] === '>=') constraintTypes[i] = '<=';
            }
        }
        
        // prepara o Simplex para forma padrão
        let needsPhase1 = false; // aqui checa se a Fase I é necessária.
        const numDecisionVars = objectiveCoefficients.length;
        const numConstraints = constraintMatrix.length;
        
        // Calcula quantas variáveis de folga/excesso serão necessárias.
        let numExtraVars = 0;
        constraintTypes.forEach(type => {
            if (type === '<=' || type === '>=') numExtraVars++;
        });

        // Cria a matriz inicial com espaço para as variáveis de decisão e de folga/excesso.
        const tableauMatrix = Array.from({ length: numConstraints }, () => Array(numDecisionVars + numExtraVars).fill(0));
        
        // Se for um problema de maximização, inverte-se o sinal da função objetivo para tratá-lo como minimização.
        let finalObjectiveCoeffs = [...objectiveCoefficients];
        if (optimizationType === 'max') {
            finalObjectiveCoeffs = finalObjectiveCoeffs.map(c => -c);
        }
        // Adiciona os custos das variáveis de folga/excesso à função objetivo.
        finalObjectiveCoeffs.push(...Array(numExtraVars).fill(0));
        
        let extraVarIndex = 0;
        // Itera sobre as restrições para adicionar as variáveis de folga e excesso.
        for (let i = 0; i < numConstraints; i++) {
            tableauMatrix[i].splice(0, numDecisionVars, ...constraintMatrix[i]);
            
            if (constraintTypes[i] === '<=') {
                // Adiciona variável de folga (+1).
                tableauMatrix[i][numDecisionVars + extraVarIndex] = 1;
                extraVarIndex++;
            } else if (constraintTypes[i] === '>=') { //caso B aqui
                // Adiciona variável de excesso (-1).
                tableauMatrix[i][numDecisionVars + extraVarIndex] = -1;
                needsPhase1 = true; // Restrições '>=' exigem Fase I.
                extraVarIndex++;
            } else { // '='
                // Restrições de igualdade também exigem Fase I.
                needsPhase1 = true;
            }
        }
        
        let resultado: [number, number[], number] | null = null;

        // execução do Simplex
        if (needsPhase1) {
            // Se houver restrições '>=' ou '=', chama a Fase I para encontrar uma solução básica viável inicial.
            resultado = faseI(tableauMatrix, constraintRhs, finalObjectiveCoeffs, optimizationType, constraintTypes);
        } else {
            // Se todas as restrições são '<=', a origem é uma solução viável, ou seja caso A
            // A base inicial é formada pelas variáveis de folga.
            const colunasParaBasica = Array.from({length: numConstraints}, (_, i) => numDecisionVars + i);
            const colunasParaNaoBasica = Array.from({length: numDecisionVars}, (_, i) => i);
            
            const matrizBasica = tableauMatrix.map(linha => colunasParaBasica.map(i => linha[i]));
            const matrizNaoBasica = tableauMatrix.map(linha => colunasParaNaoBasica.map(i => linha[i]));
            
            // Pula a Fase I e vai direto para a Fase II.
            resultado = faseII(
                tableauMatrix,
                matrizBasica,
                colunasParaBasica,
                matrizNaoBasica,
                colunasParaNaoBasica,
                constraintRhs,
                finalObjectiveCoeffs,
                optimizationType
            );
        }

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
            
            const variaveisBasicas: string[] = [];
            
            // Formata a exibição do vetor solução, mostrando apenas as variáveis com valor não-nulo.
            for (let i = 0; i < numDecisionVars; i++) {
                const valor = vetorSolucao[i] || 0;
                if (Math.abs(valor) > 1e-6) { // Usa uma tolerância para evitar ruído numérico.
                    variaveisBasicas.push(`X${i + 1}=${valor.toFixed(4)}`);
                }
            }
        } else {
            console.log("É inviavel ou ilimitado");
        }
        return resultado;
    } catch (error) {
        console.error("Erro:", error instanceof Error ? error.message : String(error));
        return null;
    }
}

main();