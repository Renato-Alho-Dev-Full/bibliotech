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

let masterDb = JSON.parse(localStorage.getItem('keven_master_db')) || {
    gerentes: [
        { id: "MGR-101", biblioteca: "Biblioteca Central", gerente: "Ana Souza", email: "ana@biblioteca.com", usuario: "gerente", senha: "123", dataEntrada: "10/01/2026", pagamento: "Pago", validade: "10/01/2027" }
    ],
    vendas: [
        { id: "VD-1", biblioteca: "Biblioteca Central", valor: 900, data: "10/01/2026" }
    ]
};

function fazerLoginAdmin(e) {
    e.preventDefault();
    const u = document.getElementById('userAdmin').value.trim();
    const p = document.getElementById('passAdmin').value.trim();
    const erroDiv = document.getElementById('erroLoginAdmin');

    if (u === 'admin' && p === 'admin123') {
        localStorage.setItem('admin_logado', 'true');
        erroDiv.classList.add('hidden');
        mostrarPainel();
    } else {
        erroDiv.innerHTML = `<i data-lucide="x-circle" class="inline w-4 h-4 mr-1"></i> Credenciais incorretas!`;
        erroDiv.classList.remove('hidden');
        lucide.createIcons();
    }
}

function mostrarPainel() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('panelSection').classList.remove('hidden');
    atualizarMasterUI();
    lucide.createIcons();
}

function logoutAdmin() {
    localStorage.removeItem('admin_logado');
    location.reload();
}

function atualizarMasterUI() {
    localStorage.setItem('keven_master_db', JSON.stringify(masterDb));

    document.getElementById('statGerentes').innerText = masterDb.gerentes.length;
    document.getElementById('statLicencas').innerText = masterDb.gerentes.filter(g => g.pagamento === 'Pago').length;
    const totalFat = masterDb.vendas.reduce((acc, v) => acc + v.valor, 0);
    document.getElementById('statFaturamento').innerText = 'R$ ' + totalFat.toLocaleString('pt-BR');

    const select = document.getElementById('pdvGerenteId');
    if (select) {
        select.innerHTML = '<option value="">Escolha um cliente cadastrado...</option>' +
            masterDb.gerentes.map(g => `<option value="${g.id}">${g.biblioteca} (${g.gerente})</option>`).join('');
    }

    const tbody = document.getElementById('tabelaCrmGerentes');
    if (tbody) {
        if (masterDb.gerentes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Nenhum gerente cadastrado.</td></tr>`;
        } else {
            tbody.innerHTML = masterDb.gerentes.map(g => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td class="p-3">
                        <b class="text-slate-900 dark:text-white">${g.biblioteca}</b><br>
                        <span class="text-xs text-purple-600 dark:text-purple-400">${g.gerente}</span>
                    </td>
                    <td class="p-3 font-mono text-xs">
                        <span class="text-sky-700 dark:text-sky-400">U: ${g.usuario}</span><br>
                        <span class="text-pink-600 dark:text-pink-400">P: ${g.senha}</span>
                    </td>
                    <td class="p-3">
                        <span class="px-2 py-1 text-[10px] font-bold rounded-full ${g.pagamento === 'Pago' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}">
                            ${g.pagamento}
                        </span>
                    </td>
                    <td class="p-3 text-xs font-mono text-purple-700 dark:text-purple-400">${g.validade}</td>
                    <td class="p-3 text-center">
                        <div class="inline-flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button type="button" onclick="estenderLicenca('${g.id}', 1)" class="px-1.5 py-1 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-bold text-[10px]">+1</button>
                            <button type="button" onclick="estenderLicenca('${g.id}', 6)" class="px-1.5 py-1 text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 font-bold text-[10px]">+6</button>
                            <button type="button" onclick="estenderLicenca('${g.id}', 12)" class="px-1.5 py-1 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 font-bold text-[10px]">+12</button>
                        </div>
                    </td>
                    <td class="p-3 text-right">
                        <div class="inline-flex gap-2">
                            <button type="button" onclick="abrirModalEdicao('${g.id}')" class="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/40 rounded-lg transition" title="Editar">
                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                            </button>
                            <button type="button" onclick="excluirGerente('${g.id}')" class="p-2 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/40 rounded-lg transition" title="Apagar Gerente">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
    lucide.createIcons();
}

function cadastrarGerente(e) {
    e.preventDefault();
    const novoGerente = {
        id: 'MGR-' + Math.floor(100 + Math.random() * 900),
        biblioteca: document.getElementById('cadBibNome').value,
        gerente: document.getElementById('cadGerenteNome').value,
        email: document.getElementById('cadEmail').value,
        usuario: document.getElementById('cadUserLogin').value,
        senha: document.getElementById('cadUserSenha').value,
        dataEntrada: new Date().toLocaleDateString('pt-BR'),
        pagamento: 'Pendente',
        validade: 'Pendente (Aguardando)'
    };
    masterDb.gerentes.push(novoGerente);
    document.getElementById('cadBibNome').value = '';
    document.getElementById('cadGerenteNome').value = '';
    document.getElementById('cadEmail').value = '';
    document.getElementById('cadUserLogin').value = '';
    document.getElementById('cadUserSenha').value = '';
    atualizarMasterUI();
    mostrarToast('Gerente cadastrado com sucesso no CRM!');
}

function excluirGerente(id) {
    if (confirm("Tem certeza que deseja apagar este gerente?")) {
        masterDb.gerentes = masterDb.gerentes.filter(g => g.id !== id);
        atualizarMasterUI();
    }
}

function abrirModalEdicao(id) {
    const g = masterDb.gerentes.find(item => item.id === id);
    if (g) {
        document.getElementById('editGerenteId').value = g.id;
        document.getElementById('editBibNome').value = g.biblioteca;
        document.getElementById('editGerenteNome').value = g.gerente;
        document.getElementById('editUserLogin').value = g.usuario;
        document.getElementById('editUserSenha').value = g.senha;
        document.getElementById('modalEditar').classList.remove('hidden');
    }
}

function fecharModalEdicao() {
    document.getElementById('modalEditar').classList.add('hidden');
}

function salvarEdicaoGerente(e) {
    e.preventDefault();
    const id = document.getElementById('editGerenteId').value;
    const g = masterDb.gerentes.find(item => item.id === id);
    if (g) {
        g.biblioteca = document.getElementById('editBibNome').value;
        g.gerente = document.getElementById('editGerenteNome').value;
        g.usuario = document.getElementById('editUserLogin').value;
        g.senha = document.getElementById('editUserSenha').value;
        fecharModalEdicao();
        atualizarMasterUI();
        mostrarToast("Dados atualizados com sucesso!");
    }
}

function realizarVendaPDV(e) {
    e.preventDefault();
    const idGerente = document.getElementById('pdvGerenteId').value;
    const meses = Number(document.getElementById('pdvMeses').value);
    const statusPgto = document.getElementById('pdvStatusPgto').value;
    const gerente = masterDb.gerentes.find(g => g.id === idGerente);

    if (!gerente) return;
    const precos = { 1: 97, 4: 350, 6: 500, 12: 900 };

    const dataVal = new Date();
    dataVal.setMonth(dataVal.getMonth() + meses);
    gerente.validade = dataVal.toLocaleDateString('pt-BR');
    gerente.pagamento = statusPgto;

    masterDb.vendas.push({
        id: 'VD-' + Math.floor(1000 + Math.random() * 9000),
        biblioteca: gerente.biblioteca,
        valor: precos[meses] || 100,
        data: new Date().toLocaleDateString('pt-BR')
    });
    atualizarMasterUI();
    mostrarToast(`Licença de ${meses} meses ativada com sucesso!`);
}

function estenderLicenca(gerenteId, meses) {
    const g = masterDb.gerentes.find(item => item.id === gerenteId);
    if (g) {
        let baseDate = new Date();
        if (g.validade && !g.validade.includes('Pendente')) {
            const partes = g.validade.split('/');
            const parsed = new Date(partes[2], partes[1] - 1, partes[0]);
            if (parsed > baseDate) baseDate = parsed;
        }
        baseDate.setMonth(baseDate.getMonth() + meses);
        g.validade = baseDate.toLocaleDateString('pt-BR');
        g.pagamento = 'Pago';
        atualizarMasterUI();
    }
}

if (localStorage.getItem('admin_logado') === 'true') {
    mostrarPainel();
}
lucide.createIcons();