"use client"

import { useEffect, useState } from "react"

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("oc_cookie_consent")
    if (!consent) {
      setTimeout(() => setVisible(true), 800) // soft fade-in delay
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("oc_cookie_consent", "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]
                 glass backdrop-blur-xl border border-white/10
                 shadow-[0_8px_40px_rgba(0,0,0,.45)]
                 px-6 py-4 rounded-2xl text-sm text-white/90
                 max-w-md w-[90%] animate-[fadeIn_.6s_ease_forwards]"
    >
      <div className="flex flex-col gap-3">
        <p className="text-white/85 leading-snug">
          We use cookies to ensure the proper functioning of our website,
          user accounts, and analytics. By continuing to browse, you agree to our{" "}
          <a
            href="/privacy-policy"
            className="text-acc2 underline underline-offset-4 hover:text-acc1 transition"
          >
            Privacy Policy
          </a>.
        </p>

        <div className="flex justify-end">
          <button
            onClick={acceptCookies}
            className="btn-acc-primary px-4 py-2 text-sm rounded-xl font-semibold
                       hover:brightness-110 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
