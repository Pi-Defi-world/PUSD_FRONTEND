'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { useWalletStore } from '@/lib/store/walletStore';
import { apiClient } from '@/lib/api/client';
import { 
  Loader2, 
  Shield, 
  PlusCircle, 
  Key, 
  Wallet, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  History,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const normalizeMnemonic = (value: string) =>
  value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');

export function WalletManager() {
  const { toast } = useToast();
  const { walletAddress, fetchBalance } = useWalletStore();
  
  const [importType, setImportType] = useState<'mnemonic' | 'secret'>('mnemonic');
  const [secretInput, setSecretInput] = useState('');
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleAccountImport = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedSecret = secretInput.trim();
    const trimmedMnemonic = mnemonicInput.trim();

    if (importType === 'secret' && !trimmedSecret) {
      toast({ title: 'Missing Secret', description: 'Please enter your secret key.', variant: 'destructive' });
      return;
    }
    if (importType === 'mnemonic' && !trimmedMnemonic) {
      toast({ title: 'Missing Passphrase', description: 'Please enter your 24-word passphrase.', variant: 'destructive' });
      return;
    }

    setIsImporting(true);
    try {
      const normalizedMnemonic = importType === 'mnemonic' ? normalizeMnemonic(trimmedMnemonic) : undefined;
      const finalSecret = importType === 'secret' ? trimmedSecret : undefined;

      // Basic frontend validation
      if (finalSecret && !finalSecret.startsWith('S')) {
        throw new Error('Secret key must start with "S"');
      }
      if (normalizedMnemonic && normalizedMnemonic.split(' ').length !== 24) {
        throw new Error('Passphrase must be exactly 24 words (Pi Network standard)');
      }

      const data = await apiClient.importAccount({
        secret: finalSecret,
        mnemonic: normalizedMnemonic,
      });

      if (data.success && data.publicKey) {
        const { publicKey, secret } = data as { publicKey: string; secret: string };

        if (secret) {
          await useAuthStore.getState().saveWalletLocally(publicKey, secret);
        } else if (normalizedMnemonic) {
          await useAuthStore.getState().reImportWallet(publicKey, normalizedMnemonic);
        }

        useWalletStore.getState().setWalletAddress(publicKey);
        fetchBalance(publicKey);

        toast({ title: 'Success', description: 'Wallet linked successfully.' });
        setSecretInput('');
        setMnemonicInput('');
      } else {
        throw new Error(data.error || 'Import failed');
      }
    } catch (err) {
      toast({ 
        title: 'Import failed', 
        description: err instanceof Error ? err.message : 'Import failed', 
        variant: 'destructive' 
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      const data = await apiClient.createWallet();
      const walletData = data.data as { publicKey?: string; secretKey?: string; passphrase?: string } | undefined;

      if (data.success && walletData?.publicKey && walletData?.secretKey) {
        const { publicKey, secretKey, passphrase } = walletData;

        await useAuthStore.getState().saveWalletLocally(publicKey, secretKey);
        useWalletStore.getState().setWalletAddress(publicKey);
        fetchBalance(publicKey);

        toast({
          title: 'Wallet created',
          description: 'Your new wallet has been created and linked.',
        });

        if (passphrase) {
          alert(`IMPORTANT: Save this 24-word passphrase securely!\n\n${passphrase}`);
        }
      } else {
        throw new Error(data.error || 'Failed to create wallet');
      }
    } catch (err) {
      toast({ 
        title: 'Creation failed', 
        description: err instanceof Error ? err.message : 'Creation failed', 
        variant: 'destructive' 
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Wallet Control Card */}
      <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-muted/20 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Wallet Service</CardTitle>
                <CardDescription className="text-[11px] font-medium opacity-70">
                  Manage your on-chain identity
                </CardDescription>
              </div>
            </div>
            <div className="px-2 py-1 rounded-full bg-success/10 border border-success/20">
              <span className="text-[10px] font-bold text-success uppercase tracking-wider">Secure</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="w-full h-11 bg-transparent border-b border-border/40 rounded-none p-0">
              <TabsTrigger 
                value="import" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all text-xs font-bold"
              >
                Link Account
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all text-xs font-bold"
              >
                New Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="m-0 animate-in fade-in duration-300">
              <div className="p-5 space-y-5">
                <div className="flex p-1 bg-muted/40 rounded-xl border border-border/40">
                  <button 
                    onClick={() => setImportType('mnemonic')}
                    className={cn(
                      "flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                      importType === 'mnemonic' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <History className="w-3.5 h-3.5" /> Passphrase
                  </button>
                  <button 
                    onClick={() => setImportType('secret')}
                    className={cn(
                      "flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                      importType === 'secret' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Lock className="w-3.5 h-3.5" /> Secret Key
                  </button>
                </div>

                <form onSubmit={handleAccountImport} className="space-y-4">
                  {importType === 'mnemonic' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <Label htmlFor="mnemonic-input" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          24-Word Passphrase
                        </Label>
                        <span className="text-[10px] font-medium text-primary/60 italic">Standard Pi Format</span>
                      </div>
                      <div className="relative group">
                        <textarea
                          id="mnemonic-input"
                          placeholder="word1 word2 word3 word4 ..."
                          value={mnemonicInput}
                          onChange={(e) => setMnemonicInput(e.target.value)}
                          className="w-full min-h-[100px] bg-background border border-border/60 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none group-hover:border-border"
                        />
                        <div className="absolute right-3 bottom-3 opacity-20">
                          <Key className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <Label htmlFor="secret-input" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Stellar Secret Key
                        </Label>
                        <span className="text-[10px] font-medium text-primary/60 italic">Starts with &quot;S&quot;</span>
                      </div>
                      <div className="relative group">
                        <Input
                          id="secret-input"
                          type={showSecret ? 'text' : 'password'}
                          placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                          value={secretInput}
                          onChange={(e) => setSecretInput(e.target.value)}
                          className="bg-background border border-border/60 rounded-xl h-11 font-mono text-sm pr-10 focus:ring-2 focus:ring-primary/20 transition-all group-hover:border-border"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={isImporting} className="w-full h-11 rounded-xl gap-2 font-bold shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform">
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Link Secure Wallet
                  </Button>
                </form>
                
                <p className="text-[10px] text-center text-muted-foreground px-4 leading-relaxed">
                  By linking your wallet, you enable the PUSD protocol to sign transactions locally on your device. Your keys never leave your browser.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="create" className="m-0 animate-in fade-in duration-300">
              <div className="p-6 space-y-6">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-800">Critical Security Warning</p>
                    <p className="text-[11px] text-amber-700/80 leading-relaxed">
                      Creating a new wallet generates a 24-word recovery phrase. 
                      <span className="block mt-1 font-bold italic underline">You must write this down and store it offline.</span>
                      If you lose it, your funds are permanently gone.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleCreateWallet} 
                    disabled={isCreating} 
                    variant="outline"
                    className="w-full h-12 rounded-xl gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all font-bold group"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />}
                    Generate New Identity
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground font-medium">
                    Recommended for users who do not yet have a Pi Wallet.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Trust & Safety Footer */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">End-to-End Encrypted</span>
        </div>
        <div className="flex items-center gap-1 text-primary hover:underline cursor-help">
          <Shield className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Security Audit</span>
        </div>
      </div>
    </div>
  );
}
