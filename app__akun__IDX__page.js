import { notFound } from 'next/navigation';
import { sql, init, getFee } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { logAct } from '@/lib/activity';
import Reveal from '@/components/Reveal';
import Gallery from '@/components/Gallery';
import Buy from './buy';
export const dynamic = 'force-dynamic';
export default async function Detail({ params }) {
  const { id } = await params;
  await init();
  const [a] = await sql`select id,title,description,specs,price,images,status from accounts where id=${id}`;
  if (!a) notFound();
  const fee = await getFee();
  const me = await getUser();
  if (me) await logAct('lihat_akun', { user: me, detail: a.title, dedupe: 10 });
  const specs = String(a.specs || '').split('\n').map((x) => x.trim()).filter(Boolean);
  return (
    <div className="w">
      <a href="/#stok" className="mut">Kembali ke stok</a>
      <div className="det">
        <Reveal><Gallery images={a.images || []} alt={a.title} /></Reveal>
        <Reveal delay={0.1} className="buyw">
          <div className="buy">
            <h1>{a.title}</h1>
            <p className="price">Rp {a.price.toLocaleString('id-ID')}</p>
            {specs.length > 0 && (
              <div className="specs"><b>Spesifikasi akun</b><ul>{specs.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            )}
            {a.description && <p className="desc">{a.description}</p>}
            <ul className="pts">
              <li>Bayar QRIS, terverifikasi otomatis</li>
              <li>Data login tampil setelah pembayaran lunas</li>
              <li>Admin membantu mengamankan akun</li>
            </ul>
            {a.status === 'sold' ? <b className="err">Sudah terjual</b> : <Buy id={a.id} price={a.price} fee={fee} />}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
