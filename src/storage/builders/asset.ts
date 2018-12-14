import stellar from "stellar-base";
import { Asset } from "stellar-sdk";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { Builder } from "./builder";

export class AssetBuilder extends Builder {
  public static fromXDR(xdr: any) {
    return new AssetBuilder(Asset.fromOperation(xdr));
  }

  public static key(asset: Asset) {
    return makeKey("asset", asset.isNative().toString(), asset.getCode(), asset.getIssuer() || "");
  }

  public readonly current: IBlank;

  constructor(private asset: Asset) {
    super();
    this.current = NQuad.blank(AssetBuilder.key(asset));
  }

  public build(): NQuads {
    const issuer = this.asset.getIssuer() || stellar.Keypair.master().publicKey();

    this.pushKey();

    this.pushValue("type", "asset");
    this.pushValue("native", this.asset.isNative().toString());
    this.pushValue("code", this.asset.getCode());

    this.pushBuilder(new AccountBuilder(issuer), "issuer", "assets.issued");

    return this.nquads;
  }
}
