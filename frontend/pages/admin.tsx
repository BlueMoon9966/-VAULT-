import { useState } from 'react'
import api from '../lib/api'
import useAuth from '../hooks/useAuth'

export default function AdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function doImport() {
    setLoading(true); setMessage('')
    try {
      const res = await api.post('/api/content/import')
      setMessage(`Imported ${res.data.count} items`)
    } catch (e: any) {
      console.error(e)
      if (e.response && e.response.status === 403) setMessage('ต้องเป็นผู้ดูแลระบบเท่านั้น')
      else if (e.response && e.response.status === 401) setMessage('ยังไม่ได้ล็อกอิน')
      else setMessage('เกิดข้อผิดพลาด')
    } finally { setLoading(false) }
  }

  return (
    <div style={{padding:20}}>
      <h1>Admin</h1>
      <div style={{marginTop:12}}>
        <button onClick={doImport} disabled={loading} style={{padding:8}}>{loading ? 'Importing...' : 'Import VAULT'}</button>
      </div>
      {message && <div style={{marginTop:12}}>{message}</div>}
      <div style={{marginTop:20}}>
        <div>หมายเหตุ: ปุ่มนี้เรียก /api/content/import และต้องใช้ token ที่เป็น admin</div>
      </div>
    </div>
  )
}
