import db from "../database";

import { Account, Ledger } from "../model";

import { ACCOUNT_CREATED, ACCOUNT_REMOVED, ACCOUNT_UPDATED, LEDGER_CREATED, pubsub } from "../pubsub";
import { AccountChange, Collection, Type as ChangeType, TrustLineChange } from "./changes";

export default class Publisher {
  public static async build(ledger: Ledger, collection: Collection): Promise<Publisher> {
    const accounts = await db.accounts.findAllMapByIDs(collection.accountIDs());
    return new Publisher(collection, ledger, accounts);
  }

  private collection: Collection;
  private accounts: Map<string, Account>;
  private ledger: Ledger;

  constructor(collection: Collection, ledger: Ledger, accounts: Map<string, Account>) {
    this.collection = collection;
    this.ledger = ledger;
    this.accounts = accounts;
  }

  public async publish() {
    pubsub.publish(LEDGER_CREATED, this.ledger);

    for (const change of this.collection) {
      // Here type checking order is important as AccountChange fits every other type
      if (change as TrustLineChange) {

      } else if (change as AccountChange) {
        switch (change.type) {
          case ChangeType.Create:
            this.publishAccountEvent(ACCOUNT_CREATED, change);
            break;

          case ChangeType.Update:
            this.publishAccountEvent(ACCOUNT_UPDATED, change);
            break;

          case ChangeType.Remove:
            this.publishAccountEvent(ACCOUNT_REMOVED, change);
            break;
        }
      } // else if
    }
  }

  private publishAccountEvent(event: string, change: AccountChange) {
    pubsub.publish(event, this.accounts.get(change.accountID));
  }
}
