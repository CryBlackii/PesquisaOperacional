"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularDeterminante = calcularDeterminante;
function calcularDeterminante(matriz) {
    const n = matriz.length;
    if (n === 1) { //caso a matriz seja 1x1 vai retornar o proprio elemento como det.
        return matriz[0][0];
    }
    let det = 0;
    const linha = 0;
    // Itera pelas colunas da primeira linha para calcular os cofatores.
    for (let coluna = 0; coluna < n; coluna++) {
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
function subMatriz(matriz, linha, coluna) {
    // Filtra as linhas, removendo a linha especificada.
    return matriz
        .filter((_, i) => i !== linha)
        // Para cada linha restante, filtra as colunas, removendo a coluna especificada.
        .map(linhaAtual => linhaAtual.filter((_, j) => j !== coluna));
}
