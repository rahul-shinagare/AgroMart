import { useMemo, useState } from "react";
import api, {
  clearAuth,
  extractError,
  formatResponse,
  getAuth,
  saveAuth
} from "./api";

const ENDPOINTS = [
  {
    group: "Users",
    label: "POST Create User",
    method: "POST",
    path: "/users",
    body: `{
  "name": "Rahul Buyer",
  "email": "buyer@test.com",
  "password": "1234",
  "role": "BUYER"
}`
  },
  {
    group: "Users",
    label: "GET All Users",
    method: "GET",
    path: "/users",
    body: ""
  },
  {
    group: "Users",
    label: "GET User By ID",
    method: "GET",
    path: "/users/1",
    body: ""
  },
  {
    group: "Users",
    label: "PUT Update User",
    method: "PUT",
    path: "/users/1",
    body: `{
  "name": "Rahul Updated",
  "email": "buyer@test.com",
  "password": "1234",
  "role": "BUYER"
}`
  },
  {
    group: "Users",
    label: "DELETE User",
    method: "DELETE",
    path: "/users/1",
    body: ""
  },

  {
    group: "Products",
    label: "POST Create Product",
    method: "POST",
    path: "/products",
    body: `{
  "farmer": {
    "userId": 1
  },
  "cropName": "Tomato",
  "category": "Vegetable",
  "description": "Fresh tomatoes",
  "price": 40,
  "stockQty": 100
}`
  },
  {
    group: "Products",
    label: "GET All Products",
    method: "GET",
    path: "/products",
    body: ""
  },
  {
    group: "Products",
    label: "GET Product By ID",
    method: "GET",
    path: "/products/1",
    body: ""
  },
  {
    group: "Products",
    label: "PUT Update Product",
    method: "PUT",
    path: "/products/1",
    body: `{
  "farmer": {
    "userId": 1
  },
  "cropName": "Tomato Updated",
  "category": "Vegetable",
  "description": "Updated description",
  "price": 45,
  "stockQty": 80
}`
  },
  {
    group: "Products",
    label: "DELETE Product",
    method: "DELETE",
    path: "/products/1",
    body: ""
  },

  {
    group: "Cart",
    label: "POST Add Cart Item",
    method: "POST",
    path: "/cart-items",
    body: `{
  "buyer": {
    "userId": 1
  },
  "product": {
    "productId": 1
  },
  "quantity": 2
}`
  },
  {
    group: "Cart",
    label: "GET All Cart Items",
    method: "GET",
    path: "/cart-items",
    body: ""
  },
  {
    group: "Cart",
    label: "GET Cart Item By ID",
    method: "GET",
    path: "/cart-items/1",
    body: ""
  },
  {
    group: "Cart",
    label: "PUT Update Cart Item",
    method: "PUT",
    path: "/cart-items/1",
    body: `{
  "buyer": {
    "userId": 1
  },
  "product": {
    "productId": 1
  },
  "quantity": 5
}`
  },
  {
    group: "Cart",
    label: "DELETE Cart Item",
    method: "DELETE",
    path: "/cart-items/1",
    body: ""
  },

  {
    group: "Orders",
    label: "POST Create Order",
    method: "POST",
    path: "/orders",
    body: `{
  "buyer": {
    "userId": 1
  },
  "totalAmount": 800,
  "status": "PENDING"
}`
  },
  {
    group: "Orders",
    label: "GET All Orders",
    method: "GET",
    path: "/orders",
    body: ""
  },
  {
    group: "Orders",
    label: "GET Order By ID",
    method: "GET",
    path: "/orders/1",
    body: ""
  },
  {
    group: "Orders",
    label: "PUT Update Order",
    method: "PUT",
    path: "/orders/1",
    body: `{
  "buyer": {
    "userId": 1
  },
  "totalAmount": 900,
  "status": "DISPATCHED"
}`
  },
  {
    group: "Orders",
    label: "DELETE Order",
    method: "DELETE",
    path: "/orders/1",
    body: ""
  },
  {
    group: "Orders",
    label: "POST Checkout",
    method: "POST",
    path: "/orders/checkout/1",
    body: ""
  },

  {
    group: "Order Items",
    label: "POST Create Order Item",
    method: "POST",
    path: "/order-items",
    body: `{
  "order": {
    "orderId": 1
  },
  "product": {
    "productId": 1
  },
  "orderQty": 2,
  "unitPrice": 40
}`
  },
  {
    group: "Order Items",
    label: "GET All Order Items",
    method: "GET",
    path: "/order-items",
    body: ""
  },
  {
    group: "Order Items",
    label: "GET Order Item By ID",
    method: "GET",
    path: "/order-items/1",
    body: ""
  },
  {
    group: "Order Items",
    label: "PUT Update Order Item",
    method: "PUT",
    path: "/order-items/1",
    body: `{
  "order": {
    "orderId": 1
  },
  "product": {
    "productId": 1
  },
  "orderQty": 3,
  "unitPrice": 40
}`
  },
  {
    group: "Order Items",
    label: "DELETE Order Item",
    method: "DELETE",
    path: "/order-items/1",
    body: ""
  }
];

const GROUPS = ["Users", "Products", "Cart", "Orders", "Order Items"];

function App() {
  const initial = getAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [auth, setAuth] = useState(initial);

  const [selectedIndex, setSelectedIndex] = useState(1);
  const selected = ENDPOINTS[selectedIndex];

  const [method, setMethod] = useState(selected.method);
  const [path, setPath] = useState(selected.path);
  const [body, setBody] = useState(selected.body);

  const [response, setResponse] = useState("Response will appear here...");
  const [loading, setLoading] = useState(false);

  const grouped = useMemo(() => {
    return GROUPS.map((group) => ({
      group,
      items: ENDPOINTS.map((endpoint, index) => ({ endpoint, index })).filter(
        (item) => item.endpoint.group === group
      )
    }));
  }, []);

  function selectEndpoint(index) {
    const endpoint = ENDPOINTS[index];
    setSelectedIndex(index);
    setMethod(endpoint.method);
    setPath(endpoint.path);
    setBody(endpoint.body);
    setResponse("Ready to send...");
  }

  async function login(e) {
    e.preventDefault();
    setLoading(true);
    setResponse("Logging in...");

    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });

      saveAuth(res.data);
      setAuth(getAuth());
      setResponse(formatResponse(res.data));
    } catch (error) {
      setResponse(extractError(error));
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAuth();
    setAuth(getAuth());
    setResponse("Logged out. JWT removed from localStorage.");
  }

  async function sendRequest() {
    setLoading(true);
    setResponse("Sending request...");

    try {
      let parsedBody = undefined;

      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        parsedBody = JSON.parse(body);
      }

      const res = await api.request({
        method,
        url: path,
        data: parsedBody
      });

      setResponse(
        `HTTP ${res.status}\n\n${formatResponse(res.data)}`
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        setResponse("Invalid JSON body.\n\n" + error.message);
      } else {
        setResponse(extractError(error));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>AgroMart API Tester</h1>
          <p>Simple React frontend for CDAC-style Spring Boot API testing</p>
        </div>

        <div className="status">
          <span
            className={`dot ${auth.token ? "online" : ""}`}
          ></span>
          {auth.token ? "JWT logged in" : "Not logged in"}
        </div>
      </header>

      <main className="container">
        <section className="card">
          <h2>1. Login</h2>
          <p className="hint">
            First create a user through <code>POST /users</code>, then login here.
          </p>

          <form className="login-grid" onSubmit={login}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Working..." : "Login"}
            </button>

            <button type="button" className="secondary" onClick={logout}>
              Logout
            </button>
          </form>

          {auth.token && (
            <div className="auth-box">
              <strong>Email:</strong> {auth.email}
              <br />
              <strong>Role:</strong> {auth.role}
              <br />
              <strong>Token:</strong> <span className="token">{auth.token}</span>
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <h2>2. API Tester</h2>
              <p className="hint">
                Choose an API, edit the ID/body if required, then press Send.
              </p>
            </div>

            <div className="endpoint-buttons">
              {grouped.map(({ group, items }) => (
                <div key={group} className="group">
                  <div className="group-title">{group}</div>
                  <div className="button-list">
                    {items.map(({ endpoint, index }) => (
                      <button
                        key={endpoint.label}
                        className={index === selectedIndex ? "active" : ""}
                        onClick={() => selectEndpoint(index)}
                      >
                        {endpoint.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="request-grid">
            <div>
              <label>HTTP Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
                <option>PATCH</option>
              </select>
            </div>

            <div className="path-field">
              <label>Endpoint</label>
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
            </div>
          </div>

          <label>Request Body JSON</label>
          <textarea
            rows="12"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"name":"Test"}'
          />

          <button className="send" onClick={sendRequest} disabled={loading}>
            {loading ? "Sending..." : "Send Request"}
          </button>
        </section>

        <section className="card">
          <div className="response-heading">
            <h2>3. Response</h2>
            <button
              className="secondary"
              onClick={() => setResponse("Cleared.")}
            >
              Clear
            </button>
          </div>

          <pre className="response">{response}</pre>
        </section>

        <section className="card checklist">
          <h2>CDAC Testing Order</h2>
          <ol>
            <li>Run Spring Boot application on port 8080.</li>
            <li>Run this React app on port 5173.</li>
            <li>Use <b>POST /users</b> to create a FARMER, BUYER, or ADMIN.</li>
            <li>Login using the same email and password.</li>
            <li>Test GET / PUT / DELETE for Users.</li>
            <li>Create a Product using the farmer's userId.</li>
            <li>Test Product CRUD.</li>
            <li>Add a Cart Item using buyerId and productId.</li>
            <li>Create or checkout an Order.</li>
            <li>Test Order Item CRUD.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}

export default App;
