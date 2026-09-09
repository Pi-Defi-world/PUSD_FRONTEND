import { NextRequest, NextResponse } from 'next/server';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

 
const BIP44_PATH = "m/44'/314159'/0'";
 
const normalizeMnemonic = (mnemonic: string) => {
  return mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
};

      
const getKeypairFromMnemonic = async (mnemonic: string) => {
  // Dynamically import Stellar SDK to avoid bundling sodium-native on client
  const StellarSdk = await import('@stellar/stellar-sdk');
  
  // Step 1: Normalize mnemonic format
  const normalizedMnemonic = normalizeMnemonic(mnemonic);
  
  // Step 2: Generate keypair using Pi Network BIP44 path
  const seed = await bip39.mnemonicToSeed(normalizedMnemonic);
  // derivePath expects a hex string according to TypeScript types
  // Convert Buffer to hex string to match the expected type signature
  const { key } = derivePath(BIP44_PATH, seed.toString('hex'));
  const keypair = StellarSdk.Keypair.fromRawEd25519Seed(key);
  
  return keypair;
};

export async function POST(request: NextRequest) {
  try {
    const { passphrase } = await request.json();

    if (!passphrase) {
      return NextResponse.json(
        { error: 'Passphrase is required' },
        { status: 400 }
      );
    }

    // Validate passphrase (basic validation)
    const words = passphrase.trim().toLowerCase().split(/\s+/);
    if (words.length !== 24) {
      return NextResponse.json(
        { error: 'Passphrase must contain exactly 24 words' },
        { status: 400 }
      );
    }

    // Derive wallet address and secret seed from passphrase
    const keypair = await getKeypairFromMnemonic(passphrase);
    const walletAddress = keypair.publicKey();
    const secretSeed = keypair.secret();

    return NextResponse.json({
      success: true,
      walletAddress,
      secretSeed,
    });
  } catch (error) {
    console.error('Error deriving wallet address:', error);
    return NextResponse.json(
      { error: 'Failed to derive wallet address' },
      { status: 500 }
    );
  }
}
