//let resultados = [];  // Variável para armazenar os resultados calculados

// Função para gerar os campos de candidatos
function gerarCampos() {
    const numeroCandidatos = parseInt(document.getElementById("numeroCandidatos").value);
    const container = document.getElementById("partidos-container");

    // Limpa o container antes de gerar novos campos
    container.innerHTML = "";

    for (let i = 1; i <= numeroCandidatos; i++) {
        const candidatoDiv = document.createElement("div");
        candidatoDiv.classList.add("candidato", "form-group", "row", "border", "p-3", "mb-2");
    
        const candidatoTitulo = document.createElement("h5");
        candidatoTitulo.innerText = `Candidato ${i}:`;
        candidatoTitulo.classList.add("col-12");
        candidatoDiv.appendChild(candidatoTitulo);
    
        //const nomeInput = document.createElement("input");
        //nomeInput.type = "text";
        //nomeInput.placeholder = "Nome do Candidato";
        //nomeInput.classList.add("form-control", "mb-2");
        //nomeInput.id = `candidatoNome${i}`;
        //candidatoDiv.appendChild(nomeInput);
    
        // Div para os inputs do partido, votos, cor e imagem
        const camposDiv = document.createElement("div");
        camposDiv.classList.add("row", "col-12", "pe-0"); // Define a linha que conterá os outros campos
        candidatoDiv.appendChild(camposDiv);
    
        // Campo Nome
        const nomeDiv = document.createElement("div");
        nomeDiv.classList.add("col-lg-12", "col-12", "mx-1", "mb-2", "p-0");
        camposDiv.appendChild(nomeDiv);
        
        const nomeInput = document.createElement("input");
        nomeInput.type = "text";
        nomeInput.placeholder = "Nome";
        nomeInput.classList.add("form-control");
        nomeInput.id = `candidatoNome${i}`;
        nomeDiv.appendChild(nomeInput);

        // Campo Estado
        const estadoDiv = document.createElement("div");
        estadoDiv.classList.add("col-lg-3", "col-3", "mx-1", "mb-2", "p-0");
        camposDiv.appendChild(estadoDiv);
        
        const estadoInput = document.createElement("input");
        estadoInput.type = "text";
        estadoInput.placeholder = "Estado";
        estadoInput.classList.add("form-control");
        estadoInput.id = `candidatoEstado${i}`;
        estadoDiv.appendChild(estadoInput);

        // Campo Partido
        const partidoDiv = document.createElement("div");
        partidoDiv.classList.add("col-lg-3", "col-3", "mx-1", "mb-2", "p-0");
        camposDiv.appendChild(partidoDiv);
        
        const partidoInput = document.createElement("input");
        partidoInput.type = "text";
        partidoInput.placeholder = "Partido";
        partidoInput.classList.add("form-control");
        partidoInput.id = `candidatoPartido${i}`;
        partidoDiv.appendChild(partidoInput);
    
        // Campo Votos
        const votosDiv = document.createElement("div");
        votosDiv.classList.add("col-lg-3", "col-3", "ms-1", "mb-2", "p-0");
        camposDiv.appendChild(votosDiv);
        
        const votosInput = document.createElement("input");
        votosInput.type = "number";
        votosInput.placeholder = "Votos";
        votosInput.classList.add("form-control");
        votosInput.id = `candidatoVotos${i}`;
        votosDiv.appendChild(votosInput);
    
        container.appendChild(candidatoDiv);
    }
    
}

function calcularDistribuicao() {
    const nulosBrancos = parseInt(document.getElementById("nulosBrancos").value) || 0;
    const numeroCandidatos = parseInt(document.getElementById("numeroCandidatos").value);
    const resultados = [];

    for (let i = 1; i <= numeroCandidatos; i++) {
        const nome = document.getElementById(`candidatoNome${i}`).value;
        const votos = parseInt(document.getElementById(`candidatoVotos${i}`).value) || 0;
        const partido = document.getElementById(`candidatoPartido${i}`).value;
        const estado = document.getElementById(`candidatoEstado${i}`).value.toUpperCase();

        resultados.push({ nome, votos, partido, estado, status });
    }

    const totalVotos = nulosBrancos + resultados.reduce((acc, cand) => acc + cand.votos, 0);
    const votosValidos = totalVotos - nulosBrancos;

    // Agrupando e calculando por estado
    const resultadosPorEstado = resultados.reduce((acc, cand) => {
        if (!acc[cand.estado]) {
            acc[cand.estado] = {
                votosValidosEstado: 0,
                candidatos: [],
            };
        }
        acc[cand.estado].votosValidosEstado += cand.votos;
        acc[cand.estado].candidatos.push(cand);
        return acc;
    }, {});

    // Calculando e ordenando candidatos por estado
    Object.keys(resultadosPorEstado).forEach(estado => {
        const estadoData = resultadosPorEstado[estado];
        // Ordena os candidatos por votos em ordem decrescente
        estadoData.candidatos.sort((a, b) => b.votos - a.votos);

        // Atribui o status de eleito e verifica empates
        if (estadoData.candidatos.length > 0) {
            const primeiro = estadoData.candidatos[0].votos;
            let eleitos = 1;

            for (let i = 1; i < estadoData.candidatos.length; i++) {
                if (estadoData.candidatos[i].votos === primeiro) {
                    eleitos++;
                } else {
                    break;
                }
            }

            // Marca o status de "eleito"
            estadoData.candidatos.forEach((cand, index) => {
                if (index < eleitos) {
                    cand.status = "Eleito";
                } else if (eleitos > 1 && index === eleitos) {
                    cand.status = "Empate";
                } else {
                    cand.status = "";
                }
            });
        }
    });

    // Preparando o resultado para a exibição
    let resultadoHTML = `<p class="mb-0"><strong>Votos válidos:</strong> ${votosValidos}</p>`;
    resultadoHTML += `<p class="mb-0"><strong>Votos nulos/brancos:</strong> ${nulosBrancos}</p>`;
    resultadoHTML += `<p class="mb-3"><strong>Total de votos:</strong> ${totalVotos}</p>`;

    Object.keys(resultadosPorEstado).forEach(estado => {
        const estadoData = resultadosPorEstado[estado];
        resultadoHTML += `<h4>${estado}</h4>`;
        resultadoHTML += `<p><strong>Votos válidos (Estado):</strong> ${estadoData.votosValidosEstado}</p>`;
        
        estadoData.candidatos.forEach(cand => {
            const porcentagem = estadoData.votosValidosEstado > 0
                ? ((cand.votos / estadoData.votosValidosEstado) * 100).toFixed(2)
                : 0;
            resultadoHTML += `<p><strong>${cand.nome}</strong> (${cand.partido}) - Votos: ${cand.votos} (${porcentagem}%) ${cand.status ? `(${cand.status})` : ''}</p>`;
            
            // Adiciona a porcentagem ao objeto do candidato para envio
            cand.porcentagem = porcentagem; // Adiciona a porcentagem ao objeto
        });
    });

    document.getElementById("resultado").innerHTML = resultadoHTML;

    // Chama a função para enviar os dados
    //enviarParaPlanilha(resultados, nulosBrancos, votosValidos, totalVotos);
}


function enviarParaPlanilha(resultados, nulosBrancos, votosValidos, totalVotos) {
    const url = "https://api.steinhq.com/v1/storages/67265bf0c0883333654a1cd7/Senado";
    const dadosParaEnviar = resultados.map(cand => ({
        VotosNulosBrancos: nulosBrancos,
        VotosValidos: votosValidos,
        TotalVotos: totalVotos,
        Candidato: cand.nome,
        Partido: cand.partido,
        Votos: cand.votos,
        Porcentagem: cand.porcentagem,
        Estado: cand.estado,
        Imagem: cand.imagem,
        Status: cand.status
    }));

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosParaEnviar)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Dados enviados para o Stein com sucesso:", data);
        // Enviando para a segunda planilha com informações selecionadas
        const urlSecundaria = "https://api.steinhq.com/v1/storages/67267f05c0883333654a2351/Senado";
        const dadosParaEnviarSecundaria = resultados.map(cand => ({
            VotoNuloBranco: nulosBrancos,
            Candidato: cand.nome,
            Partido: cand.partido,
            Imagem: cand.imagem,
            Estado: cand.estado
        }));

        return fetch(urlSecundaria, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosParaEnviarSecundaria)
        });
    })
    .then(data => {
        console.log("Dados enviados para o Google Sheets com sucesso:", data);
        Swal.fire({
            title: "Enviado!",
            text: "Dados enviados para a planilha com sucesso",
            icon: "success",
            showConfirmButton: false,
            timer: 2500
        });
    })
    .catch(error => {
        console.error("Erro ao enviar dados para o Google Sheets:", error);
        Swal.fire({
            title: "Erro!",
            text: "Erro ao enviar dados. Verifique o console para mais detalhes.",
            icon: "error",
            showConfirmButton: false,
            timer: 2500
        });
    });
}
