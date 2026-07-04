import { Client } from '@hashgraph/sdk';
require("dotenv").config();

let client = null;

export function getHederaClient() {
  if (client) return client;

  const network = process.env.HEDERA_NETWORK || "testnet";

  if (network.toLowerCase() === "mainnet") {
    client = Client.forMainnet();
    client.setOperator(
      process.env.HEDERA_MAINNET_OPERATOR_ID,
      process.env.HEDERA_MAINNET_OPERATOR_KEY
    );
    console.log("--- Hedera Client Initialized on MAINNET ---");
  } else {
    // Keep testnet mode completely intact
    client = Client.forTestnet();
    client.setOperator(
      process.env.HEDERA_TESTNET_OPERATOR_ID,
      process.env.HEDERA_TESTNET_OPERATOR_KEY
    );
    console.log("--- Hedera Client Initialized on TESTNET ---");
  }

  return client;
}