
import './Navbar.css'

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-title">
        <h2>Dashboard Overview</h2>
        <p>Welcome back, Admin!</p>
      </div>

      <div className="navbar-right">
        <input
          type="text"
          placeholder="Search..."
          aria-label="Search dashboard"
        />

        <button className="notification-btn" aria-label="Notifications">
          🔔
        </button>

        <div className="admin-profile">
          <span className="admin-avatar">👤</span>
          <span>Admin</span>
        </div>
      </div>
    </div>
  )
}

export default Navbar
