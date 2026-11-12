<?php
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"), true);
$acao = $_GET['acao'] ?? ($dados['acao'] ?? '');

// 1. Leitor e Gerente: Pega livros e empréstimos
if ($acao === 'getAcervo') {
    try {
        $livros = $pdo->query("SELECT * FROM livros")->fetchAll(PDO::FETCH_ASSOC);
        $emprestimos = $pdo->query("SELECT * FROM emprestimos")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["livros" => $livros, "emprestimos" => $emprestimos]);
    } catch (PDOException $e) {
        echo json_encode(["livros" => [], "emprestimos" => [], "erro" => $e->getMessage()]);
    }
    exit;
}

// 2. Gerente: Adicionar Livro
if ($acao === 'addLivro') {
    $stmt = $pdo->prepare("INSERT INTO livros (id, titulo, autor, categoria, foto, quantidadeTotal, sinopse) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $dados['id'], $dados['titulo'], $dados['autor'], 
        $dados['categoria'], $dados['foto'], $dados['quantidadeTotal'], $dados['sinopse']
    ]);
    echo json_encode(["sucesso" => true]);
    exit;
}

// 3. Gerente: Excluir Livro
if ($acao === 'delLivro') {
    $stmt = $pdo->prepare("DELETE FROM livros WHERE id = ?");
    $stmt->execute([$dados['id']]);
    echo json_encode(["sucesso" => true]);
    exit;
}

// 4. Gerente: Registrar Empréstimo
if ($acao === 'addEmprestimo') {
    $stmt = $pdo->prepare("INSERT INTO emprestimos (id, livroId, livroTitulo, nome, cpf, endereco, data, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $dados['id'], $dados['livroId'], $dados['livroTitulo'], 
        $dados['nome'], $dados['cpf'], $dados['endereco'], 
        $dados['data'], $dados['status']
    ]);
    echo json_encode(["sucesso" => true]);
    exit;
}

// 5. Gerente: Devolução (Baixa)
if ($acao === 'baixaEmprestimo') {
    $stmt = $pdo->prepare("UPDATE emprestimos SET status = 'Devolvido' WHERE id = ?");
    $stmt->execute([$dados['id']]);
    echo json_encode(["sucesso" => true]);
    exit;
}

// 6. Admin Master: Buscar Gerentes
if ($acao === 'getGerentes') {
    try {
        $gerentes = $pdo->query("SELECT * FROM gerentes")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["gerentes" => $gerentes]);
    } catch (PDOException $e) {
        echo json_encode(["gerentes" => []]);
    }
    exit;
}

// 7. Admin Master: Adicionar Gerente
if ($acao === 'addGerente') {
    $stmt = $pdo->prepare("INSERT INTO gerentes (id, biblioteca, gerente, email, usuario, senha, dataEntrada, pagamento, validade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $dados['id'], $dados['biblioteca'], $dados['gerente'], 
        $dados['email'], $dados['usuario'], $dados['senha'], 
        $dados['dataEntrada'], $dados['pagamento'], $dados['validade']
    ]);
    echo json_encode(["sucesso" => true]);
    exit;
}

// 8. Admin Master: Editar Gerente
// 8. Admin Master: Editar Gerente
if ($acao === 'editGerente') {
    $stmt = $pdo->prepare("UPDATE gerentes SET biblioteca = ?, gerente = ?, usuario = ?, senha = ? WHERE id = ?");
    $stmt->execute([
        $dados['biblioteca'], 
        $dados['gerente'], 
        $dados['usuario'], 
        $dados['senha'], 
        $dados['id']
    ]);
    echo json_encode(["sucesso" => true]);
    exit;
}

// 9. Admin Master: Excluir Gerente
if ($acao === 'delGerente') {
    $stmt = $pdo->prepare("DELETE FROM gerentes WHERE id = ?");
    $stmt->execute([$dados['id']]);
    echo json_encode(["sucesso" => true]);
    exit;
}

// 10. Admin Master: Renovar Licença (PDV)
if ($acao === 'renovarLicenca') {
    $stmt = $pdo->prepare("UPDATE gerentes SET pagamento = ?, validade = ? WHERE id = ?");
    $stmt->execute([$dados['statusPgto'], $dados['novaValidade'], $dados['id']]);
    echo json_encode(["sucesso" => true]);
    exit;
}
?>