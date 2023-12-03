# Tally

Tally is a score keeper for the [New York Times
crossword](https://www.nytimes.com/crosswords/). It uses Next.js and a Postgres
backend to store users and scores. It uses email magic links for authentication.

## Development

Copy `.env.example` to `.env` and fill in the connection information for your
development Postgres instance, authentication secret, canonical URL, and email
server information. If you use [vercel](https://vercel.com) to host Tally, in
production the `POSTGRES_` variables will be automatically filled when you
connect to their hosted database service. Copy the `NON_POOLING` url to the
`DATABASE_URL` variable for the DB migration scripts to use.

Use your node package manager of choice to `install` the project. I use `bun`
and that is the only one I have tested.

### Commands

| Command                             | Usage                               |
| ----------------------------------- | ----------------------------------- |
| dev                                 | start the development server        |
| build                               | build (intended for production)     |
| dev:build                           | build locally                       |
| db:up                               | run all outstanding `up` migrations |
| db:down                             | roll back the latest migration      |
| db-migrate create <name> --sql-file | create a new migration              |

## Todos

- [ ] Add a `set-env` script that copies values from `.env.production` to the 
deployed vercel project.
