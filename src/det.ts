export function calcularDeterminante(matriz : number[][]) : number{ //calcula uma determinante XD
    const n = matriz.length;
    if (n === 1){//caso seja uma matriz 1x1, vai retornar o proprio elemento
        return matriz[0][0];
    }

    let det = 0;
    const linha = 0;

    for (let coluna = 0; coluna < n; coluna++){//grandioso la place aqui
        const cofator = (-1) ** (linha + coluna);
        const elemento = matriz[linha][coluna];
        const subdet = calcularDeterminante(subMatriz(matriz, linha, coluna));
        det += cofator * elemento * subdet;
    }
    return det;
}

function subMatriz(matriz: number[][], linha: number, coluna: number) : number[][]{
    return matriz
        .filter((_, i) => i !== linha)//com base em cada linha restante, vai tirar a coluna respectiva
        .map(linhaAtual => linhaAtual.filter((_, j) => j !== coluna));
}