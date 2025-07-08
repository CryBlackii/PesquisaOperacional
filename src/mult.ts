export function multiplicaMatriz(matriz1 : number[][], matriz2 : number[][]) : number[][]{
    if(matriz1[0].length !== matriz2.length){ // verifica se é quadrado para multiplicar
        throw new Error("Matrizes incompatíveis para multiplicação");
    }

    const linhas = matriz1.length;
    const colunas = matriz2[0].length;
    const comum = matriz1[0].length;// pega a dimensão comum
    const matrizFinal : number[][] = Array(linhas) //cria uma matriz preenchida com zeros
        .fill(0)
        .map(() => Array(colunas).fill(0));

    for(let i = 0; i < linhas; i++){
        for(let j = 0; j < colunas; j++){
            let soma = 0;  // acumula para fazer o escalar
            for(let k = 0; k < comum; k++){ //calcula o produto escalar aqui
                soma += matriz1[i][k] * matriz2[k][j];
            }
            matrizFinal[i][j] = soma; 
        }
    }
    return matrizFinal;
}