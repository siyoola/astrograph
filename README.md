[![Build Status](https://img.shields.io/travis/com/astroband/astrograph/master.svg)](https://travis-ci.com/astroband/astrograph)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=astroband_astrograph&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=astroband_astrograph)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=astroband_astrograph&metric=security_rating)](https://sonarcloud.io/dashboard?id=astroband_astrograph)
[![License](https://img.shields.io/github/license/astroband/astrograph.svg)](raw/master/LICENSE.txt)

# Astrograph

**Important** This project is still under heavy active development. Until it reaches 1.0 breaking changes may land without prior notice.

Astrograph is a GraphQL server for the [Stellar](https://www.stellar.org/) network. You can think about it as a GraphQL version of [Horizon](https://github.com/stellar/go/tree/master/services/horizon), the client-facing API server for the Stellar ecosystem. 

Astrograph allows you to retrieve various data from the blockchain, as well as allowing you to subscribe to particular events using [GraphQL subscriptions](https://github.com/apollographql/graphql-subscriptions) mechanisms.

Astrograph was initially developed by Evil Martians for [Mobius](https://mobius.network) under the MIT license. We continue our work on Astrograph for the benefit of the broader Stellar developer community. Anyone is welcome to contribute to Astrograph, just read [CONTRIBUTING.md](.github/CONTRIBUTING.md).

<a href="https://evilmartians.com/?utm_source=astrograph">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54"></a>


## Configure

Here is the list of available settings:

* `DB` – stellar-core database name ("stellar" by default)
* `DBPORT` – database port to connect to (5432 by default)
* `DBHOST` – database host to connect to
* `DBUSER` – database user to connect with ("stellar" by default)
* `DBPASSWORD` – password to access the database (no password by default)
* `PORT` - port (4000 by default)
* `BIND_ADDRESS` - address to bind ("0.0.0.0" by default)
* `INGEST_INTERVAL` – database polling interval in milliseconds (2000 by default)
* `DEBUG_LEDGER` – when set, Astrograph will start ingesting ledgers, starting from that. It's useful for debugging. Pass `-1` to force ingest from first ledger existing in database.
* `DEBUG_DUMP_LEDGERS` - when set, Astrograph dumps ledger nquads to `tmp` folder, used to debug DGraph insertion.
* `DEBUG_SQL` - when set, log sql queries.
* `DGRAPH_URL` - when set, Astrograph ingests history to DGraph server. You can use different nodes of DGraph cluster (if you have more than one alpha) for reading and writing by providing `DGRAPH_INGEST_URL` and `DGRAPH_QUERY_URL` variables.
* `SENTRY_DSN` - DSN string for integration with [Sentry](https://sentry.io)

You can set them all using environmental variables, or you can create the `.env` file in the root of the project, and set them there:

```
DB="stellar_core"
DBUSER="john"
...
```

## Install

You can install Astrograph, using [yarn](https://yarnpkg.com/):

```shell
$ git clone https://github.com/astroband/astrograph
$ cd astrograph
$ yarn              # install dependencies
$ yarn run dev      # for developing purposes
$ yarn run prod     # for live setup
```

Also there is a [Dockerfile](Dockerfile). For now you can use it like this:

```shell
$ docker build -t "astrograph:latest" . # build docker image
$ docker run -e NODE_ENV=development -e DB=stellar_core -e DBUSER=john -p 4000:4000 astrograph
```

After that Astrograph server will be available on `http://localhost:4000`.

Using the Docker setup *requires environmental variables only* or settings from the `.env` files are overwritten with default env setup from Dockerfile itself.

Note that currently docker setup was tested only on macOS. If you experience any problems on Linux, please, file an issue.

## Develop

In order to develop locally, you need to get the stellar-core database. The easiest way to get it is to run stellar-core node in docker (check [docker-stellar-core](https://github.com/mobius-network/docker-stellar-core)) and let it ingest some ledgers.

After `yarn run dev` [GraphQL playground](https://www.npmjs.com/package/graphql-playground) will be available on `http://localhost:4000`

### Testing

Astrograph uses [jest](https://github.com/facebook/jest) for the tests.

You can run all available tests with `yarn run test` command.

Astrograph ships with integration tests too.
You should configure test database connection with `.env.test` file before running them because they are using [database fixture](tests/test_db.sql).
`.env.test` file presence is mandatory to prevent accidental overwriting your stellar-core database with the fixture!

You can run unit and integration tests separately, using the next commands:

```
yarn run test:unit
yarn run test:integration
```

## Usage

Let's go straight to some example queries:

### Getting accounts

```graphql
account(id: "GBRWYDXFSDVIVAGGLDY5P7GH5NVMWRCGP6PUHG6ZDN5ID32FGGXEX6UJ") {
  flags {
    authRequired
    authRevokable
    authImmutable
  }
  thresholds {
    masterWeight
    low
    medium
    high
  }
  id
  inflationDest
  sequenceNumber
  data {
    name
    value
  }
  signers {
    signer { id }
  }
  trustLines {
    account {
      id
    }
    asset {
      code
      native
      issuer
    }
  }
  ledger {
    seq
    header {
      ledgerVersion
    }
  }
}
```

There is also a corresponding query for multiple accounts:

```graphql
query {
  accounts(id: ["GBRWYDXFSDVIVAGGLDY5P7GH5NVMWRCGP6PUHG6ZDN5ID32FGGXEX6UJ", "GAAAADNFT4FLC7M52WQIOU5MZOTYHDH34P4TZTGRC4IMHZKHDKKVPOMB"]) {
    # ...
  }
}
```

### Getting account balances

```graphql
query {
  trustLines(id:"GAAACK4ZLACKVOXOLCDO5XSK2NX7SOG2WUZPJOJK7CP6WV4FLL6GBGOD") {
    authorized
    balance
    asset {
      code
      native
    }
  }
}
```

Response:

```graphql
{
  "data": {
    "trustLines": [
      {
        "authorized": true,
        "balance": "99.9999700",
        "asset": {
          "code": "XLM",
          "native": true
        }
      },
      {
        "authorized": true,
        "balance": "0.0000000",
        "asset": {
          "code": "INR",
          "native": false
        }
      }
    ]
  }
}
```

Please note that native balance is returned inside a trustline too, and is marked with the boolean flag.

You can query data entries, ledgers, transactions and account signers the same way. You can find the full schema definition in [type_defs.ts](src/schema/type_defs.ts)

## Subscriptions

The most exciting and powerful feature of Astrograph is subscriptions.

Generally, you can subscribe to the next events: `CREATE`, `UPDATE` and `REMOVE`. To subscribe individually to events you need, you can use the next filters:

* `mutationType[]` – event type(s) to subscribe to.
* `idEq` and `idIn[]` – stellar account public address you're interested in

The typical published event contains the next attributes:

* `mutationType` – event type
* `values` holds new values for changed entity. It is `null` for the `REMOVE` events.
* Key fields: `id` for account, `accountID` + `asset` for trust line, etc.

Here are some examples:

### Awaiting for missing account to be created

```graphql
subscription {
  account(args: { idEq: "GAK3NSB43EVCZKDH4PYGJPCVPOYZ7X7KIR3ZTWSYRKRMJWGG5TABM6TH", mutationTypeIn: [CREATE] }) {
   	id
    mutationType
    values {
      homeDomain
      thresholds {
        low
        medium
        high
        masterWeight
      }
    }
  }
}
```

### Monitoring account balance

```graphql
subscription {
  trustLine(args: { mutationTypeIn: [UPDATE], idEq: "GBILND6UWKZCYUE7YRZHS5DBEYM6U4R4SWO73PODLYZVXNKHS4NVSE5X" }) {
    mutationType
    accountID
    values {
      native
      balance
    }
  }
}
```

Check out the [examples](examples) folder for more!

## Playing with DGraph

For now, Astrograph supports very basic version of ingestion to [DGraph](https://dgraph.io).

To enable it, pass DGraph server host and port in `DGRAPH_URL` environment variable.

For local development, DGraph can be started by executing `dgraph/start.sh` (needs docker to run, `DGRAPH_URL==localhost:9080` will work).

Example query:

```
query {
  # Get all accounts involved in any ledger since ingestion started
  account(func: eq(type, "account")) {
    uid
    id
  }

  # Get all assets, count involved operations
  asset(func: eq(type, "asset")) {
    code
    type
    issuer {
      id
    }
    count(operations)
  }

  # Get first 100 operations
  all(func: eq(type, "operation"), first: 100) @cascade {
    uid
    kind
    account.source {
      id
      uid
    }
    account.destination {
      uid
      id      
    }
  }

  # Find all payees of specific account with amount > 1 XLM
  all(func: eq(type, "operation")) @filter(eq(kind, "payment") AND gt(amount, 10000000)) @cascade {
		kind
    amount
    account.source @filter(eq(id, "GACXLSIFKUNFY53TBDEDOFIUTWV36KMJ66NLZO3EN33S2XNSV46FZTET"))
    asset @filter(eq(native, true))
  }
}
```


## Console

To show all account trust lines:

```shell
$ yarn run examples/balance-cli.ts GAAAADNFT4FLC7M52WQIOU5MZOTYHDH34P4TZTGRC4IMHZKHDKKVPOMB
```

To monitor account trust line changes:

```shell
$ yarn run examples/balance-monitor-cli.ts GAK3NSB43EVCZKDH4PYGJPCVPOYZ7X7KIR3ZTWSYRKRMJWGG5TABM6TH
```

All examples are assuming that Astrograph is running on `localhost:4000`. You can pass URL as secondary parameter.

## Benchmark

We haven't done full stress tests yet. Despite that, it looks like the server on MBP mid 14 with 16GB RAM survives approx 7k concurrent connections with no losses. Check the [benchmark script](benchmark/index.ts) for details. To implement the fully functional test, we need to implement a dedicated stress test mode.

## Maintainers

* Victor Sokolov (@gzigzigzeo)
* Timur Ramazanov (@charlie-wasp)
* Sergey Nebolsin (@nebolsin)

## License

The project is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT)
