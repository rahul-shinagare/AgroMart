import { useEffect, useMemo, useState } from "react";
import api, {
  clearSession,
  errorMessage,
  getSession,
  saveSession,
  saveUserId
} from "./api";

const EMPTY_USER = {
  name: "",
  email: "",
  password: "",
  role: "BUYER"
};

const ORDER_STATUSES = ["PENDING", "DISPATCHED", "DELIVERED"];

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function shortDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function roleLabel(role) {
  return role ? role.toLowerCase().replace(/^./, (c) => c.toUpperCase()) : "";
}

function App() {
  const [session, setSession] = useState(getSession());
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [loadingUser, setLoadingUser] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (session.token && session.email && !user) {
      resolveCurrentUser();
    }
  }, [session.token, session.email]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  async function resolveCurrentUser() {
    setLoadingUser(true);
    try {
      const response = await api.get("/users");
      const current = response.data.find(
        (item) =>
          item.email?.toLowerCase() === session.email?.toLowerCase()
      );

      if (!current) {
        throw new Error("Logged-in user could not be found.");
      }

      setUser(current);
      saveUserId(current.userId);
      setSession({ ...getSession(), userId: current.userId });
    } catch (error) {
      handleLogout();
      setToast(`Login session could not be prepared: ${errorMessage(error)}`);
    } finally {
      setLoadingUser(false);
    }
  }

  function handleLogin(data) {
    saveSession(data);
    const next = getSession();
    setSession(next);
    setUser(null);
    setPage("dashboard");
  }

  function handleLogout() {
    clearSession();
    setSession(getSession());
    setUser(null);
    setPage("dashboard");
  }

  function notify(message) {
    setToast(message);
  }

  if (!session.token || !user || loadingUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} notify={notify} />
        {toast && <Toast message={toast} />}
      </>
    );
  }

  return (
    <div className="shell">
      <Sidebar
        role={user.role}
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
      />

      <div className="main">
        <Topbar user={user} page={page} />

        <main className="content">
          {user.role === "BUYER" && (
            <BuyerDashboard
              user={user}
              page={page}
              setPage={setPage}
              notify={notify}
            />
          )}

          {user.role === "FARMER" && (
            <FarmerDashboard
              user={user}
              page={page}
              setPage={setPage}
              notify={notify}
            />
          )}

          {user.role === "ADMIN" && (
            <AdminDashboard
              user={user}
              page={page}
              notify={notify}
            />
          )}
        </main>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}

function LoginPage({ onLogin, notify }) {
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [registerForm, setRegisterForm] = useState(EMPTY_USER);

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await api.post("/auth/login", loginForm);
      onLogin(response.data);
    } catch (error) {
      const message = errorMessage(error);
      if(message.includes("waiting for Admin approval")){
        notify("your account is awaiting Admin approval. Please try again later");
      }else{
        notify(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function register(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await api.post("/users", registerForm);

      setLoginForm({
        email: registerForm.email,
        password: registerForm.password
      });

      setMode("login");

      notify(
        "✅ Registration Successful! Please wait for Admin approval before logging in."
      );
    } catch (error) {
      notify(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand-lockup large">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">AgroMart</div>
            <div className="brand-subtitle">Farm to Market</div>
          </div>
        </div>

        <div className="hero-copy">
          <span className="eyebrow">AGRICULTURAL MARKETPLACE</span>
          <h1>Fresh produce. Direct trade. One simple platform.</h1>
          <p>
            A working frontend for your Spring Boot AgroMart backend with
            Farmer, Buyer and Admin workflows.
          </p>
        </div>

        <div className="hero-points">
          <div>
            <strong>Buyer</strong>
            <span>Browse, cart, checkout and track orders.</span>
          </div>
          <div>
            <strong>Farmer</strong>
            <span>Publish crops and manage inventory.</span>
          </div>
          <div>
            <strong>Admin</strong>
            <span>Monitor users, products and orders.</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={mode === "login" ? "tab active" : "tab"}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={mode === "register" ? "tab active" : "tab"}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={login} className="stack-form">
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="Your password"
                  required
                />
              </div>

              <button className="primary large-btn" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </button>

              <div className="demo-note">
                <strong>Quick demo</strong>
                <span>
                  Register a FARMER and a BUYER first if you need demo accounts.
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={register} className="stack-form">
              <div className="two-col">
                <div>
                  <label>Name</label>
                  <input
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        name: e.target.value
                      })
                    }
                    placeholder="Full name"
                    required
                  />
                </div>

                <div>
                  <label>Role</label>
                  <select
                    value={registerForm.role}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        role: e.target.value
                      })
                    }
                  >
                    <option value="BUYER">Buyer</option>
                    <option value="FARMER">Farmer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      email: e.target.value
                    })
                  }
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value
                    })
                  }
                  placeholder="Create a password"
                  required
                />
              </div>

              <button className="primary large-btn" disabled={busy}>
                {busy ? "Creating..." : "Create account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ role, page, setPage, onLogout }) {
  const buyerItems = [
    ["dashboard", "Overview"],
    ["products", "Marketplace"],
    ["cart", "My Cart"],
    ["orders", "My Orders"]
  ];

  const farmerItems = [
    ["dashboard", "Overview"],
    ["products", "My Products"],
    ["add-product", "Add Product"]
  ];

  const adminItems = [
    ["dashboard", "Overview"],
    ["users", "Users"],
    ["products", "Products"],
    ["orders", "Orders"]
  ];

  const items =
    role === "BUYER"
      ? buyerItems
      : role === "FARMER"
        ? farmerItems
        : adminItems;

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">A</div>
        <div>
          <div className="brand-name">AgroMart</div>
          <div className="brand-subtitle">Farm to Market</div>
        </div>
      </div>

      <div className="role-chip">{roleLabel(role)} workspace</div>

      <nav className="side-nav">
        {items.map(([key, label]) => (
          <button
            key={key}
            className={page === key ? "nav-item active" : "nav-item"}
            onClick={() => setPage(key)}
          >
            <span className="nav-icon">
              {key === "dashboard" && "⌂"}
              {key === "products" && "▦"}
              {key === "cart" && "🛒"}
              {key === "orders" && "◫"}
              {key === "users" && "◎"}
              {key === "add-product" && "+"}
            </span>
            {label}
          </button>
        ))}
      </nav>

      <div className="side-footer">
        <div className="secure-line">JWT secured session</div>
        <button className="logout-btn" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}

function Topbar({ user, page }) {
  const titleMap = {
    dashboard: "Dashboard",
    products: user.role === "FARMER" ? "My Products" : "Marketplace",
    cart: "My Cart",
    orders: user.role === "ADMIN" ? "Order Management" : "My Orders",
    users: "User Management",
    "add-product": "Add Product"
  };

  return (
    <header className="topbar">
      <div>
        <div className="breadcrumb">AgroMart / {titleMap[page]}</div>
        <h2>{titleMap[page]}</h2>
      </div>

      <div className="top-user">
        <div className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</div>
        <div>
          <strong>{user.name}</strong>
          <span>{roleLabel(user.role)}</span>
        </div>
      </div>
    </header>
  );
}

function BuyerDashboard({ user, page, setPage, notify }) {
  if (page === "products") {
    return (
      <BuyerProducts
        user={user}
        setPage={setPage}
        notify={notify}
      />
    );
  }

  if (page === "cart") {
    return <BuyerCart user={user} notify={notify} />;
  }

  if (page === "orders") {
    return <BuyerOrders user={user} />;
  }

  return (
    <BuyerOverview
      user={user}
      setPage={setPage}
    />
  );
}

function BuyerOverview({ user, setPage }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/products"),
      api.get("/cart-items"),
      api.get("/orders")
    ])
      .then(([productsRes, cartRes, ordersRes]) => {
        setProducts(productsRes.data);
        setCart(
          cartRes.data.filter(
            (item) => item.buyer?.userId === user.userId
          )
        );
        setOrders(
          ordersRes.data.filter(
            (item) => item.buyer?.userId === user.userId
          )
        );
      })
      .catch(() => {});
  }, [user.userId]);

  const cartValue = cart.reduce(
    (sum, item) => sum + Number(item.product?.price || 0) * item.quantity,
    0
  );

  const recentProducts = products
    .filter((p) => p.stockQty > 0)
    .slice(0, 4);

  return (
    <>
      <PageIntro
        eyebrow="BUYER OVERVIEW"
        title={`Good to see you, ${user.name.split(" ")[0]}.`}
        subtitle="Discover fresh crops, manage your cart and complete your next order."
      />

      <div className="stat-grid">
        <StatCard
          label="Available crops"
          value={products.length}
          meta="Across all farmers"
          icon="▦"
        />
        <StatCard
          label="Cart items"
          value={cart.reduce((sum, item) => sum + item.quantity, 0)}
          meta={money(cartValue) + " cart value"}
          icon="🛒"
        />
        <StatCard
          label="Orders"
          value={orders.length}
          meta="Your transaction history"
          icon="◫"
        />
      </div>

      <section className="section-block">
        <SectionHeader
          title="Popular crops"
          action="View marketplace"
          onAction={() => setPage("products")}
        />

        <div className="product-grid compact">
          {recentProducts.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              compact
            />
          ))}
        </div>
      </section>
    </>
  );
}

function BuyerProducts({ user, setPage, notify }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [cart, setCart] = useState([]);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      const [productsRes, cartRes] = await Promise.all([
        api.get("/products"),
        api.get("/cart-items")
      ]);
      setProducts(productsRes.data);
      setCart(
        cartRes.data.filter(
          (item) => item.buyer?.userId === user.userId
        )
      );
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  useEffect(() => {
    load();
  }, [user.userId]);

  const categories = useMemo(() => {
    const set = new Set(products.map((item) => item.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  const filtered = products.filter((product) => {
    const matchesQuery =
      product.cropName?.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase());

    const matchesCategory =
      category === "ALL" || product.category === category;

    return matchesQuery && matchesCategory;
  });

  async function addToCart(product) {
    setBusyId(product.productId);
    try {
      const existing = cart.find(
        (item) => item.product?.productId === product.productId
      );

      if (existing) {
        await api.put(`/cart-items/${existing.cartId}`, {
          buyer: { userId: user.userId },
          product: { productId: product.productId },
          quantity: existing.quantity + 1
        });
      } else {
        await api.post("/cart-items", {
          buyer: { userId: user.userId },
          product: { productId: product.productId },
          quantity: 1
        });
      }

      notify(`${product.cropName} added to your cart.`);
      await load();
    } catch (error) {
      notify(`Could not add item: ${errorMessage(error)}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="MARKETPLACE"
        title="Fresh from the farm."
        subtitle="Choose a crop, add it to your cart and checkout when you are ready."
      />

      <div className="toolbar-card">
        <div className="search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tomatoes, vegetables, fruits..."
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "ALL" ? "All categories" : item}
            </option>
          ))}
        </select>

        <button className="secondary" onClick={() => setPage("cart")}>
          View cart
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No crops found"
          text="Try a different search or category."
        />
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              onAdd={() => addToCart(product)}
              busy={busyId === product.productId}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ProductCard({ product, onAdd, busy, compact = false }) {
  return (
    <article className={compact ? "product-card compact" : "product-card"}>
      <div className="product-visual">
        <div className="crop-orb">
          {product.cropName?.[0]?.toUpperCase() || "A"}
        </div>
        <span className="stock-badge">
          {product.stockQty > 0 ? `${product.stockQty} in stock` : "Out of stock"}
        </span>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span>{product.category || "Fresh produce"}</span>
          <span>#{product.productId}</span>
        </div>

        <h3>{product.cropName}</h3>
        <p>{product.description || "Fresh agricultural produce."}</p>

        <div className="product-footer">
          <div>
            <strong>{money(product.price)}</strong>
            <span> per unit</span>
          </div>

          {onAdd && !compact && (
            <button
              className="primary small-btn"
              onClick={onAdd}
              disabled={busy || product.stockQty <= 0}
            >
              {busy ? "Adding..." : "+ Add"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function BuyerCart({ user, notify }) {
  const [cart, setCart] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const response = await api.get("/cart-items");
      setCart(
        response.data.filter(
          (item) => item.buyer?.userId === user.userId
        )
      );
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  useEffect(() => {
    load();
  }, [user.userId]);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.product?.price || 0) * item.quantity,
    0
  );

  async function changeQty(item, nextQuantity) {
    if (nextQuantity < 1) {
      return removeItem(item.cartId);
    }

    try {
      await api.put(`/cart-items/${item.cartId}`, {
        buyer: { userId: user.userId },
        product: { productId: item.product?.productId },
        quantity: nextQuantity
      });
      await load();
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  async function removeItem(id) {
    try {
      await api.delete(`/cart-items/${id}`);
      notify("Item removed from cart.");
      await load();
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  async function checkout() {
    if (!cart.length) return;

    setBusy(true);
    try {
      const response = await api.post(
        `/orders/checkout/${user.userId}`
      );

      notify(
        `Order #${response.data.orderId} placed successfully for ${money(
          response.data.totalAmount
        )}.`
      );
      await load();
    } catch (error) {
      notify(`Checkout failed: ${errorMessage(error)}`);
    } finally {
      setBusy(false);
    }
  }

  if (!cart.length) {
    return (
      <>
        <PageIntro
          eyebrow="MY CART"
          title="Your cart is empty."
          subtitle="Browse the marketplace and add a few fresh crops."
        />
        <EmptyState
          title="Nothing here yet"
          text="Your selected products will appear here."
        />
      </>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="MY CART"
        title="Ready to checkout?"
        subtitle="Your checkout calls the real Spring Boot transaction that creates the order, creates order items, reduces stock and clears the cart."
      />

      <div className="cart-layout">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Cart items</h3>
              <span>{cart.length} products selected</span>
            </div>
          </div>

          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-row" key={item.cartId}>
                <div className="cart-thumb">
                  {item.product?.cropName?.[0]?.toUpperCase() || "A"}
                </div>

                <div className="cart-info">
                  <strong>{item.product?.cropName}</strong>
                  <span>{item.product?.category || "Produce"}</span>
                  <small>{money(item.product?.price)} / unit</small>
                </div>

                <div className="qty-control">
                  <button onClick={() => changeQty(item, item.quantity - 1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQty(item, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <div className="cart-price">
                  {money(item.product?.price * item.quantity)}
                </div>

                <button
                  className="icon-btn danger"
                  onClick={() => removeItem(item.cartId)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel summary-card">
          <div className="summary-head">
            <span>Order summary</span>
            <strong>{cart.length} items</strong>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{money(total)}</strong>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <strong className="free">Free</strong>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          <button
            className="primary checkout-btn"
            onClick={checkout}
            disabled={busy}
          >
            {busy ? "Processing transaction..." : "Checkout & Place Order"}
          </button>

          <div className="transaction-note">
            <span className="secure-dot"></span>
            Secure transaction via Spring Boot backend
          </div>
        </aside>
      </div>
    </>
  );
}

function BuyerOrders({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders")
      .then((response) =>
        setOrders(
          response.data.filter(
            (order) => order.buyer?.userId === user.userId
          )
        )
      )
      .catch(() => {});
  }, [user.userId]);

  return (
    <>
      <PageIntro
        eyebrow="MY ORDERS"
        title="Your recent transactions."
        subtitle="Orders returned by your Spring Boot backend."
      />

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Order history</h3>
            <span>{orders.length} order(s)</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            text="Your completed checkout transactions will appear here."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong>#{order.orderId}</strong>
                    </td>
                    <td>{shortDate(order.orderDate)}</td>
                    <td>{money(order.totalAmount)}</td>
                    <td>
                      <StatusBadge status={order.status || "PENDING"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function FarmerDashboard({ user, page, setPage, notify }) {
  if (page === "products") {
    return (
      <FarmerProducts
        user={user}
        notify={notify}
      />
    );
  }

  if (page === "add-product") {
    return (
      <AddProductForm
        user={user}
        onCreated={() => setPage("products")}
        notify={notify}
      />
    );
  }

  return <FarmerOverview user={user} setPage={setPage} />;
}

function FarmerOverview({ user, setPage }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products")
      .then((response) =>
        setProducts(
          response.data.filter(
            (product) => product.farmer?.userId === user.userId
          )
        )
      )
      .catch(() => {});
  }, [user.userId]);

  const stockUnits = products.reduce(
    (sum, product) => sum + Number(product.stockQty || 0),
    0
  );

  return (
    <>
      <PageIntro
        eyebrow="FARMER OVERVIEW"
        title={`Welcome, ${user.name.split(" ")[0]}.`}
        subtitle="Publish your crops, monitor stock and keep your marketplace listing up to date."
      />

      <div className="stat-grid">
        <StatCard
          label="My products"
          value={products.length}
          meta="Active listings"
          icon="▦"
        />
        <StatCard
          label="Units in stock"
          value={stockUnits}
          meta="Across your products"
          icon="◒"
        />
        <StatCard
          label="Seller status"
          value="Live"
          meta="Your listings are visible"
          icon="✓"
        />
      </div>

      <section className="section-block">
        <SectionHeader
          title="Your current listings"
          action="Add product"
          onAction={() => setPage("add-product")}
        />
        <div className="product-grid compact">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.productId} product={product} compact />
          ))}
        </div>
      </section>
    </>
  );
}

function FarmerProducts({ user, notify }) {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const response = await api.get("/products");
      setProducts(
        response.data.filter(
          (product) => product.farmer?.userId === user.userId
        )
      );
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  useEffect(() => {
    load();
  }, [user.userId]);

  async function remove(id) {
    try {
      await api.delete(`/products/${id}`);
      notify("Product deleted.");
      await load();
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  async function save(product) {
    try {
      await api.put(`/products/${product.productId}`, {
        farmer: { userId: user.userId },
        cropName: product.cropName,
        category: product.category,
        description: product.description,
        price: Number(product.price),
        stockQty: Number(product.stockQty)
      });
      setEditing(null);
      notify("Product updated.");
      await load();
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="MY PRODUCTS"
        title="Manage your inventory."
        subtitle="These cards are filtered from the real Product API using your farmer userId."
      />

      <div className="listing-grid">
        {products.map((product) => (
          <div className="listing-card" key={product.productId}>
            {editing?.productId === product.productId ? (
              <InlineProductEdit
                product={editing}
                setProduct={setEditing}
                onSave={() => save(editing)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <div className="listing-title">
                  <div className="crop-mini">
                    {product.cropName?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <strong>{product.cropName}</strong>
                    <span>Product #{product.productId}</span>
                  </div>
                </div>

                <p>{product.description || "No description added."}</p>

                <div className="listing-stats">
                  <div>
                    <span>Price</span>
                    <strong>{money(product.price)}</strong>
                  </div>
                  <div>
                    <span>Stock</span>
                    <strong>{product.stockQty}</strong>
                  </div>
                </div>

                <div className="listing-actions">
                  <button
                    className="secondary"
                    onClick={() => setEditing({ ...product })}
                  >
                    Edit
                  </button>
                  <button
                    className="danger-btn"
                    onClick={() => remove(product.productId)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!products.length && (
        <EmptyState
          title="No products yet"
          text="Use Add Product from the sidebar to publish your first crop."
        />
      )}
    </>
  );
}

function InlineProductEdit({
  product,
  setProduct,
  onSave,
  onCancel
}) {
  return (
    <div className="stack-form">
      <div>
        <label>Crop name</label>
        <input
          value={product.cropName}
          onChange={(e) =>
            setProduct({ ...product, cropName: e.target.value })
          }
        />
      </div>

      <div className="two-col">
        <div>
          <label>Price</label>
          <input
            type="number"
            min="0"
            value={product.price}
            onChange={(e) =>
              setProduct({ ...product, price: e.target.value })
            }
          />
        </div>

        <div>
          <label>Stock</label>
          <input
            type="number"
            min="0"
            value={product.stockQty}
            onChange={(e) =>
              setProduct({ ...product, stockQty: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label>Category</label>
        <input
          value={product.category || ""}
          onChange={(e) =>
            setProduct({ ...product, category: e.target.value })
          }
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={product.description || ""}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
          rows="3"
        />
      </div>

      <div className="listing-actions">
        <button className="primary" onClick={onSave}>
          Save changes
        </button>
        <button className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddProductForm({ user, onCreated, notify }) {
  const [form, setForm] = useState({
    cropName: "",
    category: "Vegetable",
    description: "",
    price: "",
    stockQty: ""
  });
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);

    try {
      await api.post("/products", {
        farmer: { userId: user.userId },
        cropName: form.cropName,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        stockQty: Number(form.stockQty)
      });

      notify("Product created successfully.");
      onCreated();
    } catch (error) {
      notify(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="NEW LISTING"
        title="Publish a fresh crop."
        subtitle="Create the Product record directly through your Spring Boot API."
      />

      <section className="form-panel narrow">
        <form onSubmit={submit} className="stack-form">
          <div>
            <label>Crop name</label>
            <input
              value={form.cropName}
              onChange={(e) =>
                setForm({ ...form, cropName: e.target.value })
              }
              placeholder="Tomato"
              required
            />
          </div>

          <div className="two-col">
            <div>
              <label>Category</label>
              <input
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="Vegetable"
                required
              />
            </div>

            <div>
              <label>Price per unit</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                placeholder="40"
                required
              />
            </div>
          </div>

          <div>
            <label>Stock quantity</label>
            <input
              type="number"
              min="0"
              value={form.stockQty}
              onChange={(e) =>
                setForm({ ...form, stockQty: e.target.value })
              }
              placeholder="100"
              required
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              rows="5"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Fresh tomatoes harvested this week..."
            />
          </div>

          <button className="primary large-btn" disabled={busy}>
            {busy ? "Publishing..." : "Publish product"}
          </button>
        </form>
      </section>
    </>
  );
}

function AdminDashboard({ user, page, notify }) {
  if (page === "users") return <AdminUsers notify={notify} />;
  if (page === "products") return <AdminProducts notify={notify} />;
  if (page === "orders") return <AdminOrders notify={notify} />;

  return <AdminOverview user={user} setPage={() => {}} />;
}

function AdminOverview({ user }) {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/users"),
      api.get("/products"),
      api.get("/orders")
    ])
      .then(([usersRes, productsRes, ordersRes]) => {
        setUsers(usersRes.data);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
      })
      .catch(() => {});
  }, []);

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const buyers = users.filter((u) => u.role === "BUYER").length;
  const farmers = users.filter((u) => u.role === "FARMER").length;

  return (
    <>
      <PageIntro
        eyebrow="ADMIN OVERVIEW"
        title={`Control center for ${user.name}.`}
        subtitle="Monitor platform activity from the same REST APIs used by the Farmer and Buyer dashboards."
      />

      <div className="stat-grid four">
        <StatCard label="Users" value={users.length} meta={`${buyers} buyers`} icon="◎" />
        <StatCard label="Farmers" value={farmers} meta="Seller accounts" icon="♜" />
        <StatCard label="Products" value={products.length} meta="Marketplace listings" icon="▦" />
        <StatCard label="Order value" value={money(revenue)} meta={`${orders.length} orders`} icon="₹" />
      </div>

      <section className="section-block">
        <SectionHeader title="Recent orders" />
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(-6).reverse().map((order) => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.buyer?.name || order.buyer?.email || "Buyer"}</td>
                    <td>{money(order.totalAmount)}</td>
                    <td><StatusBadge status={order.status || "PENDING"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

function AdminUsers({ notify }) {
  const [users, setUsers] = useState([]);

  async function load() {
    try {

        const response =
            await api.get("/admin/pending-users");

        setUsers(response.data);

    } catch (error) {

        notify(errorMessage(error));

    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    try {
      await api.delete(`/users/${id}`);
      notify("User deleted.");
      await load();
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  async function approve(id) {

    try {

        await api.put(`/admin/approve-user/${id}`);

        notify("User approved successfully.");

        await load();

    } catch (error) {

        notify(errorMessage(error));

    }

  }

  return (
    <>
      <PageIntro
        eyebrow="ADMIN / USERS"
        title="User management."
        subtitle="Read and manage Farmer, Buyer and Admin records."
      />

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
               <tr key={item.userId}>
                <td>#{item.userId}</td>
                <td><strong>{item.name}</strong></td>
                <td>{item.email}</td>
                <td><span className="role-pill">{item.role}</span></td>
                <td>
                    <span
                        style={{
                            color: "orange",
                            fontWeight: "bold"
                        }}
                    >
                        {item.approvalStatus}
                    </span>
                </td>

                <td>

                    <button
                        className="primary-btn"
                        onClick={() => approve(item.userId)}
                    >
                        Approve
                    </button>

                </td>
                
              </tr>
            ))}
           </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function AdminProducts({ notify }) {
  const [products, setProducts] = useState([]);

  async function load() {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    try {
      await api.delete(`/products/${id}`);
      notify("Product deleted.");
      await load();
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  async function approve(id) {

    try {

        await api.put(`/admin/approve-user/${id}`);

        notify("User approved successfully.");

        load();

    } catch (error) {

        notify(errorMessage(error));

    }

  }

  return (
    <>
      <PageIntro
        eyebrow="ADMIN / PRODUCTS"
        title="Marketplace inventory."
        subtitle="Review the live product records from every farmer."
      />

      <div className="listing-grid">
        {products.map((product) => (
          <div className="listing-card" key={product.productId}>
            <div className="listing-title">
              <div className="crop-mini">
                {product.cropName?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <strong>{product.cropName}</strong>
                <span>{product.category || "Produce"}</span>
              </div>
            </div>

            <p>{product.description || "No description."}</p>

            <div className="listing-stats">
              <div>
                <span>Price</span>
                <strong>{money(product.price)}</strong>
              </div>
              <div>
                <span>Stock</span>
                <strong>{product.stockQty}</strong>
              </div>
            </div>

            <div className="listing-actions">
              <button
                className="danger-btn"
                onClick={() => remove(product.productId)}
              >
                Delete listing
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AdminOrders({ notify }) {
  const [orders, setOrders] = useState([]);

  async function load() {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(order, status) {
    try {
      await api.put(`/orders/${order.orderId}`, {
        buyer: { userId: order.buyer?.userId },
        orderDate: order.orderDate,
        totalAmount: order.totalAmount,
        status
      });

      notify(`Order #${order.orderId} updated.`);
      await load();
    } catch (error) {
      notify(errorMessage(error));
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="ADMIN / ORDERS"
        title="Order operations."
        subtitle="Update order status using your existing PUT /api/orders/{id} endpoint."
      />

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td><strong>#{order.orderId}</strong></td>
                  <td>{order.buyer?.name || order.buyer?.email || "Buyer"}</td>
                  <td>{shortDate(order.orderDate)}</td>
                  <td>{money(order.totalAmount)}</td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status || "PENDING"}
                      onChange={(e) =>
                        updateStatus(order, e.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function PageIntro({ eyebrow, title, subtitle }) {
  return (
    <div className="page-intro">
      <div>
        <span className="eyebrow dark">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      {action && (
        <button className="text-btn" onClick={onAction}>
          {action} →
        </button>
      )}
    </div>
  );
}

function StatCard({ label, value, meta, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <strong>{value}</strong>
      <small>{meta}</small>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${status?.toLowerCase()}`}>{status}</span>;
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">⌁</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="toast">
      <span className="toast-dot"></span>
      <span>{message}</span>
    </div>
  );
}

export default App;
