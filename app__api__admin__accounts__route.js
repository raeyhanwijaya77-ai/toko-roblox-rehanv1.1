import { sql, init } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
const deny = async () => !isAdmin(await getUser());
const bad = (m) => Response.json({ error: m }, { status: 400 });
const clean = (images) => (Array.isArray(images) ? images : []).filter((s) => typeof s === 'string' && /^(https?:\/\/|data:image\/)/.test(s)).slice(0, 8);
export async function GET() {
  if (await deny()) return Response.json({}, { status: 403 });
  await init();
  return Response.json(await sql`select * from accounts order by id desc`);
}
export async function POST(req) {
  if (await deny()) return Response.json({}, { status: 403 });
  await init();
  const { title, description, specs, price, images, username, password } = await req.json();
  const imgs = clean(images);
  const p = parseInt(price);
  if (!title || !p || p < 1 || !username || !password) return bad('Lengkapi judul, harga, username, dan password akun');
  if (!imgs.length) return bad('Tambahkan minimal 1 foto');
  await sql`insert into accounts(title,description,specs,price,images,username,password) values(${title},${description || ''},${specs || ''},${p},${JSON.stringify(imgs)}::jsonb,${username},${password})`;
  return Response.json({ ok: 1 });
}
export async function PUT(req) {
  if (await deny()) return Response.json({}, { status: 403 });
  await init();
  const { id, title, description, specs, price, images, username, password, status } = await req.json();
  const imgs = clean(images);
  const p = parseInt(price);
  if (!id || !title || !p || p < 1 || !username || !password) return bad('Lengkapi judul, harga, username, dan password akun');
  if (!imgs.length) return bad('Tambahkan minimal 1 foto');
  const st = ['available', 'reserved', 'sold'].includes(status) ? status : null;
  await sql`update accounts set title=${title},description=${description || ''},specs=${specs || ''},price=${p},images=${JSON.stringify(imgs)}::jsonb,username=${username},password=${password},status=coalesce(${st}::text,status),reserved_at=case when ${st}::text='available' then null else reserved_at end where id=${id}`;
  return Response.json({ ok: 1 });
}
export async function PATCH(req) {
  if (await deny()) return Response.json({}, { status: 403 });
  await init();
  const { id, status } = await req.json();
  if (!id || !['available', 'reserved', 'sold'].includes(status)) return bad('Status tidak valid');
  await sql`update accounts set status=${status}::text,reserved_at=case when ${status}::text='available' then null else reserved_at end where id=${id}`;
  return Response.json({ ok: 1 });
}
export async function DELETE(req) {
  if (await deny()) return Response.json({}, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  const [cur] = await sql`select status from accounts where id=${id}`;
  if (cur?.status === 'sold') return bad('Akun yang sudah terjual tidak bisa dihapus karena dipakai di riwayat pembeli. Ubah statusnya lewat Edit jika perlu.');
  await sql`delete from accounts where id=${id}`;
  return Response.json({ ok: 1 });
}
