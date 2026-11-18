
import { useEffect, useState } from 'react'
import './Settings.css'

function getSavedData(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}

function Settings() {
  const [profile, setProfile] = useState(() =>
    getSavedData('adminProfile', {
      name: 'Admin User',
      email: 'admin@gmail.com',
      role: 'Administrator'
    })
  )

  const [password, setPassword] = useState({
    current: '',
    newPassword: '',
    confirm: ''
  })

  const [darkMode, setDarkMode] = useState(() =>
    getSavedData('adminDarkMode', false)
  )

  const [notifications, setNotifications] = useState(() =>
    getSavedData('adminNotifications', true)
  )

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('adminNotifications', JSON.stringify(notifications))
  }, [notifications])

  function showMessage(text, type = 'success') {
    setMessage(text)
    setMessageType(type)
  }

  function handleProfileChange(e) {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  function handlePasswordChange(e) {
    setPassword(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Save Profile
  function saveProfile(e) {
    e.preventDefault()

    if (!profile.name.trim() || !profile.email.trim()) {
      showMessage('Please enter your name and email.', 'error')
      return
    }

    localStorage.setItem('adminProfile', JSON.stringify(profile))
    showMessage('Profile settings saved successfully!')
  }

  // Validate Password Form
  function changePassword(e) {
    e.preventDefault()

    if (!password.current.trim()) {
      showMessage('Please enter your current password.', 'error')
      return
    }

    if (password.newPassword.length < 6) {
      showMessage('New password must contain at least 6 characters.', 'error')
      return
    }

    if (password.newPassword !== password.confirm) {
      showMessage('New passwords do not match.', 'error')
      return
    }

    showMessage(
      'Password form validation successful. A real password change requires backend authentication.'
    )

    setPassword({
      current: '',
      newPassword: '',
      confirm: ''
    })
  }

  return (
    <div className={`settings-page ${darkMode ? 'dark-mode' : ''}`}>

      {/* Header */}
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account and dashboard preferences.</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`settings-message ${messageType}`}>
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage('')}
          >
            ×
          </button>
        </div>
      )}

      {/* Profile Settings */}
      <div className="settings-card">
        <h3>Profile Settings</h3>
        <p>Update your personal information.</p>

        <form onSubmit={saveProfile}>

          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleProfileChange}
            placeholder="Enter your full name"
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleProfileChange}
            placeholder="Enter your email"
            required
          />

          <label>Role</label>
          <input
            type="text"
            value={profile.role}
            disabled
          />

          <button type="submit">Save Profile</button>

        </form>
      </div>

      {/* Password Settings */}
      <div className="settings-card">
        <h3>Change Password</h3>
        <p>Validate your password change form.</p>

        <form onSubmit={changePassword}>

          <label>Current Password</label>
          <input
            type="password"
            name="current"
            value={password.current}
            onChange={handlePasswordChange}
            placeholder="Enter current password"
            required
          />

          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={password.newPassword}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
            minLength="6"
            required
          />

          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirm"
            value={password.confirm}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
            minLength="6"
            required
          />

          <button type="submit">Validate Password</button>

        </form>
      </div>

      {/* Preferences */}
      <div className="settings-card">
        <h3>Preferences</h3>
        <p>Customize your dashboard experience.</p>

        <div className="setting-option">
          <div>
            <strong>Dark Mode</strong>
            <p>Enable dark appearance.</p>
          </div>

          <input
            type="checkbox"
            checked={darkMode}
            onChange={e => setDarkMode(e.target.checked)}
          />
        </div>

        <div className="setting-option">
          <div>
            <strong>Notifications</strong>
            <p>Enable dashboard notification preference.</p>
          </div>

          <input
            type="checkbox"
            checked={notifications}
            onChange={e => setNotifications(e.target.checked)}
          />
        </div>

      </div>

    </div>
  )
}

export default Settings
