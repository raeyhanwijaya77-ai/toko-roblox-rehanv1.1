'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SafeImg from '@/components/SafeImg';
export default function HeroStack({ items = [] }) {
  const list = items.slice(0, 3);
  if (!list.length) {
    return (
      <div className="stackw">
        <div className="fc fc3"><div className="frame"><div className="ph"><i>🎮</i>Stok segera hadir</div></div><div className="cb"><h3>Akun baru segera hadir</h3></div></div>
      </div>
    );
  }
  const pos = list.length === 1 ? ['fc3'] : list.length === 2 ? ['fc1', 'fc2'] : ['fc1', 'fc2', 'fc3'];
  return (
    <div className="stackw">
      {list.map((a, i) => (
        <div key={a.id} className={'fc ' + pos[i]}>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
            <Link href={`/akun/${a.id}`} style={{ display: 'block' }}>
              <div className="frame"><SafeImg src={a.cover} alt={a.title} /></div>
              <div className="cb"><h3>{a.title}</h3><span className="price">Rp {a.price.toLocaleString('id-ID')}</span></div>
            </Link>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
