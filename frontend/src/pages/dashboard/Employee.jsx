import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

function Employee() {
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token")
      try {
        const res = await axios.get("http://localhost:8000/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(res.data.filter(user => user.is_active))
      } catch (err) {
        console.error("Erreur chargement employés", err)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Liste des employés</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate("/register")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Créer un employé
          </button>
          <button
            onClick={() => navigate("/inactive-users")}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Utilisateurs inactifs
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Retour
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Prénom</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Naissance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Rôles</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm">{user.first_name}</td>
                <td className="px-4 py-3 text-sm">{user.last_name}</td>
                <td className="px-4 py-3 text-sm">{user.email}</td>
                <td className="px-4 py-3 text-sm">{user.birth_date || "-"}</td>
                <td className="px-4 py-3 text-sm">
                  {user.roles?.length > 0
                    ? user.roles.map(r => r.name).join(", ")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    to={`/employee/${user.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Employee
