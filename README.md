# HealthChain v2 - NFT-Based Health Data Access Control

HealthChain is a decentralized health data access control system built on Stacks blockchain. It uses NFTs to manage patient-doctor relationships and control access to health records.

## 🚀 Live Demo

**Contract Address:** `ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8.healthchain_v5`  
**Network:** Stacks Testnet  
**Explorer:** [View on Hiro Explorer](https://explorer.hiro.so/address/ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8?chain=testnet)

## 🛡️ Important Notice

This project operates exclusively on **Stacks Testnet** with a real deployed Clarity contract. All transactions require real wallet approval and are executed on the actual blockchain. No simulation, mock data, or local test networks are used.

## 🔧 Technology Stack

- **Frontend:** Next.js 14, TypeScript, Chakra UI
- **Blockchain:** Stacks (Clarity smart contracts)
- **Wallet:** Hiro Wallet integration
- **Network:** Stacks Testnet

## 📋 Prerequisites

1. **Hiro Wallet Extension** - Install from [hiro.so](https://hiro.so/wallet/install-web-extension)
2. **Testnet STX Tokens** - Get from [Stacks Testnet Faucet](https://explorer.hiro.so/faucet?chain=testnet)
3. **Node.js 18+** and **npm/yarn**

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd healthchain_v2
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the `front-end` directory:

```env
NEXT_PUBLIC_STACKS_NETWORK=testnet
```

### 3. Run Development Server

```bash
cd front-end
npm run dev
```

### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 User Flow

### For Patients

1. **Connect Wallet** - Use Hiro Wallet to connect to Stacks Testnet
2. **Assign Role** - Call `assign-role` with "patient" parameter
3. **Mint Access Token** - Create NFT for health data access control
4. **Grant Doctor Access** - Give specific doctors access to your data
5. **Manage Profile** - Store health information (off-chain)

### For Doctors

1. **Connect Wallet** - Use Hiro Wallet to connect to Stacks Testnet
2. **Assign Role** - Call `assign-role` with "doctor" parameter
3. **View Patient Access** - See patients who have granted you access
4. **Access Health Records** - View authorized patient data

## 📜 Smart Contract Functions

### Public Functions

- `assign-role (role)` - Assign "patient", "doctor", or "dev" role
- `mint-access-token (uri)` - Create NFT for health data access
- `grant-access (doctor, token-id)` - Grant doctor access to patient data
- `revoke-access (doctor)` - Revoke doctor's access

### Read-Only Functions

- `has-access (patient, doctor)` - Check access permissions
- `dev-view-access (patient, doctor)` - Admin view of access control
- `dev-view-role (user)` - Get user's assigned role

## 🔐 Security Features

- **NFT-Based Access Control** - Each patient has a unique access token
- **Role-Based Permissions** - Patients and doctors have different capabilities
- **Blockchain Verification** - All access controls are verified on-chain
- **Off-Chain Data Storage** - Health records stored securely off-chain

## 🏗️ Project Structure

```
healthchain_v2/
├── clarity/
│   ├── contracts/
│   │   └── healthchain_v5.clar    # Main smart contract
│   └── deployments/
│       └── default.testnet-plan.yaml
├── front-end/
│   ├── src/
│   │   ├── components/
│   │   │   └── healthchain/       # HealthChain components
│   │   ├── lib/
│   │   │   └── healthchain/       # Contract operations
│   │   └── constants/
│   │       └── contracts.ts       # Contract addresses
│   └── package.json
└── README.md
```

## 🔧 Development

### Smart Contract Development

```bash
cd clarity
clarinet check
clarinet test
```

### Frontend Development

```bash
cd front-end
npm run dev
npm run build
npm run lint
```

## 🌐 Network Configuration

The application is configured for **Stacks Testnet** by default:

- **Contract Address:** `ST1M2X1WBC60W09W91W4ESDRHM94H75VGXGDNCQE8`
- **Contract Name:** `healthchain_v5`
- **Network:** Testnet (chain ID: 2147483648)

## 📱 Wallet Integration

The application integrates with Hiro Wallet for:
- Wallet connection and authentication
- Transaction signing and approval
- Network switching (Testnet/Mainnet)
- Address management

## 🚨 Important Notes

1. **Real Transactions** - All operations require real wallet approval
2. **Testnet Tokens** - Ensure you have sufficient testnet STX for gas fees
3. **Data Privacy** - Health data is stored off-chain; only access controls are on-chain
4. **Role Management** - Users must assign roles before using the system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on testnet
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Check the [Stacks Documentation](https://docs.stacks.co/)
- Review [Hiro Wallet Documentation](https://docs.hiro.so/)
- Open an issue in this repository

---

**HealthChain v2** - Empowering patients with blockchain-based health data control.
