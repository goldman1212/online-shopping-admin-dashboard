
import { useState } from 'react'
import './Orders.css'

function Orders({ orders, setOrders }) {
  const [customer, setCustomer] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  // Search and Filter
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      String(order.id).toLowerCase().includes(search) ||
      order.customer.toLowerCase().includes(search) ||
      order.product.toLowerCase().includes(search)

    const matchesStatus =
      filterStatus === 'All' || order.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Order Statistics
  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const processingOrders = orders.filter(o => o.status === 'Processing').length
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length

  const totalOrderValue = orders.reduce(
    (total, order) => total + order.quantity * order.price,
    0
  )

  // Reset Form
  function resetForm() {
    setCustomer('')
    setProduct('')
    setQuantity('')
    setPrice('')
    setEditingId(null)
  }

  // Add or Update Order
  function handleSubmit(e) {
    e.preventDefault()

    if (
      !customer.trim() ||
      !product.trim() ||
      quantity === '' ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0 ||
      price === '' ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      alert('Please enter valid order information.')
      return
    }

    if (editingId !== null) {
      setOrders(prev =>
        prev.map(order =>
          order.id === editingId
            ? {
                ...order,
                customer: customer.trim(),
                product: product.trim(),
                quantity: Number(quantity),
                price: Number(price)
              }
            : order
        )
      )
    } else {
      const newOrder = {
        id: Date.now(),
        customer: customer.trim(),
        product: product.trim(),
        quantity: Number(quantity),
        price: Number(price),
        status: 'Pending'
      }

      setOrders(prev => [...prev, newOrder])
    }

    resetForm()
  }

  // Edit Order
  function handleEdit(order) {
    setCustomer(order.customer)
    setProduct(order.product)
    setQuantity(String(order.quantity))
    setPrice(String(order.price))
    setEditingId(order.id)
  }

  // Update Status
  function updateStatus(id, newStatus) {
    setOrders(prev =>
      prev.map(order =>
        order.id === id
          ? { ...order, status: newStatus }
          : order
      )
    )
  }

  // Delete Order
  function deleteOrder(id) {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(prev => prev.filter(order => order.id !== id))

      if (editingId === id) {
        resetForm()
      }
    }
  }

  return (
    <div className="orders-page">

      {/* Header */}
      <div className="orders-header">
        <div>
          <h2>Orders Management</h2>
          <p>Create and manage customer orders.</p>
        </div>

        <div className="orders-count">
          Total Orders: {orders.length}
        </div>
      </div>

      {/* Order Statistics */}
      <div className="order-statistics">

        <div className="order-stat-card">
          <h4>Total Orders</h4>
          <h2>{orders.length}</h2>
        </div>

        <div className="order-stat-card pending-card">
          <h4>Pending</h4>
          <h2>{pendingOrders}</h2>
        </div>

        <div className="order-stat-card processing-card">
          <h4>Processing</h4>
          <h2>{processingOrders}</h2>
        </div>

        <div className="order-stat-card delivered-card">
          <h4>Delivered</h4>
          <h2>{deliveredOrders}</h2>
        </div>

        <div className="order-stat-card cancelled-card">
          <h4>Cancelled</h4>
          <h2>{cancelledOrders}</h2>
        </div>

        <div className="order-stat-card value-card">
          <h4>Total Order Value</h4>
          <h2>{totalOrderValue.toLocaleString()} ETB</h2>
        </div>

      </div>

      {/* Add and Edit Form */}
      <form className="order-form" onSubmit={handleSubmit}>

        <h3>
          {editingId !== null ? 'Edit Order' : 'Add New Order'}
        </h3>

        <div className="order-fields">

          <input
            type="text"
            placeholder="Customer Name"
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Product Name"
            value={product}
            onChange={e => setProduct(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Quantity"
            min="1"
            step="1"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Unit Price (ETB)"
            min="0.01"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />

          <button type="submit" className="order-add-btn">
            {editingId !== null ? 'Update Order' : 'Add Order'}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="order-cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

        </div>
      </form>

      {/* Search and Filter */}
      <div className="orders-toolbar">

        <input
          type="text"
          placeholder="Search by ID, customer or product..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

      </div>

      {/* Orders Table */}
      <div className="orders-table">

        <h3>All Orders ({filteredOrders.length})</h3>

        <table>

          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
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
                  {(order.quantity * order.price).toLocaleString()} ETB
                </td>

                <td>
                  <select
                    className={`status-select ${order.status.toLowerCase()}`}
                    value={order.status}
                    onChange={e =>
                      updateStatus(order.id, e.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>

                <td>
                  <button
                    type="button"
                    className="order-edit-btn"
                    onClick={() => handleEdit(order)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="order-delete-btn"
                    onClick={() => deleteOrder(order.id)}
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="order-empty">
                  No orders found.
                </td>
              </tr>
            )}

          </tbody>
        </table>

      </div>

    </div>
  )
}

export default Orders
