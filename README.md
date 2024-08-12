This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/)
- [Auth0](https://auth0.com/)

### Auth0 Configuration

To run this project, you need to set up an [Auth0](https://auth0.com/docs) application and obtain the following variables:

- `AUTH0_SECRET`
- `AUTH0_BASE_URL`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_MACHINE_TO_MACHINE_DOMAIN`
- `AUTH0_MACHINE_TO_MACHINE_CLIENT_ID`
- `AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET`

### Create `.env.local` or `.env.production` File

```env
PG_USER=your_username
PG_PASSWORD=your_password
PG_NAME=your_database
PG_PORT=5432
PG_HOST=postgres
RUN_POSTGRES=true # set to true if you want to run the postgres locally with docker

AUTH0_SECRET
AUTH0_BASE_URL
AUTH0_ISSUER_BASE_URL
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
AUTH0_MACHINE_TO_MACHINE_DOMAIN
AUTH0_MACHINE_TO_MACHINE_CLIENT_ID
AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET
```

First, make sure your postgres database is running, then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

**Create Database Schema**

Run the following command to create the database schema:

```
npm run create-schema
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running the development setup with docker

If you want start the postgres container with the application add the following to `.env` file.
```RUN_POSTGRES=true```

Run the following command
```bash
bash run_docker.sh .env.local

```



