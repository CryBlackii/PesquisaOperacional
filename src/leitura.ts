import * as fs from "fs";

export function lerTxt(): string[] {
    const array = fs.readFileSync("entrada.txt", "utf-8")
        .split("\n")
        .map(linha => linha.trim().replace(/\s+/g, ""))
        .filter(linha => linha !== "");
    return array;
}

export function parseProblem(array: string[]): {
    optimizationType: string,
    objectiveCoefficients: number[],
    constraintMatrix: number[][],
    constraintRhs: number[],
    constraintTypes: string[]
} {
    // 1. Analisa a Função Objetiva
    const objectiveStr = array[0];
    const optimizationType = objectiveStr.toLowerCase().startsWith("max") ? "max" : "min";
    
    const decisionVarRegex = /x(\d+)/g;
    let maxVarIndex = 0;
    let match;
    const fullText = array.join(' ');
    while((match = decisionVarRegex.exec(fullText)) !== null) {
        maxVarIndex = Math.max(maxVarIndex, parseInt(match[1]));
    }
    
    const numDecisionVars = maxVarIndex;
    const objectiveCoefficients = Array(numDecisionVars).fill(0);
    const coeffRegex = /([+-]?\d*\.?\d*)\*?x(\d+)/g;
    
    while ((match = coeffRegex.exec(objectiveStr)) !== null) {
        let coef = match[1];
        if (coef === "" || coef === "+") coef = "1";
        else if (coef === "-") coef = "-1";
        const xIndex = parseInt(match[2]) - 1;
        if(xIndex < numDecisionVars) {
            objectiveCoefficients[xIndex] = parseFloat(coef);
        }
    }

    // 2. Analisa as Restrições
    const constraints = array.slice(1);
    const numConstraints = constraints.length;
    const constraintMatrix: number[][] = Array.from({ length: numConstraints }, () => Array(numDecisionVars).fill(0));
    const constraintRhs: number[] = [];
    const constraintTypes: string[] = [];

    for (let i = 0; i < numConstraints; i++) {
        const constraintStr = constraints[i];
        let separator: string;
        if (constraintStr.includes(">=")) separator = ">=";
        else if (constraintStr.includes("<=")) separator = "<=";
        else separator = "=";

        const [lhs, rhs] = constraintStr.split(separator);
        constraintTypes.push(separator);
        constraintRhs.push(eval(rhs));
        
        const coeffRegexConst = /([+-]?\d*\.?\d*)\*?x(\d+)/g;
        while ((match = coeffRegexConst.exec(lhs)) !== null) {
            let coef = match[1];
            if (coef === "" || coef === "+") coef = "1";
            else if (coef === "-") coef = "-1";
            const xIndex = parseInt(match[2]) - 1;
            if(xIndex < numDecisionVars){
                constraintMatrix[i][xIndex] = parseFloat(coef);
            }
        }
    }

    return { optimizationType, objectiveCoefficients, constraintMatrix, constraintRhs, constraintTypes };
}