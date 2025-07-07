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

    const result: TransactionResult = await request({}, 'stx_callContract', params);

    if (options.onFinish) {
      options.onFinish(result as FinishedTxData);
    }

    return result;
  } catch (error: unknown) {
    console.error('Failed to execute contract call:', error);
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
        return principalCV(arg);
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
    
    // Convert function args to ClarityValues
    const clarityArgs: ClarityValue[] = functionArgs.map(arg => {
      if (typeof arg === 'string') {
        return principalCV(arg);
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
    throw error;
  }
};
