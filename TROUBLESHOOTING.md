# Troubleshooting Guide

This document provides solutions for common issues you might encounter when running LandChain.

## Environment Variables Issues

### Missing Environment Variables

**Problem**: Application fails with errors related to undefined environment variables.

**Solution**:
1. Make sure you have a `.env.local` file in the root directory
2. Verify that all required variables are defined:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_RPC_URL=your_ethereum_rpc_url
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
   ADMIN_PRIVATE_KEY=your_admin_private_key
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
   ```
3. Restart the development server after making changes

**Development Mode**: In development mode, the application will simulate blockchain interactions if environment variables are missing, but will log warnings.

## Blockchain Integration Issues

### "Cannot read properties of undefined (reading 'toHexString')"

**Problem**: When approving transfers, you see an error: "Blockchain operation failed: TypeError: Cannot read properties of undefined (reading 'toHexString')"

**Solution**:
1. Verify that your `ADMIN_PRIVATE_KEY` is set correctly in `.env.local`
2. Ensure the private key is in the correct format (hexadecimal string without '0x' prefix)
3. Check that your RPC URL is valid and the network is accessible

### Failed Transactions

**Problem**: Blockchain transactions fail with "insufficient funds" or similar errors.

**Solution**:
1. Ensure your admin wallet has enough ETH for gas fees on the Sepolia testnet
2. You can get free test ETH from a Sepolia faucet like:
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/
3. Verify that the contract address is correct and the contract is deployed

## MongoDB Connection Issues

### "MongoNetworkError: connect ECONNREFUSED"

**Problem**: Cannot connect to the MongoDB database.

**Solution**:
1. Verify that your MongoDB instance is running
2. Check that the connection string in `MONGODB_URI` is correct
3. If using MongoDB Atlas, ensure your IP address is whitelisted

## Wallet Connection Issues

### "No Ethereum provider found"

**Problem**: The application cannot detect MetaMask or another Web3 wallet.

**Solution**:
1. Install MetaMask or another Web3 wallet browser extension
2. Ensure the wallet is unlocked
3. Connect to the Sepolia testnet in your wallet
4. Refresh the page after setting up your wallet

### "Wrong network"

**Problem**: Wallet is connected to the wrong network.

**Solution**:
1. Open your wallet
2. Switch to the Sepolia testnet
3. Refresh the page

## Admin Dashboard Access Issues

**Problem**: Cannot access the admin dashboard.

**Solution**:
1. Navigate to `/admin`
2. Use username: "admin"
3. Use the password you set in `NEXT_PUBLIC_ADMIN_PASSWORD`
4. If you forgot the password, update it in your `.env.local` file and restart the server

## Transfer Request Issues

**Problem**: Transfer requests are not being approved properly.

**Solution**:
1. Ensure the record is in "PendingTransfer" status
2. Verify that the admin account has sufficient ETH for gas fees
3. Check that all blockchain environment variables are set correctly
4. Look for console errors that might provide more details

## Development Mode Simulation

**Note**: In development mode, if blockchain environment variables are missing, the application will:
1. Log warnings about the missing variables
2. Simulate blockchain interactions with mock transaction hashes
3. Update the database as if the blockchain operations succeeded

This allows for testing the application flow without actual blockchain integration during development. 