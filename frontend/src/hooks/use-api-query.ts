import * as React from "react"
import axios from "axios"

import { api, getErrorMessage } from "@/lib/api"

interface QueryResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
  setData: React.Dispatch<React.SetStateAction<T | null>>
}

export function useApiQuery<T>(url: string | null): QueryResult<T> {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState<boolean>(Boolean(url))
  const [error, setError] = React.useState<string | null>(null)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    api
      .get<T>(url, { signal: controller.signal })
      .then((response) => {
        setData(response.data)
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError) || controller.signal.aborted) return
        setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [url, version])

  return {
    data,
    loading,
    error,
    refetch: () => setVersion((current) => current + 1),
    setData,
  }
}
