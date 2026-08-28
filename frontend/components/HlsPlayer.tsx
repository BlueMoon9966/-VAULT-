import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

export default function HlsPlayer({ src }) {
  const videoRef = useRef(null)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      return () => { hls.destroy() }
    }
  }, [src])

  return <video ref={videoRef} controls style={{width:'100%',maxWidth:800}} />
}
