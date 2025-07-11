export function multiplicaMatriz(matriz1 : number[][], matriz2 : number[][]) : number[][]{
    // Verifica se o número de colunas da primeira matriz é igual ao número de linhas da segunda.
    if(matriz1[0].length !== matriz2.length){
        throw new Error("Matrizes incompatíveis para multiplicação");
    }

    const linhas = matriz1.length; // Número de linhas da matriz resultante.
    const colunas = matriz2[0].length; // Número de colunas da matriz resultante.
    const comum = matriz1[0].length; // Dimensão comum para o produto escalar.
    
    // Cria a matriz final preenchida com zeros.
    const matrizFinal : number[][] = Array(linhas)
        .fill(0)
        .map(() => Array(colunas).fill(0));

    // Itera sobre cada linha da primeira matriz.
    for(let i = 0; i < linhas; i++){
        // Itera sobre cada coluna da segunda matriz.
        for(let j = 0; j < colunas; j++){
            let soma = 0;  // Acumulador para o produto escalar.
            // Itera pela dimensão comum para calcular o produto escalar.
            for(let k = 0; k < comum; k++){
                soma += matriz1[i][k] * matriz2[k][j];
            }
            // Atribui o resultado à célula correspondente na matriz final.
            matrizFinal[i][j] = soma; 
        }
    }
    return matrizFinal;
}