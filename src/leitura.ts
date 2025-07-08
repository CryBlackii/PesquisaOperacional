import * as fs from "fs";
export function lerTxt() : string[]{ // vai ler a entrada e retornar uma matriz sem os espaços e linhasss
    const array = fs.readFileSync("entrada.txt", "utf-8")
        .split("\n")  //divide as linhas
        .map(linha => linha.trim().replace(/\s+/g, ""))  //tira os espaços
        .filter(linha => linha !== "");  //tira as linhas vazias
    return array;
}

export function lerRestricoes(array : string[]) : number{ // vai ver quantas restrições tem
    let contadorDeLinhas = 0;
    for(let i = 1; i < array.length; i++){  //pra começar direto na segunda linha
        if(array[i].includes(">=") || array[i].includes("<=")){
            contadorDeLinhas++;
        }
    }
    return contadorDeLinhas;
}

export function lerQuantidadeX(array : string[]) : [number, string]{ 
    let contadorDeX = 0; //vai ver quantos X tem na primeira linha
    for(let i = 0; i < array[0].length; i++){
        if(array[0][i] === "x"){
            contadorDeX++;
        }
    }
    
    let tipoOtimizacao: string;  //vai ver se é max ou min
    if(array[0].toLocaleLowerCase().startsWith("max")){
        tipoOtimizacao = "max";
        contadorDeX--;  // tira um x, pq max tem x, né
    }else{
        tipoOtimizacao = "min";
    }
    return [contadorDeX, tipoOtimizacao];
}

export function adicionarVariaveis(array : string[], contadorDeX: number) : number[]{ 
    let indiceVariavelArtificial = contadorDeX + 1;  // começa a numerar depois das variaveis que já tem
    const valoresDesigualdade : number[] = [];  

    for(let i = 1; i < array.length; i++){  
        if(array[i].includes(">=")){
            const [esquerda, direita] = array[i].split(">=");
            valoresDesigualdade.push(eval(direita));
            array[i] = `${esquerda}-x${indiceVariavelArtificial}>=${direita}`;
            indiceVariavelArtificial++;
        }else if(array[i].includes("<=")){
            const [esquerda, direita] = array[i].split("<=");
            valoresDesigualdade.push(eval(direita));
            array[i] = `${esquerda}+x${indiceVariavelArtificial}<=${direita}`;
            indiceVariavelArtificial++;
        }else if(array[i].includes("=")){ 
            const [esquerda, direita] = array[i].split("=");
            valoresDesigualdade.push(eval(direita));
        }
    }
    return valoresDesigualdade;
}

export function preencherMatriz(array : string[], contadorDeX : number, contadorDeLinhas : number) : [number[][], number[]]{
    const matrizCompleta: number[][] = Array(array.length - 1) //aqui vai criar a matriz no tamanho certin
        .fill(0)
        .map(() => Array(contadorDeX + contadorDeLinhas).fill(0));
    
    const regex = /([+-]?\d*\.?\d*)\*?x(\d+)/g; // regex pra pegar os numeros
    const vetorExpressaoPrincipal : number[] = []; 

    for(let i = 0; i < array.length; i++){
        const expr = array[i];
        let match: RegExpExecArray | null;

        while((match = regex.exec(expr)) !== null){
            let coef = match[1];
            const xIndex = parseInt(match[2]) - 1;
            
            if(coef === "" || coef === "+"){ // vai pegar os lugares onde estiver só x/-x e colocar 1/-1
                coef = "1";
            }else if(coef === "-"){
                coef = "-1";
            }
            
            if(i === 0){// ve se é a função objetivo no lugar das restrições
                vetorExpressaoPrincipal.push(parseFloat(coef));
            }else{
                matrizCompleta[i - 1][xIndex] = parseFloat(coef); // se não só taca nas restrições
            }
        }
    }

    for(let i = 0; i < contadorDeLinhas; i++){// vai encher de zero no resto, ebaaa
        vetorExpressaoPrincipal.push(0);
    }
    return [matrizCompleta, vetorExpressaoPrincipal];
}