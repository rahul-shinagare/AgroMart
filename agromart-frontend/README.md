# AgroMart React API Tester

This is a simple React frontend built specifically to test the existing AgroMart Spring Boot backend.

## Backend expected

Spring Boot:
- URL: http://localhost:8080
- API prefix: /api
- Login: POST /api/auth/login
- JWT authentication for protected APIs

## Frontend setup

Open a terminal in this folder:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The Vite proxy forwards `/api/*` requests to:

```text
http://localhost:8080/api/*
```

This avoids needing to configure browser CORS during local development.

## Test order

1. Start MySQL.
2. Start the Spring Boot AgroMart project.
3. Run this React project.
4. In the React page, choose `POST Create User`.
5. Create a test user.
6. Login.
7. Test the User CRUD APIs.
8. Create a Product using the farmer `userId`.
9. Test Product CRUD.
10. Test Cart, Order, Checkout, and Order Item APIs.

## Important

For nested entities, this frontend sends only the relationship ID. Examples:

```json
{
  "farmer": {
    "userId": 1
  }
}
```

```json
{
  "buyer": {
    "userId": 1
  }
}
```

```json
{
  "product": {
    "productId": 1
  }
}
```

Edit the IDs to match the records in your database.

## JWT

After login, the token is stored in browser `localStorage` and automatically added as:

```text
Authorization: Bearer <token>
```

for later API calls.
