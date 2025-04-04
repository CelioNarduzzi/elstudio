import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: [],
  })

  const navigate = useNavigate()
  const [allRoles, setAllRoles] = useState([])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get("http://localhost:8000/roles").then((res) => {
      setAllRoles(res.data)
    })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRolesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
    setForm((prev) => ({ ...prev, roles: selected }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    try {
      const payload = { ...form }
      delete payload.confirmPassword
      await axios.post("http://localhost:8000/auth/register", payload)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur inconnue")
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


      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-8 shadow-lg rounded-xl w-[500px] space-y-4"
        >
          <h2 className="text-2xl font-bold text-center">Créer un utilisateur</h2>

          {success && <p className="text-green-600 dark:text-green-400 text-sm">✔ Utilisateur créé</p>}
          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

          <input
            name="first_name"
            placeholder="Prénom"
            value={form.first_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="last_name"
            placeholder="Nom"
            value={form.last_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="birth_date"
            type="date"
            value={form.birth_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
      
          <select
            multiple
            required
            className="w-full border px-4 py-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            onChange={handleRolesChange}
          >
            {allRoles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Créer
          </button>
        </form>
      </div>
    </>
  )
}

export default Register
