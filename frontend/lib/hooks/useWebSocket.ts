import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'

interface UseWebSocketOptions {
  onMessage: (data: unknown) => void
  onOpen?: () => void
  onClose?: () => void
}

export function useWebSocket(path: string, options: UseWebSocketOptions) {
  const wsRef    = useRef<WebSocket | null>(null)
  const tokens   = useAuthStore((s) => s.tokens)
  const WS_URL   = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

  const connect = useCallback(() => {
    if (!tokens?.access) return
    const url = `${WS_URL}/${path}?token=${tokens.access}`
    const ws  = new WebSocket(url)
    wsRef.current = ws

    ws.onopen    = () => options.onOpen?.()
    ws.onclose   = () => options.onClose?.()
    ws.onmessage = (e) => {
      try {
        options.onMessage(JSON.parse(e.data))
      } catch {}
    }
  }, [path, tokens?.access])

  useEffect(() => {
    connect()
    return () => wsRef.current?.close()
  }, [connect])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { send }
}
