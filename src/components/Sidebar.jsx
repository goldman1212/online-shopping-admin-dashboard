
import { useState } from 'react'
import './Sidebar.css'

function Sidebar({ activePage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', icon: '🏠' },
    { name: 'Users', icon: '👥' },
    { name: 'Products', icon: '📦' },
    { name: 'Orders', icon: '🛒' },
    { name: 'Reports', icon: '📊' },
    { name: 'Settings', icon: '⚙️' }
  ]

  function handleNavigate(page) {
    onNavigate(page)
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Background Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <h2>Admin Panel</h2>

        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                className={activePage === item.name ? 'active' : ''}
                onClick={() => handleNavigate(item.name)}
              >
                {item.icon} {item.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}

export default Sidebar
