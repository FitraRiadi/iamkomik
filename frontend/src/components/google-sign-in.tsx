import * as React from "react"

const SCRIPT_ID = "google-identity-services"

interface GoogleCredentialResponse {
  credential?: string
}

interface GoogleIdentity {
  initialize: (options: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black"
      size?: "large" | "medium" | "small"
      text?: "signin_with" | "signup_with" | "continue_with" | "signin"
      shape?: "rectangular" | "pill" | "circle" | "square"
      width?: number
    },
  ) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } }
  }
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Google script gagal dimuat.")), {
        once: true,
      })
      return
    }

    const script = document.createElement("script")
    script.id = SCRIPT_ID
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Google script gagal dimuat."))
    document.head.appendChild(script)
  })
}

export function GoogleSignIn({
  onCredential,
}: {
  onCredential: (credential: string) => void | Promise<void>
}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  const container = React.useRef<HTMLDivElement>(null)
  const credentialHandler = React.useRef(onCredential)
  credentialHandler.current = onCredential
  const handleCredential = React.useCallback((response: GoogleCredentialResponse) => {
    if (response.credential) void credentialHandler.current(response.credential)
  }, [])

  React.useEffect(() => {
    if (!clientId) return
    let cancelled = false

    void loadGoogleScript()
      .then(() => {
        if (cancelled || !container.current || !window.google?.accounts?.id) return
        window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredential })
        container.current.innerHTML = ""
        window.google.accounts.id.renderButton(container.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 360,
        })
      })
      .catch(() => {
        // Tombol Google gagal dimuat; login email tetap tersedia.
      })

    return () => {
      cancelled = true
    }
  }, [clientId, handleCredential])

  if (!clientId) return null

  return <div ref={container} className="flex min-h-10 justify-center [&>div]:max-w-full" />
}
