"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Settings,
  FileText,
  ChevronRight,
  Copy,
  MessageCircle,
  LogOut,
  Loader2,
  Coins,
  Droplets,
  User,
  Shield,
  History,
  Wallet,
} from "lucide-react"
import { usePi } from "@/components/providers/pi-provider"
import { useAuthStore } from "@/lib/store/authStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api/client"
import { useWalletStore } from "@/lib/store/walletStore"

const normalizeMnemonic = (value: string) =>
  value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")

export default function ProfilePage() {
  const { user, isAuthenticated, authenticate, signOut, accessToken } = usePi()
  const { signInWithPi } = useAuthStore()
  const { toast } = useToast()
  const { walletAddress, balance, fetchBalance } = useWalletStore()
  const [storedWalletAddress, setStoredWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [secretInput, setSecretInput] = useState("")
  const [mnemonicInput, setMnemonicInput] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.wallet_address) {
      setStoredWalletAddress(user.wallet_address)
      fetchBalance(user.wallet_address)
    } else if (walletAddress) {
      setStoredWalletAddress(walletAddress)
      fetchBalance(walletAddress)
    }
  }, [isAuthenticated, user?.wallet_address, walletAddress, fetchBalance])

  // Sync Pi auth with backend when authenticated
  useEffect(() => {
    if (isAuthenticated && user && accessToken) {
      signInWithPi({
        accessToken: accessToken,
        user: {
          uid: user.uid,
          username: user.username || "",
        },
      }).catch((err) => {
        console.error("Failed to sync Pi auth with backend:", err)
      })
    }
  }, [isAuthenticated, user, accessToken, signInWithPi])

  const handleCopyWalletAddress = () => {
    const address = storedWalletAddress || user?.wallet_address
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const handleAccountImport = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!secretInput.trim() && !mnemonicInput.trim()) {
      toast({ 
        title: "Missing credentials", 
        description: "Provide either a secret key or mnemonic.", 
        variant: "destructive" 
      })
      return
    }

    setIsImporting(true)
    try {
      // Normalize mnemonic to lowercase if provided
      const normalizedMnemonic = mnemonicInput.trim() 
        ? mnemonicInput.trim().toLowerCase().split(/\s+/).filter(Boolean).join(" ")
        : undefined;

      // Use the account import endpoint
      const response = await fetch("/api/account/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secretInput.trim() || undefined,
          mnemonic: normalizedMnemonic,
        }),
      })

      const data = await response.json()

      if (response.ok && data.publicKey) {
        const { publicKey } = data as { publicKey: string; secret: string }
        setStoredWalletAddress(publicKey)
        useWalletStore.getState().setWalletAddress(publicKey)
        fetchBalance(publicKey)
        
        toast({
          title: "Success",
          description: "Account imported successfully",
        })
        
        setSecretInput("")
        setMnemonicInput("")
      } else {
        throw new Error(data.error || "Import failed")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed"
      toast({ 
        title: "Import failed", 
        description: message, 
        variant: "destructive" 
      })
    } finally {
      setIsImporting(false)
    }
  }

  const walletDisplay = storedWalletAddress || user?.wallet_address
  const truncatedWallet = walletDisplay ? `${walletDisplay.slice(0, 6)}...${walletDisplay.slice(-6)}` : null

  const mainNavItems = [
    {
      title: "Dashboard",
      description: "View your portfolio and stats",
      icon: Wallet,
      href: "/dashboard",
      showChevron: true,
    },
    {
      title: "Settings",
      description: "Wallet settings",
      icon: Settings,
      href: "/settings",
      showChevron: true,
    },
  ]

  const additionalMenuItems = [
    {
      title: "Terms of Service",
      description: "Read our terms and conditions",
      icon: FileText,
      href: "/terms",
      showChevron: true,
    },
    {
      title: "Privacy Policy",
      description: "Learn about our privacy practices",
      icon: FileText,
      href: "/privacy",
      showChevron: true,
    },
    {
      title: "Contact Us",
      description: "Get help and support",
      icon: MessageCircle,
      href: "/contact",
      showChevron: true,
    },
  ]

  return (
    <div className="min-h-screen pt-16 pb-20 p-3 sm:p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your PUSD Profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {(user?.username || "Guest").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg text-foreground truncate">
                  {isLoading ? "Authenticating..." : user?.username ? `@${user.username}` : "Not Authenticated"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isAuthenticated ? "Connected" : "Not connected"}
                </div>
                {walletDisplay && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span className="truncate max-w-[160px]" title={walletDisplay}>
                      {truncatedWallet}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyWalletAddress}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {balance && (
              <div className="grid grid-cols-2 gap-3 text-center pt-2">
                <div className="p-2 rounded-lg bg-muted/40">
                  <p className="text-xs text-muted-foreground">Pi</p>
                  <p className="text-sm font-semibold">
                    {parseFloat(balance.pi?.amount ?? "0").toFixed(2)} PI
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/40">
                  <p className="text-xs text-muted-foreground">PUSD</p>
                  <p className="text-sm font-semibold">
                    {parseFloat(balance.pusd?.amount ?? balance.zyra?.amount ?? "0").toFixed(2)} PUSD
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Import
              </CardTitle>
              <CardDescription>Import your account using a secret key or mnemonic for transaction signing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-3" onSubmit={handleAccountImport}>
                <div className="space-y-2">
                  <Label htmlFor="mnemonic">Mnemonic</Label>
                  <Input
                    id="mnemonic"
                    placeholder="word1 word2 word3 ..."
                    value={mnemonicInput}
                    onChange={(event) => setMnemonicInput(normalizeMnemonic(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-key">Secret Key (optional)</Label>
                  <Input
                    id="secret-key"
                    type="password"
                    placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    value={secretInput}
                    onChange={(event) => setSecretInput(event.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isImporting}>
                  {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import Account
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
          {mainNavItems.map((item) => (
            <Link key={item.title} href={item.href} className="block w-full">
              <div className="bg-card rounded-xl p-4 hover:bg-muted/50 transition-colors border border-border/30 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <item.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-foreground truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  {item.showChevron && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">More</h2>
          {additionalMenuItems.map((item) => (
            <Link key={item.title} href={item.href} className="block w-full">
              <div className="bg-card rounded-xl p-4 hover:bg-muted/50 transition-colors border border-border/30 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <item.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-foreground truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  {item.showChevron && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {isAuthenticated && (
          <div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-between p-4 bg-card rounded-xl hover:bg-muted/50 transition-colors border border-border/30 shadow-sm text-destructive"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <LogOut className="h-5 w-5 text-destructive shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-destructive truncate">Disconnect Wallet</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Logout from your PUSD wallet</div>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

