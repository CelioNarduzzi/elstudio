import { useEffect, useState } from "react"
import axios from "axios"

function RoleManagement() {
  const [roles, setRoles] = useState([])
  const [newRole, setNewRole] = useState("")
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState("")

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  const fetchRoles = async () => {
    const res = await axios.get("http://localhost:8000/roles", { headers })
    setRoles(res.data)
  }

  const handleCreate = async () => {
    if (!newRole.trim()) return
    await axios.post("http://localhost:8000/roles", { name: newRole }, { headers })
    setNewRole("")
    fetchRoles()
  }

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8000/roles/${id}`, { headers })
    fetchRoles()
  }

  const handleEdit = (role) => {
    setEditId(role.id)
    setEditName(role.name)
  }

  const handleUpdate = async () => {
    if (!editName.trim()) return
    await axios.put(`http://localhost:8000/roles/${editId}`, { name: editName }, { headers })
    setEditId(null)
    setEditName("")
    fetchRoles()
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des rôles</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          placeholder="Nom du rôle"
          className="border rounded px-3 py-2"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ajouter
        </button>
      </div>

      <ul className="space-y-3">
  {roles.map((role, index) => (
    <li
      key={role.id}
      className={`flex justify-between items-center border-b pb-2 ${
        index === 0 ? "text-gray-500" : ""
      }`}
    >
      {editId === role.id && index !== 0 ? (
        <>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={handleUpdate}
            className="text-green-600 hover:underline ml-4"
          >
            Enregistrer
          </button>
        </>
      ) : (
        <>
          <span>{role.name}</span>
          {index !== 0 && (
            <div>
              <button
                onClick={() => handleEdit(role)}
                className="text-blue-600 hover:underline mr-4"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(role.id)}
                className="text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          )}
        </>
      )}
    </li>
  ))}
</ul>
    </div>
  )
}

export default RoleManagement
