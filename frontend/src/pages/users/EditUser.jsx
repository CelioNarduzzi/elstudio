// frontend/src/pages/EditUser.jsx
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"

function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    birth_date: "",
    password: "",
    roles: []
  })
  const [availableRoles, setAvailableRoles] = useState([])
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      try {
        const res = await axios.get(`http://localhost:8000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setForm({
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,
          birth_date: res.data.birth_date || "",
          password: "",
          roles: res.data.roles.map(r => r.name)
        })
      } catch (err) {
        setMessage("Erreur de chargement de l'utilisateur")
      }
    }

    const fetchRoles = async () => {
      const res = await axios.get("http://localhost:8000/roles")
      setAvailableRoles(res.data)
    }

    fetchUser()
    fetchRoles()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === "checkbox") {
      const updatedRoles = checked
        ? [...form.roles, value]
        : form.roles.filter((role) => role !== value)
      setForm({ ...form, roles: updatedRoles })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    try {
      await axios.put(`http://localhost:8000/users/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage("Utilisateur modifié avec succès ✅")
      setTimeout(() => navigate("/employee"), 1000)
    } catch {
      setMessage("Erreur lors de la modification")
    }
  }

  const handleDeactivate = async () => {
    const confirmed = confirm("Voulez-vous désactiver cet utilisateur ?")
    if (!confirmed) return
    const token = localStorage.getItem("token")
    try {
      await axios.put(`http://localhost:8000/users/${id}`, { ...form, is_active: false }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate("/employee")
    } catch {
      setMessage("Erreur lors de la désactivation")
    }
  }

  return (
    <>
<div className="flex justify-end mt-4 px-4">
  <button
    onClick={() => navigate("/employee")}
    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
  >
    Retour
  </button>
</div>
    <div className="max-w-xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">Modifier un utilisateur</h1>
      {message && <div className="mb-4 text-blue-600 dark:text-blue-400">{message}</div>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          name="first_name"
          placeholder="Prénom"
          value={form.first_name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Nom"
          value={form.last_name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="date"
          name="birth_date"
          value={form.birth_date}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <div>
          <label className="block font-medium mb-1">Rôles</label>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map((role) => (
              <label key={role.name} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={role.name}
                  checked={form.roles.includes(role.name)}
                  onChange={handleChange}
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={handleDeactivate}
          className="ml-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Désactiver
        </button>
      </form>
    </div>
    </>
  )
}

export default EditUser