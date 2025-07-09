import { ContractCallRegularOptions, FinishedTxData, request } from '@stacks/connect';
import { TransactionResult } from '@stacks/connect/dist/types/methods';

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
      postConditionMode: 'allow',
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
