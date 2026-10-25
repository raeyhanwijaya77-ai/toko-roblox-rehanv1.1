'use client';
import { useEffect, useState } from 'react';
export default function PwOtp({ email }) {
  const [on, setOn] = useState(null);
  const [otp, setOtp] = useState(''), [pw, setPw] = useState(''), [old, setOld] = useState('');
  const [m, setM] = useState(''), [ok, setOk] = useState(false), [busy, setB] = useState(false);
  useEffect(() => { fetch('/api/auth').then((r) => r.json()).then((d) => setOn(!!d.otp)).catch(() => setOn(false)); }, []);
  const post = (url, body) => fetch(url, { method: 'POST', body: JSON.stringify(body) })
    .then(async (r) => { let j = {}; try { j = await r.json(); } catch {} return { ok: r.ok, error: j.error || (r.ok ? '' : 'Server error ' + r.status) }; })
    .catch(() => ({ ok: false, error: 'Koneksi gagal' }));
  async function send() {
    setM('');
    const d = await post('/api/auth', { mode: 'forgot_send', login: email });
    setOk(d.ok); setM(d.ok ? 'Kode dikirim ke ' + email + ' (cek juga folder Spam).' : d.error);
  }
  async function save(ev) {
    ev.preventDefault(); setB(true); setM('');
    const d = on ? await post('/api/auth', { mode: 'forgot_reset', login: email, otp, password: pw }) : await post('/api/profile/password', { old, password: pw });
    setB(false); setOk(d.ok); setM(d.ok ? 'Password berhasil diganti' : d.error);
    if (d.ok) { setPw(''); setOtp(''); setOld(''); }
  }
  if (on === null) return <p className="mut">Memuat…</p>;
  return (
    <form onSubmit={save}>
      {on ? (
        <>
          <p className="mut" style={{ marginBottom: 10 }}>Verifikasi dengan kode OTP yang dikirim ke Gmail kamu.</p>
          <button type="button" className="btn o sm" style={{ marginBottom: 12 }} onClick={send}>Kirim kode OTP</button>
          <input inputMode="numeric" placeholder="Kode 6 digit" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        </>
      ) : (
        <input type="password" placeholder="Password lama" value={old} onChange={(e) => setOld(e.target.value)} required />
      )}
      <input type="password" placeholder="Password baru (min. 6 karakter)" value={pw} onChange={(e) => setPw(e.target.value)} required />
      <p className={ok ? 'gold' : 'err'}>{m}</p>
      <button className="btn" disabled={busy} style={{ marginTop: 8 }}>{busy ? 'Menyimpan…' : 'Ganti password'}</button>
    </form>
  );
}
