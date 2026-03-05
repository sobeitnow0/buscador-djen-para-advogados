// ==UserScript==
// @name         Buscador DJEN (API) - Botão Flutuante
// @namespace    https://github.com/SEU-USUARIO/SEU-REPOSITORIO
// @version      1.0.0
// @description  Adiciona um botão flutuante discreto para buscar intimações processuais via API do DJEN.
// @author       Amilcar Moreira
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      comunicaapi.pje.jus.br
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // CONFIGURAÇÕES DO USUÁRIO
    // Insira sua OAB e Estado abaixo
    // ==========================================
    const OAB_NUM = '349457';
    const OAB_UF = 'SP';

    // ==========================================
    // REGRAS DE EXIBIÇÃO
    // Evita duplicar o botão em sites complexos (iframes) e páginas sensíveis
    // ==========================================
    if (window.top !== window.self) return;

    const sitesBloqueados = ['accounts.google.com', 'chrome.google.com', 'mail.google.com'];
    if (sitesBloqueados.some(site => window.location.hostname.includes(site))) return;

    // ==========================================
    // INTERFACE: BOTÃO FLUTUANTE
    // Cria e estiliza o botão no canto da tela
    // ==========================================
    const btn = document.createElement('div');
    btn.id = 'btn-djen-flutuante';
    btn.innerHTML = '⚖️ DJEN';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #3584e4;
        color: white;
        padding: 10px 16px;
        border-radius: 50px;
        font-family: sans-serif;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        z-index: 999999;
        transition: background 0.2s, transform 0.1s;
        user-select: none;
    `;
    
    // Efeitos hover e click do botão
    btn.onmouseover = () => btn.style.backgroundColor = '#1c71d8';
    btn.onmouseout = () => btn.style.backgroundColor = '#3584e4';
    btn.onmousedown = () => btn.style.transform = 'scale(0.95)';
    btn.onmouseup = () => btn.style.transform = 'scale(1)';
    btn.onclick = () => iniciarBusca();

    document.body.appendChild(btn);

    // ==========================================
    // LÓGICA DE BUSCA
    // Captura a data e converte para o formato da API (ISO)
    // ==========================================
    function iniciarBusca() {
        const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        let dataInput = prompt("Data da busca no DJEN (DD/MM/AAAA):", hoje);
        if (!dataInput) return; // Cancela se o usuário fechar o prompt

        let partesData = dataInput.split('/');
        if (partesData.length !== 3) {
            alert("Formato inválido. Use DD/MM/AAAA.");
            return;
        }
        let dataISO = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;

        buscarNaAPI(dataISO, dataInput);
    }

    // ==========================================
    // REQUISIÇÃO API CNJ
    // Comunicação direta com o servidor do Comunica PJe
    // ==========================================
    function buscarNaAPI(dataISO, dataFormatada) {
        const url = `https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroOab=${OAB_NUM}&ufOab=${OAB_UF}&dataDisponibilizacaoInicio=${dataISO}&dataDisponibilizacaoFim=${dataISO}`;

        // Feedback visual de carregamento
        const btnOriginalText = btn.innerHTML;
        btn.innerHTML = '⏳ Buscando...';
        btn.style.pointerEvents = 'none';

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            },
            onload: function(response) {
                // Restaura o botão
                btn.innerHTML = btnOriginalText;
                btn.style.pointerEvents = 'auto';

                if (response.status === 200) {
                    try {
                        const dados = JSON.parse(response.responseText);
                        const intimacoes = dados.items || [];
                        criarModalResultado(intimacoes, dataFormatada);
                    } catch (e) {
                        alert("Erro ao processar os dados recebidos do CNJ.");
                    }
                } else {
                    alert(`Erro ${response.status} na API do CNJ.`);
                }
            },
            onerror: function() {
                btn.innerHTML = btnOriginalText;
                btn.style.pointerEvents = 'auto';
                alert("Erro de conexão com a API do DJEN. Verifique sua internet ou tente mais tarde.");
            }
        });
    }

    // ==========================================
    // INTERFACE: MODAL DE RESULTADOS
    // Constrói a janela flutuante com a listagem das intimações
    // ==========================================
    function criarModalResultado(intimacoes, dataFormatada) {
        // Remove modal anterior, se houver
        const modalAntigo = document.getElementById('djen-api-modal');
        if (modalAntigo) modalAntigo.remove();

        let conteudo = "";
        if (intimacoes.length === 0) {
            conteudo = `<p style='color: #555; text-align: center; margin-top: 20px;'>Nenhuma intimação encontrada no DJEN para a OAB ${OAB_NUM}/${OAB_UF} na data ${dataFormatada}.</p>`;
        } else {
            conteudo = `<p style='margin-bottom: 15px;'><strong>${intimacoes.length}</strong> intimação(ões) encontrada(s) na data ${dataFormatada}:</p>`;
            
            intimacoes.forEach((item, index) => {
                const tribunal = item.siglaTribunal || "Tribunal Não Informado";
                const orgao = item.nomeOrgao || "Órgão Não Informado";
                const texto = item.texto || item.teor || "Texto não disponibilizado.";
                
                // Extrai o número do processo via Regex (Padrão CNJ)
                let processo = "N/A";
                const matchProc = texto.match(/\d{7}-\d{2}\.\d{4}\.\d{1,2}\.\d{2}\.\d{4}/);
                if (matchProc) processo = matchProc[0];

                conteudo += `
                    <div style="background: #f8f9fa; border-left: 4px solid #3584e4; padding: 15px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #ddd;">
                        <div style="margin-bottom: 8px; font-family: sans-serif; font-size: 14px; color: #333;">
                            <strong>⚖️ Tribunal:</strong> ${tribunal} - ${orgao}<br>
                            <strong>📄 Processo:</strong> ${processo}
                        </div>
                        <div style="font-family: monospace; font-size: 13px; white-space: pre-wrap; color: #444; background: white; padding: 10px; border: 1px solid #eee;">${texto}</div>
                    </div>
                `;
            });
        }

        // HTML base do Modal
        const modalHtml = `
            <div id="djen-api-modal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 999999; display: flex; justify-content: center; align-items: center;">
                <div style="background: white; width: 85%; max-width: 900px; height: 85vh; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; overflow: hidden; font-family: sans-serif;">
                    <div style="background: #2c3e50; color: white; padding: 15px 20px; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                        <span>Resultado DJEN (OAB/SP ${OAB_NUM})</span>
                        <button id="djen-fechar-btn" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; line-height: 1;">&times;</button>
                    </div>
                    <div style="padding: 20px; overflow-y: auto; flex-grow: 1; background: #fff;">
                        ${conteudo}
                    </div>
                    <div style="padding: 15px 20px; background: #fafafa; border-top: 1px solid #eee; text-align: right;">
                        <button id="djen-copiar-btn" style="background: #3584e4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Copiar Tudo</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Eventos do Modal
        document.getElementById('djen-fechar-btn').addEventListener('click', () => {
            document.getElementById('djen-api-modal').remove();
        });

        // Formatação de cópia para área de transferência
        document.getElementById('djen-copiar-btn').addEventListener('click', () => {
            const textParaCopiar = intimacoes.map((item, i) => {
                return `--- INTIMAÇÃO ${i+1} ---\nTribunal: ${item.siglaTribunal || 'N/A'} - ${item.nomeOrgao || 'N/A'}\nTexto:\n${item.texto || item.teor || ''}`;
            }).join("\n\n");
            
            navigator.clipboard.writeText(textParaCopiar).then(() => {
                const btnCopiar = document.getElementById('djen-copiar-btn');
                btnCopiar.innerText = "Copiado!";
                btnCopiar.style.background = "#2da15f";
                setTimeout(() => {
                    btnCopiar.innerText = "Copiar Tudo";
                    btnCopiar.style.background = "#3584e4";
                }, 2000);
            });
        });
    }
})();
