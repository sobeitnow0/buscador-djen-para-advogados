# buscador-djen-para-advogados
Userscript para consultar intimações no DJEN (CNJ) via API pública. Adiciona um botão flutuante discreto para buscas rápidas por OAB e data.

# ⚖️ Buscador DJEN (API) - Userscript

Um script de navegador (Userscript) leve e prático para advogados. Ele adiciona um botão flutuante discreto em qualquer página da web, permitindo consultar intimações diretamente na base de dados unificada do **Diário de Justiça Eletrônico Nacional (DJEN / CNJ)**, sem precisar navegar por interfaces lentas ou lidar com bloqueios de tribunais estaduais e federais.

## ✨ Funcionalidades

* **Consulta Direta via API:** Conecta-se diretamente ao servidor do CNJ (`comunicaapi.pje.jus.br`), garantindo velocidade e estabilidade.
* **Acesso Universal (TJ e TRF):** Como o DJEN é nacional, uma única busca retorna publicações de qualquer tribunal integrado que tenha enviado a comunicação para a base central.
* **Botão Flutuante Discreto:** Fica disponível no canto inferior da tela em sites comuns, sem poluir páginas complexas de sistema ou webmails.
* **Interface Limpa:** Exibe os resultados em uma janela flutuante organizada, com destaque para o número do processo e o tribunal/órgão de origem.
* **Cópia Rápida:** Botão "Copiar Tudo" que formata as intimações em texto limpo, pronto para ser colado no seu software de gestão, Logseq, Obsidian ou editor de texto.

## 🚀 Como Instalar

1. **Instale um gerenciador de userscripts** no seu navegador de preferência (opções populares incluem [Violentmonkey](https://violentmonkey.github.io/), [Tampermonkey](https://www.tampermonkey.net/) ou Greasemonkey).
2. Clique no link abaixo para instalar o script automaticamente:
   👉 **[Instalar Buscador DJEN](https://raw.githubusercontent.com/SEU-USUARIO/SEU-REPOSITORIO/main/buscador-djen.user.js)** *(Nota: não esqueça de substituir este link pela URL Raw do seu arquivo no GitHub!)*
3. Confirme a instalação na tela que se abrirá no seu gerenciador.

## ⚙️ Configuração (Sua OAB)

Após instalar, você precisa configurar a sua OAB no código fonte do script para que ele busque as suas publicações:
1. Abra o painel do seu gerenciador de scripts e clique em "Editar" no script **Buscador DJEN (API)**.
2. Nas primeiras linhas do código, localize estas variáveis e insira os seus dados:
   ```javascript
   const OAB_NUM = '123456'; // Coloque apenas os números da sua OAB
   const OAB_UF = 'SP';      // Coloque a sigla do seu estado
