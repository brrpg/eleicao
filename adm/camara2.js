let partidos = {}; // Mova a declaração de `partidos` para fora das funções para ser acessível em ambas

function calcularDistribuicao() {
    // Obtenha os dados de entrada do HTML
    const vagas = parseInt(document.getElementById("vagas").value);
    const nulosBrancos = parseInt(document.getElementById("nulosBrancos").value);
    const partidosNomes = [];
    partidos = {}; // Inicialize o objeto `partidos` aqui
    const nome = document.getElementById("titulo").value;

    // Coletar nomes, votos e cores de cada partido
    for (let i = 1; i <= 9; i++) {
        const nomePartido = document.getElementById(`partidoNome${i}`).value;
        const votos = parseInt(document.getElementById(`partido${i}`).value);
        const cor = document.getElementById(`partidoCor${i}`).value; // Coletar a cor
        partidosNomes.push(nomePartido);
        partidos[`partido${i}`] = { votos, cor, vagasObtidas: 0, QP: 0, QPInteiro: 0 }; // Adicionar cor ao objeto do partido
    }

    // Calcular votos totais e votos válidos
    const votosTotais = Object.values(partidos).reduce((acc, partido) => acc + partido.votos, 0) + nulosBrancos;
    const votosValidos = Object.values(partidos).reduce((acc, partido) => acc + partido.votos, 0);

    // Exibir informações iniciais no HTML
    document.getElementById("resultado").innerHTML = `
        <h5>${nome}</h5>
        <p class="mb-0"><strong>Quantidade de vagas:</strong> ${vagas}</p>
        <p class="mb-0"><strong>Votos válidos:</strong> ${votosValidos}</p>
        <p class="mb-0"><strong>Votos nulos/brancos:</strong> ${nulosBrancos}</p>
        <p class="mb-4"><strong>Votos totais:</strong> ${votosTotais}</p>
    `;

    // Calcular quociente eleitoral (QE)
    const QE = Math.floor(votosValidos / vagas);
    document.getElementById("resultado").innerHTML += `<p><strong>Quociente Eleitoral (QE):</strong> ${QE}</p>`;

    // Calcular quociente partidário (QP) e atribuir vagas iniciais
    let vagasDistribuidas = 0;
    let distribuicaoQP = `<h4>Quociente Partidário de cada partido:</h4><ul>`;

    for (let i = 1; i <= 9; i++) {
        const partido = partidos[`partido${i}`];
        partido.QP = partido.votos / QE;
        partido.QPInteiro = Math.floor(partido.QP);
        partido.vagasObtidas = partido.QPInteiro;
        vagasDistribuidas += partido.vagasObtidas;

        distribuicaoQP += `<li>${partidosNomes[i - 1]} com ${partido.votos} votos: QP completo = ${partido.QP.toFixed(2)}, QP inteiro (vagas iniciais) = ${partido.QPInteiro}</li>`;
    }

    distribuicaoQP += `</ul>`;

    let vagasRestantes = vagas - vagasDistribuidas;
    document.getElementById("resultado").innerHTML += `<p>Vagas restantes para distribuir (sobras): ${vagasRestantes}</p>`;

    let distribuicaoSobras = `<h4>Distribuição das Sobras:</h4><ol>`;

    // Distribuição de vagas restantes por sobras
    while (vagasRestantes > 0) {
        const partidosOrdenados = Object.values(partidos).sort((a, b) => {
            const mediaA = a.votos / (a.vagasObtidas + 1);
            const mediaB = b.votos / (b.vagasObtidas + 1);
            if (mediaA === mediaB) {
                return a.vagasObtidas - b.vagasObtidas; // Desempate pelo menor número de vagas ganhas
            }
            return mediaB - mediaA; // Ordem decrescente das médias
        });

        partidosOrdenados[0].vagasObtidas++;
        vagasRestantes--;

        const partidoIndex = Object.keys(partidos).find(key => partidos[key] === partidosOrdenados[0]);
        distribuicaoSobras += `<li>${partidosNomes[partidoIndex.replace('partido', '') - 1]} recebeu 1 vaga extra (Média: ${(partidosOrdenados[0].votos / (partidosOrdenados[0].vagasObtidas)).toFixed(2)} após receber a vaga)</li>`;
    }

    distribuicaoSobras += `</ol>`;

    let resultadoHTML = `<p>Total de vagas distribuídas: ${vagas}</p><ul>`;
    let somaCadeiras = [];

    for (let i = 1; i <= 9; i++) {
        const partido = partidos[`partido${i}`];
        resultadoHTML += `<li>${partidosNomes[i - 1]}: ${partido.vagasObtidas} vagas</li>`;
        somaCadeiras.push({
            partido: partidosNomes[i - 1],
            totalVagas: partido.vagasObtidas,
            cor: partido.cor
        });
    }

    resultadoHTML += `</ul>`;

    let resultadoSoma = `<h4>Total de vagas por partido:</h4><ul>`;
    somaCadeiras.forEach(item => {
        resultadoSoma += `<li>${item.partido}: ${item.totalVagas} vagas</li>`;
    });
    resultadoSoma += `</ul>`;

    document.getElementById("resultado").innerHTML += distribuicaoQP + distribuicaoSobras + resultadoSoma;

    // Atualizar o gráfico
    updateChart(somaCadeiras);
}

am4core.ready(function () {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create("chartdiv", am4charts.PieChart);
    chart.hiddenState.properties.opacity = 0; // cria um efeito fade-in inicial

    // Configuração do gráfico
    chart.radius = am4core.percent(70);
    chart.innerRadius = am4core.percent(40);
    chart.startAngle = 180;
    chart.endAngle = 360;

    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "totalVagas";
    series.dataFields.category = "partido";
    series.slices.template.propertyFields.fill = "cor"; // Define a cor a partir dos dados

    // Ocultar fatias com valor zero usando um adaptador
    series.slices.template.adapter.add("visible", function(visible, target) {
        return target.dataItem.value > 0;
    });

    // Mostrar % e quantidade de vagas
    series.slices.template.tooltipText = "{category}: [bold]{value} vagas ({value.percent.formatNumber('#.0')}%)";

    // Configura o rótulo para exibir % e quantidade de vagas
    series.labels.template.text = "{category}: {value} vagas ({value.percent.formatNumber('#.0')}%)";
    series.labels.template.disabled = false; // habilitar rótulos
    series.ticks.template.disabled = false; // habilitar ticks

    chart.legend = new am4charts.Legend();

    // Função para atualizar o gráfico
    window.updateChart = function (somaCadeiras) {
        chart.data = somaCadeiras.map(item => ({
            partido: item.partido,
            totalVagas: item.totalVagas,
            cor: item.cor // Cor definida pelo usuário
        }));
    }
}); // end am4core.ready()

function enviarParaPlanilha() {
    const vagas = parseInt(document.getElementById("vagas").value);
    const nulosBrancos = parseInt(document.getElementById("nulosBrancos").value);
    const partidos = [];
    let votosValidos = 0;

    for (let i = 1; i <= 9; i++) {
        const nomePartido = document.getElementById(`partidoNome${i}`).value;
        const votos = parseInt(document.getElementById(`partido${i}`).value);
        const cor = document.getElementById(`partidoCor${i}`).value;

        partidos.push({
            Partido: nomePartido,
            Votos: votos,
            Cor: cor,
            VagasObtidas: 0,
            Sobras: 0
        });

        votosValidos += votos;
    }

    const votosTotais = votosValidos + nulosBrancos;

    partidos.forEach(partido => {
        partido.VagasObtidas = Math.floor((partido.Votos / votosValidos) * vagas);
    });

    const vagasDistribuidas = partidos.reduce((total, partido) => total + partido.VagasObtidas, 0);
    const sobras = vagas - vagasDistribuidas;

    if (sobras > 0) {
        const votosPorVaga = partidos.map(partido => ({
            Partido: partido.Partido,
            Votos: partido.Votos - partido.VagasObtidas * (votosValidos / vagas)
        }));

        votosPorVaga.sort((a, b) => b.Votos - a.Votos);

        for (let i = 0; i < sobras; i++) {
            partidos.find(p => p.Partido === votosPorVaga[i % votosPorVaga.length].Partido).Sobras++;
        }
    }

    partidos.forEach(partido => {
        partido.VagasObtidas += partido.Sobras;
    });

    const data = {
        range: 'A1', // Altere para o intervalo desejado
        majorDimension: 'ROWS',
        values: [
            [
                "Deputado Vagas", "Deputado Votos Nulos/Brancos", "Deputado Votos Totais", "Deputado Votos Válidos"
            ],
            [
                vagas, nulosBrancos, votosTotais, votosValidos
            ],
            ...partidos.map(partido => ([
                partido.Partido,
                partido.Votos,
                partido.Cor,
                partido.VagasObtidas
            ]))
        ]
    };

    const sheetId = '1T_r486_3eFo3izRUVLrW8r6vEBAGMsVkvAIWN872C80'; // ID da sua planilha
    const apiKey = '8cce11023c3e0deaed4eba785fd6de9744ee5c13'; // Coloque aqui a chave de API que você copiou

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED&key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Dados enviados para o Google Sheets:', result);
        Swal.fire({
            title: "Enviado!",
            text: "Dados enviados para o Google Sheets",
            icon: "success"
        });
    })
    .catch(error => {
        console.error('Erro ao enviar dados para o Google Sheets:', error);
        Swal.fire({
            title: "Erro",
            text: "Erro ao enviar dados para o Google Sheets",
            icon: "error"
        });
    });
}
