import { redirect } from 'next/navigation';
import { sql, init } from '@/lib/db';
import { getUser } from '@/lib/auth';
import Reveal from '@/components/Reveal';
import PwOtp from '@/components/PwOtp';
export const dynamic = 'force-dynamic';
export default async function Profil() {
  const u = await getUser();
  if (!u) redirect('/login');
  await init();
  const [r] = await sql`select username,email from users where id=${u.id}`;
  if (!r) redirect('/login');
  return (
    <div className="w">
      <Reveal>
        <div className="box" style={{ maxWidth: 520 }}>
          <div className="avatar">{(r.username || r.email)[0].toUpperCase()}</div>
          <h2 style={{ textAlign: 'center' }}>{r.username || 'Pengguna'}</h2>
          <p className="mut" style={{ textAlign: 'center', marginBottom: 18 }}>{r.email}</p>
          <h3 style={{ marginBottom: 10 }}>Ganti password</h3>
          <PwOtp email={r.email} />
        </div>
      </Reveal>
    </div>
  );
}
