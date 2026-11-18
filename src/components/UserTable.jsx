
import './UserTable.css'

function UserTable() {
  const users = [
    { id: 1, name: 'Abebe Kebede', email: 'abebe@gmail.com', role: 'Admin' },
    { id: 2, name: 'Dawit Bekele', email: 'dawit@gmail.com', role: 'User' },
    { id: 3, name: 'Marta Ali', email: 'marta@gmail.com', role: 'Editor' },
    { id: 4, name: 'Kebede Tola', email: 'kebede@gmail.com', role: 'User' }
  ]

  return (
    <div className="user-table">
      <h2>Recent Users</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
