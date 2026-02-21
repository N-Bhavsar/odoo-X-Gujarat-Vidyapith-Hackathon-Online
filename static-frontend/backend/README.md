# FleetFlow Backend (Prisma)

## Setup

1. Copy env file:

```
copy .env.example .env
```

2. Install dependencies:

```
npm install
```

3. Run migrations:

```
npx prisma migrate dev --name init
npx prisma generate
```

4. (Optional) Seed demo data:

```
npm run seed
```

5. Start the API:

```
npm run dev
```

## Default Users

- admin@fleetflow.com / FleetFlow@123
- manager@fleetflow.com / FleetFlow@123
