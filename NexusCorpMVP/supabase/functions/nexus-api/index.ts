import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type, x-nexus-admin', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const encoder = new TextEncoder();
const base64url = (value: Uint8Array | string) => {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value;
  let output = ''; bytes.forEach((byte) => output += String.fromCharCode(byte));
  return btoa(output).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
};
const decode = (value: string) => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=')), (char) => char.charCodeAt(0));
const hmac = async (value: string, secret: string) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
};
const makeToken = async (deviceId: string, secret: string) => { const payload = base64url(JSON.stringify({ deviceId, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })); return `${payload}.${await hmac(payload, secret)}`; };
const validToken = async (token: string, deviceId: string, secret: string) => {
  const [payload, signature] = token.split('.'); if (!payload || !signature || signature !== await hmac(payload, secret)) return false;
  try { const data = JSON.parse(new TextDecoder().decode(decode(payload))); return data.deviceId === deviceId && data.exp > Date.now(); } catch { return false; }
};
const bad = (message: string, status = 400) => new Response(JSON.stringify({ error: message }), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return bad('Método no permitido', 405);
  try {
    const body = await request.json(); const { action, deviceId } = body;
    if (!deviceId || !/^[0-9a-f-]{36}$/i.test(deviceId)) return bad('Identificador de dispositivo inválido');
    const url = Deno.env.get('SUPABASE_URL')!; const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminPassphrase = Deno.env.get('NEXUS_ADMIN_PASSPHRASE')!; const tokenSecret = Deno.env.get('NEXUS_ADMIN_TOKEN_SECRET')!;
    const db = createClient(url, serviceKey);
    const isAdmin = await validToken(request.headers.get('X-Nexus-Admin') || '', deviceId, tokenSecret);
    if (action === 'admin-login') {
      if (!body.passphrase || body.passphrase !== adminPassphrase) return bad('Clave de administrador incorrecta', 403);
      return new Response(JSON.stringify({ token: await makeToken(deviceId, tokenSecret) }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    if (action === 'sync') {
      if (!body.save || typeof body.companyName !== 'string') return bad('Partida inválida');
      const { data: current, error: readError } = await db.from('corporations').select('*').eq('device_id', deviceId).maybeSingle(); if (readError) throw readError;
      const revision = Number(body.revision || 0);
      if (current && current.admin_revision > revision) return new Response(JSON.stringify({ force: true, save: current.save, revision: current.admin_revision }), { headers: { ...cors, 'Content-Type': 'application/json' } });
      const { error } = await db.from('corporations').upsert({ device_id: deviceId, company_name: body.companyName.slice(0, 22), save: body.save, admin_revision: current?.admin_revision || 0, updated_at: new Date().toISOString() }, { onConflict: 'device_id' }); if (error) throw error;
      return new Response(JSON.stringify({ force: false, revision: current?.admin_revision || 0 }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    if (!isAdmin) return bad('Autorización de administrador requerida', 403);
    if (action === 'admin-list') {
      const { data, error } = await db.from('corporations').select('id,company_name,save,updated_at,admin_revision').order('updated_at', { ascending: false }).limit(250); if (error) throw error;
      return new Response(JSON.stringify({ companies: data }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    if (action === 'admin-update') {
      const { data: corporation, error: loadError } = await db.from('corporations').select('*').eq('id', body.corporationId).single(); if (loadError || !corporation) return bad('Empresa no encontrada', 404);
      const save = corporation.save || {}; save.engine ||= {};
      if (Number.isFinite(body.money)) save.engine.money = Math.max(0, Math.floor(body.money));
      if (Number.isFinite(body.reputation)) save.engine.reputation = Math.max(0, Math.min(100, Math.floor(body.reputation)));
      const revision = corporation.admin_revision + 1;
      const { error } = await db.from('corporations').update({ save, admin_revision: revision, updated_at: new Date().toISOString() }).eq('id', corporation.id); if (error) throw error;
      return new Response(JSON.stringify({ revision }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    return bad('Acción desconocida');
  } catch (error) { console.error(error); return bad('Error interno del servicio', 500); }
});
