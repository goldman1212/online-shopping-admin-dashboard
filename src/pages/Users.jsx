
import { useState } from 'react'
import './Users.css'

function Users({ users, setUsers }) {

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('User')
  const [editingId, setEditingId] = useState(null)

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('All')

  // Filter users
  const filteredUsers = users.filter(user => {

    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole =
      filterRole === 'All' || user.role === filterRole

    return matchesSearch && matchesRole
  })

  // Add and Update User
  function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      alert('Please fill in all fields!')
      return
    }

    if (editingId !== null) {
      setUsers(prev =>
        prev.map(user =>
          user.id === editingId
            ? {
                ...user,
                name: name.trim(),
                email: email.trim(),
                role
              }
            : user
        )
      )
    } else {

      const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        role
      }

      setUsers(prev => [...prev, newUser])
    }

    resetForm()
  }

  // Reset form
  function resetForm() {
    setName('')
    setEmail('')
    setRole('User')
    setEditingId(null)
  }

  // Edit User
  function handleEdit(user) {
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setEditingId(user.id)
  }

  // Delete User
  function handleDelete(id) {

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user?'
    )

    if (confirmDelete) {
      setUsers(prev =>
        prev.filter(user => user.id !== id)
      )
    }
  }

  return (
    <div className="users-page">

      {/* Header */}
      <div className="users-header">

        <div>
          <h2>Users Management</h2>
          <p>Manage all registered users in your system.</p>
        </div>

        <span className="users-count">
          Total Users: {users.length}
        </span>

      </div>

      {/* Add User Form */}
      <form className="user-form" onSubmit={handleSubmit}>

        <h3>
          {editingId !== null ? 'Edit User' : 'Add New User'}
        </h3>

        <div className="form-fields">

          <input
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <select
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
          </select>

          <button type="submit" className="add-btn">
            {editingId !== null ? 'Update User' : 'Add User'}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

        </div>
      </form>

      {/* Search and Filter */}
      <div className="users-toolbar">

        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
          <option value="Editor">Editor</option>
        </select>

      </div>

      {/* Users Table */}
      <div className="users-table">

        <h3>All Users ({filteredUsers.length})</h3>

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredUsers.map(user => (

              <tr key={user.id}>

                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>

                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>

                <td>

                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-message">
                  No users found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Users
