async function fetchData() {
    const urlDatabase = 'https://opensheet.elk.sh/1T_r486_3eFo3izRUVLrW8r6vEBAGMsVkvAIWN872C80/Database';
    const urlInformacao = 'https://opensheet.elk.sh/1T_r486_3eFo3izRUVLrW8r6vEBAGMsVkvAIWN872C80/Informacao';
    
    try {
        // Fetch da aba Database
        const responseDatabase = await fetch(urlDatabase);
        const dataDatabase = await responseDatabase.json();

        // Fetch da aba Informacao
        const responseInformacao = await fetch(urlInformacao);
        const dataInformacao = await responseInformacao.json();

        // Filtra e estrutura os dados para o gráfico
        const chartData = dataDatabase
            .filter(row => row.Partido && row.VagasObtidas > 0)
            .map(row => ({
                partido: row.Partido,
                totalVagas: parseInt(row.VagasObtidas, 10),
                cor: row.Cor || "#ccc"
            }));

        // Calcula o total de vagas e porcentagem
        const totalVagas = chartData.reduce((acc, item) => acc + item.totalVagas, 0);
        chartData.forEach(item => {
            item.percent = ((item.totalVagas / totalVagas) * 100).toFixed(2);
        });

        // Exibe as informações gerais a partir da primeira linha da aba "Informacao"
        console.log(dataInformacao); // Para verificar os dados
        if (dataInformacao.length > 0) {
            createGeneralInfo(dataInformacao[0]);  
        } else {
            console.error('A aba "Informacao" está vazia ou não contém dados.');
        }

        // Passa a primeira linha com informações gerais da aba "Informacao"
        createGeneralInfo(dataDatabase[0]);
        createDataList(dataDatabase);
        createDeputadoList(dataInformacao);  // Usa dados da aba Informacao para a lista de deputados
        createChart(chartData);
        displayDataHora(dataInformacao);
        percent(dataInformacao);

    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
}

// Adicionando contador de cliques no botão refresh
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

// Função para exibir informações gerais
function createGeneralInfo(data) {
    const generalInfoDiv = document.getElementById('lista-eleicao');
    generalInfoDiv.innerHTML = `
        <div><strong>Vagas:</strong> ${data.Vagas || 'N/A'}</div>
        <div><strong>Votos Totais:</strong> ${data.VotosTotais || 'N/A'}</div>
        <div><strong>Votos Válidos:</strong> ${data.VotosValidos || 'N/A'}</div>
        <div><strong>Votos Nulos/Brancos:</strong> ${data.VotosNulosBrancos || 'N/A'}</div>
    `;
}

function displayDataHora(data) {
    const dataHoraDiv = document.getElementById('data-hora');
    dataHoraDiv.innerHTML = '';
    
    // Exibe o valor da primeira linha da coluna DataHora
    if (data.length > 0 && data[0].DataHora) {
        dataHoraDiv.innerHTML = `${data[0].DataHora}`;
    }
}

function percent(data) {
    const percentCalcText = document.getElementById('porcentagem');
    const percentCalc = document.getElementById('barra');

    // Limpa o conteúdo anterior
    percentCalcText.innerHTML = '';
    
    // Exibe o valor da primeira linha da coluna Porcentagem
    if (data.length > 0 && data[0].Porcentagem !== undefined) {
        const porcentagem = data[0].Porcentagem;

        // Define o texto na div
        percentCalcText.innerHTML = `${porcentagem}%`;

        // Altera o width da barra com o valor da porcentagem
        percentCalc.style.width = `${porcentagem}%`;
    }
}

// Função para criar lista de partidos
function createDataList(data) {
    const dataList = document.getElementById('lista-partidos');
    dataList.innerHTML = '';

    data.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.innerHTML =
            (row.Partido ? `<strong>${row.Partido}:</strong> ` : '') +
            (row.VagasObtidas ? `${row.VagasObtidas} vagas` : '');

        // Remove vírgula no final, se existir
        if (rowDiv.innerHTML.endsWith(', ')) {
            rowDiv.innerHTML = rowDiv.innerHTML.slice(0, -2);
        }

        dataList.appendChild(rowDiv);
    });
}

// Função para exibir lista de deputados
function createDeputadoList(data) {
    const deputadoList = document.getElementById('lista-deputados');
    deputadoList.innerHTML = '';

    data.forEach(row => {
        if (row.Deputado && row.PartidoDeputado && row.VotoDeputado) { // Verifica se tem os dados necessários
            const deputadoDiv = document.createElement('div');
            deputadoDiv.innerHTML = `
                ${row.Deputado} (${row.PartidoDeputado}): ${row.VotoDeputado} votos
                ${row.StatusDeputado ? ` - <strong>${row.StatusDeputado}</strong>` : ''}
            `;
            deputadoList.appendChild(deputadoDiv);
        }
    });
}

function createChart(data) {
    am4core.ready(function () {
        am4core.useTheme(am4themes_animated);

        var chart = am4core.create("chartdiv", am4charts.PieChart);
        chart.hiddenState.properties.opacity = 0; // Efeito fade-in inicial
        chart.radius = am4core.percent(70);
        chart.innerRadius = am4core.percent(40);
        chart.startAngle = 180;
        chart.endAngle = 360;

        chart.data = data.map(item => ({
            partido: item.partido,
            totalVagas: item.totalVagas,
            cor: item.cor
        }));

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "totalVagas";
        series.dataFields.category = "partido";
        series.slices.template.propertyFields.fill = "cor";

        series.slices.template.cornerRadius = 4; // Raio de canto
        series.slices.template.strokeWidth = 0.5; // Largura da borda
        series.slices.template.stroke = am4core.color("#dee2e6"); // Cor da borda

        // Ocultar fatias com valor zero
        series.slices.template.adapter.add("visible", function (visible, target) {
            return target.dataItem.value > 0;
        });

        // Rótulo e Tooltip
        series.slices.template.tooltipText = "{category}: [bold]{value} vagas ({value.percent.formatNumber('#.0')}%)";
        series.labels.template.text = "{category}: {value} vagas ({value.percent.formatNumber('#.0')}%)";
        series.labels.template.disabled = false;
        series.ticks.template.disabled = false;

        chart.legend = new am4charts.Legend();

        // Configuração da animação de expansão
        series.hiddenState.properties.startAngle = 90; // Ângulo de início das fatias escondidas
        series.hiddenState.properties.endAngle = 90;   // Ângulo de fim das fatias escondidas

        series.slices.template.events.on("inited", function (event) {
            event.target.show(1000, am4core.ease.cubicOut); // Expansão das fatias ao carregar
        });

    });
}

// Chama a função para buscar dados ao carregar a página
fetchData();
