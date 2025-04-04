// frontend/src/pages/InactiveUsers.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function InactiveUsers() {
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token")
      try {
        const res = await axios.get("http://localhost:8000/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        // Filtrage côté client
        const inactifs = res.data.filter(user => !user.is_active)
        setUsers(inactifs)
      } catch (err) {
        console.error("Erreur chargement utilisateurs", err)
      }
    }
  
    fetchUsers()
  }, [])
  
  const handlePermanentDelete = async (id) => {
    const confirmed = confirm("Supprimer définitivement cet utilisateur ?")
    if (!confirmed) return
    const token = localStorage.getItem("token")
    try {
      await axios.delete(`http://localhost:8000/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(users.filter((user) => user.id !== id))
    } catch {
      alert("Erreur lors de la suppression définitive")
    }
  }

  const handleReactivate = async (id) => {
    const token = localStorage.getItem("token")
    try {
      await axios.put(`http://localhost:8000/users/reactivate/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(users.filter((user) => user.id !== id))
    } catch {
      alert("Erreur lors de la réactivation")
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Utilisateurs inactifs</h1>
        <button
          onClick={() => navigate("/employee")}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Retour
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-4">
                <button
  onClick={() => handleReactivate(user.id)}
  className="text-green-600 hover:underline mr-4"
>
  Réactiver
</button>
                  <button
                    onClick={() => handlePermanentDelete(user.id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer définitivement
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InactiveUsers
