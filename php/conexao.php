<?php
// Configurações do Banco de Dados
$host = 'localhost';
$dbname = 'bibliotech'; // Nome do banco que criamos
$user = 'root';
$pass = ''; // Coloque a sua senha do MySQL aqui (ou deixe vazio se não tiver)

// Configuração de cabeçalhos CORS (para permitir que o JS chame o PHP sem bloqueios)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Criação da conexão via PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    // Ativa a exibição de erros do banco para facilitar o debug
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Se der erro na conexão, retorna um JSON de erro para o frontend
    die(json_encode(["sucesso" => false, "erro" => "Falha crítica ao conectar no banco de dados: " . $e->getMessage()]));
}
?>