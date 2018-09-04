import Big from "big.js";
import db from "../../database";
import { Network } from "stellar-base";

const StellarAmountPrecision = 7;

export async function setNetwork(): Promise<string> {
  const promise = db.storeState.getStellarNetworkPassphrase().then((networkPassphrase: string) => {
    Network.use(new Network(networkPassphrase));
    return networkPassphrase;
  });

  return promise;
}

// converts amounts according to Stellar precision like this:
// "99999999800" -> "9999.9999800"
export function toFloatAmountString(intAmountString: string): string {
  const floatAmount = new Big(intAmountString);
  return floatAmount.div(new Big("1e" + StellarAmountPrecision)).toFixed(StellarAmountPrecision);
}
