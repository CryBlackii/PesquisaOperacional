"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faseI = faseI;
exports.faseII = faseII;
const inversa_1 = require("./inversa");
const mult_1 = require("./mult");
/**
 * Implementa a Fase I do método Simplex de Duas Fases.
 * O objetivo é encontrar uma Solução Básica Viável inicial para o problema original.
 * @param matrizOriginal A matriz de restrições já com vars de folga/excesso.
 * @param valoresDesigualdade O vetor 'b' (RHS).
 * @param vetorExpressaoPrincipal O vetor de custos 'c' original.
 * @param tipoOtimizacao 'max' ou 'min'.
 * @param constraintTypes Os tipos de restrição originais.
 * @returns O resultado da Fase II se uma solução viável for encontrada, ou null se o problema for inviável.
 */
function faseI(matrizOriginal, valoresDesigualdade, vetorExpressaoPrincipal, tipoOtimizacao, constraintTypes) {
    const m = matrizOriginal.length; // número de restrições
    const n = matrizOriginal[0].length; // número de vars (decisão + folga/excesso)
    const numDecisionVars = n - (constraintTypes.filter(t => t !== '=').length);
    // --- 1. Adicionar Variáveis Artificiais ---
    let artificialVarCount = 0;
    // Conta quantas variáveis artificiais são necessárias (uma para cada '>=' ou '=').
    constraintTypes.forEach(type => {
        if (type === '>=' || type === '=') {
            artificialVarCount++;
        }
    });
    // Cria uma nova matriz com colunas para as variáveis artificiais.
    const matrizComArtificiais = matrizOriginal.map(linha => [...linha, ...Array(artificialVarCount).fill(0)]);
    let currentArtificialIndex = 0;
    const colunasParaBasica = []; // Índices das variáveis na base inicial.
    // --- 2. Montar a Base Inicial para a Fase I ---
    let slackSurplusIndex = 0;
    for (let i = 0; i < m; i++) {
        if (constraintTypes[i] === '<=') {
            // Se a restrição é '<=', a variável de folga entra na base.
            colunasParaBasica.push(numDecisionVars + slackSurplusIndex);
            slackSurplusIndex++;
        }
        else if (constraintTypes[i] === '>=') {
            // Se é '>=', adiciona +1 na coluna da variável artificial e ela entra na base.
            matrizComArtificiais[i][n + currentArtificialIndex] = 1;
            colunasParaBasica.push(n + currentArtificialIndex);
            currentArtificialIndex++;
            slackSurplusIndex++;
        }
        else { // '='
            // Se é '=', adiciona +1 na coluna da variável artificial e ela entra na base.
            matrizComArtificiais[i][n + currentArtificialIndex] = 1;
            colunasParaBasica.push(n + currentArtificialIndex);
            currentArtificialIndex++;
        }
    }
    // --- 3. Criar a Função Objetivo Artificial ---
    // O objetivo da Fase I é minimizar a soma das variáveis artificiais (w = a1 + a2 + ...).
    const expressaoArtificial = Array(n + artificialVarCount).fill(0);
    // O custo é 1 para as variáveis artificiais e 0 para as outras.
    colunasParaBasica.forEach((basicVarIndex, i) => {
        const type = constraintTypes[i];
        if (type === '>=' || type === '=') {
            if (basicVarIndex >= n)
                expressaoArtificial[basicVarIndex] = 1;
        }
    });
    // Identifica as colunas das variáveis não-básicas.
    const colunasParaNaoBasica = [];
    const allVarsIndices = Array.from({ length: n + artificialVarCount }, (_, i) => i);
    allVarsIndices.forEach(i => {
        if (!colunasParaBasica.includes(i)) {
            colunasParaNaoBasica.push(i);
        }
    });
    const custoArtificial = [...expressaoArtificial];
    // Ajusta a função objetivo artificial para a forma canônica (custos relativos das vars básicas devem ser 0).
    for (let i = 0; i < m; i++) {
        const basicVarIndex = colunasParaBasica[i];
        if (custoArtificial[basicVarIndex] === 1) { // Se uma var artificial está na base...
            // Subtrai a linha da restrição correspondente da linha de custo.
            for (let j = 0; j < custoArtificial.length; j++) {
                custoArtificial[j] -= matrizComArtificiais[i][j];
            }
        }
    }
    const matrizBasicaFase1 = matrizComArtificiais.map(linha => colunasParaBasica.map(i => linha[i]));
    const matrizNaoBasicaFase1 = matrizComArtificiais.map(linha => colunasParaNaoBasica.map(i => linha[i]));
    // --- 4. Resolver o Problema da Fase I ---
    // Chama a Fase II para resolver o problema artificial (minimizar w).
    const resultadoFase1 = faseII(matrizComArtificiais, matrizBasicaFase1, colunasParaBasica, matrizNaoBasicaFase1, colunasParaNaoBasica, valoresDesigualdade, custoArtificial, "min");
    // --- 5. Verificar o Resultado da Fase I ---
    // Se o resultado é nulo ou o custo ótimo (soma das vars artificiais) for > 0, o problema original é inviável.
    if (resultadoFase1 === null || resultadoFase1[0] > 1e-6) {
        console.log("Problema inviável (Fase I terminou com custo > 0).");
        return null;
    }
    // Verifica se alguma variável artificial permaneceu na base com valor não nulo (caso degenerado, pode indicar inviabilidade).
    const artificialNaBase = colunasParaBasica.some(varIndex => varIndex >= n);
    if (artificialNaBase) {
        console.log("Problema inviável (variáveis artificiais na base no final da Fase I).");
        return null; // Simplificação: trata casos degenerados como inviáveis.
    }
    // --- 6. Preparar e Chamar a Fase II ---
    // Se a Fase I foi bem-sucedida, a base encontrada é viável para o problema original.
    // Remove as colunas das variáveis artificiais e usa a base encontrada para iniciar a Fase II.
    const novaColunasParaBasica = [...colunasParaBasica];
    const novaColunasParaNaoBasica = [];
    const originalAndSlackIndices = Array.from({ length: n }, (_, i) => i);
    originalAndSlackIndices.forEach(i => {
        if (!novaColunasParaBasica.includes(i)) {
            novaColunasParaNaoBasica.push(i);
        }
    });
    const matrizSemArtificiais = matrizOriginal;
    const novaMatrizBasica = matrizSemArtificiais.map(linha => novaColunasParaBasica.map(i => linha[i]));
    const novaMatrizNaoBasica = matrizSemArtificiais.map(linha => novaColunasParaNaoBasica.map(i => linha[i]));
    // Chama a Fase II com a função objetivo original e a base viável encontrada.
    return faseII(matrizSemArtificiais, novaMatrizBasica, novaColunasParaBasica, novaMatrizNaoBasica, novaColunasParaNaoBasica, valoresDesigualdade, vetorExpressaoPrincipal, tipoOtimizacao);
}
/**
 * Implementa a Fase II do método Simplex Revisado.
 * A partir de uma Solução Básica Viável, itera até encontrar a solução ótima.
 * @returns Uma tupla com [valor ótimo, vetor solução, número de iterações] ou null se o problema for ilimitado.
 */
function faseII(matrizCompleta, matrizBasica, // Matriz B
colunasParaBasica, matrizNaoBasica, // Matriz N
colunasParaNaoBasica, valoresDesigualdade, // Vetor b
vetorExpressaoPrincipal, // Vetor c
tipoOtimizacao, iteracao = 1) {
    // Critério de parada para evitar loops infinitos.
    if (iteracao >= 100) {
        console.log("Número máximo de iterações atingido");
        return null;
    }
    // --- Passo 1: Calcular a inversa da matriz básica (B⁻¹) ---
    const inversaBasica = (0, inversa_1.criarMatrizInversa)(matrizBasica, (0, inversa_1.criarMatrizIdentidade)(matrizBasica));
    if (!inversaBasica) {
        console.log("Matriz básica não é invertível");
        return null;
    }
    // --- Passo 2: Calcular a solução básica atual (xB = B⁻¹ * b) ---
    const vetorB = valoresDesigualdade.map(i => [i]);
    const xBasico = (0, mult_1.multiplicaMatriz)(inversaBasica, vetorB);
    // --- Passo 3: Calcular os custos relativos (critério de entrada) ---
    const custoBasico = [colunasParaBasica.map(i => vetorExpressaoPrincipal[i] || 0)]; // Vetor cB
    const yt = (0, mult_1.multiplicaMatriz)(custoBasico, inversaBasica); // Vetor de multiplicadores simplex (yT = cB * B⁻¹)
    const custoNaoBasico = [colunasParaNaoBasica.map(i => vetorExpressaoPrincipal[i] || 0)]; // Vetor cN
    const aNj = matrizNaoBasica; // Matriz das variáveis não-básicas
    // Custo relativo (reduzido): cN' = cN - yT * N
    const multiplicacao = (0, mult_1.multiplicaMatriz)(yt, aNj);
    const custoRelativo = custoNaoBasico[0].map((val, i) => val - multiplicacao[0][i]);
    const menorCusto = Math.min(...custoRelativo);
    // --- Passo 4: Checar a otimalidade ---
    // Se todos os custos relativos são não-negativos, a solução atual é ótima.
    if (menorCusto >= -1e-9) { // Usa uma tolerância para comparação com zero.
        let valorOtimo = 0;
        const CbB = (0, mult_1.multiplicaMatriz)(custoBasico, xBasico); // Z = cB * xB
        valorOtimo = CbB[0][0];
        // Monta o vetor solução final com todas as variáveis.
        const vetorSolucao = Array(vetorExpressaoPrincipal.length).fill(0);
        for (let i = 0; i < xBasico.length; i++) {
            vetorSolucao[colunasParaBasica[i]] = xBasico[i][0];
        }
        return [valorOtimo, vetorSolucao, iteracao];
    }
    // --- Passo 5: Determinar a variável que entra na base ---
    // A variável que entra é a que tem o custo relativo mais negativo.
    const indiceVariavelEntrada = custoRelativo.indexOf(menorCusto);
    // --- Passo 6: Determinar a variável que sai da base (critério da razão) ---
    // Calcular a direção simplex: d = B⁻¹ * a_k (onde a_k é a coluna da var que entra)
    const direcao = (0, mult_1.multiplicaMatriz)(inversaBasica, matrizCompleta.map(linha => [linha[colunasParaNaoBasica[indiceVariavelEntrada]]]));
    let passo = Infinity;
    let indiceSaida = -1;
    // Teste da razão: min { xB_i / d_i } para d_i > 0
    for (let i = 0; i < direcao.length; i++) {
        if (direcao[i][0] > 1e-9) { // Apenas para componentes positivos da direção.
            const razao = xBasico[i][0] / direcao[i][0];
            if (razao < passo) {
                passo = razao;
                indiceSaida = i;
            }
        }
    }
    // --- Passo 7: Checar se o problema é ilimitado ---
    // Se todos os d_i <= 0, o problema não tem solução ótima finita (é ilimitado).
    if (indiceSaida === -1) {
        console.log("Problema ilimitado (nenhuma variável de saída encontrada).");
        return null;
    }
    // --- Passo 8: Atualizar a base ---
    // A variável que entra (entrada) troca de lugar com a variável que sai (saida).
    const entrada = colunasParaNaoBasica[indiceVariavelEntrada];
    const saida = colunasParaBasica[indiceSaida];
    colunasParaBasica[indiceSaida] = entrada;
    colunasParaNaoBasica[indiceVariavelEntrada] = saida;
    colunasParaNaoBasica.sort((a, b) => a - b); // Mantém a ordem para consistência.
    // --- Passo 9: Recursão ---
    // Chama a próxima iteração com a nova base.
    return faseII(matrizCompleta, matrizCompleta.map(linha => colunasParaBasica.map(i => linha[i])), colunasParaBasica, matrizCompleta.map(linha => colunasParaNaoBasica.map(i => linha[i])), colunasParaNaoBasica, valoresDesigualdade, vetorExpressaoPrincipal, tipoOtimizacao, iteracao + 1);
}
