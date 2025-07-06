# Hexis

> **Speak Freely, Share Privately**

Hexis is a publishing protocol for encrypted messages, designed for a world where privacy, expression, and control are in constant tension.

## 🎯 Service Overview

With Hexis, you can:
- **Post encrypted messages** publicly
- **Attach public previews** that appear as ordinary posts to the general public
- **Restrict access** to specific wallet addresses or paying users
- **Set prices** to sell access to your messages

## 🏗️ Project Structure

```
hexis.cat/
├── packages/
│   ├── frontend/          # React + TypeScript frontend
│   └── contract/          # Solidity smart contracts
├── biome.json            # Code formatter configuration
└── pnpm-workspace.yaml   # Monorepo configuration
```

### Tech Stack

**Frontend**
- React 19 + TypeScript
- TanStack Router
- Tailwind CSS v4
- Vite

**Smart Contracts**
- Solidity ^0.8.28
- Hardhat
- Viem

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10.7.0+

### Installation & Development

```bash
# Install dependencies
pnpm install

# Start frontend development server
pnpm frontend dev

# Smart contract development
pnpm contract
```

## 📋 Development Status

The project is currently in initial setup phase:
- ✅ Project structure configured
- ✅ Basic development environment setup
- ✅ Code quality tools configured (Biome, ESLint)
- 🔄 Core features development in progress

## 🎨 Core Features (Planned)

- [ ] End-to-end encrypted message system
- [ ] Public preview functionality
- [ ] Wallet-based access control
- [ ] Payment system (1% fee)
- [ ] Short link generation and sharing
- [ ] On-chain storage

## 🔐 Security & Privacy

- All messages encrypted client-side
- Fully on-chain storage (no IPFS)
- No centralized storage
- Even Hexis cannot read your messages

## 📄 License

ISC License

---

**🜍 hexis.cat** — Publish what matters, hide what must. 
