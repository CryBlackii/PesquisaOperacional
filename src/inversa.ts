export function criarMatrizIdentidade(matrizQuadrada : number[][]) : number[][]{
    const tamanho = matrizQuadrada.length;
    const identidade: number[][] = Array.from({ length: tamanho }, () => Array(tamanho).fill(0));
    for(let i = 0; i < tamanho; i++){
        identidade[i][i] = 1;
    }
    return identidade;
}

export function criarMatrizInversa(matrizQuadrada : number[][], identidade : number[][]) : number[][] | null{
    const tamanho = matrizQuadrada.length;
    
    // cria a matriz ampliada com base na identidade
    const matrizAmpliada = matrizQuadrada.map((linha, i) => [...linha, ...identidade[i]]);

    for(let i = 0; i < tamanho; i++){ // o grande 23 aqui
        if(matrizAmpliada[i][i] === 0){
            let trocou = false;
            for(let k = i + 1; k < tamanho; k++){
                if(matrizAmpliada[k][i] !== 0){
                    [matrizAmpliada[i], matrizAmpliada[k]] = [matrizAmpliada[k], matrizAmpliada[i]];
                    trocou = true;
                    break;
                }
            }
            if(!trocou){
                return null;
            }
        }

        const fator = matrizAmpliada[i][i];
        for(let j = 0; j < 2 * tamanho; j++){
            matrizAmpliada[i][j] /= fator;
        }

        for (let k = 0; k < tamanho; k++) {
            if(k !== i){
                const fator2 = matrizAmpliada[k][i];
                for(let j = 0; j < 2 * tamanho; j++){
                    matrizAmpliada[k][j] -= fator2 * matrizAmpliada[i][j];
                }
            }
        }
    }
    const inversa = matrizAmpliada.map(linha => linha.slice(tamanho));
    return inversa;
}