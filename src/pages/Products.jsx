
import { useState } from 'react'
import './Products.css'

function Products({ products, setProducts }) {

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')
  const [editingId, setEditingId] = useState(null)

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')

  // Get unique categories
  const categories = [
    ...new Set(products.map(product => product.category))
  ]

  // Search and Filter Products
  const filteredProducts = products.filter(product => {

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      filterCategory === 'All' ||
      product.category === filterCategory

    return matchesSearch && matchesCategory
  })

  // Reset Form
  function resetForm() {
    setName('')
    setPrice('')
    setCategory('')
    setStock('')
    setEditingId(null)
  }

  // Add or Update Product
  function handleSubmit(e) {
    e.preventDefault()

    if (
      !name.trim() ||
      !category.trim() ||
      price === '' ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      stock === '' ||
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {
      alert('Please enter valid product information.')
      return
    }

    if (editingId !== null) {

      setProducts(prev =>
        prev.map(product =>
          product.id === editingId
            ? {
                ...product,
                name: name.trim(),
                price: Number(price),
                category: category.trim(),
                stock: Number(stock)
              }
            : product
        )
      )

    } else {

      const newProduct = {
        id: Date.now(),
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        stock: Number(stock)
      }

      setProducts(prev => [...prev, newProduct])
    }

    resetForm()
  }

  // Edit Product
  function handleEdit(product) {
    setName(product.name)
    setPrice(String(product.price))
    setCategory(product.category)
    setStock(String(product.stock))
    setEditingId(product.id)
  }

  // Delete Product
  function deleteProduct(id) {

    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev =>
        prev.filter(product => product.id !== id)
      )
    }
  }

  // Stock Status
  function getStockStatus(quantity) {

    if (quantity === 0) {
      return 'Out of Stock'
    }

    if (quantity <= 5) {
      return 'Low Stock'
    }

    return 'In Stock'
  }

  return (
    <div className="products-page">

      {/* Header */}
      <div className="products-header">
        <div>
          <h2>Products Management</h2>
          <p>Manage your products and inventory.</p>
        </div>

        <span className="product-count">
          Total Products: {products.length}
        </span>
      </div>

      {/* Add and Edit Form */}
      <form className="product-form" onSubmit={handleSubmit}>

        <h3>
          {editingId !== null ? 'Edit Product' : 'Add New Product'}
        </h3>

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price (ETB)"
          min="0.01"
          step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Stock Quantity"
          min="0"
          step="1"
          value={stock}
          onChange={e => setStock(e.target.value)}
          required
        />

        <button type="submit">
          {editingId !== null ? 'Update Product' : 'Add Product'}
        </button>

        {editingId !== null && (
          <button
            type="button"
            className="product-cancel-btn"
            onClick={resetForm}
          >
            Cancel
          </button>
        )}

      </form>

      {/* Search and Filter */}
      <div className="products-toolbar">

        <input
          type="text"
          placeholder="Search product..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>

          {categories.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}

        </select>

      </div>

      {/* Products Table */}
      <div className="products-table">

        <h3>All Products ({filteredProducts.length})</h3>

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Stock Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredProducts.map(product => (

              <tr key={product.id}>

                <td>{product.id}</td>

                <td>{product.name}</td>

                <td>
                  {Number(product.price).toLocaleString()} ETB
                </td>

                <td>{product.category}</td>

                <td>{product.stock}</td>

                <td>
                  <span className={`stock-status ${
                    product.stock === 0
                      ? 'out-of-stock'
                      : product.stock <= 5
                        ? 'low-stock'
                        : 'in-stock'
                  }`}>
                    {getStockStatus(product.stock)}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="product-edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="product-delete-btn"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </td>

              </tr>

            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="7">
                  No products found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Products
