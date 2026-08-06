# AgroMart Real-World React Frontend

This is a more complete React frontend for the existing AgroMart Spring Boot backend.

It is intentionally kept simple enough for CDAC-level learning but behaves like a small real-world website.

## Roles

### BUYER
- Dashboard
- Marketplace
- Search and category filter
- Add product to cart
- Increase/decrease cart quantity
- Remove cart item
- Checkout
- Order history

### FARMER
- Dashboard
- Add product
- View own products
- Edit product
- Delete product
- Stock management

### ADMIN
- Dashboard
- User management
- Product management
- Order management
- Update order status

## Backend

The frontend expects:

```text
Spring Boot: http://localhost:8080
API base:    /api
Login:       POST /api/auth/login
```

The Vite development proxy maps:

```text
http://localhost:5173/api/*
```

to:

```text
http://localhost:8080/api/*
```

## Run

Open a terminal inside this folder:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## End-to-end buyer transaction

This frontend uses your real transaction API:

```text
1. Buyer logs in
2. GET /api/products
3. POST /api/cart-items
4. GET /api/cart-items
5. Buyer changes quantity using PUT /api/cart-items/{id}
6. POST /api/orders/checkout/{buyerId}
```

The existing Spring Boot checkout transaction then:

```text
Find buyer
  ↓
Read buyer cart
  ↓
Create Order
  ↓
Check stock
  ↓
Reduce product stock
  ↓
Create OrderItem records
  ↓
Calculate total
  ↓
Update Order total
  ↓
Delete buyer cart
```

## Important backend limitation handled by frontend

Your login response contains:

```json
{
  "token": "...",
  "email": "...",
  "role": "..."
}
```

but not the `userId`.

Your current backend also has no:

```text
GET /api/users/me
GET /api/cart-items/buyer/{id}
GET /api/orders/buyer/{id}
```

Therefore the frontend does the following after login:

```text
Login
 ↓
Receive JWT + email + role
 ↓
GET /api/users
 ↓
Find current user by email
 ↓
Save userId locally
 ↓
Filter cart/orders/products by userId
```

This works with the current backend without changing your Java code.

## Recommended demo data

Create:

### Farmer
```text
Name: Rahul Farmer
Email: farmer@test.com
Password: 1234
Role: FARMER
```

### Buyer
```text
Name: Rahul Buyer
Email: buyer@test.com
Password: 1234
Role: BUYER
```

Then:

1. Login as Farmer
2. Add "Tomato", price `40`, stock `100`
3. Logout
4. Login as Buyer
5. Open Marketplace
6. Add Tomato to cart
7. Open My Cart
8. Change quantity to 2 or 3
9. Click Checkout & Place Order
10. Open My Orders
11. Login as Farmer again and see reduced stock
12. Login as Admin to inspect users, products and orders

## Note

The current Spring Boot backend uses plain-text password comparison. This React frontend simply follows the existing backend behavior.
