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

let db = JSON.parse(localStorage.getItem('bib_db')) || { livros: [], emprestimos: [] };
if (!db.emprestimos) db.emprestimos = [];

// ==========================================
// TEMA E DARK MODE
// ==========================================
function applyTheme() {
    if (localStorage.getItem('keven_theme') === 'dark') {
        document.documentElement.classList.add('dark');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.setAttribute('data-lucide', 'sun');
    } else {
        document.documentElement.classList.remove('dark');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.setAttribute('data-lucide', 'moon');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleDarkMode() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('keven_theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('keven_theme', 'dark');
    }
    applyTheme();
}
applyTheme();

function toggleSenhaGerente() {
    const inputSenha = document.getElementById('passMgr');
    const icon = document.getElementById('iconEyeGerente');
    if (!inputSenha) return;
    if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        if (icon) icon.setAttribute('data-lucide', 'eye-off');
    } else {
        inputSenha.type = 'password';
        if (icon) icon.setAttribute('data-lucide', 'eye');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// LOGIN E SESSÃO DO GERENTE
// ==========================================
function fazerLoginGerente(e) {
    e.preventDefault();
    const u = document.getElementById('userMgr').value.trim();
    const p = document.getElementById('passMgr').value.trim();
    const erroDiv = document.getElementById('erroLogin');

    const masterDb = JSON.parse(localStorage.getItem('keven_master_db')) || { gerentes: [] };
    const gerenteEncontrado = masterDb.gerentes.find(g => g.usuario === u && g.senha === p);

    if (gerenteEncontrado) {
        if (gerenteEncontrado.pagamento !== 'Pago') {
            erroDiv.innerHTML = `<i data-lucide="alert-circle" class="inline w-4 h-4 mr-1"></i> A licença desta biblioteca está pendente ou vencida.`;
            erroDiv.classList.remove('hidden');
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
        localStorage.setItem('gerente_logado', 'true');
        localStorage.setItem('gerente_atual', JSON.stringify(gerenteEncontrado));
        mostrarPainelGerente();
        erroDiv.classList.add('hidden');
    } else if (u === 'admin' && p === 'admin123') {
        localStorage.setItem('gerente_logado', 'true');
        localStorage.setItem('gerente_atual', JSON.stringify({ biblioteca: "Biblioteca Central (Master Teste)" }));
        mostrarPainelGerente();
        erroDiv.classList.add('hidden');
    } else {
        erroDiv.innerHTML = `<i data-lucide="x-circle" class="inline w-4 h-4 mr-1"></i> Usuário ou senha incorretos!`;
        erroDiv.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function mostrarPainelGerente() {
    const loginDiv = document.getElementById('loginGerente');
    const panelDiv = document.getElementById('panelGerente');
    if (loginDiv) loginDiv.classList.add('hidden');
    if (panelDiv) panelDiv.classList.remove('hidden');

    const dadosGerente = JSON.parse(localStorage.getItem('gerente_atual'));
    if (dadosGerente && dadosGerente.biblioteca) {
        const cabecalho = document.getElementById('nomeBibliotecaCabecalho');
        if (cabecalho) cabecalho.innerText = "Unidade: " + dadosGerente.biblioteca;
    }
    atualizarInterfaceGerente();
}

function logoutGerente() {
    localStorage.removeItem('gerente_logado');
    localStorage.removeItem('gerente_atual');
    location.reload();
}

// ==========================================
// BUSCA POR ISBN (GOOGLE BOOKS API)
// ==========================================
async function buscarLivroPorISBN() {
    const isbnInput = document.getElementById('isbnInput');
    if (!isbnInput) return;
    const isbn = isbnInput.value.trim();

    if (!isbn) {
        mostrarToast('Por favor, digite um código ISBN.');
        return;
    }

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const bookInfo = data.items[0].volumeInfo;

            document.getElementById('livroTitulo').value = bookInfo.title || '';
            document.getElementById('livroAutor').value = bookInfo.authors ? bookInfo.authors.join(', ') : 'Autor Desconhecido';
            document.getElementById('livroCategoria').value = bookInfo.categories ? bookInfo.categories[0] : 'Geral';
            document.getElementById('livroSinopse').value = bookInfo.description ? bookInfo.description.substring(0, 350) + '...' : 'Sem sinopse disponível.';

            if (bookInfo.imageLinks && bookInfo.imageLinks.thumbnail) {
                const fotoUrl = document.getElementById('livroFotoUrl');
                if (fotoUrl) fotoUrl.value = bookInfo.imageLinks.thumbnail.replace('http:', 'https:');
            }

            mostrarToast('Livro encontrado na base oficial do Google Books!');
        } else {
            // Fallback de demonstração caso a API pública recuse o ISBN
            document.getElementById('livroTitulo').value = "Dom Casmurro (Edição Especial)";
            document.getElementById('livroAutor').value = "Machado de Assis";
            document.getElementById('livroCategoria').value = "Literatura";
            document.getElementById('livroSinopse').value = "Clássico da literatura nacional sobre a dúvida e o ciúme de Bentinho.";
            const fotoUrl = document.getElementById('livroFotoUrl');
            if (fotoUrl) fotoUrl.value = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
            alert('ISBN não localizado diretamente na API. Preenchido com dados de demonstração.');
        }
    } catch (error) {
        console.error('Erro na requisição ISBN:', error);
        mostrarToast('Erro ao consultar a API do Google Books.');
    }
}

// ==========================================
// GESTÃO DE ACERVO E ISOLAMENTO POR UNIDADE
// ==========================================
function atualizarInterfaceGerente() {
    localStorage.setItem('bib_db', JSON.stringify(db));
    const dadosGerente = JSON.parse(localStorage.getItem('gerente_atual')) || { biblioteca: "Biblioteca Central" };

    // Filtra estritamente os livros da unidade do gerente logado
    const meusLivros = db.livros.filter(l => (l.bibliotecaNome || "Biblioteca Central") === dadosGerente.biblioteca);
    const meusEmprestimos = db.emprestimos.filter(e => {
        const liv = db.livros.find(l => l.id === e.livroId);
        return liv && (liv.bibliotecaNome || "Biblioteca Central") === dadosGerente.biblioteca;
    });

    const totalLivros = meusLivros.length;
    const empAtivos = meusEmprestimos.filter(e => e.status === 'Ativo').length;
    const totalExemplares = meusLivros.reduce((acc, l) => acc + Number(l.quantidadeTotal), 0);
    const disponiveis = totalExemplares - empAtivos;

    if (document.getElementById('statLivros')) document.getElementById('statLivros').innerText = totalLivros;
    if (document.getElementById('statEmprestimos')) document.getElementById('statEmprestimos').innerText = empAtivos;
    if (document.getElementById('statDisponiveis')) document.getElementById('statDisponiveis').innerText = Math.max(0, disponiveis);

    const maxVal = totalExemplares || 1;
    const pctDisp = Math.round((Math.max(0, disponiveis) / maxVal) * 100);
    const pctEmp = 100 - pctDisp;
    if (document.getElementById('barDisp')) document.getElementById('barDisp').style.width = pctDisp + '%';
    if (document.getElementById('barEmp')) document.getElementById('barEmp').style.width = pctEmp + '%';

    const select = document.getElementById('empLivroId');
    if (select) {
        select.innerHTML = '<option value="">Selecione o livro...</option>' +
            meusLivros.map(l => `<option value="${l.id}">${l.titulo} (Disp: ${l.quantidadeTotal - db.emprestimos.filter(e => e.livroId === l.id && e.status === 'Ativo').length})</option>`).join('');
    }

    const tabLivros = document.getElementById('tabelaLivrosGerente');
    if (tabLivros) {
        if (meusLivros.length === 0) {
            tabLivros.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-400">Nenhum livro cadastrado nesta unidade.</td></tr>`;
        } else {
            tabLivros.innerHTML = meusLivros.map(l => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td class="p-3">
                        <b class="text-slate-900 dark:text-white">${l.titulo}</b><br>
                        <span class="text-xs text-purple-600 dark:text-purple-400">ID: ${l.id}</span>
                    </td>
                    <td class="p-3 font-bold">${l.quantidadeTotal}</td>
                    <td class="p-3 text-right">
                        <button type="button" onclick="excluirLivro('${l.id}')" class="p-2 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/40 rounded-lg transition text-xs font-bold flex items-center gap-1 ml-auto">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Excluir
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    const ativos = meusEmprestimos.filter(e => e.status === 'Ativo');
    const tabEmp = document.getElementById('tabelaEmprestimosGerente');
    if (tabEmp) {
        if (ativos.length === 0) {
            tabEmp.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-400">Nenhum empréstimo ativo.</td></tr>`;
        } else {
            tabEmp.innerHTML = ativos.map(e => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td class="p-3">
                        <b class="text-slate-900 dark:text-white">${e.nome}</b><br>
                        <span class="text-xs text-pink-600 dark:text-pink-400">${e.livroTitulo}</span>
                    </td>
                    <td class="p-3 text-xs text-slate-500">${e.data}</td>
                    <td class="p-3 text-right">
                        <button type="button" onclick="darBaixaEmprestimo('${e.id}')" class="px-3 py-1.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/40 rounded-lg transition text-xs font-bold flex items-center gap-1 ml-auto">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i> Devolver
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// CARREGAR DADOS DO SUPABASE
// ==========================================
async function carregarDadosDoBanco() {
    try {
        const { data: livros, error: errLivros } = await supabaseClient.from('livros').select('*');
        const { data: emprestimos, error: errEmp } = await supabaseClient.from('emprestimos').select('*');

        if (errLivros || errEmp) {
            console.error('Erro ao buscar dados do Supabase:', errLivros || errEmp);
            return { livros: [], emprestimos: [] };
        }

        return {
            livros: livros.map(l => ({
                id: l.codigo_livro,
                bibliotecaNome: l.biblioteca_nome,
                titulo: l.titulo,
                autor: l.autor,
                categoria: l.categoria,
                foto: l.foto,
                quantidadeTotal: l.quantidade_total,
                sinopse: l.sinopse
            })),
            emprestimos: emprestimos.map(e => ({
                id: e.codigo_emp,
                livroId: e.livro_id,
                livroTitulo: e.livro_titulo,
                nome: e.nome_leitor,
                cpf: e.cpf_leitor,
                endereco: e.endereco_leitor,
                data: e.data_emp,
                status: e.status
            }))
        };
    } catch (e) {
        console.error('Erro de conexão:', e);
        return { livros: [], emprestimos: [] };
    }
}

// ==========================================
// CADASTRAR LIVRO NO SUPABASE
// ==========================================
async function cadastrarLivro(e) {
    e.preventDefault();
    const fileInput = document.getElementById('livroFotoFile');
    const file = fileInput.files[0];
    const dadosGerente = JSON.parse(localStorage.getItem('gerente_atual')) || { biblioteca: "Biblioteca Central" };

    if (file) {
        const reader = new FileReader();
        reader.onload = async function (event) {
            const base64Image = event.target.result;
            const novoId = 'LIV-' + Math.floor(1000 + Math.random() * 9000);

            const { error } = await supabaseClient.from('livros').insert([{
                codigo_livro: novoId,
                biblioteca_nome: dadosGerente.biblioteca,
                titulo: document.getElementById('livroTitulo').value,
                autor: document.getElementById('livroAutor').value,
                categoria: document.getElementById('livroCategoria').value,
                foto: base64Image,
                quantidade_total: Number(document.getElementById('livroQtd').value),
                sinopse: document.getElementById('livroSinopse').value
            }]);

            if (error) {
                alert('Erro ao cadastrar livro no banco: ' + error.message);
            } else {
                document.getElementById('formLivro').reset();
                atualizarInterfaceGerente();
                alert(`Livro cadastrado com sucesso no Supabase! ID: ${novoId}`);
            }
        };
        reader.readAsDataURL(file);
    }
}

// ==========================================
// REGISTRAR EMPRÉSTIMO NO SUPABASE
// ==========================================
async function registrarEmprestimo(e) {
    e.preventDefault();
    const idLivro = document.getElementById('empLivroId').value;

    // Busca dados atuais do banco
    const db = await carregarDadosDoBanco();
    const livro = db.livros.find(l => l.id === idLivro);
    if (!livro) return;

    const ativosLivro = db.emprestimos.filter(emp => emp.livroId === idLivro && emp.status === 'Ativo').length;
    if (ativosLivro >= livro.quantidadeTotal) {
        alert('Todos os exemplares deste livro já estão emprestados!');
        return;
    }

    const novoEmpId = 'EMP-' + Math.floor(1000 + Math.random() * 9000);
    const { error } = await supabaseClient.from('emprestimos').insert([{
        codigo_emp: novoEmpId,
        livro_id: idLivro,
        livro_titulo: livro.titulo,
        nome_leitor: document.getElementById('empNome').value,
        cpf_leitor: document.getElementById('empCpf').value,
        endereco_leitor: document.getElementById('empEndereco').value,
        data_emp: new Date().toLocaleDateString('pt-BR'),
        status: 'Ativo'
    }]);

    if (error) {
        alert('Erro ao registrar empréstimo: ' + error.message);
    } else {
        document.getElementById('formEmprestimo').reset();
        atualizarInterfaceGerente();
        alert('Empréstimo registrado com sucesso no Supabase!');
    }
}

// ==========================================
// DAR BAIXA EM EMPRÉSTIMO (DEVOLUÇÃO)
// ==========================================
async function darBaixaEmprestimo(empId) {
    const { error } = await supabaseClient
        .from('emprestimos')
        .update({ status: 'Devolvido' })
        .eq('codigo_emp', empId);

    if (error) {
        alert('Erro ao atualizar devolução: ' + error.message);
    } else {
        atualizarInterfaceGerente();
        alert('Devolução confirmada no banco de dados!');
    }
}

// ==========================================
// EXCLUIR LIVRO
// ==========================================
async function excluirLivro(id) {
    if (confirm('Tem certeza que deseja excluir este livro do Supabase?')) {
        const { error } = await supabaseClient
            .from('livros')
            .delete()
            .eq('codigo_livro', id);

        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            atualizarInterfaceGerente();
        }
    }
}

function copiarLinkLeitor() {
    const url = window.location.href.replace('gerente.html', 'leitor.html');
    navigator.clipboard.writeText(url);
    mostrarToast('Link público da estante copiado!');
}

if (localStorage.getItem('gerente_logado') === 'true') {
    mostrarPainelGerente();
}
if (typeof lucide !== 'undefined') lucide.createIcons();