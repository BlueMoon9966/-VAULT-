import VaultList from '../components/VaultList'
import Link from 'next/link'
import useAuth from '../hooks/useAuth'

export default function BrowsePage() {
  const { user, logout } = useAuth();
  return (
    <div style={{padding:20}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Browse VAULT</h1>
        <div>
          <Link href="/">Home</Link> | {' '}
          {user ? <a onClick={() => logout()} style={{cursor:'pointer'}}>Logout</a> : <Link href="/login">Login</Link>}
        </div>
      </header>
      <main style={{marginTop:16}}>
        <VaultList />
      </main>
    </div>
  )
}
