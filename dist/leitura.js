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
exports.parseProblem = parseProblem;
const fs = __importStar(require("fs"));
function lerTxt() {
    const array = fs.readFileSync("entrada.txt", "utf-8")
        .split("\n")
        // Para cada linha, remove espaços em branco no início e no fim (trim) e remove todos os espaços internos (replace).
        .map(linha => linha.trim().replace(/\s+/g, ""))
        // Filtra e remove quaisquer linhas que ficaram vazias após o tratamento.
        .filter(linha => linha !== "");
    return array;
}
function parseProblem(array) {
    const objectiveStr = array[0]; // A primeira linha é sempre a função objetivo.
    // Determina se é um problema de maximização ou minimização.
    const optimizationType = objectiveStr.toLowerCase().startsWith("max") ? "max" : "min";
    const decisionVarRegex = /x(\d+)/g;
    let maxVarIndex = 0; // Armazena o maior índice de variável encontrado
    let match;
    const fullText = array.join(' '); // Junta todo o problema em uma string para encontrar todas as variáveis.
    // Loop para encontrar o maior índice de variável de decisão no problema inteiro.
    while ((match = decisionVarRegex.exec(fullText)) !== null) {
        maxVarIndex = Math.max(maxVarIndex, parseInt(match[1]));
    }
    const numDecisionVars = maxVarIndex; // O número total de variáveis de decisão é o maior índice encontrado.
    // Cria um array de coeficientes para a função objetivo, inicializado com zeros.
    const objectiveCoefficients = Array(numDecisionVars).fill(0);
    // Expressão regular para capturar os coeficientes e os índices das variáveis (ex: -2*x1, +x2).
    const coeffRegex = /([+-]?\d*\.?\d*)\*?x(\d+)/g;
    while ((match = coeffRegex.exec(objectiveStr)) !== null) {
        let coef = match[1]; // O coeficiente capturado (pode ser "", "+", "-", ou um número).
        // Trata coeficientes implícitos (ex: "x2" tem coeficiente 1, "-x3" tem -1).
        if (coef === "" || coef === "+")
            coef = "1";
        else if (coef === "-")
            coef = "-1";
        const xIndex = parseInt(match[2]) - 1;
        if (xIndex < numDecisionVars) {
            objectiveCoefficients[xIndex] = parseFloat(coef);
        }
    }
    const constraints = array.slice(1); // Pega todas as linhas exceto a primeira 
    const numConstraints = constraints.length;
    // Cria a matriz de coeficientes das restrições, inicializada com zeros
    const constraintMatrix = Array.from({ length: numConstraints }, () => Array(numDecisionVars).fill(0));
    const constraintRhs = [];
    const constraintTypes = []; // Array para armazenar os tipos de inequação ('<=', '>=', '=').
    for (let i = 0; i < numConstraints; i++) {
        const constraintStr = constraints[i];
        let separator;
        // Identifica o tipo de restrição.
        if (constraintStr.includes(">="))
            separator = ">=";
        else if (constraintStr.includes("<="))
            separator = "<=";
        else
            separator = "=";
        // Divide a restrição em lado esquerdo e lado direito
        const [lhs, rhs] = constraintStr.split(separator);
        constraintTypes.push(separator);
        constraintRhs.push(eval(rhs)); // Armazena o valor do lado direito
        // Usa a mesma lógica da função objetivo para extrair os coeficientes do lado esquerdo da restrição.
        const coeffRegexConst = /([+-]?\d*\.?\d*)\*?x(\d+)/g;
        while ((match = coeffRegexConst.exec(lhs)) !== null) {
            let coef = match[1];
            if (coef === "" || coef === "+")
                coef = "1";
            else if (coef === "-")
                coef = "-1";
            const xIndex = parseInt(match[2]) - 1;
            if (xIndex < numDecisionVars) {
                constraintMatrix[i][xIndex] = parseFloat(coef);
            }
        }
    }
    return { optimizationType, objectiveCoefficients, constraintMatrix, constraintRhs, constraintTypes };
}
