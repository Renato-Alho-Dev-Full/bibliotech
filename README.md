# 📚 Sistema SaaS Multi-Biblioteca 360

Sistema web completo, modular e responsivo desenvolvido para o gerenciamento de bibliotecas sob um modelo de licenciamento SaaS (Multi-Tenant). O projeto contempla controle administrativo master, PDV, CRM de clientes, painel operacional para gerentes e uma estante virtual pública para leitores.

---

## 🚀 Arquitetura e Módulos do Sistema

O projeto é dividido em três aplicações independentes que se comunicam de forma segura através do armazenamento local do navegador (`localStorage` / arquitetura desacoplada):

1. **`admin.html` (Painel Master / SaaS Control):**
   - Acesso restrito do criador da plataforma.
   - Gestão de licenças de uso (ativação e suspensão em tempo real).
   - **Módulo PDV:** Venda e renovação de planos de assinatura para gerentes/bibliotecas (1, 4, 6 e 12 meses).
   - **Módulo CRM:** Cadastro de novos clientes, visualização de credenciais de login/senha geradas, além de funções completas de **edição** e **exclusão** de contas.
   - Suporte nativo a **Dark Mode** sincronizado.

2. **`gerente.html` (Workspace Operacional):**
   - Tela de login protegida e integrada diretamente ao CRM do Admin Master (com validação de licença ativa/paga).
   - Dashboard analítico com indicadores de acervo e taxa de circulação.
   - Cadastro de livros com ID gerado automaticamente e conversão segura de capas locais em formato Base64.
   - Registro de empréstimos vinculados ao CPF e endereço do leitor, além do painel de **baixa (devolução)** para retornar exemplares ao estoque.
   - Suporte a **Dark Mode**.

3. **`leitor.html` (Estante Virtual Pública):**
   - Acesso 100% aberto e público (sem necessidade de login ou autenticação).
   - Menu responsivo de categorias e barra de pesquisa em tempo real.
   - Cards modernos com badges dinâmicos de status (**Disponível em Verde** / **Emprestado em Vermelho**) e botão de detalhes em azul.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5 & CSS3** (com tipografia e design limpo em tons de nude, branco, roxo e azul claro).
* **Tailwind CSS** (via CDN, com suporte a temas dinâmicos via classes).
* **Lucide Icons** (para iconografia moderna e minimalista).
* **JavaScript Vanilla (ES6+)** com manipulação síncrona de `localStorage`.

---

## 💻 Como Rodar o Projeto Localmente

Como a aplicação utiliza armazenamento local (`localStorage`) para simular o banco de dados entre os módulos, evite abrir os arquivos HTML diretamente dando duplo clique (`file:///`), pois o navegador restringe a comunicação entre arquivos locais.

1. Abra a pasta do projeto no **Visual Studio Code**.
2. Instale e abra a extensão **Live Server**.
3. Clique em **"Go Live"** no rodapé do VS Code para rodar os arquivos em um servidor local (`http://127.0.0.1:5500`).

---

## ☁️ Como Subir e Rodar o Sistema na Vercel (Passo a Passo)

A **Vercel** é a melhor plataforma para hospedar aplicações frontend estáticas de forma rápida, segura e gratuita. Siga estes passos para colocar o sistema no ar:

### Passo 1: Enviar o código para o GitHub
Se você ainda não enviou, abra o terminal na pasta do seu projeto e execute:
```bash
git init
git add .
git commit -m "feat: versão final do sistema SaaS de biblioteca"
git branch -M main
git remote add origin [https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git](https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git)
git push -u origin main
