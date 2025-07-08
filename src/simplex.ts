import { criarMatrizInversa, criarMatrizIdentidade } from "./inversa";
import { multiplicaMatriz } from "./mult";

export function faseI(matrizCompleta : number[][], valoresDesigualdade : number[], vetorExpressaoPrincipal : number[], tipoOtimizacao : string) : [number, number[], number] | null{
    
    const m = matrizCompleta.length; // numero das restrições
    const n = matrizCompleta[0].length; 
    const matrizComArtificiais = matrizCompleta.map((linha, i) => { // vai adcionar as variaveis artificiais para cada restrição
        const artificiais = Array(m).fill(0);
        artificiais[i] = 1; 
        return [...linha, ...artificiais];
    });
    const expressaoArtificial = Array(n).fill(0).concat(Array(m).fill(1)); //minimiza a soma das variaveis artificiais
    const colunasParaBasica: number[] = [];// configura as colunas basicas n basicas
   
    const colunasParaNaoBasica: number[] = [];
    for(let i = 0; i < n + m; i++){
        if (i >= n) colunasParaBasica.push(i);
        else colunasParaNaoBasica.push(i);
    }
    
    const matrizBasica = matrizComArtificiais.map(linha => colunasParaBasica.map(i => linha[i]));//vai tirar as submatrizes basica e n basicas
    const matrizNaoBasica = matrizComArtificiais.map(linha => colunasParaNaoBasica.map(i => linha[i]));

    // executa a fase 2
    const resultadoFase1 = faseII(matrizComArtificiais, matrizBasica, colunasParaBasica, matrizNaoBasica, colunasParaNaoBasica, valoresDesigualdade, expressaoArtificial, "min");

    if(resultadoFase1 === null || resultadoFase1[0] > 1e-6){ //ve se achou um valor otimo
        console.log("Problema inviável. Não existe solução básica viável inicial.");
        return null;
    }

    const matrizSemArtificiais = matrizComArtificiais.map(linha => linha.slice(0, n));//vai tirar as variaveis artificiais para iniciar a fase2

    let novaColunasParaBasica = colunasParaBasica.filter(c => c < n); //vai ter a matriz original aqui
    let novaColunasParaNaoBasica = colunasParaNaoBasica.filter(c => c < n);
    
    while(novaColunasParaBasica.length < m){ //completar a base se precisar
        const candidato = novaColunasParaNaoBasica.shift();
        if(candidato !== undefined) novaColunasParaBasica.push(candidato);
    }

    // arruma a novas submatrizes para a fase2
    const novaMatrizBasica = matrizSemArtificiais.map(linha => novaColunasParaBasica.map(i => linha[i]));
    const novaMatrizNaoBasica = matrizSemArtificiais.map(linha => novaColunasParaNaoBasica.map(i => linha[i]));

    // a tal da fase 2 com problema original
    return faseII( matrizSemArtificiais, novaMatrizBasica, novaColunasParaBasica, novaMatrizNaoBasica, novaColunasParaNaoBasica, valoresDesigualdade, vetorExpressaoPrincipal, tipoOtimizacao);
    }

// fase2 implementação do metodo pra otimização
export function faseII(matrizCompleta : number[][], matrizBasica : number[][], colunasParaBasica : number[], matrizNaoBasica : number[][], colunasParaNaoBasica : number[], valoresDesigualdade : number[], vetorExpressaoPrincipal : number[], tipoOtimizacao : string, iteracao : number = 1) : [number, number[], number] | null{
    
    if(iteracao >= 100){ //limite das iterações, para nao ter um loop sem fim
        console.log("Número máximo de iterações atingido");
        return null;
    }

    const inversaBasica = criarMatrizInversa(matrizBasica, criarMatrizIdentidade(matrizBasica)); //calcula a matriz inversa da base q ta
    if(!inversaBasica){
        console.log("Matriz básica não é invertível");
        return null;
    }

    // vai calcular a solução basica atual agui
    const vetorB = valoresDesigualdade.map(i => [i]); // converte de matriz para coluna
    const xBasico = multiplicaMatriz(inversaBasica, vetorB);
    const custoBasico = [colunasParaBasica.map(i => vetorExpressaoPrincipal[i])];  // calcula o vetor de custos basicos e multiplica por B⁻¹ para obter yᵀ
    const yt = multiplicaMatriz(custoBasico, inversaBasica);
    const custoNaoBasico = [colunasParaNaoBasica.map(i => vetorExpressaoPrincipal[i])];
    // extrai submatriz n basica da matriz completa
    const aNj = Array(matrizCompleta.length).fill(0).map(() => Array(colunasParaNaoBasica.length).fill(0));
    for(let i = 0; i < matrizCompleta.length; i++){
        for(let j = 0; j < colunasParaNaoBasica.length; j++){
            aNj[i][j] = matrizCompleta[i][colunasParaNaoBasica[j]];
        }
    }
    
    const multiplicacao = multiplicaMatriz(yt, aNj); // calcula custos relativos
    const custoRelativo: number[] = [];
    for(let i = 0; i < custoNaoBasico[0].length; i++){
        custoRelativo.push(custoNaoBasico[0][i] - multiplicacao[0][i]);
    }

    const indiceVariavelEntrada = custoRelativo.indexOf(Math.min(...custoRelativo)); // encontra a variavel para entrar na base de menor custo
    const variavelEntrada = Math.min(...custoRelativo);

    if(variavelEntrada >= 0){ //criterio de parada
        let valorOtimo = 0;
        for(let i = 0; i < custoBasico[0].length; i++){
            valorOtimo += custoBasico[0][i] * xBasico[i][0];
        }
        if(tipoOtimizacao === "max"){
            valorOtimo *= -1;
        }

        const vetorSolucao = Array(vetorExpressaoPrincipal.length).fill(0); //constroi vetor solução inteiro
        for(let i = 0; i < xBasico.length; i++){
            const indiceVariavel = colunasParaBasica[i];
            vetorSolucao[indiceVariavel] = xBasico[i][0];
        }
        return [valorOtimo, vetorSolucao, iteracao];
    }
    const aNk = aNj.map(linha => [linha[indiceVariavelEntrada]]);// Direção simplex
    const y = multiplicaMatriz(inversaBasica, aNk);

    if(y.every((elemento : number[]) => elemento[0] <= 0)){ //ve se o problema é ilimitado
        console.log("Problema não tem solução ótima finita");
        return null;
    }

    let epsilon = Infinity; // calcula a razao min para a determinar a variavel q vai sair
    let indiceSaida = -1;
    for(let i = 0; i < y.length; i++){
        if(y[i][0] > 0){
            const razao = xBasico[i][0] / y[i][0];
            if(razao < epsilon){
                epsilon = razao;
                indiceSaida = i;
            }
        }
    }
    const entrando = colunasParaNaoBasica[indiceVariavelEntrada]; //vai fazer a troca de base aqui
    const saindo = colunasParaBasica[indiceSaida];
    colunasParaBasica[indiceSaida] = entrando;
    colunasParaNaoBasica[indiceVariavelEntrada] = saindo;

    // vai atualizar as submatrizes basicas e n basicas
    const novaMatrizBasica = matrizCompleta.map(linha => colunasParaBasica.map(i => linha[i]));
    const novaMatrizNaoBasica = matrizCompleta.map(linha => colunasParaNaoBasica.map(i => linha[i]));

    return faseII(matrizCompleta, novaMatrizBasica, colunasParaBasica, novaMatrizNaoBasica, colunasParaNaoBasica, valoresDesigualdade, vetorExpressaoPrincipal, tipoOtimizacao, iteracao + 1);
}

// função pra ajudar o problema e verificar se precisa de fase 1
export function verificaFaseI(array : string[], vetorExpressaoPrincipal : number[], valoresDesigualdade : number[], matrizCompleta : number[][]) : [boolean, number[], number[][]]{
    if(array[0].toLowerCase().startsWith("max")){ //vai converter de max para min (*-1)
        for(let i = 0; i < vetorExpressaoPrincipal.length; i++){
            vetorExpressaoPrincipal[i] *= -1;
        }
    }

    for(let i = 0; i < valoresDesigualdade.length; i++){ //garante que os lados direitos não sao negativos
        if(valoresDesigualdade[i] < 0){
            valoresDesigualdade[i] *= -1;
            for(let j = 0; j < matrizCompleta[i].length; j++){
                matrizCompleta[i][j] *= -1;
            }
        }
    }

    for(let i = 1; i < array.length; i++){ //ve se precisa da fase 1
        if(array[i].includes(">=") || array[i].includes(">")){
            return [true, vetorExpressaoPrincipal, matrizCompleta];
        }
        if(array[i].includes("=") && !array[i].includes(">=") && !array[i].includes("<=")){
            return [true, vetorExpressaoPrincipal, matrizCompleta];
        }
    }
    return [false, vetorExpressaoPrincipal, matrizCompleta];
}