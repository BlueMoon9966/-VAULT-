import { useRouter } from 'next/router'
import HlsPlayer from '../../components/HlsPlayer'

export default function Player() {
  const router = useRouter();
  const { slug = [] } = router.query;
  // slug could encode path to content; for demo we'll accept ?src= URL
  const src = (typeof window !== 'undefined') ? new URLSearchParams(window.location.search).get('src') : null;
  if (!src) return <div>No src provided</div>
  return (
    <div style={{padding:20}}>
      <h2>Player</h2>
      <HlsPlayer src={src} />
    </div>
  )
}
