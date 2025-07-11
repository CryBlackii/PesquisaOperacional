import { criarMatrizInversa, criarMatrizIdentidade } from "./inversa";
import { multiplicaMatriz } from "./mult";

export function faseI(
    matrizOriginal: number[][], 
    valoresDesigualdade: number[], 
    vetorExpressaoPrincipal: number[], 
    tipoOtimizacao: string,
    constraintTypes: string[]
): [number, number[], number] | null {
    const m = matrizOriginal.length;
    const n = matrizOriginal[0].length;
    const numDecisionVars = n - (constraintTypes.filter(t => t !== '=').length);

    let artificialVarCount = 0;
    constraintTypes.forEach(type => {
        if (type === '>=' || type === '=') {
            artificialVarCount++;
        }
    });

    const matrizComArtificiais = matrizOriginal.map(linha => [...linha, ...Array(artificialVarCount).fill(0)]);
    
    let currentArtificialIndex = 0;
    const colunasParaBasica: number[] = [];
    
    let slackSurplusIndex = 0;
    for (let i = 0; i < m; i++) {
        if (constraintTypes[i] === '<=') {
            colunasParaBasica.push(numDecisionVars + slackSurplusIndex);
            slackSurplusIndex++;
        } else if (constraintTypes[i] === '>=') {
            matrizComArtificiais[i][n + currentArtificialIndex] = 1;
            colunasParaBasica.push(n + currentArtificialIndex);
            currentArtificialIndex++;
            slackSurplusIndex++;
        } else { // '='
            matrizComArtificiais[i][n + currentArtificialIndex] = 1;
            colunasParaBasica.push(n + currentArtificialIndex);
            currentArtificialIndex++;
        }
    }
    
    const expressaoArtificial = Array(n).fill(0).concat(Array(artificialVarCount).fill(1));
    const colunasParaNaoBasica: number[] = [];
    const allVarsIndices = Array.from({length: n + artificialVarCount}, (_, i) => i);
    allVarsIndices.forEach(i => {
        if (!colunasParaBasica.includes(i)) {
            colunasParaNaoBasica.push(i);
        }
    });
    
    // Corrigir a função objetivo da Fase I para canonicidade
    for (let i = 0; i < m; i++) {
        if (matrizComArtificiais[i][colunasParaBasica[i]] === 1 && expressaoArtificial[colunasParaBasica[i]] === 1) {
            for (let j = 0; j < expressaoArtificial.length; j++) {
                expressaoArtificial[j] -= matrizComArtificiais[i][j];
            }
        }
    }

    const matrizBasicaFase1 = matrizComArtificiais.map(linha => colunasParaBasica.map(i => linha[i]));
    const matrizNaoBasicaFase1 = matrizComArtificiais.map(linha => colunasParaNaoBasica.map(i => linha[i]));
    
    const resultadoFase1 = faseII(
        matrizComArtificiais,
        matrizBasicaFase1,
        colunasParaBasica,
        matrizNaoBasicaFase1,
        colunasParaNaoBasica,
        valoresDesigualdade,
        expressaoArtificial,
        "min"
    );

    if (resultadoFase1 === null || resultadoFase1[0] > 1e-6) {
        console.log("Problema inviável (Fase I > 0).");
        return null;
    }
    
    const solucaoFase1 = resultadoFase1[1];
    let novaColunasParaBasica = [];
    for (let i = 0; i < colunasParaBasica.length; i++) {
        const colIndex = colunasParaBasica[i];
        if (colIndex < n) { // Manter variáveis originais e de folga/excesso
            novaColunasParaBasica.push(colIndex);
        }
    }

    // Se uma variável artificial ainda estiver na base com valor zero, ela deve ser trocada.
    const nonBasicOriginalAndSlack = colunasParaNaoBasica.filter(c => c < n);
    while (novaColunasParaBasica.length < m) {
        const candidato = nonBasicOriginalAndSlack.shift();
        if (candidato !== undefined) {
             novaColunasParaBasica.push(candidato);
        } else {
            console.log("Não foi possível remover todas as variáveis artificiais da base.");
            return null; // Degenerescência ou redundância
        }
    }

    const novaColunasParaNaoBasica: number[] = [];
    const originalAndSlackIndices = Array.from({length: n}, (_, i) => i);
    originalAndSlackIndices.forEach(i => {
        if (!novaColunasParaBasica.includes(i)) {
            novaColunasParaNaoBasica.push(i);
        }
    });
    
    const matrizSemArtificiais = matrizOriginal;
    const novaMatrizBasica = matrizSemArtificiais.map(linha => novaColunasParaBasica.map(i => linha[i]));
    const novaMatrizNaoBasica = matrizSemArtificiais.map(linha => novaColunasParaNaoBasica.map(i => linha[i]));

    return faseII(
        matrizSemArtificiais,
        novaMatrizBasica,
        novaColunasParaBasica,
        novaMatrizNaoBasica,
        novaColunasParaNaoBasica,
        valoresDesigualdade,
        vetorExpressaoPrincipal,
        tipoOtimizacao
    );
}

export function faseII(
    matrizCompleta: number[][],
    matrizBasica: number[][],
    colunasParaBasica: number[],
    matrizNaoBasica: number[][],
    colunasParaNaoBasica: number[],
    valoresDesigualdade: number[],
    vetorExpressaoPrincipal: number[],
    tipoOtimizacao: string,
    iteracao: number = 1
): [number, number[], number] | null {
    if (iteracao >= 100) {
        console.log("Número máximo de iterações atingido");
        return null;
    }

    const inversaBasica = criarMatrizInversa(matrizBasica, criarMatrizIdentidade(matrizBasica));
    if (!inversaBasica) {
        console.log("Matriz básica não é invertível");
        return null;
    }

    const vetorB = valoresDesigualdade.map(i => [i]);
    const xBasico = multiplicaMatriz(inversaBasica, vetorB);
    
    const custoBasico = [colunasParaBasica.map(i => vetorExpressaoPrincipal[i] || 0)];
    const yt = multiplicaMatriz(custoBasico, inversaBasica);
    const custoNaoBasico = [colunasParaNaoBasica.map(i => vetorExpressaoPrincipal[i] || 0)];
    
    const aNj = matrizNaoBasica;
    
    const multiplicacao = multiplicaMatriz(yt, aNj);
    const custoRelativo = custoNaoBasico[0].map((val, i) => val - multiplicacao[0][i]);

    const menorCusto = Math.min(...custoRelativo);
    
    if (menorCusto >= -1e-9) { // Critério de otimalidade
        let valorOtimo = 0;
        const ytB = multiplicaMatriz(yt, vetorB);
        valorOtimo = ytB[0][0];
        
        const vetorSolucao = Array(vetorExpressaoPrincipal.length).fill(0);
        for (let i = 0; i < xBasico.length; i++) {
            vetorSolucao[colunasParaBasica[i]] = xBasico[i][0];
        }
        
        return [valorOtimo, vetorSolucao, iteracao];
    }
    
    const indiceVariavelEntrada = custoRelativo.indexOf(menorCusto);

    const direcao = multiplicaMatriz(
        inversaBasica,
        matrizCompleta.map(linha => [linha[colunasParaNaoBasica[indiceVariavelEntrada]]])
    );

    if (direcao.every(x => x[0] <= 1e-9)) {
        console.log("Problema ilimitado");
        return null;
    }

    let passo = Infinity;
    let indiceSaida = -1;
    for (let i = 0; i < direcao.length; i++) {
        if (direcao[i][0] > 1e-9) {
            const razao = xBasico[i][0] / direcao[i][0];
            if (razao < passo) {
                passo = razao;
                indiceSaida = i;
            }
        }
    }

    if (indiceSaida === -1) {
        console.log("Problema ilimitado (nenhuma variável de saída encontrada).");
        return null;
    }

    const entrada = colunasParaNaoBasica[indiceVariavelEntrada];
    const saida = colunasParaBasica[indiceSaida];
    
    colunasParaBasica[indiceSaida] = entrada;
    colunasParaNaoBasica[indiceVariavelEntrada] = saida;
    colunasParaNaoBasica.sort((a,b)=>a-b);


    return faseII(
        matrizCompleta,
        matrizCompleta.map(linha => colunasParaBasica.map(i => linha[i])),
        colunasParaBasica,
        matrizCompleta.map(linha => colunasParaNaoBasica.map(i => linha[i])),
        colunasParaNaoBasica,
        valoresDesigualdade,
        vetorExpressaoPrincipal,
        tipoOtimizacao,
        iteracao + 1
    );
}