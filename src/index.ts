import * as fs from "fs";
import { faseI, faseII, verificaFaseI } from "./simplex";
import { criarMatrizInversa, criarMatrizIdentidade } from "./inversa";
import { calcularDeterminante } from "./det";
import { multiplicaMatriz } from "./mult";
import { lerTxt, lerRestricoes, lerQuantidadeX, adicionarVariaveis, preencherMatriz } from "./leitura";

function main() {
    try {
        const array = lerTxt();
        const contadorDeLinhas = lerRestricoes(array);
        const [contadorDeX, tipoOtimizacao] = lerQuantidadeX(array);
        const valoresDesigualdade = adicionarVariaveis(array, contadorDeX);
        const [matrizCompleta, vetorExpressaoPrincipal] = preencherMatriz(array, contadorDeX, contadorDeLinhas);
        const determinante = calcularDeterminante(matrizCompleta);

        const [fase1Necessaria, vetorAtualizado, matrizAtualizada] = verificaFaseI(
            array,
            vetorExpressaoPrincipal,
            valoresDesigualdade,
            matrizCompleta
        );

        let resultado: [number, number[], number] | null = null;

        if (fase1Necessaria) {
            resultado = faseI(matrizAtualizada, valoresDesigualdade, vetorAtualizado, tipoOtimizacao);
            if (resultado === null) {
                console.log("Problema inviável ou ilimitado");
                return null;
            }
        } else {
            const indices: number[] = [];
            const numLinhas = matrizAtualizada.length;
            
            for (let i = 0; i < matrizAtualizada[0].length; i++) {
                const col = matrizAtualizada.map(l => l[i]);
                const uns = col.filter(v => v === 1).length;
                const zeros = col.filter(v => v === 0).length;

                if (uns === 1 && zeros === numLinhas - 1) {
                    indices.push(i);
                }

                if (indices.length === numLinhas) break;
            }

            if (indices.length !== numLinhas) {
                resultado = faseI(matrizAtualizada, valoresDesigualdade, vetorAtualizado, tipoOtimizacao);
                if (resultado === null) {
                    console.log("Problema inviável ou ilimitado");
                    return null;
                }
            } else {
                const colunasParaBasica = indices;
                const colunasParaNaoBasica: number[] = [];
                
                for (let i = 0; i < matrizAtualizada[0].length; i++) {
                    if (!indices.includes(i)) {
                        colunasParaNaoBasica.push(i);
                    }
                }

                const matrizBasica = matrizAtualizada.map(linha => colunasParaBasica.map(i => linha[i]));
                const matrizNaoBasica = matrizAtualizada.map(linha => colunasParaNaoBasica.map(i => linha[i]));

                resultado = faseII(
                    matrizAtualizada,
                    matrizBasica,
                    colunasParaBasica,
                    matrizNaoBasica,
                    colunasParaNaoBasica,
                    valoresDesigualdade,
                    vetorAtualizado,
                    tipoOtimizacao
                );
            }
        }

        if (resultado) {
            const [valorOtimo, vetorSolucao, iteracoes] = resultado;
            console.log(`Z = ${valorOtimo}`);
            
            const variaveisBasicas: string[] = [];
            const variaveisNaoBasicas: string[] = [];
            
            for (let i = 0; i < vetorSolucao.length; i++) {
                if (vetorSolucao[i] !== 0) {
                    variaveisBasicas.push(`X${i + 1}=${vetorSolucao[i]}`);
                } else {
                    variaveisNaoBasicas.push(`X${i + 1}=${vetorSolucao[i]}`);
                }
            }
        } else {
            console.log("Problema não possui solução ótima finita");
        }

        return resultado;
    } catch (error) {
        console.error("Erro:", error instanceof Error ? error.message : String(error));
        return null;
    }
}

main();