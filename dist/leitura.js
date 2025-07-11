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
exports.adicionarVariaveis2 = adicionarVariaveis2;
exports.preencherMatriz = preencherMatriz;
const fs = __importStar(require("fs"));
function lerTxt() {
    const array = fs.readFileSync("entrada.txt", "utf-8")
        .split("\n")
        .map(linha => linha.trim().replace(/\s+/g, ""))
        .filter(linha => linha !== "");
    return array;
}
function lerRestricoes(array) {
    let contadorDeLinhas = 0;
    for (let i = 1; i < array.length; i++) {
        if (array[i].includes(">=") || array[i].includes("<=")) {
            contadorDeLinhas++;
        }
    }
    return contadorDeLinhas;
}
function lerQuantidadeX(array) {
    let contadorDeX = 0;
    for (let i = 0; i < array[0].length; i++) {
        if (array[0][i] === "x") {
            contadorDeX++;
        }
    }
    let tipoOtimizacao;
    if (array[0].toLocaleLowerCase().startsWith("max")) {
        tipoOtimizacao = "max";
        contadorDeX--;
    }
    else {
        tipoOtimizacao = "min";
    }
    return [contadorDeX, tipoOtimizacao];
}
function adicionarVariaveis(array, contadorDeX) {
    let indiceVariavelArtificial = contadorDeX + 1;
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
function adicionarVariaveis2(array) {
    const valoresDesigualdade = [];
    let indiceSlack = 1;
    let indiceArtificial = 1;
    for (let i = 0; i < array.length; i++) {
        if (array[i].includes("<=")) {
            const [lhs, rhs] = array[i].split("<=");
            valoresDesigualdade.push(eval(rhs));
            array[i] = `${lhs}+s${indiceSlack}=${rhs}`;
            indiceSlack++;
        }
        else if (array[i].includes(">=")) {
            const [lhs, rhs] = array[i].split(">=");
            valoresDesigualdade.push(eval(rhs));
            array[i] = `${lhs}-s${indiceSlack}+a${indiceArtificial}=${rhs}`;
            indiceSlack++;
            indiceArtificial++;
        }
        else if (array[i].includes("=")) {
            const [lhs, rhs] = array[i].split("=");
            valoresDesigualdade.push(eval(rhs));
            array[i] = `${lhs}+a${indiceArtificial}=${rhs}`;
            indiceArtificial++;
        }
    }
    return [array, valoresDesigualdade];
}
function preencherMatriz(array, contadorDeX, contadorDeLinhas) {
    const matrizCompleta = Array(array.length - 1)
        .fill(0)
        .map(() => Array(contadorDeX + contadorDeLinhas).fill(0));
    const regex = /([+-]?\d*\.?\d*)\*?x(\d+)/g;
    const vetorExpressaoPrincipal = [];
    for (let i = 0; i < array.length; i++) {
        const expr = array[i];
        let match;
        while ((match = regex.exec(expr)) !== null) {
            let coef = match[1];
            const xIndex = parseInt(match[2]) - 1;
            if (coef === "" || coef === "+") {
                coef = "1";
            }
            else if (coef === "-") {
                coef = "-1";
            }
            if (i === 0) {
                vetorExpressaoPrincipal.push(parseFloat(coef));
            }
            else {
                matrizCompleta[i - 1][xIndex] = parseFloat(coef);
            }
        }
    }
    for (let i = 0; i < contadorDeLinhas; i++) {
        vetorExpressaoPrincipal.push(0);
    }
    return [matrizCompleta, vetorExpressaoPrincipal];
}
