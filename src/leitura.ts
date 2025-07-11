import * as fs from "fs";

export function lerTxt(): string[] {
    const array = fs.readFileSync("entrada.txt", "utf-8")
        .split("\n")
        // Para cada linha, remove espaços em branco no início e no fim (trim) e remove todos os espaços internos (replace).
        .map(linha => linha.trim().replace(/\s+/g, ""))
        // Filtra e remove quaisquer linhas que ficaram vazias após o tratamento.
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
    const objectiveStr = array[0]; // A primeira linha é sempre a função objetivo.
    // Determina se é um problema de maximização ou minimização.
    const optimizationType = objectiveStr.toLowerCase().startsWith("max") ? "max" : "min";
    
    const decisionVarRegex = /x(\d+)/g;
    let maxVarIndex = 0; // Armazena o maior índice de variável encontrado
    let match;
    const fullText = array.join(' '); // Junta todo o problema em uma string para encontrar todas as variáveis.
    // Loop para encontrar o maior índice de variável de decisão no problema inteiro.
    while((match = decisionVarRegex.exec(fullText)) !== null) {
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
        if (coef === "" || coef === "+") coef = "1";
        else if (coef === "-") coef = "-1";
        const xIndex = parseInt(match[2]) - 1;
        if(xIndex < numDecisionVars) {
            objectiveCoefficients[xIndex] = parseFloat(coef); 
        }
    }

    const constraints = array.slice(1); // Pega todas as linhas exceto a primeira 
    const numConstraints = constraints.length; 
    // Cria a matriz de coeficientes das restrições, inicializada com zeros
    const constraintMatrix: number[][] = Array.from({ length: numConstraints }, () => Array(numDecisionVars).fill(0));
    const constraintRhs: number[] = []; 
    const constraintTypes: string[] = []; // Array para armazenar os tipos de inequação ('<=', '>=', '=').

    for (let i = 0; i < numConstraints; i++) {
        const constraintStr = constraints[i];
        let separator: string;
        // Identifica o tipo de restrição.
        if (constraintStr.includes(">=")) separator = ">=";
        else if (constraintStr.includes("<=")) separator = "<=";
        else separator = "=";

        // Divide a restrição em lado esquerdo e lado direito
        const [lhs, rhs] = constraintStr.split(separator);
        constraintTypes.push(separator); 
        constraintRhs.push(eval(rhs)); // Armazena o valor do lado direito
        
        // Usa a mesma lógica da função objetivo para extrair os coeficientes do lado esquerdo da restrição.
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