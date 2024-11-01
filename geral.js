async function fetchData() {
    const url = 'https://opensheet.elk.sh/1T_r486_3eFo3izRUVLrW8r6vEBAGMsVkvAIWN872C80/Presidente';

    try {
        // Fetch dos dados
        const response = await fetch(url);
        const data = await response.json();

        // Funções para exibir os dados
        displayPercent(data);
        displayDataHora(data);
        displayElectionInfo(data);
        createCards(data);
        colorMap(data);

    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
}

let clickCount = 0; // Contador de cliques
let timer; // Timer para gerenciar o intervalo

document.getElementById('refresh-button').addEventListener('click', () => {
    fetchData(); // Chama a função de buscar dados

    clickCount++; // Incrementa o contador de cliques

    // Se um timer já estiver ativo, não faz nada
    if (!timer) {
        // Inicia um novo timer que redefine o contador após 2 segundos
        timer = setTimeout(() => {
            clickCount = 0; // Reseta o contador
            timer = null; // Limpa o timer
        }, 2000); // 2000 milissegundos (2 segundos)
    }

    // Se o contador atingir 3 cliques
    if (clickCount === 3) {
        Swal.fire({
            title: "Pare!",
            text: "Você clicou muitas vezes no botão atualizar",
            icon: "warning",
            showConfirmButton: false,
            timer: 3500
        });
        clickCount = 0; // Reseta o contador após mostrar o alerta
        clearTimeout(timer); // Limpa o timer
        timer = null; // Reseta o timer
        
        // Congela o botão
        const refreshButton = document.getElementById('refresh-button');
        refreshButton.disabled = true; // Desabilita o botão

        // Reabilita o botão após 5 segundos (5000 milissegundos)
        setTimeout(() => {
            refreshButton.disabled = false; // Reabilita o botão
        }, 5000); // Tempo de congelamento em milissegundos
    }
});


// Exibe a porcentagem e ajusta a largura da barra
function displayPercent(data) {
    const percentCalcText = document.getElementById('porcentagem');
    const percentCalc = document.getElementById('barra');

    // Limpa o conteúdo anterior
    percentCalcText.innerHTML = '';
    
    // Verifica se há dados na coluna "Porcentagem"
    if (data.length > 0 && data[0].Porcentagem !== undefined) {
        const porcentagem = parseFloat(data[0].Porcentagem);

        // Verifique o valor no console
        console.log("Porcentagem obtida:", porcentagem);

        // Define o texto na div
        percentCalcText.innerHTML = `${porcentagem}%`;

        // Altera o width da barra com o valor da porcentagem, incluindo "%"
        percentCalc.style.width = `${porcentagem}%`;

    } else {
        console.warn("Porcentagem não encontrada ou dados insuficientes.");
    }
}

// Exibe a data e hora
function displayDataHora(data) {
    const dataHoraDiv = document.getElementById('data-hora');
    if (data.length > 0 && data[0].DataHora) {
        dataHoraDiv.innerHTML = `${data[0].DataHora}`;
    }
}

// Exibe informações da eleição (Votos Totais, Nulos/Brancos, e Válidos)
function displayElectionInfo(data) {
    const listaEleicaoDiv = document.getElementById('lista-eleicao');
    if (data.length > 0) {
        const votoTotal = parseInt(data[0].VotoTotal, 10) || 0;
        const votoNuloBranco = parseInt(data[0].VotoNuloBranco, 10) || 0;
        const votosValidos = votoTotal - votoNuloBranco;

        listaEleicaoDiv.innerHTML = `
            <div><strong>Votos Totais:</strong> ${votoTotal}</div>
            <div><strong>Votos Nulos/Brancos:</strong> ${votoNuloBranco}</div>
            <div><strong>Votos Válidos:</strong> ${votosValidos}</div>
        `;
    }
}

function createCards(data) {
    const container = document.getElementById('cards-container');
    container.innerHTML = ''; // Limpa o contêiner antes de adicionar novos cards

    // Ordena os candidatos em ordem decrescente com base no número de votos
    data.sort((a, b) => parseInt(b.Voto) - parseInt(a.Voto));

    data.forEach(candidate => {
        // Verifica se todos os campos têm valor (não estão vazios ou indefinidos)
        if (
            candidate.Candidato && candidate.Partido && candidate.Imagem &&
            candidate.CandidatoCor && candidate.Voto && candidate.CandidatoPorcentagem
        ) {
            // Substitui a vírgula por ponto na porcentagem
            const porcentagem = candidate.CandidatoPorcentagem.replace(',', '.');

            // Cria o card com HTML dinâmico
            const cardHTML = `
                <div class="card my-3">
                    <div class="row card-body g-0">
                        <div class="col-md-4 imagem">
                            <img src="${candidate.Imagem}" class="img-fluid rounded-circle">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <div class="d-flex">
                                    <h2 class="card-title poppins align-content-center">${candidate.Candidato}</h2>
                                    <div class="ms-auto">
                                        <h3 class="card-title poppins mb-0">${porcentagem}%</h3>
                                        <h5 class="text-end me-2 fw-light">${candidate.Voto} votos</h5>
                                    </div>
                                </div>
                                <div class="mt-2 progress" style="height: 3px" role="progressbar" aria-label="Basic example" aria-valuenow="${porcentagem}" aria-valuemin="0" aria-valuemax="100">
                                    <div class="progress-bar" style="width: ${porcentagem}%; background-color: ${candidate.CandidatoCor};"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Converte a string HTML para elementos reais e adiciona ao contêiner
            container.insertAdjacentHTML('beforeend', cardHTML);
        }
    });
}

function colorMap(data) {
    data.forEach(item => {
        // Confirma se as chaves correspondem aos nomes na planilha
        //console.log(item); // Log para visualizar cada item retornado
        
        const estado = item.Estados; // Acessa a coluna de Estados
        const estadoCor = item.EstadosCor; // Acessa a coluna de EstadosCor

        // Garante que o estado e a cor estão preenchidos
        if (estado && estadoCor) {
            // Formata o id do path e do círculo
            const stateId = estado.toLowerCase() + 'path'; // Converte o nome do estado para minúsculas e adiciona "path"
            const circleId = estado.toLowerCase() + 'circle'; // Converte o nome do estado para minúsculas e adiciona "circle"
            
            // Seleciona o path pelo id
            const statePath = document.getElementById(stateId);
            const stateCircle = document.getElementById(circleId); // Seleciona o círculo pelo id
            //console.log(`Tentando colorir o estado: ${stateId} com a cor: ${estadoCor}`); // Log para depuração

            if (statePath) {
                // Define a cor de preenchimento usando a propriedade CSS
                statePath.style.setProperty('fill', estadoCor, 'important');
                //console.log(`Cor aplicada com sucesso a ${stateId}`); // Confirmação de sucesso
            } else {
                console.warn(`Elemento não encontrado: ${stateId}`); // Aviso se o elemento não for encontrado
            }

            if (stateCircle) {
                // Define a cor de preenchimento para o círculo se existir
                stateCircle.style.setProperty('fill', estadoCor, 'important');
                stateCircle.style.setProperty('stroke','#ffffff', 'important');
                //console.log(`Cor aplicada com sucesso ao círculo: ${circleId}`); // Confirmação de sucesso
            } else {
                //console.warn(`Elemento não encontrado: ${circleId}`); // Aviso se o círculo não for encontrado
            }
        } else {
            console.warn(`Dados inválidos: Estado: ${estado}, Cor: ${estadoCor}`); // Aviso para dados inválidos
        }
    });
}

// Chama a função para buscar dados ao carregar a página
fetchData();
