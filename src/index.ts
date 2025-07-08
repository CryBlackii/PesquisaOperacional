import * as fs from "fs";
import { faseI, faseII, verificaFaseI } from "./simplex";
import { criarMatrizInversa, criarMatrizIdentidade } from "./inversa";
import { calcularDeterminante } from "./det";
import { multiplicaMatriz } from "./mult";
import { lerTxt, lerRestricoes, lerQuantidadeX, adicionarVariaveis, preencherMatriz } from "./leitura";

function main() : void{
    try{
        const array = lerTxt();
        const contadorDeLinhas = lerRestricoes(array);
        const [contadorDeX, tipoOtimizacao] = lerQuantidadeX(array);
        const valoresDesigualdade = adicionarVariaveis(array, contadorDeX);
        const [matrizCompleta, vetorExpressaoPrincipal] = preencherMatriz(array, contadorDeX, contadorDeLinhas);
        const determinante = calcularDeterminante(matrizCompleta);
        //verificação se vai precisar das tal variavel artificial
        const [fase1Necessaria, vetorAtualizado, matrizAtualizada] = verificaFaseI(array, vetorExpressaoPrincipal, valoresDesigualdade, matrizCompleta);

        if(fase1Necessaria){// se tiver variavel artificial ele segue para a fase1, se não pula direto para fase two :)
            const resultado = faseI(matrizAtualizada, valoresDesigualdade, vetorAtualizado, tipoOtimizacao);
            if(resultado){
                const [valorOtimo, vetorSolucao, iteracoes] = resultado;
                console.log("solução otima: [" + vetorSolucao.join(", ") + "]");
                console.log("valor ótimo:", valorOtimo);
            }else{
                console.log("o problema não possui solução otima ;/");
            }
        }else{
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
            const resultado = faseII(matrizAtualizada, matrizBasica, colunasParaBasica, matrizNaoBasica, colunasParaNaoBasica, valoresDesigualdade, vetorAtualizado, tipoOtimizacao);

            if(resultado){
                const [valorOtimo, vetorSolucao, iteracoes] = resultado;
                console.log("solução otima: [" + vetorSolucao.join(", ") + "]");
                console.log("valor ótimo:", valorOtimo);
            }else{
                console.log("o problema não possui solução otima ;/");
            }
        }
    }catch(error){
        console.error("teve erro fi", error instanceof Error ? error.message : String(error));
    }
}

main();