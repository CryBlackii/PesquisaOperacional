/**
 * Cria uma matriz identidade de mesma dimensão de uma matriz quadrada fornecida.
 * @param matrizQuadrada A matriz que serve de referência para o tamanho.
 * @returns A matriz identidade correspondente.
 */
export function criarMatrizIdentidade(matrizQuadrada : number[][]) : number[][]{
    const tamanho = matrizQuadrada.length;
    // Cria uma matriz preenchida com zeros.
    const identidade: number[][] = Array.from({ length: tamanho }, () => Array(tamanho).fill(0));
    // Preenche a diagonal principal com 1s.
    for(let i = 0; i < tamanho; i++){
        identidade[i][i] = 1;
    }
    return identidade;
}

/**
 * Calcula a matriz inversa de uma matriz quadrada usando o método de eliminação de Gauss-Jordan.
 * @param matrizQuadrada A matriz a ser invertida (A).
 * @param identidade A matriz identidade de mesma dimensão.
 * @returns A matriz inversa (A⁻¹) ou null se a matriz for singular (não invertível).
 */
export function criarMatrizInversa(matrizQuadrada : number[][], identidade : number[][]) : number[][] | null{
    const tamanho = matrizQuadrada.length;
    
    // Cria a matriz aumentada [A | I].
    const matrizAmpliada = matrizQuadrada.map((linha, i) => [...linha, ...identidade[i]]);

    // Itera sobre as colunas para fazer a eliminação.
    for(let i = 0; i < tamanho; i++){
        // --- Pivoteamento Parcial ---
        // Procura pela linha com o maior valor absoluto na coluna atual (pivô) para melhorar a estabilidade numérica.
        let maxRow = i;
        for (let k = i + 1; k < tamanho; k++) {
            if (Math.abs(matrizAmpliada[k][i]) > Math.abs(matrizAmpliada[maxRow][i])) {
                maxRow = k;
            }
        }
        // Troca a linha atual pela linha com o maior pivô.
        [matrizAmpliada[i], matrizAmpliada[maxRow]] = [matrizAmpliada[maxRow], matrizAmpliada[i]];
        
        // Verifica se a matriz é singular (pivô zero ou muito próximo de zero).
        if(Math.abs(matrizAmpliada[i][i]) < 1e-10){
            return null; // A matriz não tem inversa.
        }

        // --- Normalização da Linha do Pivô ---
        // Divide toda a linha do pivô pelo valor do pivô para torná-lo 1.
        const fator = matrizAmpliada[i][i];
        for(let j = i; j < 2 * tamanho; j++){
            matrizAmpliada[i][j] /= fator;
        }

        // --- Eliminação nas Outras Linhas ---
        // Zera os outros elementos na coluna do pivô.
        for (let k = 0; k < tamanho; k++) {
            if(k !== i){ // Não faz na própria linha do pivô.
                const fator2 = matrizAmpliada[k][i]; // Fator de multiplicação.
                // Subtrai a linha do pivô (multiplicada pelo fator) da linha atual.
                for(let j = i; j < 2 * tamanho; j++){
                    matrizAmpliada[k][j] -= fator2 * matrizAmpliada[i][j];
                }
            }
        }
    }
    // Extrai a parte direita da matriz aumentada, que agora é a matriz inversa.
    const inversa = matrizAmpliada.map(linha => linha.slice(tamanho));
    return inversa;
}