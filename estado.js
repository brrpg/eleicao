// Função para verificar se o link atual corresponde ao link da página
function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('header a'); // Seleciona todos os links dentro do elemento nav

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('fw-bold'); // Adiciona a classe 'fw-bold' para o link ativo
        } else {
            link.classList.remove('fw-bold'); // Remove a classe 'fw-bold' dos outros links
        }
    });
}

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

    // Limpar os dados exibidos anteriormente
    listaEleicaoDiv.innerHTML = '';
    cardsContainer.innerHTML = '';
    porcentagemDiv.innerHTML = '';
    barraDiv.style.width = '0%';
    dataHoraDiv.innerHTML = '';

    // Verifica se o estado está presente nos dados
    const estadoVotoNuloBranco = data.find(item => item.EstadoVotoNuloBranco === estado);
    if (!estadoVotoNuloBranco) {
        listaEleicaoDiv.innerHTML = `<div>Nenhum dado encontrado para ${estado.toUpperCase()}.</div>`;
        return;
    }

    // Obtém a porcentagem de apuração do estado
    const porcentagemEstado = estadoVotoNuloBranco.Porcentagem ? parseFloat(estadoVotoNuloBranco.Porcentagem) : 0;
    console.log(porcentagemEstado);

    // Obtém dados globais e valida VotoNuloBranco
    const globalData = data[0]; // Presumindo que a primeira entrada contém os dados globais
    const votoNuloBranco = estadoVotoNuloBranco.VotoNuloBranco ? parseInt(estadoVotoNuloBranco.VotoNuloBranco.replace(/\./g, '')) || 0 : 0;

    // Filtra candidatos do estado
    const candidatos = data.filter(item => item.Estado === estado);
    if (candidatos.length === 0) {
        listaEleicaoDiv.innerHTML = `<div>Nenhum dado encontrado para ${estado.toUpperCase()}.</div>`;
        return;
    }

    // Soma os votos de todos os candidatos do estado
    const totalVotos = candidatos.reduce((sum, candidate) => sum + (parseInt(candidate.Voto.replace(/\./g, '')) || 0), 0);
    console.log('Total de Votos:', totalVotos);

    // Total de votos com nulos e brancos
    const totalVotos1 = totalVotos + votoNuloBranco;

    // Exibe as informações do estado
    listaEleicaoDiv.innerHTML = ` 
        <div><strong>Estado:</strong> ${estado.toUpperCase()}</div>
        <div><strong>Votos Totais:</strong> ${totalVotos1.toLocaleString('pt-BR')}</div>
        <div><strong>Votos Nulos/Brancos:</strong> ${votoNuloBranco.toLocaleString('pt-BR')}</div>
        <div><strong>Votos Válidos:</strong> ${totalVotos.toLocaleString('pt-BR')}</div>
    `;

    // Criação do HTML para cada candidato e cálculo da porcentagem
    const candidatosHTML = candidatos.map(candidate => {
        const votosCandidato = parseInt(candidate.Voto.replace(/\./g, '')) || 0;
        const porcentagem = totalVotos > 0 ? ((votosCandidato / totalVotos) * 100).toFixed(2) : '0.00'; // Garante duas casas decimais
    
        return {
            nome: candidate.Candidato,
            cor: candidate.CandidatoCor,
            porcentagem: porcentagem, // Já formatado com duas casas decimais
            imagem: candidate.Imagem,
            votos: candidate.Voto,
            status: candidate.Status || '',
            statuscor: candidate.StatusCor || ''
        };
    }).sort((a, b) => b.porcentagem - a.porcentagem);
    
    // Adiciona os candidatos ao container de cards
    cardsContainer.innerHTML = candidatosHTML.map(candidate => `
        <div class="card my-3">
            ${candidate.status ? 
                `<div class="card-header bg-${candidate.statuscor === 'verde' ? 'success' : candidate.statuscor === 'vermelho' ? 'danger' : 'primary'} text-white montserrat">
                    <p class="m-0">${candidate.status}</p>
                </div>` 
                : ''
            }
            <div class="row card-body g-0">
                <div class="col-md-4 imagem">
                    <img src="${candidate.imagem}" class="img-fluid rounded-circle" alt="${candidate.nome}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <div class="d-flex">
                            <h2 class="card-title poppins align-content-center">${candidate.nome}</h2>
                            <div class="ms-auto">
                                <h3 class="card-title poppins mb-0">${candidate.porcentagem}%</h3> <!-- Porcentagem com duas casas decimais -->
                                <h5 class="text-end me-2 fw-light">${candidate.votos}</h5>
                            </div>
                        </div>
                        <div class="mt-2 progress" style="height: 3px" role="progressbar" aria-label="Progresso do candidato" aria-valuenow="${candidate.porcentagem}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: ${candidate.porcentagem}%; background-color: ${candidate.cor};"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Atualiza as divs globais com dados específicos do estado
    porcentagemDiv.innerHTML = porcentagemEstado + '%';
    barraDiv.style.width = porcentagemEstado + '%';
    dataHoraDiv.innerHTML = globalData.DataHora;

    // Colorir o mapa com base nas porcentagens dos candidatos
    const proporcoes = {};
    candidatos.forEach(candidate => {
        const votes = parseInt(candidate.Voto.replace(/\./g, '')) || 0;
        const percentage = (votes / totalVotos) * 100;
        if (candidate.CandidatoCor) {
            proporcoes[candidate.CandidatoCor] = (proporcoes[candidate.CandidatoCor] || 0) + percentage;
        }
    });

    // Encontrar a cor com a maior porcentagem
    const maxCor = Object.keys(proporcoes).reduce((a, b) => proporcoes[a] > proporcoes[b] ? a : b, '');

    // Identificação do SVG correto
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
    
    // Verifique se há um hash na URL e exiba os votos correspondentes
    const hash = window.location.hash.substring(1); // Remove o '#'
    if (hash) {
        displayVotes(data, hash); // Exibe a div de acordo com o hash da URL
    } else {
        displayVotes(data, 'sp'); // Caso não haja hash, exibe São Paulo por padrão
    }

    // Adicionar eventos de clique para os botões
    document.getElementById('btn-sp').addEventListener('click', () => {
        window.location.hash = 'sp'; // Atualiza o hash para 'sp'
        displayVotes(data, 'sp'); // Exibe votos de SP
    });
    document.getElementById('btn-sc').addEventListener('click', () => {
        window.location.hash = 'sc'; // Atualiza o hash para 'sc'
        displayVotes(data, 'sc'); // Exibe votos de SC
    });
    document.getElementById('btn-pe').addEventListener('click', () => {
        window.location.hash = 'pe'; // Atualiza o hash para 'pe'
        displayVotes(data, 'pe'); // Exibe votos de PE
    });
    document.getElementById('btn-go').addEventListener('click', () => {
        window.location.hash = 'go'; // Atualiza o hash para 'go'
        displayVotes(data, 'go'); // Exibe votos de GO
    });
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

document.addEventListener("DOMContentLoaded", function () {
    const botoes = document.querySelectorAll(".nav button");
    const divs = document.querySelectorAll("div[id^='sp'], div[id^='sc'], div[id^='pe'], div[id^='go']"); // Seleciona as divs com id correspondente
    const title = document.getElementById("title");

    // Função para mostrar a div correspondente ao hash
    function mostrarDiv(id) {
        // Oculta todas as divs
        divs.forEach((div) => {
            div.style.display = "none";
        });

        // Exibe a div correspondente ao ID
        const targetDiv = document.getElementById(id);
        if (targetDiv) {
            targetDiv.style.display = "block";
        }

        // Altera o título com base no botão correspondente ao ID
        const botao = document.querySelector(`button[data-target="${id}"]`);
        if (botao) {
            const novoTitulo = botao.getAttribute("data-titulo");
            title.textContent = novoTitulo;
        }
    }

    // Função para mostrar o mapa correspondente
    function mostrarMapa(estado) {
        // Oculta todos os mapas
        document.querySelectorAll("object[type='image/svg+xml']").forEach(obj => obj.style.display = "none");

        // Exibe o mapa correspondente ao estado
        const mapa = document.getElementById(`mapa${estado === 'sp' ? '0' : estado === 'sc' ? '1' : estado === 'pe' ? '2' : '3'}`);
        if (mapa) {
            mapa.style.display = "block";
        }
    }

    // Verifica o hash da URL ao carregar a página
    const hash = window.location.hash.substring(1); // Remove o '#'
    if (hash) {
        mostrarDiv(hash); // Se houver hash na URL, chama a função para mostrar a div correspondente
        mostrarMapa(hash); // Mostra o mapa correspondente
    } else {
        mostrarDiv("sp"); // Se não houver hash, exibe a primeira div por padrão (ou outra que você desejar)
        mostrarMapa("sp"); // Exibe o mapa de São Paulo por padrão
    }

    // Configura o evento de clique nos botões
    botoes.forEach((botao) => {
        botao.addEventListener("click", () => {
            const targetId = botao.getAttribute("data-target");

            // Altera o hash na URL para refletir a div selecionada
            if (window.location.hash !== `#${targetId}`) {
                window.location.hash = targetId; // Atualiza o hash na URL
            }
            mostrarDiv(targetId); // Mostra a div correspondente ao botão
            mostrarMapa(targetId); // Exibe o mapa correspondente ao botão
        });
    });

    // Monitora mudanças no hash para garantir que, ao voltar ou avançar no histórico, a div correta seja exibida
    window.addEventListener('hashchange', function() {
        const newHash = window.location.hash.substring(1);
        mostrarDiv(newHash); // Exibe a div correspondente ao novo hash
        mostrarMapa(newHash); // Exibe o mapa correspondente ao novo hash
    });
});
