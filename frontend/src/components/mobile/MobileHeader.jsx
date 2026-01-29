import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MobileHeader.css'

const MobileHeader = ({ user, onLogout, onCreateProduct, onExportCSV }) => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const handleMenuAction = (action) => {
    closeMenu()
    if (action === 'create') onCreateProduct()
    else if (action === 'export') onExportCSV()
    else if (action === 'activity') navigate('/activity-history')
    else if (action === 'logout') onLogout()
  }

  return (
    <header className="mobile-header">
      <div className="mobile-header-content">
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menu">
          <span className="hamburger-icon">☰</span>
        </button>
        <h1 className="mobile-header-title">Samay IMS</h1>
        <div className="mobile-profile-icon">
          <span className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
      </div>

      {/* Slide-in menu */}
      <div className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu}>
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <h2>Menu</h2>
            <button className="mobile-menu-close" onClick={closeMenu}>×</button>
          </div>
          <div className="mobile-menu-user">
            <div className="mobile-menu-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div className="mobile-menu-user-info">
              <div className="mobile-menu-user-name">{user?.name || 'User'}</div>
              <div className="mobile-menu-user-email">{user?.email || ''}</div>
            </div>
          </div>
          <nav className="mobile-menu-nav">
            <button className="mobile-menu-item" onClick={() => handleMenuAction('create')}>
              <span className="menu-icon">+</span>
              <span>Add Product</span>
            </button>
            <button className="mobile-menu-item" onClick={() => handleMenuAction('export')}>
              <span className="menu-icon">📥</span>
              <span>Export CSV</span>
            </button>
            <button className="mobile-menu-item" onClick={() => handleMenuAction('activity')}>
              <span className="menu-icon">📋</span>
              <span>Activity History</span>
            </button>
            <div className="mobile-menu-divider"></div>
            <button className="mobile-menu-item logout" onClick={() => handleMenuAction('logout')}>
              <span className="menu-icon">🚪</span>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default MobileHeader

