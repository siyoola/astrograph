Astrograph
==========

Stellar GraphQL interface.

# Installation

`go get https://github.com/mobius-network/Astrograph`

# Usage

`astrograph --database-url=postgres://localhost/core?sslmode=disable`

# TODO

1. Solve N+1 for trustlines.
2. Fast rewind to last ledger
3. Data fields loading/monitoring.
4. Filter updates by request (do not query accounts which are not currently observed and/or not passed to ctx)
5. Monitor account deletion.
6. Proper error handling