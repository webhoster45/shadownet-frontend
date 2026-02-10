import { RpcProvider } from "starknet";
import abi from "./contract-abi.json";

export const CONTRACT_ADDRESS =
  "0x49e43ce869b6c4f9415b1d088a92acb048b87ede6370f9ddc9013604ea79ceb";

export const RPC_URL =
  "https://starknet-sepolia.g.alchemy.com/v2/aSzNwLtr_R5h1CQLJhUuC";

export const provider = new RpcProvider({ nodeUrl: RPC_URL });

// Connect Ready / ArgentX
export async function connectWallet() {
  if (!window.starknet) {
    alert("Please install Ready Wallet");
    return null;
  }

  await window.starknet.enable({ starknetVersion: "v5" });
  return window.starknet;
}

// WRITE: Create vault (matches test script)
export async function createVault(account, vaultId, commitment) {
  const tx = await account.execute({
    contractAddress: CONTRACT_ADDRESS,
    entrypoint: "create_vault",
    calldata: [vaultId.toString(), commitment.toString()],
  });

  await provider.waitForTransaction(tx.transaction_hash);
  return tx.transaction_hash;
}

// READ: Get vault (matches test script)


export async function getVault(vaultId) {
  const res = await provider.callContract({
    contractAddress: CONTRACT_ADDRESS,
    entrypoint: "get_vault",
    calldata: [vaultId.toString()],
  });

  // Starknet returns raw felts in an array
  const values = res.result ?? res;

  return {
    owner: values[0],       // felt252 (address)
    commitment: values[1],  // felt252
  };
}


