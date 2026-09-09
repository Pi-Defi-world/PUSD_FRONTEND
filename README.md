# PUSD Platform – Pi-Native Stablecoin with Off-Chain USD Reserve

A production-grade USD-referenced stable token built on Pi Network using a Soroban-style `pusd-token` contract, backed by an off-chain USD reserve (cash + short-term Treasuries), with passkey authentication and real-time pricing.

## 🚀 Features

### Core Features
- **USD-Referenced Stable Token**: 1 PUSD is economically targeted to ≈ 1 USD via off-chain reserves.
- **Off-Chain USD Reserve**: Single USD reserve (cash + T-bills) tracked by the backend's `BankReserveService`.
- **Pi-Only User Rails (Phase 1)**: Users deposit and redeem Pi; USD never leaves issuer banking perimeter.
- **Optional Overcollateralization Logic**: Frontend can display and simulate overcollateralization / safety buffers.
- **Passkey Authentication**: Secure biometric authentication with WebAuthn/FIDO2
- **Client-Side Encryption**: Passphrases encrypted locally, never sent to server
- **Real-Time Pricing**: Dynamic Pi price integration from oracle APIs
- **Atomic Transactions**: Multi-signature transactions on Pi Network

### Business / Risk Model (Current Version)
- **Fee Structure**: 0.3% mint/redeem fees (configurable), optional API/arbitrage fees.
- **Treasury Management**: Off-chain USD reserve (cash + T-bills) handled by issuer; no on-chain baskets.
- **Single-Reserve Accounting**: Backend maintains a consolidated USD reserve and reserve snapshots.
- **Safety Features**: Circuit breakers, price tolerance, liquidation thresholds (enforced in backend/stablecoin services).

### Security
- **Passphrase Security**: Never leaves browser, encrypted with passkey-derived keys
- **Multi-Signature**: Transactions require multiple keypairs
- **Rate Limiting**: API protection and abuse prevention
- **Input Validation**: Comprehensive validation with Zod schemas

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.1**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library
- **Zustand**: Lightweight state management
- **React Query**: Data fetching and caching

### Backend
- **Express.js**: RESTful API server
- **PostgreSQL**: Database with Prisma ORM
- **WebAuthn**: Passkey authentication standard
- **Stellar / Soroban SDKs**: Pi Network smart contract integration (Soroban).
- **PUSD Token Integration**: Backend calls `pusd-token` contract for issuer-only mint/burn.

### Security & Crypto
- **WebAuthn/FIDO2**: Passwordless authentication
- **Crypto-JS**: Client-side encryption
- **BIP39**: Mnemonic phrase generation
- **Ed25519**: Cryptographic key derivation

## 📁 Project Structure

```
pusd-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Dashboard pages
│   │   └── dashboard/
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication APIs
│   │   └── stablecoin/           # Stablecoin operation APIs
│   ├── stats/                    # Public stats page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   └── theme-provider.tsx       # Theme provider
├── lib/                         # Core libraries
│   ├── crypto/                  # Encryption utilities
│   │   ├── encryption.ts        # Client-side encryption
│   │   └── passphrase-converter.ts
│   ├── db/                     # Database
│   │   ├── mongodb.ts          # MongoDB connection
│   │   └── models/             # Database models
│   ├── passkey/                # Passkey authentication
│   │   └── webauthn.ts         # WebAuthn implementation
│   ├── stablecoin/             # Stablecoin logic
│   │   └── PUSDBusinessStablecoin.ts
│   └── store/                   # State management
│       ├── authStore.ts
│       ├── walletStore.ts
│       ├── transactionStore.ts
│       └── priceStore.ts
├── types/                       # TypeScript definitions
│   └── index.ts
└── hooks/                       # Custom React hooks
    └── use-toast.ts
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PUSD-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create `.env.local` file:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://user:password@localhost:5432/pusd
   DIRECT_DATABASE_URL=postgresql://user:password@localhost:5432/pusd

   # Pi / Soroban Network Configuration
   PI_NETWORK_SERVER_URL=https://api.testnet.minepi.com
   PI_NETWORK_PASSPHRASE="Pi Testnet"

   # Oracle Configuration
   ORACLE_API_URL=https://oracle-three-xi.vercel.app

   # WebAuthn/Passkey Configuration
   WEBAUTHN_RP_ID=localhost
   WEBAUTHN_RP_NAME="PUSD Platform"
   WEBAUTHN_ORIGIN=http://localhost:3000

   # Security Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ENCRYPTION_KEY=your-encryption-key-change-in-production

   # PUSD Stablecoin / Token Configuration
   PUSD_ASSET_CODE=PUSD
   ISSUER_PUBLIC_KEY=your-issuer-public-key
   ISSUER_SECRET_KEY=your-issuer-secret-key
   RESERVE_PUBLIC_KEY=your-reserve-public-key
   RESERVE_SECRET_KEY=your-reserve-secret-key
   TREASURY_PUBLIC_KEY=your-treasury-public-key
   TREASURY_SECRET_KEY=your-treasury-secret-key

   # Testnet Configuration (Frontend)
   NEXT_PUBLIC_NETWORK=testnet
   NEXT_PUBLIC_SERVER_URL=http://localhost:8001
   NEXT_PUBLIC_USD_TEST_ASSET_CODE=USDTEST
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Authentication Flow

### Registration
1. User enters username and display name
2. System generates wallet address from passphrase
3. User registers passkey (biometric/PIN)
4. User enters 12-word passphrase (one-time)
5. Passphrase encrypted with passkey-derived key
6. Encrypted passphrase stored in localStorage
7. User record created with wallet address + passkey credential

### Login
1. User enters wallet address
2. System prompts for passkey authentication
3. On success, encrypted passphrase retrieved from localStorage
4. Passphrase decrypted with passkey
5. Wallet data loaded for transactions

### Security Model
- **Passphrase**: Never leaves browser, encrypted locally
- **Passkey**: Used for authentication and encryption key derivation
- **Wallet Address**: Only public key stored in database
- **Secret Keys**: Generated client-side, never transmitted

## 💰 Stablecoin Operations

### Minting PUSD (Pi → PUSD)
1. User enters **Pi amount** to deposit.
2. System fetches current Pi price from the oracle.
3. Calculates **PUSD output** and fees based on USD value of Pi.
4. Backend creates a `Deposit` record and instructions for sending Pi (muxed address + memo).
5. User sends Pi to the reserve address; backend detects the payment and marks the deposit `CONFIRMED`.
6. Backend calls the `pusd-token` issuer path to **mint PUSD** to the user and marks the deposit `PROCESSED`.

### Redeeming PUSD (PUSD → Pi)
1. User enters **PUSD amount** to redeem.
2. System calculates expected Pi output (based on current Pi price and fees).
3. Backend tracks a `Redeem` record and observes PUSD being burned/transferred back to the issuer.
4. When confirmed, backend sends Pi back to the user and marks the redeem `PROCESSED`.

### Reserve & Transparency
- **Reserve Composition**: Single USD reserve (cash + T-bills), no on-chain USDC/asset basket.
- **Reserve Snapshots**: Backend computes `ReserveSnapshot` rows and exposes them via APIs.
- **Transparency UI**: Dashboard section shows total USD reserve, Pi reserve, PUSD supply, and collateralization ratio.

## 🚀 Deployment

### Vercel Deployment
1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure Environment Variables**
   Set all environment variables in Vercel dashboard

3. **Database Setup**
   - Create PostgreSQL database (local or cloud)
   - Update `DATABASE_URL` with connection string
   - Run Prisma migrations: `pnpm db:push`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables for Production
- Update `WEBAUTHN_RP_ID` to your domain
- Update `WEBAUTHN_ORIGIN` to your production URL
- Use strong, unique secrets for `JWT_SECRET` and `ENCRYPTION_KEY`
- Configure Pi Network / Soroban production keys

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register-passkey` - Start passkey registration
- `PUT /api/auth/verify-registration` - Verify passkey registration
- `POST /api/auth/login-passkey` - Start passkey authentication
- `PUT /api/auth/verify-login` - Verify passkey authentication

### Stablecoin Operations
- `POST /api/stablecoin/mint` - Mint PUSD tokens
- `POST /api/stablecoin/redeem` - Redeem PUSD tokens
- `GET /api/stablecoin/balance?address={address}` - Get user balances
- `GET /api/stablecoin/stats` - Get system statistics
- `GET /api/stablecoin/collateral-composition` - Get multi-collateral breakdown (70/30)

## 🔒 Security Considerations

### Client-Side Security
- Passphrases encrypted with passkey-derived keys
- Sensitive data never transmitted to server
- LocalStorage encryption with Web Crypto API
- Session timeout and automatic cleanup

### Server-Side Security
- Rate limiting on all API routes
- CSRF protection
- Input validation with Zod schemas
- Secure headers with Helmet
- MongoDB injection prevention

### Transaction Security
- Multi-signature verification
- Transaction amount limits
- Confirmation dialogs for all operations
- Circuit breaker integration
- Price tolerance checks

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
pnpm test:integration
```

### E2E Tests
```bash
pnpm test:e2e
```

## 📈 Monitoring

### Error Tracking
- Sentry integration for error monitoring
- Comprehensive error boundaries
- User-friendly error messages

### Analytics
- Transaction success/failure metrics
- API performance monitoring
- User behavior analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🧪 Testnet Support

### Testnet Mode

The frontend supports both testnet and mainnet modes. Testnet mode uses USD-TEST (a synthetic token) instead of USDC for collateral.

#### Testnet Features
- **USD-TEST Asset**: Synthetic token with hardcoded $1.00 peg
- **Liquidity Pool**: 70% of Pi collateral allocated to pool, 30% to reserve
- **Pool Operations**: Automatic swaps between USD-TEST and Pi
- **Reserve/Pool Breakdown**: Dashboard shows separate reserve and pool balances

#### Environment Variables for Testnet

Add to `.env.local`:
```env
# Testnet Configuration
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_SERVER_URL=http://localhost:8001
NEXT_PUBLIC_USD_TEST_ASSET_CODE=USDTEST
```

#### Testnet Detection

The frontend automatically detects testnet mode by:
1. Checking `NEXT_PUBLIC_NETWORK` environment variable
2. Checking if hostname includes "testnet"

#### Testnet-Specific UI

- **Testnet Badge**: Appears in navbar and relevant pages
- **USD-TEST Display**: Shows "USD-TEST" instead of "USDC" throughout the UI
- **Reserve/Pool Breakdown**: Displays separate reserve and pool balances
- **Pool Info Card**: Shows liquidity pool information and health metrics

#### Testnet Help

For detailed testnet information, visit `/help/testnet` in the dashboard.

## ⚠️ Disclaimer

This is a test platform built on Pi Network Testnet and Stellar Testnet. Do not use for production purposes. The PUSD stablecoin is for testing and tokenization setup before MVP launch.

## 🔧 Tokenization Setup

### Initializing PUSD Asset
```bash
cd pusd-backend
node scripts/initialize-pusd-asset.js
```

### Testing Minting
```bash
node scripts/test-mint.js
```

### Testing Redemption
```bash
node scripts/test-redeem.js
```

### Testing Multi-Collateral
```bash
node scripts/test-multi-collateral.js
```

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

Built with ❤️ using Next.js, TypeScript, and shadcn/ui
