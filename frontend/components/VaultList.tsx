import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function VaultList() {
  const [index, setIndex] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/content/index');
        setIndex(res.data.index || []);
        setFiltered(res.data.index || []);
      } catch (e) {
        console.error('Failed to load index', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return setFiltered(index);
    setFiltered(index.filter(item => (item.name||'').toLowerCase().includes(qq) || (item.author||'').toLowerCase().includes(qq) || (item.path||'').toLowerCase().includes(qq)));
  }, [q, index]);

  return (
    <div>
      <div style={{marginBottom:12}}>
        <input placeholder="ค้นหา ชื่อ/ผู้แต่ง/path" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%',padding:8}} />
      </div>
      <div>
        {filtered.length === 0 && <div>ไม่พบรายการ</div>}
        {filtered.map((item, i) => (
          <div key={i} style={{padding:8,borderBottom:'1px solid #eee'}}>
            <div style={{display:'flex',gap:12}}>
              {item.image && <img src={item.image} alt={item.name} style={{width:80,height:45,objectFit:'cover'}} />}
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{item.name}</div>
                <div style={{color:'#666',fontSize:13}}>{item.author || ''}</div>
                <div style={{color:'#999',fontSize:12}}>{item.path}</div>
                {item.url && <div style={{marginTop:8}}><a href={`/player?src=${encodeURIComponent(item.url)}`}>▶️ เล่น</a></div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
