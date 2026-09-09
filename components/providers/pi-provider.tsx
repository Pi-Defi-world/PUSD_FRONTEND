"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { PiAuthResult, PiPaymentDTO } from "@/pi-sdk"

interface PiUser {
  uid: string
  username?: string
  wallet_address?: string
}

interface PiContextType {
  user: PiUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  authenticate: () => Promise<PiAuthResult>
  signOut: () => void
  createPayment: (
    amount: number,
    memo: string,
    metadata?: any,
    donationData?: { userId: string; amount: number; memo: string; metadata?: Record<string, unknown> }
  ) => Promise<any>
}

const PiContext = createContext<PiContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

async function approvePiPayment(paymentId: string) {
  const res = await fetch(`${API_URL}/pi-payments/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  })
  if (!res.ok) {
    const msg = res.status === 503
      ? "Payment approval unavailable (backend PI_API_KEY may be missing or invalid)."
      : "Payment approval failed"
    throw new Error(msg)
  }
}

async function completePiPayment(
  paymentId: string,
  txid: string,
  donationData?: { userId: string; amount: number; memo: string; metadata?: Record<string, unknown> }
) {
  const res = await fetch(`${API_URL}/pi-payments/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId, txid, donationData }),
  })
  if (!res.ok) throw new Error("Payment completion failed")
}

async function cancelPiPayment(paymentId: string) {
  const res = await fetch(`${API_URL}/pi-payments/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  })
  if (!res.ok) throw new Error("Payment cancel failed")
}

export function PiProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PiUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize Pi SDK on mount - simple version
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initSDK = () => {
      if (window.Pi && typeof window.Pi.init === 'function') {
        try {
          window.Pi.init({ 
            version: "2.0", 
            sandbox: true 
          })
          console.log("✅ Pi SDK initialized (sandbox: true)")
        } catch (error) {
          console.warn("Pi SDK already initialized:", error)
        }
      } else {
        setTimeout(initSDK, 100)
      }
    }

    initSDK()
  }, [])

  // Do not restore auth from localStorage — always require explicit Pi.authenticate()
  // so the SDK has a session with payments scope in this page load.

  const authenticate = useCallback(async (): Promise<PiAuthResult> => {
    console.log("🔐 authenticate() called")
    
    if (typeof window === 'undefined' || !window.Pi) {
      throw new Error("Pi SDK not available. Please open in Pi Browser.")
    }

    setIsLoading(true)
    try {
      const onIncompletePaymentFound = (payment: PiPaymentDTO) => {
        console.warn("⚠️ Incomplete payment found:", payment.identifier)
        cancelPiPayment(payment.identifier).catch((err) =>
          console.error("Error cancelling incomplete payment:", err)
        )
      }

      console.log("🔑 Calling Pi.authenticate()...")
      const auth = await window.Pi.authenticate(
        ["username", "payments", "wallet_address"],
        onIncompletePaymentFound
      )

      console.log("✅ Pi SDK auth SUCCESS!")
      console.log("📦 Response:", { uid: auth.user.uid, username: auth.user.username })

      const userData: PiUser = {
        uid: auth.user.uid,
        username: auth.user.username,
        wallet_address: auth.user.wallet_address
      }

      // Send to backend
      console.log("📡 Sending to backend:", `${API_URL}/auth/signin`)
      
      try {
        const response = await fetch(`${API_URL}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: auth.accessToken,
            user: {
              uid: userData.uid,
              username: userData.username || '',
              wallet_address: userData.wallet_address
            }
          })
        })

        if (!response.ok) {
          throw new Error(`Backend signin failed: ${response.status}`)
        }

        const data = await response.json()
        console.log("📦 Backend response:", data)

        if (data.success && data.data?.user) {
          if (data.data.user.piUsername) {
            userData.username = data.data.user.piUsername
          }
          if (data.data.token) {
            localStorage.setItem("auth_token", data.data.token)
          }
        }
      } catch (error) {
        console.error("❌ Backend call failed:", error)
      }

      // Update state
      setUser(userData)
      setAccessToken(auth.accessToken)
      setIsAuthenticated(true)

      // Save to localStorage
      localStorage.setItem("pi_access_token", auth.accessToken)
      localStorage.setItem("pi_user", JSON.stringify(userData))

      return { accessToken: auth.accessToken, user: userData }
    } catch (error) {
      console.error("❌ Pi auth failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = () => {
    setUser(null)
    setAccessToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem("pi_access_token")
    localStorage.removeItem("pi_user")
    localStorage.removeItem("auth_token")
    console.log("✅ Signed out")
  }

  const createPayment = async (
    amount: number,
    memo: string,
    metadata?: any,
    donationData?: { userId: string; amount: number; memo: string; metadata?: Record<string, unknown> }
  ) => {
    if (!isAuthenticated || !user) {
      throw new Error("User must be authenticated to make payments")
    }

    if (typeof window === "undefined" || !(window as any).Pi) {
      throw new Error("Pi SDK not available. Please open in Pi Browser.")
    }

    try {
      // Ensure Pi SDK has a session with payments scope in this page load.
      // Restored localStorage auth does not give the SDK payments scope until we run authenticate().
      const authResult = await authenticate()
      const paymentUser = authResult.user

      ;(window as any).Pi.init({ version: "2.0", sandbox: true })

      return await new Promise((resolve, reject) => {
        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log("Payment ready for approval:", paymentId)
            try {
              await approvePiPayment(paymentId)
            } catch (err) {
              console.error("Payment approval failed:", err)
              reject(err)
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log("Payment ready for completion:", paymentId, txid)
            try {
              const dataToSend =
                donationData ||
                {
                  userId: paymentUser.uid,
                  amount,
                  memo,
                  metadata: metadata || {},
                }
              await completePiPayment(paymentId, txid, dataToSend)
              resolve({ success: true, paymentId, txid })
            } catch (err) {
              console.error("Payment completion failed:", err)
              reject(err)
            }
          },
          onCancel: (paymentId: string) => {
            console.log("Payment cancelled:", paymentId)
            reject(new Error("Payment was cancelled"))
          },
          onError: (error: Error, payment?: PiPaymentDTO) => {
            console.error("Payment error:", error, payment)
            const message = (error && (error as any).message) || String(error || '')

            // Help user recover when payments scope is missing, like the sample.
            if (message.toLowerCase().includes("payments") && message.toLowerCase().includes("scope")) {
              console.warn("⚠️ Payments scope not granted. User needs to re-authenticate with payments enabled.")
              // Clear local auth so next login can request payments scope cleanly
              signOut()
              if (typeof window !== "undefined") {
                alert(
                  "Pi payments permission is not enabled for this session.\n\n" +
                    "Please log out in this app, then log in again in Pi Browser and make sure to grant the “payments” permission."
                )
              }
              reject(
                new Error(
                  'Payment permissions required. Please log out and log back in via Pi Browser, granting the "payments" scope.'
                )
              )
              return
            }

            reject(error)
          },
        }

        ;(window as any).Pi.createPayment(
          {
            amount,
            memo,
            metadata: metadata || { type: "donation" },
          },
          callbacks
        )
      })
    } catch (error) {
      console.error("Payment creation failed:", error)
      throw error
    }
  }

  return (
    <PiContext.Provider
      value={{ user, accessToken, isAuthenticated, isLoading, authenticate, signOut, createPayment }}
    >
      {children}
    </PiContext.Provider>
  )
}

export function usePi() {
  const context = useContext(PiContext)
  if (!context) throw new Error("usePi must be used within PiProvider")
  return context
}
