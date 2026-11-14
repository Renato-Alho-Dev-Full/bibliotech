import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
    const cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

    // Valida que o chamador é admin (via JWT)
    const auth = req.headers.get('Authorization') || '';
    const token = auth.replace('Bearer ', '');
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user || user.app_metadata?.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: cors });
    }

    const { action, payload } = await req.json();
    let result;

    if (action === 'listar') {
        const [{ data: gerentes }, { data: vendas }] = await Promise.all([
            sb.from('gerentes').select('*'),
            sb.from('vendas').select('*')
        ]);
        result = { gerentes, vendas };
    }
    else if (action === 'criar_gerente') {
        const { email, senha, biblioteca, gerente, usuario } = payload;

        // Cria usuário Auth
        const { data: u, error: ue } = await sb.auth.admin.createUser({
            email, password: senha, email_confirm: true
        });
        if (ue) return new Response(JSON.stringify({ error: ue.message }), { status: 400, headers: cors });

        const codigo = 'MGR-' + Date.now().toString(36).toUpperCase();
        const { data, error: ie } = await sb.from('gerentes').insert([{
            codigo_mgr: codigo,
            biblioteca, gerente, email, usuario,
            senha_hash: 'auth_managed',
            data_entrada: new Date().toLocaleDateString('pt-BR'),
            pagamento: 'Pendente',
            validade: 'Pendente',
            auth_user_id: u.user.id
        }]).select().single();

        if (ie) return new Response(JSON.stringify({ error: ie.message }), { status: 400, headers: cors });
        result = data;
    }
    else if (action === 'venda') {
        const { gerenteId, meses, statusPgto } = payload;
        const precos = { 1: 97, 4: 350, 6: 500, 12: 900 };
        const { data: g } = await sb.from('gerentes').select('*').eq('codigo_mgr', gerenteId).single();
        if (!g) return new Response(JSON.stringify({ error: 'gerente não encontrado' }), { status: 404, headers: cors });

        const validade = new Date();
        validade.setMonth(validade.getMonth() + meses);

        await sb.from('gerentes').update({
            validade: validade.toLocaleDateString('pt-BR'),
            pagamento: statusPgto
        }).eq('codigo_mgr', gerenteId);

        const { data, error: ve } = await sb.from('vendas').insert([{
            codigo_venda: 'VD-' + Date.now().toString(36).toUpperCase(),
            biblioteca: g.biblioteca,
            valor: precos[meses] || 100,
            data_venda: new Date().toLocaleDateString('pt-BR')
        }]).select().single();

        if (ve) return new Response(JSON.stringify({ error: ve.message }), { status: 400, headers: cors });
        result = data;
    }
    else if (action === 'excluir_gerente') {
        const { gerenteId } = payload;
        const { data: g } = await sb.from('gerentes').select('auth_user_id').eq('codigo_mgr', gerenteId).single();
        if (g?.auth_user_id) await sb.auth.admin.deleteUser(g.auth_user_id);
        await sb.from('gerentes').delete().eq('codigo_mgr', gerenteId);
        result = { ok: true };
    }
    else {
        return new Response(JSON.stringify({ error: 'ação inválida' }), { status: 400, headers: cors });
    }

    return new Response(JSON.stringify(result), { headers: { ...cors, 'Content-Type': 'application/json' } });
});