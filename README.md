# MetaNFT — Modern NFT Marketplace (Academic Demo)

Next.js 16 + Solidity (Hardhat) + Tailwind CSS v4 + ethers v6. Designed for a **smooth final-year viva**: **demo mode** works without wallets or RPC; **hybrid / live** modes opt into a local Hardhat chain or your RPC.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Copy [`.env.example`](.env.example) to `.env.local` and adjust as needed.

## Modes

| `NEXT_PUBLIC_RUNTIME_MODE` | Behaviour |
|----------------------------|-----------|
| `demo` (default)           | Marketplace data from **localStorage** (`lib/demoStore.js`). Mint, buy, likes, favorites, and comments work offline. |
| `hybrid`                   | Same as demo until you enable **Blockchain** in the navbar (stores `nft_use_chain` in `localStorage`), then reads/mints via RPC + contracts. |
| `live`                     | Always uses chain + [`config.js`](config.js) addresses (falls back to demo data if RPC fails). |

## Auth (NextAuth)

- **Demo login** — always available on [`/auth/signin`](pages/auth/signin). Pick a username; avatar uses DiceBear.
- **Google** — enabled automatically when `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXTAUTH_SECRET` are set.

Protected routes: **Create NFT** ([`create-item`](pages/create-item.js)), **Dashboard** ([`dashboard`](pages/dashboard.js)) — sign in required.

## Image uploads

- Client uploads to [`/api/upload`](pages/api/upload.js) (`multipart/form-data`, field name **`file`**).
- **≤ 5 MB**, `image/*` only.
- If **Cloudinary** env vars are set → Cloudinary upload; otherwise file is saved under [`public/uploads`](public/uploads).

## MongoDB (optional)

Set `MONGODB_URI`. API routes under `/api/nfts`, `/api/likes`, `/api/comments`, `/api/users` use Mongo when configured; otherwise they return empty / stub payloads and the UI keeps using **client-side** demo storage.

## AI features

- `POST /api/ai/describe` — `{ imageUrl, category }` → `{ title, description, tags }`. Uses OpenAI vision when `OPENAI_API_KEY` is set; otherwise deterministic mocks in [`lib/aiMock.js`](lib/aiMock.js).
- `POST /api/ai/price` — suggests an ETH list price (mock or OpenAI).

Buttons live on the **Create NFT** page after you have an image URL.

## Smart contracts

- [`contracts/NFT.sol`](contracts/NFT.sol) — `ERC721URIStorage`, `NFTMinted` event, metadata JSON stored as `tokenURI`.
- [`contracts/Market.sol`](contracts/Market.sol) — listings with `tokenURI` copied from the NFT for marketplace UIs; `ReentrancyGuard` on sales; custom errors.

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network hardhat   # ephemeral; writes fresh addresses to config.js
```

For a persistent local chain, run **Hardhat node / Anvil** on `8545`, deploy, then set `NEXT_PUBLIC_RPC_URL` and addresses in `.env.local` if they differ from [`config.js`](config.js).

## Viva walkthrough (5 minutes)

1. Show **Demo mode** badge — no wallet needed.
2. **Sign in** with demo username → open **Profile** (`/profile/me`) → edit bio (saved in `localStorage`).
3. **Explore** → use **search / category chips / sort** on the home page.
4. Open an **NFT detail** → comments, favorites, activity, related NFTs → **Buy** (demo transfer).
5. **Create NFT** → upload image (or paste URL) → **Generate with AI** / **Suggest price** → mint → appears in grid.
6. **Dashboard** (signed in) — charts + trending + activity (demo aggregates).
7. (Optional) Switch runtime to `hybrid`, toggle **Blockchain**, show **Hardhat** mint path with `npm` scripts / deployed addresses.

## Scripts

| Command        | Purpose              |
|----------------|----------------------|
| `npm run dev`  | Next.js dev server   |
| `npm run build`| Production build     |
| `npm run lint` | ESLint               |

## Project layout (high level)

- [`pages/`](pages/) — UI routes + [`pages/api`](pages/api) backend.
- [`components/`](components/) — Layout, Navbar, NFTCard, MarketControls, dashboard charts, profile blocks.
- [`lib/`](lib/) — `marketplace.js` facade, `demoStore.js`, env helpers, auth options, AI mocks, upload client.
- [`models/`](models/) — Mongoose schemas (optional DB).
- [`contracts/`](contracts/) — Solidity sources; [`artifacts/`](artifacts/) ABI JSON for the app.

## Security notes (academic scope)

- Demo / dev flows may use a **Hardhat default private key** on the client when chain mode is on — **never use real funds or mainnet keys** in this project as-shipped.
- Rotate `NEXTAUTH_SECRET` and all third-party keys for any public deployment.
