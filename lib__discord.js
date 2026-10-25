import { sql } from './db';
const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
async function hook() {
  const [r] = await sql`select v from meta where k='discord_url'`;
  return r?.v || process.env.DISCORD_WEBHOOK_URL || '';
}
export async function sendDiscord(payload) {
  try {
    const u = await hook();
    if (!u) return false;
    const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'Toko Akun Rehan', ...payload }) });
    return r.ok;
  } catch { return false; }
}
async function summary() {
  const [a] = await sql`select count(*) filter (where status='available')::int as ready, count(*) filter (where status='reserved')::int as held, count(*) filter (where status='sold')::int as sold from accounts`;
  const [o] = await sql`select count(*)::int as n, coalesce(sum(amount-coalesce(fee,0)),0)::int as rev, count(*) filter (where created::date=current_date)::int as tn, coalesce(sum(amount-coalesce(fee,0)) filter (where created::date=current_date),0)::int as trev from orders where status='paid'`;
  return { ready: a.ready, held: a.held, sold: a.sold, orders: o.n, rev: o.rev, todayN: o.tn, todayRev: o.trev };
}
export async function notifySale(o) {
  try {
    const [a] = await sql`select title from accounts where id=${o.account_id}`;
    const [b] = await sql`select username,email from users where id=${o.user_id}`;
    const s = await summary();
    const fields = [
      { name: 'Akun', value: a?.title || '-' },
      { name: 'Pembeli', value: b?.username || b?.email || '-', inline: true },
      { name: 'Dibayar pembeli', value: rp(o.amount), inline: true },
      { name: 'Diterima bersih', value: rp(o.amount - (o.fee || 0)), inline: true },
    ];
    if (o.voucher) fields.push({ name: 'Voucher', value: `${o.voucher} (hemat ${rp(o.discount)})`, inline: true });
    fields.push(
      { name: 'Stok tersisa', value: String(s.ready), inline: true },
      { name: 'Total terjual', value: String(s.orders), inline: true },
      { name: 'Total penghasilan', value: rp(s.rev), inline: true },
    );
    await sendDiscord({ embeds: [{ title: '💰 Akun terjual', color: 0x10b981, fields, footer: { text: s.ready <= 3 ? '⚠ Stok menipis, segera tambah akun' : 'Toko Akun Rehan' }, timestamp: new Date().toISOString() }] });
  } catch {}
}
export async function notifyConflict(o) {
  try {
    const [a] = await sql`select title from accounts where id=${o.account_id}`;
    const [b] = await sql`select username,email from users where id=${o.user_id}`;
    await sendDiscord({ embeds: [{ title: '⚠ Pembayaran masuk, tapi akun sudah terjual', color: 0xfb7185, description: 'Pembeli membayar setelah waktu pesanan habis dan akunnya sudah dibeli orang lain. Hubungi pembeli untuk refund atau akun pengganti.', fields: [{ name: 'Order', value: o.id, inline: true }, { name: 'Akun', value: a?.title || '-', inline: true }, { name: 'Pembeli', value: b?.username || b?.email || '-', inline: true }, { name: 'Dibayar', value: rp(o.amount), inline: true }], timestamp: new Date().toISOString() }] });
  } catch {}
}
export async function notifyReview(name, rating, body) {
  try {
    await sendDiscord({ embeds: [{ title: '⭐ Testimoni baru', color: 0xfbbf24, description: String(body || '').slice(0, 300), fields: [{ name: 'Pembeli', value: name || '-', inline: true }, { name: 'Rating', value: '★'.repeat(rating) + '☆'.repeat(5 - rating), inline: true }], timestamp: new Date().toISOString() }] });
  } catch {}
}
export async function sendReport() {
  const s = await summary();
  return sendDiscord({ embeds: [{ title: '📊 Laporan toko', color: 0x0ea5e9, fields: [
    { name: 'Stok tersedia', value: String(s.ready), inline: true },
    { name: 'Sedang ditahan', value: String(s.held), inline: true },
    { name: 'Akun terjual', value: String(s.sold), inline: true },
    { name: 'Pesanan lunas', value: String(s.orders), inline: true },
    { name: 'Total penghasilan', value: rp(s.rev), inline: true },
    { name: 'Hari ini', value: `${s.todayN} pesanan, ${rp(s.todayRev)}`, inline: true },
  ], timestamp: new Date().toISOString() }] });
}
