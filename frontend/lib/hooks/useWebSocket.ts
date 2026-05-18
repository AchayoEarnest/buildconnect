import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'

interface UseWebSocketOptions {
  onMessage: (data: unknown) => void
  onOpen?: () => void
  onClose?: () => void
}

const RECONNECT_DELAY_MS = 3_000

export function useWebSocket(path: string, options: UseWebSocketOptions) {
  const wsRef        = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef   = useRef(true)
  const tokens       = useAuthStore((s) => s.tokens)
  const WS_URL       = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

  // Keep stable refs for callbacks so connect() never goes stale while the
  // parent re-renders. This avoids tearing down/re-opening the socket on
  // every render that passes a new inline callback.
  const onMessageRef = useRef(options.onMessage)
  const onOpenRef    = useRef(options.onOpen)
  const onCloseRef   = useRef(options.onClose)

  useEffect(() => { onMessageRef.current = options.onMessage }, [options.onMessage])
  useEffect(() => { onOpenRef.current    = options.onOpen    }, [options.onOpen])
  useEffect(() => { onCloseRef.current   = options.onClose   }, [options.onClose])

  const connect = useCallback(() => {
    if (!tokens?.access || !mountedRef.current) return

    wsRef.current?.close()

    const url = `${WS_URL}/${path}?token=${tokens.access}`
    const ws  = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => onOpenRef.current?.()

    ws.onmessage = (e) => {
      try { onMessageRef.current(JSON.parse(e.data)) } catch {}
    }

    ws.onclose = () => {
      onCloseRef.current?.()
      // Auto-reconnect while the component is still mounted
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
      }
    }

    ws.onerror = () => {
      // onerror is always followed by onclose — let onclose handle reconnect
      ws.close()
    }
  }, [path, tokens?.access, WS_URL])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { send }
}
