"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simplex_1 = require("./simplex");
const det_1 = require("./det");
const leitura_1 = require("./leitura");
function main() {
    try {
        const array = (0, leitura_1.lerTxt)();
        const contadorDeLinhas = (0, leitura_1.lerRestricoes)(array);
        const [contadorDeX, tipoOtimizacao] = (0, leitura_1.lerQuantidadeX)(array);
        const valoresDesigualdade = (0, leitura_1.adicionarVariaveis)(array, contadorDeX);
        const [matrizCompleta, vetorExpressaoPrincipal] = (0, leitura_1.preencherMatriz)(array, contadorDeX, contadorDeLinhas);
        const determinante = (0, det_1.calcularDeterminante)(matrizCompleta);
        const [fase1Necessaria, vetorAtualizado, matrizAtualizada] = (0, simplex_1.verificaFaseI)(array, vetorExpressaoPrincipal, valoresDesigualdade, matrizCompleta);
        let resultado = null;
        if (fase1Necessaria) {
            resultado = (0, simplex_1.faseI)(matrizAtualizada, valoresDesigualdade, vetorAtualizado, tipoOtimizacao);
            if (resultado === null) {
                console.log("Problema inviável ou ilimitado");
                return null;
            }
        }
        else {
            const indices = [];
            const numLinhas = matrizAtualizada.length;
            for (let i = 0; i < matrizAtualizada[0].length; i++) {
                const col = matrizAtualizada.map(l => l[i]);
                const uns = col.filter(v => v === 1).length;
                const zeros = col.filter(v => v === 0).length;
                if (uns === 1 && zeros === numLinhas - 1) {
                    indices.push(i);
                }
                if (indices.length === numLinhas)
                    break;
            }
            if (indices.length !== numLinhas) {
                resultado = (0, simplex_1.faseI)(matrizAtualizada, valoresDesigualdade, vetorAtualizado, tipoOtimizacao);
                if (resultado === null) {
                    console.log("Problema inviável ou ilimitado");
                    return null;
                }
            }
            else {
                const colunasParaBasica = indices;
                const colunasParaNaoBasica = [];
                for (let i = 0; i < matrizAtualizada[0].length; i++) {
                    if (!indices.includes(i)) {
                        colunasParaNaoBasica.push(i);
                    }
                }
                const matrizBasica = matrizAtualizada.map(linha => colunasParaBasica.map(i => linha[i]));
                const matrizNaoBasica = matrizAtualizada.map(linha => colunasParaNaoBasica.map(i => linha[i]));
                resultado = (0, simplex_1.faseII)(matrizAtualizada, matrizBasica, colunasParaBasica, matrizNaoBasica, colunasParaNaoBasica, valoresDesigualdade, vetorAtualizado, tipoOtimizacao);
            }
        }
        if (resultado) {
            const [valorOtimo, vetorSolucao, iteracoes] = resultado;
            console.log(`Z = ${valorOtimo}`);
            const variaveisBasicas = [];
            const variaveisNaoBasicas = [];
            for (let i = 0; i < vetorSolucao.length; i++) {
                if (vetorSolucao[i] !== 0) {
                    variaveisBasicas.push(`X${i + 1}=${vetorSolucao[i]}`);
                }
                else {
                    variaveisNaoBasicas.push(`X${i + 1}=${vetorSolucao[i]}`);
                }
            }
        }
        else {
            console.log("Problema não possui solução ótima finita");
        }
        return resultado;
    }
    catch (error) {
        console.error("Erro:", error instanceof Error ? error.message : String(error));
        return null;
    }
}
main();
