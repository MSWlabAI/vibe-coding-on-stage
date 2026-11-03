'use client'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function Qr({ text, size = 240, className = '' }: { text: string; size?: number; className?: string }) {
  const [src, setSrc] = useState<string>('')
  useEffect(() => {
    if (!text) return
    QRCode.toDataURL(text, { margin: 1, width: size * 2, color: { dark: '#000000', light: '#ffffff' } }).then(setSrc).catch(() => setSrc(''))
  }, [text, size])
  if (!src) return <div style={{ width: size, height: size }} className={`rounded-xl bg-white ${className}`} />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} width={size} height={size} alt={`QR code for ${text}`} className={`rounded-xl bg-white ${className}`} />
}
