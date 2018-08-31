import stellar from "stellar-base";
import { Account } from "./account";
import { Asset } from "./asset";

export class TrustLine {
  public static buildFakeNative(account: Account) {
    const data = {
      accountid: account.id,
      assettype: stellar.xdr.AssetType.assetTypeNative().value,
      assetcode: "XLM",
      issuer: stellar.Keypair.master().publicKey(),
      lastmodified: account.lastModified,
      tlimit: "9223372036854776000",
      flags: 1,
      balance: account.balance
    };

    return new TrustLine(data);
  }

  public accountID: string;
  public asset: Asset;
  public limit: string;
  public balance: string;
  public authorized: boolean;
  public lastModified: number;

  constructor(data: {
    accountid: string;
    assettype: number;
    issuer: string;
    assetcode: string;
    tlimit: string;
    balance: string;
    flags: number;
    lastmodified: number;
  }) {
    this.accountID = data.accountid;
    this.limit = data.tlimit;
    this.balance = data.balance;
    this.lastModified = data.lastmodified;
    this.authorized = (data.flags & stellar.xdr.TrustLineFlags.authorizedFlag().value) > 0;

    this.asset = new Asset(
      // we want to handle native balance
      // like a trustline too, for consistency
      data.assettype === stellar.xdr.AssetType.assetTypeNative().value,
      data.assetcode,
      data.issuer
    );
  }
}
