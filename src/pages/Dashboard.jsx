
import { useState, useEffect } from 'react'

// Components
import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'
import StatCard from '../components/StatCard.jsx'
import UserTable from '../components/UserTable.jsx'

// Pages
import Users from './Users.jsx'
import Products from './Products.jsx'
import Orders from './Orders.jsx'
import Reports from './Reports.jsx'
import Settings from './settings.jsx'

// CSS
import './Dashboard.css'

// Default Data
const defaultUsers = [
  { id: 1, name: 'Abebe Kebede', email: 'abebe@gmail.com', role: 'Admin' },
  { id: 2, name: 'Dawit Bekele', email: 'dawit@gmail.com', role: 'User' },
  { id: 3, name: 'Marta Ali', email: 'marta@gmail.com', role: 'Editor' }
]

const defaultProducts = [
  { id: 1, name: 'Laptop', price: 45000, category: 'Electronics', stock: 12 },
  { id: 2, name: 'Keyboard', price: 1200, category: 'Accessories', stock: 30 },
  { id: 3, name: 'Smartphone', price: 25000, category: 'Electronics', stock: 15 }
]

const defaultOrders = [
  {
    id: 1001,
    customer: 'Abebe Kebede',
    product: 'Laptop',
    quantity: 1,
    price: 45000,
    status: 'Pending'
  },
  {
    id: 1002,
    customer: 'Dawit Bekele',
    product: 'Keyboard',
    quantity: 2,
    price: 1200,
    status: 'Processing'
  },
  {
    id: 1003,
    customer: 'Marta Ali',
    product: 'Smartphone',
    quantity: 1,
    price: 25000,
    status: 'Delivered'
  }
]

// Load Data from LocalStorage
function loadData(key, defaultData) {
  try {
    const savedData = localStorage.getItem(key)

    if (savedData !== null) {
      const parsedData = JSON.parse(savedData)

      if (Array.isArray(parsedData)) {
        return parsedData
      }
    }

    return defaultData
  } catch (error) {
    console.error(`Error loading ${key}:`, error)
    return defaultData
  }
}

function Dashboard() {
  const [activePage, setActivePage] = useState('Dashboard')

  // Users Data
  const [users, setUsers] = useState(() =>
    loadData('dashboardUsers', defaultUsers)
  )

  // Products Data
  const [products, setProducts] = useState(() =>
    loadData('dashboardProducts', defaultProducts)
  )

  // Orders Data
  const [orders, setOrders] = useState(() =>
    loadData('dashboardOrders', defaultOrders)
  )

  // Save Users
  useEffect(() => {
    localStorage.setItem('dashboardUsers', JSON.stringify(users))
  }, [users])

  // Save Products
  useEffect(() => {
    localStorage.setItem('dashboardProducts', JSON.stringify(products))
  }, [products])

  // Save Orders
  useEffect(() => {
    localStorage.setItem('dashboardOrders', JSON.stringify(orders))
  }, [orders])

  // Calculate Total Revenue
  const totalRevenue = orders
    .filter(order => order.status === 'Delivered')
    .reduce((total, order) => {
      return total + (
        Number(order.quantity) * Number(order.price)
      )
    }, 0)

  // Calculate Order Statistics
  const orderStatistics = [
    {
      name: 'Pending',
      count: orders.filter(order => order.status === 'Pending').length,
      color: '#f59e0b'
    },
    {
      name: 'Processing',
      count: orders.filter(order => order.status === 'Processing').length,
      color: '#3b82f6'
    },
    {
      name: 'Delivered',
      count: orders.filter(order => order.status === 'Delivered').length,
      color: '#16a34a'
    },
    {
      name: 'Cancelled',
      count: orders.filter(order => order.status === 'Cancelled').length,
      color: '#ef4444'
    }
  ]

  // Recent Orders
  const recentOrders = [...orders].slice(-5).reverse()

  // Render Selected Page
  function renderContent() {
    switch (activePage) {

      case 'Dashboard':
        return (
          <>
            <h2>Dashboard Overview</h2>

            {/* Statistics Cards */}
            <div className="stats-container">

              <StatCard
                title="Total Users"
                value={users.length.toLocaleString()}
                icon="👥"
                color="#2563eb"
              />

              <StatCard
                title="Total Products"
                value={products.length.toLocaleString()}
                icon="📦"
                color="#16a34a"
              />

              <StatCard
                title="Total Orders"
                value={orders.length.toLocaleString()}
                icon="🛒"
                color="#ea580c"
              />

              <StatCard
                title="Total Revenue"
                value={`${totalRevenue.toLocaleString()} ETB`}
                icon="💰"
                color="#9333ea"
              />

            </div>

            {/* Dashboard Analytics */}
            <div className="dashboard-analytics">

              {/* Order Statistics */}
              <div className="analytics-card">
                <h3>Order Status Overview</h3>
                <p>Current order performance</p>

                {orderStatistics.map(item => (
                  <div className="chart-item" key={item.name}>

                    <div className="chart-label">
                      <span>{item.name}</span>
                      <strong>{item.count}</strong>
                    </div>

                    <div className="chart-track">
                      <div
                        className="chart-bar"
                        style={{
                          width: `${
                            orders.length === 0
                              ? 0
                              : (item.count / orders.length) * 100
                          }%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>

                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="analytics-card">
                <h3>Recent Orders</h3>
                <p>Latest customer orders</p>

                {recentOrders.length === 0 ? (
                  <p>No recent orders available.</p>
                ) : (
                  recentOrders.map(order => (
                    <div className="recent-order" key={order.id}>

                      <div>
                        <strong>{order.customer}</strong>
                        <p>{order.product}</p>
                      </div>

                      <span className={`status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>

                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Recent Users */}
            <UserTable users={users} />

          </>
        )

      case 'Users':
        return (
          <Users
            users={users}
            setUsers={setUsers}
          />
        )

      case 'Products':
        return (
          <Products
            products={products}
            setProducts={setProducts}
          />
        )

      case 'Orders':
        return (
          <Orders
            orders={orders}
            setOrders={setOrders}
          />
        )

      case 'Reports':
        return <Reports orders={orders} />

      case 'Settings':
        return <Settings />

      default:
        return <h2>Page Not Found</h2>
    }
  }

  return (
    <div className="dashboard-layout">

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="dashboard-main">

        <Navbar />

        <div className="dashboard-content">
          {renderContent()}
        </div>

      </div>

    </div>
  )
}

export default Dashboard
