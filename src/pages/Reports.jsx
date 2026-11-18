
import { useState } from 'react'
import './Reports.css'

function Reports({ orders = [] }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Order Statistics
  const pending = orders.filter(o => o.status === 'Pending').length
  const processing = orders.filter(o => o.status === 'Processing').length
  const delivered = orders.filter(o => o.status === 'Delivered').length
  const cancelled = orders.filter(o => o.status === 'Cancelled').length

  // Revenue from delivered orders only
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce(
      (total, order) =>
        total + Number(order.quantity) * Number(order.price),
      0
    )

  // Best-Selling Products
  const productSales = {}

  orders
    .filter(order => order.status === 'Delivered')
    .forEach(order => {
      if (!productSales[order.product]) {
        productSales[order.product] = {
          name: order.product,
          quantity: 0,
          revenue: 0
        }
      }

      productSales[order.product].quantity += Number(order.quantity)
      productSales[order.product].revenue +=
        Number(order.quantity) * Number(order.price)
    })

  const bestSellingProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)

  // Order Statistics
  const statistics = [
    { status: 'Pending', count: pending },
    { status: 'Processing', count: processing },
    { status: 'Delivered', count: delivered },
    { status: 'Cancelled', count: cancelled }
  ]

  const getPercentage = count =>
    orders.length === 0 ? 0 : (count / orders.length) * 100

  // Search Orders
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase()

    return (
      String(order.id).toLowerCase().includes(search) ||
      order.customer.toLowerCase().includes(search) ||
      order.product.toLowerCase().includes(search)
    )
  })

  // Export CSV
  function exportCSV() {
    const headers = [
      'Order ID',
      'Customer',
      'Product',
      'Quantity',
      'Unit Price',
      'Total Price',
      'Status'
    ]

    const rows = orders.map(order => [
      order.id,
      order.customer,
      order.product,
      order.quantity,
      order.price,
      Number(order.quantity) * Number(order.price),
      order.status
    ])

    const csvContent = [headers, ...rows]
      .map(row =>
        row.map(value =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(',')
      )
      .join('\n')

    const blob = new Blob(
      ['\uFEFF' + csvContent],
      { type: 'text/csv;charset=utf-8;' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'orders-report.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="reports-page">

      {/* Header */}
      <div className="reports-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Monitor your business performance.</p>
        </div>

        <div className="report-actions">
          <button className="export-btn" onClick={exportCSV}>
            Export CSV
          </button>

          <button className="print-btn" onClick={() => window.print()}>
            Print Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="report-cards">

        <div className="report-card">
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="report-card">
          <span>Total Revenue</span>
          <h2>{totalRevenue.toLocaleString()} ETB</h2>
        </div>

        <div className="report-card">
          <span>Delivered Orders</span>
          <h2>{delivered}</h2>
        </div>

        <div className="report-card">
          <span>Cancelled Orders</span>
          <h2>{cancelled}</h2>
        </div>

      </div>

      {/* Order Statistics */}
      <div className="report-section">
        <h3>Order Statistics</h3>

        {statistics.map(item => (
          <div className="order-stat" key={item.status}>

            <div className="order-stat-header">
              <span>{item.status}</span>
              <strong>
                {item.count} ({getPercentage(item.count).toFixed(1)}%)
              </strong>
            </div>

            <div className="progress-track">
              <div
                className={`progress-fill ${item.status.toLowerCase()}`}
                style={{
                  width: `${getPercentage(item.count)}%`
                }}
              />
            </div>

          </div>
        ))}
      </div>

      {/* Best Selling Products */}
      <div className="report-section">
        <h3>Best-Selling Products</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product Name</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>

            <tbody>
              {bestSellingProducts.map((item, index) => (
                <tr key={item.name}>
                  <td>#{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.revenue.toLocaleString()} ETB</td>
                </tr>
              ))}

              {bestSellingProducts.length === 0 && (
                <tr>
                  <td colSpan="4">No delivered product sales available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Orders */}
      <div className="report-section">
        <h3>All Orders ({filteredOrders.length})</h3>

        <input
          className="report-search"
          type="text"
          placeholder="Search by ID, customer or product..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td>{order.quantity}</td>
                  <td>
                    {(Number(order.quantity) * Number(order.price))
                      .toLocaleString()} ETB
                  </td>
                  <td>
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default Reports
