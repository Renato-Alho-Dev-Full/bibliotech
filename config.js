// config.js — inclua ANTES dos outros scripts
const SUPABASE_URL = 'https://gwdpnesdtifwvcbxbkko.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GtiWd4H_VxZXZwbXEBHuow_YOxFuF_N';

// Carrega Supabase
(function loadSupabase(cb) {
    if (window.supabase) return cb();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = cb;
    document.head.appendChild(s);
})(() => {
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.dispatchEvent(new Event('supabase:ready'));
});