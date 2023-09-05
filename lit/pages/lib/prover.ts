import { poseidon1 } from "poseidon-lite";
import { ripemd160 } from "ethers/lib/utils.js";
const snarkjs = require("snarkjs"); // snarkjs doesn't have types

export const valueToBigInt = (value: unknown): bigint => {
  return BigInt(ripemd160(Buffer.from(JSON.stringify(value))));
};

/**
 * Compute the key that only you can know the preimage of.
 * @param preimage your secret, the preimage of the key
 * @returns key, as the Poseidon hash of your secret
 */
export function computeKey(preimage: bigint): string {
  return poseidon1([preimage]).toString();
}
