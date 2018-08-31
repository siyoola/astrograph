import { Account, DataEntry, Signer, TrustLine } from "../../model";

import { withFilter } from "graphql-subscriptions";
import { createBatchResolver } from "./util";

import db from "../../database";
import { ACCOUNT_CREATED, ACCOUNT_REMOVED, ACCOUNT_UPDATED, pubsub } from "../../pubsub";

const fetchIDs = (r: any) => r.id;

const signersResolver = createBatchResolver<Account, Signer[]>((source: any) =>
  db.signers.findAllByAccountIDs(source.map(fetchIDs))
);

const dataEntriesResolver = createBatchResolver<Account, DataEntry[]>((source: any) =>
  db.dataEntries.findAllByAccountIDs(source.map(fetchIDs))
);

const trustLinesResolver = createBatchResolver<Account, TrustLine[]>(async (source: any) => {
  const trustLines = await db.trustLines.findAllByAccountIDs(source.map(fetchIDs));

  for (const accountTrustLines of trustLines) {
    const account = source.filter((acc: Account) => acc.id === accountTrustLines[0].accountID);
    accountTrustLines.unshift(TrustLine.buildFakeNative(account));
  }

  return trustLines;
});

const accountSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return payload.id === variables.id;
      }
    ),

    resolve(payload: any, args: any, ctx: any, info: any) {
      return payload;
    }
  };
};

export default {
  Account: {
    signers: signersResolver,
    data: dataEntriesResolver,
    trustLines: trustLinesResolver
  },
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    },
    accounts(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findAllByIDs(args.id);
    }
  },
  Subscription: {
    accountCreated: accountSubscription(ACCOUNT_CREATED),
    accountUpdated: accountSubscription(ACCOUNT_UPDATED),
    accountRemoved: accountSubscription(ACCOUNT_REMOVED)
  }
};
