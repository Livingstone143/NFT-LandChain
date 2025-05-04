<<<<<<< HEAD
# NFT-LandChain
Land records using NFT and Blockchain
=======
# LandChain - Blockchain Land Record Management System

LandChain is a decentralized application for managing land records on the blockchain. It provides a secure, transparent, and immutable way to register, verify, and transfer land ownership.

## Features

- **Land Registration**: Register land records with detailed information
- **Blockchain Verification**: Verify land records on the blockchain
- **Transfer Requests**: Request land transfers that require admin approval
- **Mapping Integration**: View land records on an interactive map
- **Admin Dashboard**: Approve registrations and transfers

## Setup Instructions

### Prerequisites

- Node.js 16+
- MongoDB database
- Ethereum wallet with testnet ETH (for Sepolia testnet)
- Metamask or WalletConnect compatible wallet

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/landchain.git
   cd landchain
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:

   ```
   # MongoDB connection
   MONGODB_URI=your_mongodb_connection_string

   # Blockchain configuration
   NEXT_PUBLIC_RPC_URL=your_ethereum_rpc_url
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address

   # Admin wallet for blockchain transactions
   ADMIN_PRIVATE_KEY=your_admin_private_key

   # Admin dashboard password
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
   ```

   > **Note**: In development mode, the app will simulate blockchain interactions if environment variables are missing.

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Smart Contract Deployment

If you want to deploy your own contract:

1. Compile the smart contract
   ```
   npm run compile
   ```

2. Deploy to Sepolia testnet
   ```
   npm run deploy
   ```

3. Update the `NEXT_PUBLIC_CONTRACT_ADDRESS` in your `.env.local` file with the new contract address

## Admin Dashboard

Access the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin)
- Username: admin
- Password: The password you set in `NEXT_PUBLIC_ADMIN_PASSWORD`

## Development Notes

### Blockchain Integration

- In development mode, blockchain interactions will be simulated if environment variables are missing
- For production, ensure all blockchain environment variables are properly set

### Transfer Process

The transfer process has two steps:
1. User requests a transfer which requires admin approval
2. Admin approves the transfer which executes the blockchain transaction

This two-step process ensures proper verification of transfers by authorized administrators.

## License

This project is licensed under the MIT License. 
>>>>>>> 388e65c (first commit)
