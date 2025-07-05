# HealthChain - Decentralized Health Records

A decentralized health record system built on the Stacks blockchain that allows patients to securely store and share their health data with authorized doctors.

## 🏥 Project Overview

HealthChain is a decentralized application (dApp) that transforms the traditional NFT marketplace template into a secure health record management system. Patients can upload encrypted health data to the blockchain and grant access to specific doctors, ensuring data privacy and control.

## 🚀 Core Features

### Smart Contract Functions
- **`add-record(data: (buff 1024))`** - Patients can upload encrypted health data
- **`grant-access(doctor: principal)`** - Patients can grant read access to specific doctors
- **`get-record(patient: principal)`** - Doctors can view patient records only if authorized

### Frontend Components
- **RecordUploadForm** - Interface for patients to upload health data
- **GrantAccessForm** - Interface for patients to grant doctor access
- **ViewRecord** - Interface for doctors to view authorized patient records

## 🛠️ Technology Stack

- **Blockchain**: Stacks (Clarity smart contracts)
- **Frontend**: Next.js with React
- **Wallet Integration**: Hiro Wallet, Xverse
- **Styling**: Tailwind CSS
- **Development**: Clarinet for contract development

## 📋 Contract Address

**Testnet Contract Address**: `ST2CEP848SACBBX7KHVC4TBZXBV0JH6SC0WF439NF.healthchain`

## 🏗️ Project Structure

```
HealthChain/
├── clarity/
│   ├── contracts/
│   │   └── healthchain.clar          # Main smart contract
│   ├── deployments/
│   │   └── default.devnet-plan.yaml  # Deployment configuration
│   └── Clarinet.toml                 # Clarinet configuration
├── front-end/
│   ├── src/
│   │   ├── components/
│   │   │   └── healthchain/          # HealthChain UI components
│   │   ├── constants/
│   │   │   └── contracts.ts          # Contract configuration
│   │   └── app/
│   │       ├── page.tsx              # Main application page
│   │       └── globals.css           # Global styles
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Clarinet CLI (for contract development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HealthChain
   ```

2. **Install frontend dependencies**
   ```bash
   cd front-end
   npm install
   ```

3. **Deploy the smart contract**
   ```bash
   cd ../clarity
   clarinet contracts deploy healthchain
   ```

4. **Start the development server**
   ```bash
   cd ../front-end
   npm run dev
   ```

## 💡 How It Works

### For Patients
1. **Connect Wallet**: Use Hiro Wallet or Xverse to connect to the application
2. **Upload Health Data**: Use the RecordUploadForm to upload encrypted health data
3. **Grant Access**: Use the GrantAccessForm to give specific doctors access to your records

### For Doctors
1. **Connect Wallet**: Use your Stacks wallet to connect to the application
2. **View Records**: Use the ViewRecord component to access patient records you've been authorized to view

### Security Features
- **Encrypted Data**: Health data is stored as encrypted buffers on the blockchain
- **Access Control**: Only patients and explicitly authorized doctors can view records
- **Blockchain Security**: Leverages Stacks blockchain for immutability and transparency

## 🎨 Design

- **Primary Color**: Emerald Green (#10B981)
- **Secondary Color**: Dark Slate (#1F2937)
- **Theme**: Medical/Healthcare with modern UI/UX
- **Hero Text**: "Own your health data. Share it with trusted doctors."

## 🔧 Development

### Smart Contract Development
The smart contract is written in Clarity and includes:
- Data storage using maps
- Access control mechanisms
- Public and read-only functions

### Frontend Development
The frontend uses:
- Next.js 13+ with App Router
- React hooks for state management
- Micro-stacks for Stacks integration
- Tailwind CSS for styling

## 📝 Additional Features Implemented

- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error messages for user feedback
- **Network Support**: Supports devnet, testnet, and mainnet
- **Wallet Integration**: Seamless integration with Stacks wallets

## 🔒 Privacy & Security

- Health data is encrypted before being stored on the blockchain
- Access is controlled through explicit authorization
- Patients maintain full control over their data
- No central authority can access patient records

## 🚀 Deployment

The application is designed to be deployed to Stacks testnet and mainnet. The contract address will be updated once deployed to the respective networks.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support or questions, please open an issue in the repository.
