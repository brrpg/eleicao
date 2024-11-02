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
        nomeDiv.classList.add("col-lg-8", "col-8", "mx-1", "mb-2", "p-0");
        camposDiv.appendChild(nomeDiv);
        
        const nomeInput = document.createElement("input");
        nomeInput.type = "text";
        nomeInput.placeholder = "Nome";
        nomeInput.classList.add("form-control");
        nomeInput.id = `candidatoNome${i}`;
        nomeDiv.appendChild(nomeInput);

        // Campo Nome
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
        partidoDiv.classList.add("col-lg-4", "col-3", "mx-1", "mb-2", "p-0");
        camposDiv.appendChild(partidoDiv);
        
        const partidoInput = document.createElement("input");
        partidoInput.type = "text";
        partidoInput.placeholder = "Partido";
        partidoInput.classList.add("form-control");
        partidoInput.id = `candidatoPartido${i}`;
        partidoDiv.appendChild(partidoInput);
    
        // Campo Votos
        const votosDiv = document.createElement("div");
        votosDiv.classList.add("col-lg-4", "col-3", "ms-1", "mb-2", "p-0");
        camposDiv.appendChild(votosDiv);
        
        const votosInput = document.createElement("input");
        votosInput.type = "number";
        votosInput.placeholder = "Votos";
        votosInput.classList.add("form-control");
        votosInput.id = `candidatoVotos${i}`;
        votosDiv.appendChild(votosInput);

        // Campo Voto NPC
        const votosNPCDiv = document.createElement("div");
        votosNPCDiv.classList.add("col-lg-3", "col-3", "mx-1", "mb-2", "p-0");
        camposDiv.appendChild(votosNPCDiv);
        
        const votosNPCInput = document.createElement("input");
        votosNPCInput.type = "number";
        votosNPCInput.placeholder = "% NPC";
        votosNPCInput.classList.add("form-control");
        votosNPCInput.id = `candidatoNpc${i}`;
        votosNPCDiv.appendChild(votosNPCInput);
    
        // Campo Cor
        const corDiv = document.createElement("div");
        corDiv.classList.add("col-lg-2", "col-1", "mb-2", "p-0");
        camposDiv.appendChild(corDiv);
        
        const corInput = document.createElement("input");
        corInput.type = "color";
        corInput.classList.add("form-control", "form-control-color");
        corInput.id = `candidatoCor${i}`;
        corDiv.appendChild(corInput);
    
        // Campo Imagem (URL)
        const imagemDiv = document.createElement("div");
        imagemDiv.classList.add("col-lg-10", "col-12", "mb-2", "p-0");
        camposDiv.appendChild(imagemDiv);
        
        const imagemInput = document.createElement("input");
        imagemInput.type = "text";
        imagemInput.placeholder = "URL da Imagem do Candidato";
        imagemInput.classList.add("form-control");
        imagemInput.id = `candidatoImagem${i}`;
        imagemDiv.appendChild(imagemInput);
    
        container.appendChild(candidatoDiv);
    }
    
}

function calcularDistribuicao() {
    const numeroCandidatos = parseInt(document.getElementById("numeroCandidatos").value);
    const resultados = [];

    // Obter votos nulos por estado
    const nulos = {
        SP: parseInt(document.getElementById("nulo1").value) || 0,
        SC: parseInt(document.getElementById("nulo2").value) || 0,
        PE: parseInt(document.getElementById("nulo3").value) || 0,
        GO: parseInt(document.getElementById("nulo4").value) || 0,
    };

    for (let i = 1; i <= numeroCandidatos; i++) {
        const nome = document.getElementById(`candidatoNome${i}`).value;
        const votos = parseInt(document.getElementById(`candidatoVotos${i}`).value) || 0;
        const partido = document.getElementById(`candidatoPartido${i}`).value;
        const estado = document.getElementById(`candidatoEstado${i}`).value.toUpperCase();
        const cor = document.getElementById(`candidatoCor${i}`).value;
        const imagem = document.getElementById(`candidatoImagem${i}`).value;
        const npc = document.getElementById(`candidatoNpc${i}`).value;

        resultados.push({ nome, votos, partido, estado, cor, imagem, npc });
    }

    // Cálculo total de votos
    const totalVotos = resultados.reduce((acc, cand) => acc + cand.votos, 0);

    // Agrupando e calculando por estado
    const resultadosPorEstado = resultados.reduce((acc, cand) => {
        if (!acc[cand.estado]) {
            acc[cand.estado] = {
                votosValidosEstado: 0,
                candidatos: [],
                votosNulosEstado: nulos[cand.estado] || 0, // Adicionando votos nulos do estado
            };
        }
        acc[cand.estado].votosValidosEstado += cand.votos;
        acc[cand.estado].candidatos.push(cand);
        return acc;
    }, {});

    // Preparando o resultado para a exibição
    let resultadoHTML = `<p class="mb-3"><strong>Total de votos:</strong> ${totalVotos}</p>`;

    Object.keys(resultadosPorEstado).forEach(estado => {
        const estadoData = resultadosPorEstado[estado];
        const votosTotaisEstado = estadoData.votosValidosEstado + estadoData.votosNulosEstado; // Cálculo de votos totais
        resultadoHTML += `<h4>${estado}</h4>`;
        resultadoHTML += `<p><strong>Votos válidos (Estado):</strong> ${estadoData.votosValidosEstado}</p>`;
        resultadoHTML += `<p><strong>Votos nulos (Estado):</strong> ${estadoData.votosNulosEstado}</p>`;
        resultadoHTML += `<p><strong>Votos totais (Estado):</strong> ${votosTotaisEstado}</p>`; // Adicionando votos totais
        
        // Calcular porcentagens para cada candidato e ordenar por porcentagem
        estadoData.candidatos.forEach(cand => {
            const porcentagem = estadoData.votosValidosEstado > 0
                ? ((cand.votos / estadoData.votosValidosEstado) * 100).toFixed(2)
                : 0;
            cand.porcentagem = porcentagem; // Adiciona a porcentagem ao objeto
        });

        // Ordenar candidatos por porcentagem em ordem decrescente
        estadoData.candidatos.sort((a, b) => b.porcentagem - a.porcentagem);

        // Adicionar candidatos ordenados ao resultadoHTML
        estadoData.candidatos.forEach(cand => {
            resultadoHTML += `<p><strong>${cand.nome}</strong> (${cand.partido}) - Votos: ${cand.votos} (${cand.porcentagem}%)</p>`;
        });
    });

    document.getElementById("resultado").innerHTML = resultadoHTML;

    // Chama a função para enviar os dados, incluindo votos nulos
    enviarParaPlanilha(resultados, nulos, totalVotos);
}

function enviarParaPlanilha(resultados, nulos, votosValidos, totalVotos) {
    const url = "https://api.steinhq.com/v1/storages/67265bf0c0883333654a1cd7/Estado";

    // Preparando os dados para enviar, incluindo os votos nulos por estado
    const dadosParaEnviar = resultados.map(cand => ({
        VotosValidos: votosValidos,
        TotalVotos: totalVotos,
        VotosNulos: nulos[cand.estado] || 0, // Adicionando votos nulos do estado
        Candidato: cand.nome,
        Partido: cand.partido,
        Votos: cand.votos,
        Porcentagem: cand.porcentagem,
        Estado: cand.estado,
        Imagem: cand.imagem,
        NPC: cand.npc
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
        const urlSecundaria = "https://api.steinhq.com/v1/storages/67267f05c0883333654a2351/Estado";
        const dadosParaEnviarSecundaria = resultados.map(cand => ({
            Candidato: cand.nome,
            Partido: cand.partido,
            Imagem: cand.imagem,
            Estado: cand.estado,
            CandidatoCor: cand.cor
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
