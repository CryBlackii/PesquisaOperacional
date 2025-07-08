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
        //verificação se vai precisar das tal variavel artificial
        const [fase1Necessaria, vetorAtualizado, matrizAtualizada] = (0, simplex_1.verificaFaseI)(array, vetorExpressaoPrincipal, valoresDesigualdade, matrizCompleta);
        if (fase1Necessaria) { // se tiver variavel artificial ele segue para a fase1, se não pula direto para fase two :)
            const resultado = (0, simplex_1.faseI)(matrizAtualizada, valoresDesigualdade, vetorAtualizado, tipoOtimizacao);
            if (resultado) {
                const [valorOtimo, vetorSolucao, iteracoes] = resultado;
                console.log("solução otima: [" + vetorSolucao.join(", ") + "]");
                console.log("valor ótimo:", valorOtimo);
            }
            else {
                console.log("o problema não possui solução otima ;/");
            }
        }
        else {
            const numLinhas = matrizAtualizada.length;
            const numColunas = matrizAtualizada[0].length;
            const indicesColunas = [...Array(numColunas).keys()];
            for (let i = indicesColunas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indicesColunas[i], indicesColunas[j]] = [indicesColunas[j], indicesColunas[i]];
            }
            //arrumar colunas basica e n basica
            const colunasParaBasica = indicesColunas.slice(0, numLinhas);
            const colunasParaNaoBasica = indicesColunas.slice(numLinhas);
            //arrumar submatriz basica e n basica
            const matrizBasica = matrizAtualizada.map(linha => colunasParaBasica.map(i => linha[i]));
            const matrizNaoBasica = matrizAtualizada.map(linha => colunasParaNaoBasica.map(i => linha[i]));
            const resultado = (0, simplex_1.faseII)(matrizAtualizada, matrizBasica, colunasParaBasica, matrizNaoBasica, colunasParaNaoBasica, valoresDesigualdade, vetorAtualizado, tipoOtimizacao);
            if (resultado) {
                const [valorOtimo, vetorSolucao, iteracoes] = resultado;
                console.log("solução otima: [" + vetorSolucao.join(", ") + "]");
                console.log("valor ótimo:", valorOtimo);
            }
            else {
                console.log("o problema não possui solução otima ;/");
            }
        }
    }
    catch (error) {
        console.error("teve erro fi", error instanceof Error ? error.message : String(error));
    }
}
main();
