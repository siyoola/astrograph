import { IDatabase } from "pg-promise";
import squel from "squel";
import { Asset } from "stellar-sdk";
import { Balance } from "../model";
import { BalanceFactory } from "../model/factories";
import { PagingParams, parseCursorPagination, properlyOrdered, SortOrder } from "../util/paging";

export default class AssetsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAll(code?: string, issuer?: string, limit?: number, offset?: number) {
    const queryBuilder = squel
      .select()
      .field("assetcode")
      .field("issuer")
      .from("trustlines")
      .group("assetcode")
      .group("issuer")
      .order("assetcode");

    if (code) {
      queryBuilder.having("assetcode = ?", code);
    }

    if (issuer) {
      queryBuilder.having("issuer = ?", issuer);
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());

    return res.map(a => new Asset(a.assetcode, a.issuer));
  }

  public async findHolders(asset: Asset, paging: PagingParams) {
    const { limit, cursor, order } = parseCursorPagination(paging);
    const queryBuilder = squel
      .select()
      .from("trustlines")
      .where("assetcode = ?", asset.getCode())
      .where("issuer = ?", asset.getIssuer())
      .order("balance", order === SortOrder.ASC) // we must order by balance first to support cursor pagination
      .order("accountid", order !== SortOrder.ASC) // inversion of above
      .limit(limit);

    if (cursor) {
      const [accountId, , balance] = Balance.parsePagingToken(cursor);

      if (paging.after) {
        queryBuilder.where("(balance = ? AND accountid > ?) OR balance < ?", balance, accountId, balance);
      } else if (paging.before) {
        queryBuilder.where("(balance = ? AND accountid < ?) OR balance > ?", balance, accountId, balance);
      }
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());
    const balances = res.map(r => BalanceFactory.fromDb(r));

    return properlyOrdered(balances, paging);
  }
}
