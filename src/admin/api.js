
// Frontend-only data layer.
// All records are stored in this browser's localStorage.

const DB_KEY = "online-shopping-admin-db-v1";

const seed = {
  users: [
    {
      id: 1,
      name: "Abebe Kebede",
      email: "abebe@example.com",
      role: "Buyer",
      status: "Active",
      city: "Addis Ababa"
    },
    {
      id: 2,
      name: "Marta Ali",
      email: "marta@example.com",
      role: "Seller",
      status: "Active",
      city: "Dire Dawa"
    },
    {
      id: 3,
      name: "Dawit Bekele",
      email: "dawit@example.com",
      role: "Buyer",
      status: "Suspended",
      city: "Adama"
    }
  ],

  sellers: [
    {
      id: 1,
      business: "Marta Footwear",
      owner: "Marta Ali",
      email: "marta@example.com",
      city: "Dire Dawa",
      status: "Approved"
    },
    {
      id: 2,
      business: "Dawit Shoes",
      owner: "Dawit Bekele",
      email: "dawit@example.com",
      city: "Adama",
      status: "Pending"
    }
  ],

  products: [
    {
      id: 1,
      name: "Leather Oxford",
      category: "Formal Shoes",
      price: 3200,
      stock: 24,
      status: "Approved"
    },
    {
      id: 2,
      name: "Running Sneaker",
      category: "Sports Shoes",
      price: 2800,
      stock: 41,
      status: "Approved"
    },
    {
      id: 3,
      name: "Classic Sandal",
      category: "Sandals",
      price: 1500,
      stock: 12,
      status: "Pending"
    }
  ],

  orders: [
    {
      id: 1040,
      buyer: "Abebe Kebede",
      product: "Leather Oxford",
      amount: 3200,
      paymentStatus: "Paid",
      deliveryStatus: "Processing",
      date: "2026-11-15"
    },
    {
      id: 1041,
      buyer: "Marta Ali",
      product: "Running Sneaker",
      amount: 2800,
      paymentStatus: "Paid",
      deliveryStatus: "Delivered",
      date: "2026-11-16"
    }
  ],

  payments: [
    {
      id: 1,
      orderId: "ORD-1040",
      customer: "Abebe Kebede",
      amount: 3200,
      method: "Telebirr",
      status: "Paid",
      date: "2026-11-15"
    }
  ],

  delivery: [
    {
      id: 1,
      orderId: "ORD-1040",
      customer: "Abebe Kebede",
      carrier: "Local Courier",
      status: "Processing",
      city: "Addis Ababa"
    }
  ],

  tryon: [
    {
      id: 1,
      product: "Leather Oxford",
      modelStatus: "Ready",
      category: "Shoes",
      updated: "2026-11-15"
    }
  ],

  ads: [
    {
      id: 1,
      title: "November Shoe Sale",
      seller: "Marta Footwear",
      status: "Pending",
      budget: 5000
    }
  ],

  support: [
    {
      id: 1,
      subject: "Order delivery question",
      customer: "Abebe Kebede",
      priority: "Normal",
      status: "Open"
    }
  ],

  notifications: [
    {
      id: 1,
      title: "New seller registration",
      type: "Seller",
      status: "Unread",
      date: "2026-11-16"
    }
  ]
};

// Read data from localStorage.
function readDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);

    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn("Could not read dashboard data", error);
  }

  localStorage.setItem(DB_KEY, JSON.stringify(seed));

  return structuredClone(seed);
}

// Save data to localStorage.
function writeDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Get all records from a module.
export function getAll(module) {
  const db = readDb();

  return db[module] || [];
}

// Create a new record or update an existing record.
export function saveRecord(module, record) {
  const db = readDb();

  const rows = db[module] || [];

  if (
    record.id != null &&
    rows.some((row) => String(row.id) === String(record.id))
  ) {
    db[module] = rows.map((row) =>
      String(row.id) === String(record.id)
        ? { ...row, ...record }
        : row
    );
  } else {
    const nextId =
      rows.reduce(
        (max, row) => Math.max(max, Number(row.id) || 0),
        0
      ) + 1;

    db[module] = [
      ...rows,
      {
        ...record,
        id: record.id ?? nextId
      }
    ];
  }

  writeDb(db);

  return db[module];
}

// Delete a record.
export function deleteRecord(module, id) {
  const db = readDb();

  db[module] = (db[module] || []).filter(
    (row) => String(row.id) !== String(id)
  );

  writeDb(db);

  return db[module];
}

// Update an existing record.
export function updateRecord(module, id, changes) {
  const db = readDb();

  db[module] = (db[module] || []).map((row) =>
    String(row.id) === String(id)
      ? { ...row, ...changes }
      : row
  );

  writeDb(db);

  return db[module];
}

// Reset all data to the original sample data.
export function resetDemoData() {
  localStorage.setItem(DB_KEY, JSON.stringify(seed));

  return structuredClone(seed);
}

// Calculate dashboard summary.
export function getSummary() {
  const db = readDb();

  const orders = db.orders || [];

  const revenue = orders
    .filter((order) => order.paymentStatus === "Paid")
    .reduce(
      (sum, order) => sum + Number(order.amount || 0),
      0
    );

  return {
    users: (db.users || []).length,
    sellers: (db.sellers || []).length,
    products: (db.products || []).length,
    orders: orders.length,
    revenue,
    pending: (db.sellers || []).filter(
      (seller) => seller.status === "Pending"
    ).length
  };
}
