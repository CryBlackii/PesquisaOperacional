/**
 * Calcula o determinante de uma matriz quadrada usando a expansão de Laplace.
 * @param matriz A matriz quadrada.
 * @returns O valor do determinante.
 */
export function calcularDeterminante(matriz : number[][]) : number{
    const n = matriz.length;
    // Caso base: se a matriz é 1x1, o determinante é o próprio elemento.
    if (n === 1){
        return matriz[0][0];
    }

    let det = 0;
    const linha = 0; // Expansão será feita ao longo da primeira linha.

    // Itera pelas colunas da primeira linha para calcular os cofatores.
    for (let coluna = 0; coluna < n; coluna++){
        // O cofator é (-1)^(i+j).
        const cofator = (-1) ** (linha + coluna);
        // O elemento da matriz na posição (linha, coluna).
        const elemento = matriz[linha][coluna];
        // Calcula o determinante da submatriz (menor).
        const subdet = calcularDeterminante(subMatriz(matriz, linha, coluna));
        // Acumula o resultado na variável do determinante.
        det += cofator * elemento * subdet;
    }
    return det;
}

/**
 * Cria uma submatriz removendo uma linha e uma coluna específicas.
 * @param matriz A matriz original.
 * @param linha A linha a ser removida.
 * @param coluna A coluna a ser removida.
 * @returns A submatriz resultante.
 */
function subMatriz(matriz: number[][], linha: number, coluna: number) : number[][]{
    // Filtra as linhas, removendo a linha especificada.
    return matriz
        .filter((_, i) => i !== linha)
        // Para cada linha restante, filtra as colunas, removendo a coluna especificada.
        .map(linhaAtual => linhaAtual.filter((_, j) => j !== coluna));
}