import { criarMatrizInversa, criarMatrizIdentidade } from "./inversa";
import { multiplicaMatriz } from "./mult";

export function faseI(
    matrizCompleta: number[][], 
    valoresDesigualdade: number[], 
    vetorExpressaoPrincipal: number[], 
    tipoOtimizacao: string
): [number, number[], number] | null {
    const m = matrizCompleta.length;
    const n = matrizCompleta[0].length;
    
    // Adiciona variáveis artificiais
    const matrizComArtificiais = matrizCompleta.map((linha, i) => {
        const artificiais = Array(m).fill(0);
        artificiais[i] = 1;
        return [...linha, ...artificiais];
    });

    const expressaoArtificial = Array(n).fill(0).concat(Array(m).fill(1));
    const colunasParaBasica: number[] = [];
    const colunasParaNaoBasica: number[] = [];

    for (let i = 0; i < n + m; i++) {
        if (i >= n) colunasParaBasica.push(i);
        else colunasParaNaoBasica.push(i);
    }

    const matrizBasica = matrizComArtificiais.map(linha => colunasParaBasica.map(i => linha[i]));
    const matrizNaoBasica = matrizComArtificiais.map(linha => colunasParaNaoBasica.map(i => linha[i]));

    const resultadoFase1 = faseII(
        matrizComArtificiais,
        matrizBasica,
        colunasParaBasica,
        matrizNaoBasica,
        colunasParaNaoBasica,
        valoresDesigualdade,
        expressaoArtificial,
        "min"
    );

    if (resultadoFase1 === null || resultadoFase1[0] > 1e-6) {
        return null;
    }

    const matrizSemArtificiais = matrizComArtificiais.map(linha => linha.slice(0, n));
    let novaColunasParaBasica = colunasParaBasica.filter(c => c < n);
    let novaColunasParaNaoBasica = colunasParaNaoBasica.filter(c => c < n);

    while (novaColunasParaBasica.length < m) {
        const candidato = novaColunasParaNaoBasica.shift();
        if (candidato !== undefined) novaColunasParaBasica.push(candidato);
    }

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
    
    if (xBasico.some(x => x[0] < -1e-6)) {
        return null;
    }

    const custoBasico = [colunasParaBasica.map(i => vetorExpressaoPrincipal[i])];
    const yt = multiplicaMatriz(custoBasico, inversaBasica);
    const custoNaoBasico = [colunasParaNaoBasica.map(i => vetorExpressaoPrincipal[i])];
    
    const aNj = matrizCompleta.map(linha => 
        colunasParaNaoBasica.map(j => linha[j])
    );
    
    const multiplicacao = multiplicaMatriz(yt, aNj);
    const custoRelativo = custoNaoBasico[0].map((val, i) => val - multiplicacao[0][i]);

    const menorCusto = Math.min(...custoRelativo);
    const indiceVariavelEntrada = custoRelativo.indexOf(menorCusto);

    if (menorCusto >= -1e-6) {
        let valorOtimo = 0;
        for (let i = 0; i < custoBasico[0].length; i++) {
            valorOtimo += custoBasico[0][i] * xBasico[i][0];
        }
        
        if (tipoOtimizacao === "max") {
            valorOtimo *= -1;
        }

        const vetorSolucao = Array(vetorExpressaoPrincipal.length).fill(0);
        for (let i = 0; i < xBasico.length; i++) {
            vetorSolucao[colunasParaBasica[i]] = xBasico[i][0];
        }
        
        return [valorOtimo, vetorSolucao, iteracao];
    }

    const direcao = multiplicaMatriz(
        inversaBasica,
        matrizCompleta.map(linha => [linha[colunasParaNaoBasica[indiceVariavelEntrada]]])
    );

    if (direcao.every(x => x[0] <= 1e-6)) {
        console.log("Problema ilimitado");
        return null;
    }

    let passo = Infinity;
    let indiceSaida = -1;
    for (let i = 0; i < direcao.length; i++) {
        if (direcao[i][0] > 1e-6) {
            const razao = xBasico[i][0] / direcao[i][0];
            if (razao < passo) {
                passo = razao;
                indiceSaida = i;
            }
        }
    }

    if (indiceSaida === -1) {
        console.log("Problema ilimitado");
        return null;
    }

    const entrada = colunasParaNaoBasica[indiceVariavelEntrada];
    const saida = colunasParaBasica[indiceSaida];
    
    colunasParaBasica[indiceSaida] = entrada;
    colunasParaNaoBasica[indiceVariavelEntrada] = saida;

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

export function verificaFaseI(
    array: string[],
    vetorExpressaoPrincipal: number[],
    valoresDesigualdade: number[],
    matrizCompleta: number[][]
): [boolean, number[], number[][]] {
    if (array[0].toLowerCase().startsWith("max")) {
        for (let i = 0; i < vetorExpressaoPrincipal.length; i++) {
            vetorExpressaoPrincipal[i] *= -1;
        }
    }

    for (let i = 1; i < array.length; i++) {
        if (array[i].includes(">=") || array[i].includes(">")) {
            return [true, vetorExpressaoPrincipal, matrizCompleta];
        }
        if (array[i].includes("=") && !array[i].includes(">=") && !array[i].includes("<=")) {
            return [true, vetorExpressaoPrincipal, matrizCompleta];
        }
    }
    return [false, vetorExpressaoPrincipal, matrizCompleta];
}