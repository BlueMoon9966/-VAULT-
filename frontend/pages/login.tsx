import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/auth/login', { username, password }, { withCredentials: true });
      localStorage.setItem('accessToken', res.data.accessToken);
      router.push('/browse');
    } catch (e) { alert('Login failed'); }
  }

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><input placeholder="username or email" value={username} onChange={e=>setUsername(e.target.value)} /></div>
        <div><input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
