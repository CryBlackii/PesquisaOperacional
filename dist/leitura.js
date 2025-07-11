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
        .map(linha => linha.trim().replace(/\s+/g, ""))
        .filter(linha => linha !== "");
    return array;
}
function parseProblem(array) {
    // 1. Analisa a Função Objetiva
    const objectiveStr = array[0];
    const optimizationType = objectiveStr.toLowerCase().startsWith("max") ? "max" : "min";
    const decisionVarRegex = /x(\d+)/g;
    let maxVarIndex = 0;
    let match;
    const fullText = array.join(' ');
    while ((match = decisionVarRegex.exec(fullText)) !== null) {
        maxVarIndex = Math.max(maxVarIndex, parseInt(match[1]));
    }
    const numDecisionVars = maxVarIndex;
    const objectiveCoefficients = Array(numDecisionVars).fill(0);
    const coeffRegex = /([+-]?\d*\.?\d*)\*?x(\d+)/g;
    while ((match = coeffRegex.exec(objectiveStr)) !== null) {
        let coef = match[1];
        if (coef === "" || coef === "+")
            coef = "1";
        else if (coef === "-")
            coef = "-1";
        const xIndex = parseInt(match[2]) - 1;
        if (xIndex < numDecisionVars) {
            objectiveCoefficients[xIndex] = parseFloat(coef);
        }
    }
    // 2. Analisa as Restrições
    const constraints = array.slice(1);
    const numConstraints = constraints.length;
    const constraintMatrix = Array.from({ length: numConstraints }, () => Array(numDecisionVars).fill(0));
    const constraintRhs = [];
    const constraintTypes = [];
    for (let i = 0; i < numConstraints; i++) {
        const constraintStr = constraints[i];
        let separator;
        if (constraintStr.includes(">="))
            separator = ">=";
        else if (constraintStr.includes("<="))
            separator = "<=";
        else
            separator = "=";
        const [lhs, rhs] = constraintStr.split(separator);
        constraintTypes.push(separator);
        constraintRhs.push(eval(rhs));
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
