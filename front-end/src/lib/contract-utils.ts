import { STACKS_TESTNET } from '@stacks/network';
import { ContractCallRegularOptions, FinishedTxData, request } from '@stacks/connect';

import {
  makeContractCall,
  broadcastTransaction,
  SignedContractCallOptions,
  ClarityValue,
  PostCondition,
  PostConditionMode,
  principalCV,
  stringAsciiCV,
  stringUtf8CV,
  listCV,
  uintCV,
  boolCV,
  noneCV,
  someCV,
} from '@stacks/transactions';
import { generateWallet } from '@stacks/wallet-sdk';
import { isTestnetEnvironment } from './use-network';
import { TransactionResult } from '@stacks/connect/dist/types/methods';
import { Network } from './network';
import { getHealthchainContract } from './clarity-utils';

interface DirectCallResponse {
  txid: string;
}

export const shouldUseDirectCall = () => false; // No longer needed for testnet

// This function is no longer needed since we're using real wallet integration
export const executeContractCall = async (
  txOptions: ContractCallRegularOptions,
  currentWallet: any
): Promise<DirectCallResponse> => {
  // This function is deprecated - use openContractCall instead
  throw new Error('Use openContractCall with Hiro Wallet instead');
};

export const openContractCall = async (options: ContractCallRegularOptions) => {
  try {
    const contract = `${options.contractAddress}.${options.contractName}`;
    const params: any = {
      contract,
      functionName: options.functionName,
      functionArgs: options.functionArgs,
      network:
        typeof options.network === 'object'
          ? 'chainId' in options.network
            ? options.network.chainId === 1
              ? 'mainnet'
              : 'testnet'
            : options.network
          : options.network,
      postConditions: options.postConditions,
      postConditionMode: options.postConditionMode === PostConditionMode.Allow ? 'allow' : 'deny',
      sponsored: options.sponsored,
    };

    console.log('🔗 openContractCall params:', params);

    const result: TransactionResult = await request({}, 'stx_callContract', params);

    console.log('📤 openContractCall result:', result);

    if (options.onFinish) {
      options.onFinish(result as FinishedTxData);
    }

    return result;
  } catch (error: unknown) {
    console.error('❌ openContractCall failed:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      options
    });
    if (error instanceof Error && error.message?.includes('cancelled') && options.onCancel) {
      options.onCancel();
    }
    throw error;
  }
};

// New functions for real blockchain operations

export const callReadOnlyFunction = async (
  network: Network,
  functionName: string,
  functionArgs: any[],
  senderAddress: string
) => {
  try {
    const contract = getHealthchainContract(network);
    
    // Convert function args to ClarityValues
    const clarityArgs: ClarityValue[] = functionArgs.map(arg => {
      if (typeof arg === 'string') {
        // Check if it's a principal address (starts with ST or SP)
        if (arg.startsWith('ST') || arg.startsWith('SP')) {
          return principalCV(arg);
        } else {
          // For UTF-8 strings (like URIs), use stringUtf8CV
          return stringUtf8CV(arg);
        }
      } else if (typeof arg === 'number') {
        return uintCV(arg);
      } else if (typeof arg === 'boolean') {
        return boolCV(arg);
      } else if (Array.isArray(arg)) {
        return listCV(arg.map(item => stringAsciiCV(item)));
      } else {
        return stringAsciiCV(String(arg));
      }
    });

    const result = await request({}, 'stx_callReadOnlyFunction', {
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName,
      functionArgs: clarityArgs,
      network: isTestnetEnvironment(network) ? 'testnet' : 'mainnet',
      senderAddress,
    });

    return result;
  } catch (error) {
    console.error('Read-only function call failed:', error);
    throw error;
  }
};

export const callPublicFunction = async (
  network: Network,
  functionName: string,
  functionArgs: any[],
  senderAddress: string
) => {
  try {
    const contract = getHealthchainContract(network);
    
    console.log('🔍 Contract bilgileri:', {
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      network: network,
      isTestnet: isTestnetEnvironment(network)
    });
    
    // Convert function args to ClarityValues
    const clarityArgs: ClarityValue[] = functionArgs.map((arg, index) => {
      console.log(`🔧 Converting arg ${index}:`, arg, typeof arg);
      
      if (typeof arg === 'string') {
        // Check if it's a principal address (starts with ST or SP)
        if (arg.startsWith('ST') || arg.startsWith('SP')) {
          console.log(`📍 Converting to principal: ${arg}`);
          return principalCV(arg);
        } else if (arg.startsWith('http')) {
          // For URIs, use stringUtf8CV
          console.log(`📍 Converting to UTF8 string: ${arg}`);
          return stringUtf8CV(arg);
        } else {
          // For ASCII strings (like roles), use stringAsciiCV
          console.log(`📍 Converting to ASCII string: ${arg}`);
          return stringAsciiCV(arg);
        }
      } else if (typeof arg === 'number') {
        console.log(`📍 Converting to uint: ${arg}`);
        return uintCV(arg);
      } else if (typeof arg === 'boolean') {
        console.log(`📍 Converting to bool: ${arg}`);
        return boolCV(arg);
      } else if (Array.isArray(arg)) {
        console.log(`📍 Converting to list: ${arg}`);
        return listCV(arg.map(item => stringAsciiCV(item)));
      } else {
        console.log(`📍 Converting to ASCII string (default): ${arg}`);
        return stringAsciiCV(String(arg));
      }
    });

    console.log('🔗 Calling public function:', {
      contract: `${contract.contractAddress}.${contract.contractName}`,
      functionName,
      functionArgs: clarityArgs,
      network: isTestnetEnvironment(network) ? 'testnet' : 'mainnet',
      senderAddress
    });

    const result = await openContractCall({
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName,
      functionArgs: clarityArgs,
      network: isTestnetEnvironment(network) ? STACKS_TESTNET : network,
      anchorMode: 3, // Any
      fee: 5000, // 0.005 STX fee
      onFinish: (data) => {
        console.log('✅ Transaction finished:', data);
        console.log('📊 Transaction ID:', data.txId);
      },
      onCancel: () => {
        console.log('❌ Transaction cancelled by user');
      },
    });

    console.log('📤 Transaction sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Public function call failed:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      functionName,
      functionArgs,
      network,
      senderAddress
    });
    throw error;
  }
};
