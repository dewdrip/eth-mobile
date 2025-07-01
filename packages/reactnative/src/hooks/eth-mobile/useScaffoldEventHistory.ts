import {
  AbiCoder,
  Block,
  Interface,
  JsonRpcProvider,
  Log,
  TransactionReceipt,
  TransactionResponse
} from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDeployedContractInfo, useNetwork } from '.';
import { ContractName } from '../../utils/eth-mobile';

interface UseScaffoldEventHistoryConfig<
  TContractName extends ContractName,
  TEventName extends string
> {
  contractName: TContractName;
  eventName: TEventName;
  fromBlock: bigint;
  filters?: Record<string, any>;
  blockData?: boolean;
  transactionData?: boolean;
  receiptData?: boolean;
  watch?: boolean;
  enabled?: boolean;
}

interface EventData {
  log: Log;
  blockData?: Block | null;
  transactionData?: TransactionResponse | null;
  receiptData?: TransactionReceipt | null;
  args?: any[];
  eventName?: string;
}

interface EventHistoryState {
  data: EventData[] | undefined;
  status: 'idle' | 'pending' | 'error' | 'success';
  error: Error | null;
  isLoading: boolean;
}

const getEvents = async (
  provider: JsonRpcProvider,
  contractAddress: string,
  eventName: string,
  fromBlock: bigint,
  toBlock?: bigint,
  filters?: Record<string, any>,
  options?: {
    blockData?: boolean;
    transactionData?: boolean;
    receiptData?: boolean;
  }
): Promise<EventData[]> => {
  try {
    // Convert filters to ethers format
    const ethersFilters: any = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          ethersFilters[key] = value;
        }
      });
    }

    // Get logs using ethers - we'll filter by event name later
    const logs = await provider.getLogs({
      address: contractAddress,
      fromBlock: fromBlock,
      toBlock: toBlock,
      ...ethersFilters
    });

    if (!logs || logs.length === 0) return [];

    const finalEvents = await Promise.all(
      logs.map(async log => {
        const eventData: EventData = { log };

        if (options?.blockData && log.blockHash) {
          try {
            eventData.blockData = await provider.getBlock(log.blockHash);
          } catch (error) {
            console.warn('Failed to fetch block data:', error);
            eventData.blockData = null;
          }
        }

        if (options?.transactionData && log.transactionHash) {
          try {
            eventData.transactionData = await provider.getTransaction(
              log.transactionHash
            );
          } catch (error) {
            console.warn('Failed to fetch transaction data:', error);
            eventData.transactionData = null;
          }
        }

        if (options?.receiptData && log.transactionHash) {
          try {
            eventData.receiptData = await provider.getTransactionReceipt(
              log.transactionHash
            );
          } catch (error) {
            console.warn('Failed to fetch receipt data:', error);
            eventData.receiptData = null;
          }
        }

        return eventData;
      })
    );

    return finalEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

/**
 * Reads events from a deployed contract using ethers
 *
 * @example
 * ```tsx
 * // Basic usage with Staker contract Stake event
 * const { data: events, isLoading, error } = useScaffoldEventHistory({
 *   contractName: "Staker",
 *   eventName: "Stake",
 *   fromBlock: 0n,
 * });
 *
 * // Access decoded event arguments
 * events?.forEach((event, index) => {
 *   console.log("User:", event.args[0]); // address
 *   console.log("Amount:", event.args[1]); // uint256
 *   console.log("Event name:", event.eventName); // "Stake"
 *   console.log("Block number:", event.log.blockNumber);
 *   console.log("Transaction hash:", event.log.transactionHash);
 * });
 *
 * // With filters
 * const { data: events } = useScaffoldEventHistory({
 *   contractName: "Staker",
 *   eventName: "Stake",
 *   fromBlock: 1000n,
 *   filters: { user: "0x123..." }, // Filter by specific user
 * });
 *
 * // With additional data
 * const { data: events } = useScaffoldEventHistory({
 *   contractName: "Staker",
 *   eventName: "Stake",
 *   fromBlock: 0n,
 *   blockData: true,
 *   transactionData: true,
 *   receiptData: true,
 * });
 *
 * // With watch enabled for real-time updates
 * const { data: events } = useScaffoldEventHistory({
 *   contractName: "Staker",
 *   eventName: "Stake",
 *   fromBlock: 0n,
 *   watch: true,
 * });
 * ```
 *
 * @param config - The config settings
 * @param config.contractName - deployed contract name from deployedContracts.ts
 * @param config.eventName - name of the event to listen for
 * @param config.fromBlock - the block number to start reading events from
 * @param config.filters - filters to be applied to the event (parameterName: value)
 * @param config.blockData - if set to true it will return the block data for each event (default: false)
 * @param config.transactionData - if set to true it will return the transaction data for each event (default: false)
 * @param config.receiptData - if set to true it will return the receipt data for each event (default: false)
 * @param config.watch - if set to true, the events will be updated every 15 seconds (default: false)
 * @param config.enabled - set this to false to disable the hook from running (default: true)
 *
 * @returns Object containing:
 * - data: Array of event data with optional block, transaction, and receipt data
 * - status: Query status ('idle' | 'pending' | 'error' | 'success')
 * - error: Error object if query failed
 * - isLoading: Boolean indicating if the query is loading
 * - isFetchingNewEvent: Boolean indicating if fetching new events
 * - refetch: Function to manually refetch the data
 */
export const useScaffoldEventHistory = <
  TContractName extends ContractName,
  TEventName extends string
>({
  contractName,
  eventName,
  fromBlock,
  filters,
  blockData = false,
  transactionData = false,
  receiptData = false,
  watch = false,
  enabled = true
}: UseScaffoldEventHistoryConfig<TContractName, TEventName>) => {
  const network = useNetwork();
  const [state, setState] = useState<EventHistoryState>({
    data: undefined,
    status: 'idle',
    error: null,
    isLoading: false
  });
  const lastFetchedBlock = useRef<bigint>(fromBlock);

  const { data: deployedContractData } = useDeployedContractInfo(
    contractName as string
  );

  // Create provider
  const provider = new JsonRpcProvider(network.provider);

  // Fetch events function
  const fetchEvents = useCallback(async () => {
    if (!deployedContractData) return;

    setState(prev => ({
      ...prev,
      isLoading: true,
      status: 'pending'
    }));

    try {
      const currentBlockNumber = BigInt(await provider.getBlockNumber());

      const toBlock = currentBlockNumber;
      const fromBlockToUse = lastFetchedBlock.current;

      const data = await getEvents(
        provider,
        String(deployedContractData.address),
        eventName,
        fromBlockToUse,
        toBlock,
        filters,
        { blockData, transactionData, receiptData }
      );

      // Create contract interface for proper event decoding
      const contractInterface = new Interface(deployedContractData.abi as any);

      const processedData = data.map(event =>
        addIndexedArgsToEvent(event, contractInterface, eventName)
      );

      setState(prev => {
        // Create a Set of existing transaction hashes to avoid duplicates
        const existingTxHashes = new Set(
          (prev.data || []).map(event => event.log.transactionHash)
        );

        // Filter out events that already exist based on transaction hash
        const uniqueNewData = processedData.filter(
          event => !existingTxHashes.has(event.log.transactionHash)
        );

        const newData = [...(prev.data || []), ...uniqueNewData];

        return {
          data: newData,
          status: 'success',
          error: null,
          isLoading: false
        };
      });

      if (data.length > 0) {
        lastFetchedBlock.current = currentBlockNumber || fromBlock;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error as Error,
        isLoading: false
      }));
    }
  }, [
    deployedContractData,
    provider,
    eventName,
    fromBlock,
    filters,
    blockData,
    transactionData,
    receiptData,
    lastFetchedBlock
  ]);

  // Fetch new events when block number changes (for watch mode)
  useEffect(() => {
    if (!enabled) return;

    fetchEvents();

    provider.off('block');

    if (watch) {
      provider.on('block', blockNumber => {
        fetchEvents();
      });
    } else {
      provider.off('block');
    }

    return () => {
      provider.off('block');
    };
  }, [watch, deployedContractData]);

  // Refetch function
  const refetch = useCallback(() => {
    fetchEvents();
  }, [enabled]);

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    isLoading: state.isLoading,
    refetch
  };
};

/**
 * Helper function to add indexed arguments to event data
 * @param event - The event data to process
 * @param contractInterface - The contract interface for decoding
 * @param eventName - The name of the event
 * @returns Event data with parsed arguments
 */
export const addIndexedArgsToEvent = (
  event: EventData,
  contractInterface?: Interface,
  eventName?: string
) => {
  if (!event.log || !event.log.topics || event.log.topics.length === 0) {
    return event;
  }

  try {
    // If we have the contract interface and event name, try to decode properly
    if (contractInterface && eventName) {
      try {
        const parsedLog = contractInterface.parseLog({
          topics: [...event.log.topics],
          data: event.log.data
        });

        if (parsedLog) {
          return {
            ...event,
            args: parsedLog.args,
            eventName: parsedLog.name
          };
        }
      } catch (error) {
        console.warn('Failed to parse log with interface:', error);
      }
    }

    // Fallback: manual decoding for common event patterns
    const topics = event.log.topics;
    const data = event.log.data;

    // The first topic is the event signature
    const eventSignature = topics[0];

    // For indexed parameters, they go in topics[1], topics[2], etc.
    // For non-indexed parameters, they go in the data field
    const indexedArgs: any[] = [];
    const abiCoder = new AbiCoder();

    // Try to decode indexed arguments from topics
    for (let i = 1; i < topics.length; i++) {
      try {
        // Try common types for indexed parameters
        const topic = topics[i];

        // Try as address (20 bytes)
        if (topic.length === 66) {
          // 0x + 64 hex chars
          try {
            const address = abiCoder.decode(['address'], topic)[0];
            indexedArgs.push(address);
            continue;
          } catch {}
        }

        // Try as uint256
        try {
          const uint256 = abiCoder.decode(['uint256'], topic)[0];
          indexedArgs.push(uint256);
          continue;
        } catch {}

        // Try as bytes32
        try {
          const bytes32 = abiCoder.decode(['bytes32'], topic)[0];
          indexedArgs.push(bytes32);
          continue;
        } catch {}

        // If all else fails, keep as raw topic
        indexedArgs.push(topic);
      } catch (error) {
        indexedArgs.push(topics[i]);
      }
    }

    // Try to decode non-indexed arguments from data
    let nonIndexedArgs: any[] = [];
    if (data && data !== '0x') {
      try {
        // This is a simplified approach - in practice you'd need the exact ABI
        // For now, we'll try to decode as uint256 if it's 32 bytes
        if (data.length === 66) {
          // 0x + 64 hex chars
          try {
            const uint256 = abiCoder.decode(['uint256'], data)[0];
            nonIndexedArgs.push(uint256);
          } catch {}
        }
      } catch (error) {
        console.warn('Failed to decode non-indexed args:', error);
      }
    }

    return {
      ...event,
      args: [...indexedArgs, ...nonIndexedArgs],
      eventName: eventName || 'Unknown'
    };
  } catch (error) {
    console.warn('Error decoding event args:', error);
    return {
      ...event,
      args: [],
      eventName: eventName || 'Unknown'
    };
  }
};
