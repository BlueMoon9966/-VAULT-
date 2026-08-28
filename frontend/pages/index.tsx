import Link from 'next/link'

export default function Home() {
  return (
    <div style={{padding:20}}>
      <h1>VAULT Browser</h1>
      <p><Link href="/login">Login</Link></p>
      <p><Link href="/browse">Browse</Link></p>
    </div>
  )
}
