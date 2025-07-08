"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.lerTxt = lerTxt;
exports.lerRestricoes = lerRestricoes;
exports.lerQuantidadeX = lerQuantidadeX;
exports.adicionarVariaveis = adicionarVariaveis;
exports.preencherMatriz = preencherMatriz;
const fs = __importStar(require("fs"));
function lerTxt() {
    const array = fs.readFileSync("entrada.txt", "utf-8")
        .split("\n") //divide as linhas
        .map(linha => linha.trim().replace(/\s+/g, "")) //tira os espaços
        .filter(linha => linha !== ""); //tira as linhas vazias
    return array;
}
function lerRestricoes(array) {
    let contadorDeLinhas = 0;
    for (let i = 1; i < array.length; i++) { //pra começar direto na segunda linha
        if (array[i].includes(">=") || array[i].includes("<=")) {
            contadorDeLinhas++;
        }
    }
    return contadorDeLinhas;
}
function lerQuantidadeX(array) {
    let contadorDeX = 0; //vai ver quantos X tem na primeira linha
    for (let i = 0; i < array[0].length; i++) {
        if (array[0][i] === "x") {
            contadorDeX++;
        }
    }
    let tipoOtimizacao; //vai ver se é max ou min
    if (array[0].toLocaleLowerCase().startsWith("max")) {
        tipoOtimizacao = "max";
        contadorDeX--; // tira um x, pq max tem x, né
    }
    else {
        tipoOtimizacao = "min";
    }
    return [contadorDeX, tipoOtimizacao];
}
function adicionarVariaveis(array, contadorDeX) {
    let indiceVariavelArtificial = contadorDeX + 1; // começa a numerar depois das variaveis que já tem
    const valoresDesigualdade = [];
    for (let i = 1; i < array.length; i++) {
        if (array[i].includes(">=")) {
            const [esquerda, direita] = array[i].split(">=");
            valoresDesigualdade.push(eval(direita));
            array[i] = `${esquerda}-x${indiceVariavelArtificial}>=${direita}`;
            indiceVariavelArtificial++;
        }
        else if (array[i].includes("<=")) {
            const [esquerda, direita] = array[i].split("<=");
            valoresDesigualdade.push(eval(direita));
            array[i] = `${esquerda}+x${indiceVariavelArtificial}<=${direita}`;
            indiceVariavelArtificial++;
        }
        else if (array[i].includes("=")) {
            const [esquerda, direita] = array[i].split("=");
            valoresDesigualdade.push(eval(direita));
        }
    }
    return valoresDesigualdade;
}
function preencherMatriz(array, contadorDeX, contadorDeLinhas) {
    const matrizCompleta = Array(array.length - 1) //aqui vai criar a matriz no tamanho certin
        .fill(0)
        .map(() => Array(contadorDeX + contadorDeLinhas).fill(0));
    const regex = /([+-]?\d*\.?\d*)\*?x(\d+)/g; // regex pra pegar os numeros
    const vetorExpressaoPrincipal = [];
    for (let i = 0; i < array.length; i++) {
        const expr = array[i];
        let match;
        while ((match = regex.exec(expr)) !== null) {
            let coef = match[1];
            const xIndex = parseInt(match[2]) - 1;
            if (coef === "" || coef === "+") { // vai pegar os lugares onde estiver só x/-x e colocar 1/-1
                coef = "1";
            }
            else if (coef === "-") {
                coef = "-1";
            }
            if (i === 0) { // ve se é a função objetivo no lugar das restrições
                vetorExpressaoPrincipal.push(parseFloat(coef));
            }
            else {
                matrizCompleta[i - 1][xIndex] = parseFloat(coef); // se não só taca nas restrições
            }
        }
    }
    for (let i = 0; i < contadorDeLinhas; i++) { // vai encher de zero no resto, ebaaa
        vetorExpressaoPrincipal.push(0);
    }
    return [matrizCompleta, vetorExpressaoPrincipal];
}
