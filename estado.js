document.addEventListener("DOMContentLoaded", function() {
    const botoes = document.querySelectorAll(".nav button");
    const mapas = document.querySelectorAll("#mapas object");

    botoes.forEach((botao, index) => {
        botao.addEventListener("click", () => {
            // Oculta todos os mapas
            mapas.forEach((mapa) => {
                mapa.style.display = "none";
            });

            // Exibe o mapa correspondente ao botão clicado
            mapas[index].style.display = "block";

            // Obtém o valor do atributo data-titulo do botão clicado
            const novoTitulo = botao.getAttribute('data-titulo');
            // Altera o conteúdo do h3 com o ID 'title'
            document.getElementById('title').textContent = novoTitulo;
        });
    });
});

// Função para buscar dados da planilha
async function fetchData() {
    try {
        const response = await fetch('https://opensheet.elk.sh/1T_r486_3eFo3izRUVLrW8r6vEBAGMsVkvAIWN872C80/Estado');
        if (!response.ok) {
            throw new Error('Erro na rede');
        }
        const data = await response.json();
        console.log('Dados recebidos:', data); // Log dos dados para verificar

        // Aqui você deve garantir que os dados são válidos antes de prosseguir
        if (!data || typeof data !== 'object' || !Array.isArray(data)) {
            throw new Error('Dados inválidos recebidos');
        }

        return data; // Retorna os dados válidos
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
}


function colorirSVG(svgElement) {
    try {
        const elements = svgElement.querySelectorAll('seletor'); // Verifique se svgElement é um elemento SVG
        // Lógica para colorir elementos
    } catch (error) {
        console.error('Erro ao colorir o SVG:', error);
    }
}


// Função para exibir os votos
function displayVotes(data, estado) {
    if (!data || !estado) {
        console.error('Dados ou estado inválido:', data, estado);
        return;
    }

    const listaEleicaoDiv = document.getElementById('lista-eleicao');
    const cardsContainer = document.getElementById('cards-container');
    const porcentagemDiv = document.getElementById('porcentagem');
    const barraDiv = document.getElementById('barra');
    const dataHoraDiv = document.getElementById('data-hora');

    // Verifica se o estado é válido
    const estadoVotoNuloBranco = data.find(item => item.EstadoVotoNuloBranco === estado);
    if (!estadoVotoNuloBranco) {
        listaEleicaoDiv.innerHTML = `<div>Nenhum dado encontrado para ${estado.toUpperCase()}.</div>`;
        return;
    }

    const globalData = data[0]; // Presumindo que a primeira entrada contém os dados globais
    const votoNuloBranco = parseInt(estadoVotoNuloBranco.VotoNuloBranco) || 0;

    // Filtra candidatos do estado
    const candidatos = data.filter(item => item.Estado === estado);

    if (candidatos.length === 0) {
        listaEleicaoDiv.innerHTML = `<div>Nenhum dado encontrado para ${estado.toUpperCase()}.</div>`;
        return;
    }

    // Soma os votos de todos os candidatos do estado
    const totalVotos = candidatos.reduce((sum, candidate) => sum + (parseInt(candidate.Voto.replace(/\./g, '')) || 0), 0);

    // Exibe as informações do estado
    listaEleicaoDiv.innerHTML = `
        <div><strong>Estado:</strong> ${estado.toUpperCase()}</div>
        <div><strong>Votos Totais:</strong> ${totalVotos.toLocaleString('pt-BR')}</div>
        <div><strong>Votos Nulos/Brancos:</strong> ${votoNuloBranco.toLocaleString('pt-BR')}</div>
        <div><strong>Votos Válidos:</strong> ${(totalVotos - votoNuloBranco).toLocaleString('pt-BR')}</div>
    `;

    // Cria o HTML para cada candidato e calcula porcentagem
    const candidatosHTML = candidatos.map(candidate => {
        const votosCandidato = parseInt(candidate.Voto.replace(/\./g, '')) || 0;
        const porcentagem = totalVotos > 0 ? ((votosCandidato / totalVotos) * 100).toFixed(2) : 0;
        return {
            nome: candidate.Candidato,
            cor: candidate.CandidatoCor,
            porcentagem: parseFloat(porcentagem), // Converter para float para ordenação
            imagem: candidate.Imagem,
            votos: candidate.Voto
        };
    }).sort((a, b) => b.porcentagem - a.porcentagem); // Ordena em ordem decrescente pela porcentagem

    // Adiciona os candidatos ao container de cards
    cardsContainer.innerHTML = candidatosHTML.map(candidate => `
        <div class="card my-3">
            <div class="row card-body g-0">
                <div class="col-md-4 imagem">
                    <img src="${candidate.imagem}" class="img-fluid rounded-circle">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <div class="d-flex">
                            <h2 class="card-title poppins align-content-center">${candidate.nome}</h2>
                            <div class="ms-auto">
                                <h3 class="card-title poppins mb-0">${candidate.porcentagem}%</h3>
                                <h5 class="text-end me-2 fw-light">${candidate.votos}</h5>
                            </div>
                        </div>
                        <div class="mt-2 progress" style="height: 3px" role="progressbar" aria-label="Basic example" aria-valuenow="${candidate.porcentagem}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: ${candidate.porcentagem}%; background-color: ${candidate.cor};"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Atualiza a div#porcentagem, div#barra e div#data-hora com os dados globais
    porcentagemDiv.innerHTML = globalData.Porcentagem + '%';
    barraDiv.style.width = globalData.Porcentagem + '%';
    dataHoraDiv.innerHTML = globalData.DataHora;

    // Colorir o mapa baseado nos candidatos
    const proporcoes = {};
    candidatos.forEach(candidate => {
        const votes = parseInt(candidate.Voto.replace(/\./g, '')) || 0;
        const percentage = (votes / totalVotos) * 100;
        if (candidate.CandidatoCor) {
            proporcoes[candidate.CandidatoCor] = (proporcoes[candidate.CandidatoCor] || 0) + percentage;
        }
    });

    // Encontrar a cor com a maior porcentagem
    let maxCor = Object.keys(proporcoes).reduce((a, b) => proporcoes[a] > proporcoes[b] ? a : b);

    // Colorir o SVG do mapa
    const idMapa = `mapa${estado === 'sp' ? '0' : estado === 'sc' ? '1' : estado === 'pe' ? '2' : '3'}`;
    const svgElement = document.getElementById(idMapa);

    if (svgElement) {
        svgElement.addEventListener("load", function() {
            const svgDoc = this.contentDocument;
            colorirSVG(svgDoc.querySelector("svg"), proporcoes, maxCor, estado, data);
        });
    } else {
        console.error(`Elemento SVG com ID '${idMapa}' não encontrado.`);
    }
}


// Função para colorir os paths em cada SVG
function colorirSVG(svgElement, proporcoes, corMax, estado, data) {
    if (!svgElement) {
        console.error("Elemento SVG não encontrado.");
        return;
    }

    const paths = Array.from(svgElement.querySelectorAll("path"));
    const totalPaths = paths.length;

    // Aplica a cor de acordo com a proporção
    let index = 0;
    for (const [cor, porcentagem] of Object.entries(proporcoes)) {
        const count = Math.floor(totalPaths * (porcentagem / 100));
        for (let i = 0; i < count; i++) {
            if (index < totalPaths) {
                paths[index].setAttribute("fill", cor);
                index++;
            }
        }
    }

    // Preenche o restante com a cor do candidato com a maior porcentagem
    while (index < totalPaths) {
        paths[index].setAttribute("fill", corMax); // Preenche o restante com a cor do candidato mais forte
        index++;
    }

    // Pintar cidades específicas com cores da planilha
    const cidades = {
        sp: { id: 'cidadesp' },
        sc: { id: 'cidadesc' },
        pe: { id: 'cidadepe' },
        go: { id: 'cidadego' }
    };

    if (cidades[estado]) {
        const { id } = cidades[estado];
        const cidadeCor = getColorForCity(id, data); // Obtém a cor da cidade da planilha
        const cidadePath = svgElement.querySelector(`#${id}`);
        if (cidadePath) {
            cidadePath.setAttribute("fill", cidadeCor);
        }
    }

    // Alterar stroke e stroke-width
    alterarStroke(svgElement);
}

// Função para obter a cor da cidade a partir dos dados da planilha
function getColorForCity(cityId, data) {
    const cityData = data.find(item => item.Cidade === cityId);
    return cityData ? cityData.CidadeCor : '#000000'; // Retorna preto se a cor não for encontrada
}

// Função para alterar o stroke e stroke-width
function alterarStroke(svgElement) {
    const paths = svgElement.querySelectorAll("path");
    paths.forEach(path => {
        path.setAttribute("stroke", "#fff"); // Define a cor do stroke como preto
        path.setAttribute("stroke-width", "0.25"); // Define a largura do stroke
    });
}


// Função para exibir os votos totais ao carregar a página
async function init() {
    const data = await fetchData();
    // Exibir votos totais (de SP por exemplo)
    displayVotes(data, 'sp');

    // Adicionar eventos de clique para os botões
    document.getElementById('btn-sp').addEventListener('click', () => displayVotes(data, 'sp'));
    document.getElementById('btn-sc').addEventListener('click', () => displayVotes(data, 'sc'));
    document.getElementById('btn-pe').addEventListener('click', () => displayVotes(data, 'pe'));
    document.getElementById('btn-go').addEventListener('click', () => displayVotes(data, 'go'));

    // Ativar o botão SP ao carregar a página
    const spButton = document.getElementById('btn-sp');
    spButton.click(); // Simula um clique no botão SP para ativar e mostrar o mapa
}

// Chama a função de inicialização ao carregar a página
init();

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
