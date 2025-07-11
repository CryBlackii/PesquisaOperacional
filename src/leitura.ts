import * as fs from "fs";

export function lerTxt(): string[] {
    const array = fs.readFileSync("entrada.txt", "utf-8")
        .split("\n")
        .map(linha => linha.trim().replace(/\s+/g, ""))
        .filter(linha => linha !== "");
    return array;
}

export function lerRestricoes(array: string[]): number {
    let contadorDeLinhas = 0;
    for (let i = 1; i < array.length; i++) {
        if (array[i].includes(">=") || array[i].includes("<=")) {
            contadorDeLinhas++;
        }
    }
    return contadorDeLinhas;
}

export function lerQuantidadeX(array: string[]): [number, string] {
    let contadorDeX = 0;
    for (let i = 0; i < array[0].length; i++) {
        if (array[0][i] === "x") {
            contadorDeX++;
        }
    }
    
    let tipoOtimizacao: string;
    if (array[0].toLocaleLowerCase().startsWith("max")) {
        tipoOtimizacao = "max";
        contadorDeX--;
    } else {
        tipoOtimizacao = "min";
    }
    return [contadorDeX, tipoOtimizacao];
}

export function adicionarVariaveis(array: string[], contadorDeX: number): number[] {
    let indiceVariavelArtificial = contadorDeX + 1;
    const valoresDesigualdade: number[] = [];

    for (let i = 1; i < array.length; i++) {
        if (array[i].includes(">=")) {
            const [esquerda, direita] = array[i].split(">=");
            valoresDesigualdade.push(eval(direita));
            array[i] = `${esquerda}-x${indiceVariavelArtificial}>=${direita}`;
            indiceVariavelArtificial++;
        } else if (array[i].includes("<=")) {
            const [esquerda, direita] = array[i].split("<=");
            valoresDesigualdade.push(eval(direita));
            array[i] = `${esquerda}+x${indiceVariavelArtificial}<=${direita}`;
            indiceVariavelArtificial++;
        } else if (array[i].includes("=")) {
            const [esquerda, direita] = array[i].split("=");
            valoresDesigualdade.push(eval(direita));
        }
    }
    return valoresDesigualdade;
}

export function adicionarVariaveis2(array: string[]): [string[], number[]] {
  const valoresDesigualdade: number[] = [];
  let indiceSlack = 1;
  let indiceArtificial = 1;

  for (let i = 0; i < array.length; i++) {
    if (array[i].includes("<=")) {
      const [lhs, rhs] = array[i].split("<=");
      valoresDesigualdade.push(eval(rhs));
      array[i] = `${lhs}+s${indiceSlack}=${rhs}`;
      indiceSlack++;
    } else if (array[i].includes(">=")) {
      const [lhs, rhs] = array[i].split(">=");
      valoresDesigualdade.push(eval(rhs));
      array[i] = `${lhs}-s${indiceSlack}+a${indiceArtificial}=${rhs}`;
      indiceSlack++;
      indiceArtificial++;
    } else if (array[i].includes("=")) {
      const [lhs, rhs] = array[i].split("=");
      valoresDesigualdade.push(eval(rhs));
      array[i] = `${lhs}+a${indiceArtificial}=${rhs}`;
      indiceArtificial++;
    }
  }

  return [array, valoresDesigualdade];
}

export function preencherMatriz(array: string[], contadorDeX: number, contadorDeLinhas: number): [number[][], number[]] {
    const matrizCompleta: number[][] = Array(array.length - 1)
        .fill(0)
        .map(() => Array(contadorDeX + contadorDeLinhas).fill(0));
    
    const regex = /([+-]?\d*\.?\d*)\*?x(\d+)/g;
    const vetorExpressaoPrincipal: number[] = [];

    for (let i = 0; i < array.length; i++) {
        const expr = array[i];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(expr)) !== null) {
            let coef = match[1];
            const xIndex = parseInt(match[2]) - 1;
            
            if (coef === "" || coef === "+") {
                coef = "1";
            } else if (coef === "-") {
                coef = "-1";
            }
            
            if (i === 0) {
                vetorExpressaoPrincipal.push(parseFloat(coef));
            } else {
                matrizCompleta[i - 1][xIndex] = parseFloat(coef);
            }
        }
    }

    for (let i = 0; i < contadorDeLinhas; i++) {
        vetorExpressaoPrincipal.push(0);
    }
    return [matrizCompleta, vetorExpressaoPrincipal];
}