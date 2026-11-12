// ==========================================
// SISTEMA DE NOTIFICAÇÕES TOAST PROFISSIONAL
// ==========================================
function mostrarToast(mensagem, tipo = 'sucesso') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const corBg = tipo === 'sucesso' ? 'bg-emerald-600' : (tipo === 'erro' ? 'bg-red-600' : 'bg-purple-600');

    toast.className = `${corBg} text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-3 transform translate-y-5 opacity-0 transition-all duration-300`;
    toast.innerHTML = `
        <span>${mensagem}</span>
    `;

    container.appendChild(toast);

    // Animação de entrada
    setTimeout(() => {
        toast.classList.remove('translate-y-5', 'opacity-0');
    }, 10);

    // Remove após 3 segundos com animação
    setTimeout(() => {
        toast.classList.add('translate-y-5', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Gerenciamento de dados e bibliotecas para o Leitor
function obterDadosMaster() {
    return JSON.parse(localStorage.getItem('keven_master_db')) || {
        gerentes: [
            { id: "MGR-101", biblioteca: "Biblioteca Central" },
            { id: "MGR-102", biblioteca: "Biblioteca Municipal de Belém" }
        ]
    };
}

function obterDados() {
    return JSON.parse(localStorage.getItem('bib_db')) || {
        livros: [
            { id: "LIV-8921", bibliotecaId: "MGR-101", bibliotecaNome: "Biblioteca Central", titulo: "Dom Casmurro", autor: "Machado de Assis", categoria: "Literatura", foto: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", quantidadeTotal: 3, sinopse: "Clássico focado na dúvida sobre Capitu." },
            { id: "LIV-3412", bibliotecaId: "MGR-102", bibliotecaNome: "Biblioteca Municipal de Belém", titulo: "O Senhor dos Anéis", autor: "J.R.R. Tolkien", categoria: "Fantasia", foto: "https://images.unsplash.com/photo-1629992101753-56d196c8aea7?w=400", quantidadeTotal: 2, sinopse: "Jornada épica pelo Um Anel." }
        ],
        emprestimos: []
    };
}

let categoriaAtiva = 'Todos';
let bibliotecaAtiva = 'Todas';

// Renderiza o seletor de bibliotecas no topo da página
function renderSeletorBiblioteca() {
    const master = obterDadosMaster();
    const bibliotecas = master.gerentes;

    // Procura ou cria o container do seletor na barra de navegação/topo
    let seletorDiv = document.getElementById('seletorBibliotecaContainer');
    if (!seletorDiv) {
        seletorDiv = document.createElement('div');
        seletorDiv.id = 'seletorBibliotecaContainer';
        seletorDiv.className = 'max-w-7xl mx-auto px-6 pt-4 flex items-center gap-3';

        // Insere logo abaixo do header
        const header = document.querySelector('header');
        if (header && header.parentNode) {
            header.parentNode.insertBefore(seletorDiv, header.nextSibling);
        }
    }

    seletorDiv.innerHTML = `
        <div class="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-purple-100 w-full md:w-auto">
            <span class="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1.5"><i data-lucide="map-pin" class="w-4 h-4 text-purple-600"></i> Biblioteca:</span>
            <select id="selectBibliotecaLeitor" onchange="mudarBiblioteca(this.value)" class="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full">
                <option value="Todas" ${bibliotecaAtiva === 'Todas' ? 'selected' : ''}>Todas as Bibliotecas</option>
                ${bibliotecas.map(b => `<option value="${b.biblioteca}" ${bibliotecaAtiva === b.biblioteca ? 'selected' : ''}>${b.biblioteca}</option>`).join('')}
            </select>
        </div>
    `;
    lucide.createIcons();
}

// ==========================================
// FUNÇÕES DE FILTRAGEM (LEITOR)
// ==========================================

function mudarBiblioteca(val) {
    bibliotecaAtiva = val;
    categoriaAtiva = 'Todos'; // Reset vital para não bugar a tela
    document.getElementById('searchInput').value = ''; // Limpa a busca ao trocar
    renderCategorias();
    filtrarLivros();
}

function renderCategorias() {
    const db = obterDados();

    // Pega APENAS os livros da biblioteca selecionada
    let lista = db.livros;
    if (bibliotecaAtiva !== 'Todas') {
        lista = db.livros.filter(l => l.bibliotecaNome === bibliotecaAtiva);
    }

    const cats = ['Todos', ...new Set(lista.map(l => l.categoria))];
    const categoryContainer = document.getElementById('categoryContainer');

    if (categoryContainer) {
        categoryContainer.innerHTML = cats.map(c => `
            <button onclick="filtrarCategoria('${c}')" class="px-5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap shadow-sm ${categoriaAtiva === c ? 'bg-purple-700 text-white' : 'bg-white text-slate-700 hover:bg-purple-100'}">${c}</button>
        `).join('');
    }
}

function filtrarCategoria(c) {
    categoriaAtiva = c;
    renderCategorias();
    filtrarLivros();
}

function filtrarLivros() {
    const db = obterDados();
    const term = document.getElementById('searchInput').value.toLowerCase();

    // Filtro super rigoroso para evitar mistura de acervos
    const filtrados = db.livros.filter(l => {
        const matchBib = bibliotecaAtiva === 'Todas' || l.bibliotecaNome === bibliotecaAtiva;
        const matchCat = categoriaAtiva === 'Todos' || l.categoria === categoriaAtiva;
        const matchSearch = l.titulo.toLowerCase().includes(term) || l.autor.toLowerCase().includes(term);
        return matchBib && matchCat && matchSearch;
    });

    renderLivros(filtrados, db.emprestimos);
}

function renderLivros(lista, emprestimos) {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;

    if (lista.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-16 text-gray-400 font-medium">Nenhum livro encontrado nesta unidade ou categoria.</div>`;
        return;
    }

    grid.innerHTML = lista.map(l => {
        const empAtivos = emprestimos.filter(e => e.livroId === l.id && e.status === 'Ativo').length;
        const disponivel = (l.quantidadeTotal - empAtivos) > 0;
        const nomeBibTag = l.bibliotecaNome ? `<span class="text-[9px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-md ml-1">${l.bibliotecaNome}</span>` : '';

        return `
            <div class="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border border-purple-100 group">
                <div class="relative h-60 overflow-hidden bg-gray-100">
                    <img src="${l.foto}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <div class="absolute top-3 left-3">
                        <span class="px-3 py-1 text-[11px] font-bold rounded-full shadow-md ${disponivel ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">
                            ${disponivel ? 'Disponível' : 'Emprestado'}
                        </span>
                    </div>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest">${l.categoria}</span>
                            ${nomeBibTag}
                        </div>
                        <h3 class="font-bold text-slate-900 text-lg line-clamp-1">${l.titulo}</h3>
                        <p class="text-xs text-slate-500 mb-4">${l.autor}</p>
                    </div>
                    <button type="button" onclick="abrirModal('${l.id}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-200 text-xs">
                        <i data-lucide="info" class="w-4 h-4"></i> Detalhes
                    </button>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

// ==========================================
// FUNÇÕES DO MODAL DE DETALHES
// ==========================================
function abrirModal(id) {
    const db = obterDados();
    const l = db.livros.find(x => x.id === id);
    if (!l) return;

    const empAtivos = (db.emprestimos || []).filter(e => e.livroId === l.id && e.status === 'Ativo').length;
    const disponivel = (l.quantidadeTotal - empAtivos) > 0;

    document.getElementById('modalContent').innerHTML = `
        <div class="relative h-56 rounded-2xl overflow-hidden mb-4 shadow-inner">
            <img src="${l.foto}" class="w-full h-full object-cover">
        </div>
        <span class="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 ${disponivel ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
            ${disponivel ? 'Disponível para Empréstimo' : 'Todos os exemplares emprestados'}
        </span>
        <h2 class="text-2xl font-bold text-slate-900">${l.titulo}</h2>
        <p class="text-xs font-semibold text-purple-600 mb-1">Autor: ${l.autor} | Categoria: ${l.categoria}</p>
        <p class="text-xs font-bold text-slate-700 mb-3">Biblioteca: ${l.bibliotecaNome || 'Biblioteca Central'}</p>
        <p class="text-slate-600 text-sm mb-4 leading-relaxed">${l.sinopse}</p>
        <div class="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border">Código ID: ${l.id} | Total no acervo: ${l.quantidadeTotal}</div>
    `;

    document.getElementById('modalDetalhes').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Trava o scroll da página de fundo
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function fecharModal() {
    document.getElementById('modalDetalhes').classList.add('hidden');
    document.body.style.overflow = ''; // Libera o scroll da página
}

// Fecha o modal ao clicar no fundo escuro
document.getElementById('modalDetalhes').addEventListener('click', function (event) {
    if (event.target === this) {
        fecharModal();
    }
});

// Fecha o modal ao apertar a tecla ESC
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        fecharModal();
    }
});

function fecharModalBackground(event) {
    if (event.target.id === 'modalDetalhes') {
        fecharModal();
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        fecharModal();
    }
});

// Inicialização da Estante
renderSeletorBiblioteca();
renderCategorias();
filtrarLivros();