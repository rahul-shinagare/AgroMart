# AgroMart

A full-stack agricultural marketplace platform that connects **Farmers**, **Wholesale Buyers**, and **Administrators** through a secure digital ecosystem. AgroMart simplifies product listing, bulk purchasing, order management, and user administration while providing role-based access and a scalable backend architecture.

---

## Project Overview

AgroMart is designed to bridge the gap between farmers and buyers by eliminating unnecessary intermediaries. Farmers can publish agricultural products, buyers can place bulk orders, and administrators manage user approvals and platform operations.

The application follows a modern client-server architecture with a React frontend and a Spring Boot REST API backend.

---

## Features

### Farmer

- Register and login
- Create and manage product listings
- Update product quantity and pricing
- View incoming orders
- Track order status

### Buyer

- Register and login
- Browse available products
- Add products to cart
- Place orders
- View purchase history

### Administrator

- Secure administrator login
- Approve or reject newly registered users
- Manage platform users
- Monitor products and transactions

---

## Technology Stack

### Backend

- Java 17
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT Authentication
- Hibernate
- Maven

### Frontend

- React
- Vite
- Axios
- React Router

### Database

- MySQL

### Tools

- Postman
- Git
- GitHub
- Spring Tool Suite (STS)
- VS Code

---

## Project Structure

```
MainProject
│
├── AgroMart/                     # Spring Boot Backend
│   ├── src
│   ├── pom.xml
│   └── ...
│
├── agromart-realworld-frontend/  # React Frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
```

---

## Backend Architecture

```
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Database
```

The backend follows a layered architecture to separate business logic from data access and improve maintainability.

---

## Database Modules

- Users
- Products
- Cart
- Orders
- Order Items

---

## Security

The application uses Spring Security with JWT-based authentication.

Role-based authorization:

- ADMIN
- FARMER
- BUYER

Protected endpoints are accessible only to authorized users based on their assigned role.

---

## API Highlights

### Authentication

- Register User
- Login
- JWT Token Generation

### Products

- Add Product
- Update Product
- Delete Product
- Get All Products

### Orders

- Place Order
- View Orders
- Update Order Status

### Admin

- Approve User
- Reject User
- View Pending Users

---

## Getting Started

### Clone Repository

```bash
git clone https://github.com/rahul-shinagare/AgroMart.git
```

---

### Backend

```bash
cd AgroMart
```

Run the Spring Boot application.

```
http://localhost:8080
```

---

### Frontend

```bash
cd agromart-realworld-frontend
npm install
npm run dev
```

The frontend will be available at

```
http://localhost:5173
```

---

## Future Enhancements

- Online Payment Integration
- Email Notifications
- AI Crop Recommendation
- Product Search & Filters
- Product Images
- Farmer Analytics Dashboard
- Inventory Management
- Responsive Mobile UI
- Docker Deployment
- CI/CD Pipeline

---

## Development Status

Current implementation includes:

- User Authentication
- Role-Based Access Control
- Product Management
- Order Management
- Admin Approval Workflow
- React Frontend Integration

Additional features are under active development.

---

## Author

**Rahul Shinagare**

B.Tech Computer Science Engineering

MIT World Peace University, Pune

---

## License

This project is developed for educational and portfolio purposes.
