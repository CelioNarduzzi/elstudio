import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Profile() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    birth_date: "",
    language: "fr",
    date_format: "DD/MM/YYYY",
    theme: "light"
  })

  const [org, setOrg] = useState({
    name: "",
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_password: "",
    smtp_use_tls: false,
    smtp_use_ssl: false,
    default_from_email: ""
  })

  const navigate = useNavigate()
  const [message, setMessage] = useState(null)
  const roles = JSON.parse(localStorage.getItem("roles") || "[]")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const u = res.data
        setUser(u)
        setForm({
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          password: "",
          birth_date: u.birth_date || "",
          language: u.language || "fr",
          date_format: u.date_format || "DD/MM/YYYY",
          theme: u.theme || "light"
        })
      } catch (err) {
        console.error("Erreur chargement profil", err)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await axios.get("http://localhost:8000/organization")
        setOrg(res.data)
      } catch (err) {
        console.error("Erreur chargement organisation", err)
      }
    }
    if (roles.includes("super_admin")) fetchOrg()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    try {
      await axios.put("http://localhost:8000/users/me", form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage("✅ Données mises à jour avec succès")
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setMessage("❌ Erreur lors de la mise à jour")
    }
  }

  const handleOrgUpdate = async () => {
    const token = localStorage.getItem("token")
    try {
      await axios.put("http://localhost:8000/organization", org, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage("✅ Organisation mise à jour avec succès")
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setMessage("❌ Erreur lors de la mise à jour de l'organisation")
    }
  }

  if (!user) return <p className="text-center mt-8 text-gray-600 dark:text-gray-300">Chargement du profil...</p>

  return (
    <>
      <div className="max-w-6xl mx-auto flex justify-end mt-6 mb-4 px-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Retour
        </button>
      </div>

      <div className="flex max-w-6xl mx-auto bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl shadow overflow-hidden">
        <div className="w-48 bg-gray-100 dark:bg-gray-800 p-4 space-y-4">
          <button onClick={() => setActiveTab("profile")} className={`block w-full text-left px-2 py-1 rounded ${activeTab === "profile" ? "bg-blue-200 dark:bg-blue-700 font-semibold" : ""}`}>Mon profil</button>
          <button onClick={() => setActiveTab("preferences")} className={`block w-full text-left px-2 py-1 rounded ${activeTab === "preferences" ? "bg-blue-200 dark:bg-blue-700 font-semibold" : ""}`}>Préférences</button>
          {roles.includes("super_admin") && (
            <button onClick={() => setActiveTab("organization")} className={`block w-full text-left px-2 py-1 rounded ${activeTab === "organization" ? "bg-blue-200 dark:bg-blue-700 font-semibold" : ""}`}>Entreprise</button>
          )}
        </div>

        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">{activeTab === "profile" ? "Mon profil" : activeTab === "preferences" ? "Mes préférences" : "Mon entreprise"}</h1>
          {message && (<div className="mb-4 text-sm text-blue-600 dark:text-blue-400">{message}</div>)}

          {activeTab === "profile" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Prénom" name="first_name" value={form.first_name} onChange={handleChange} required />
              <Input label="Nom" name="last_name" value={form.last_name} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input label="Date de naissance" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />
              <Input label="Nouveau mot de passe" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Laisse vide pour ne pas changer" />
              <SubmitButton label="Enregistrer les modifications" />
            </form>
          )}

          {activeTab === "preferences" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select label="Langue" name="language" value={form.language} onChange={handleChange} options={{ fr: "Français", en: "English" }} />
              <Select label="Format de date" name="date_format" value={form.date_format} onChange={handleChange} options={{ "DD/MM/YYYY": "DD/MM/YYYY", "YYYY-MM-DD": "YYYY-MM-DD" }} />
              <Select label="Thème" name="theme" value={form.theme} onChange={handleChange} options={{ light: "Clair", dark: "Sombre" }} />
              <SubmitButton label="Enregistrer les préférences" />
            </form>
          )}

          {activeTab === "organization" && roles.includes("super_admin") && (
            <div className="mt-6 space-y-4">
              <Input label="Nom de l'entreprise" name="name" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
              <Input label="SMTP Host" name="smtp_host" value={org.smtp_host} onChange={(e) => setOrg({ ...org, smtp_host: e.target.value })} />
              <Input label="SMTP Port" name="smtp_port" value={org.smtp_port} onChange={(e) => setOrg({ ...org, smtp_port: e.target.value })} />
              <Input label="SMTP User" name="smtp_user" value={org.smtp_user} onChange={(e) => setOrg({ ...org, smtp_user: e.target.value })} />
              <Input label="SMTP Password" type="password" name="smtp_password" value={org.smtp_password} onChange={(e) => setOrg({ ...org, smtp_password: e.target.value })} />
              <Input label="Email expéditeur par défaut" name="default_from_email" value={org.default_from_email} onChange={(e) => setOrg({ ...org, default_from_email: e.target.value })} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={org.smtp_use_tls} onChange={(e) => setOrg({ ...org, smtp_use_tls: e.target.checked })} /> Utiliser TLS
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={org.smtp_use_ssl} onChange={(e) => setOrg({ ...org, smtp_use_ssl: e.target.checked })} /> Utiliser SSL
              </label>
              <button onClick={handleOrgUpdate} type="button" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                Mettre à jour l'entreprise
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Profile

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input {...props} className="w-full border px-4 py-2 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
    </div>
  )
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <select name={name} value={value} onChange={onChange} className="w-full border px-4 py-2 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        {Object.entries(options).map(([val, text]) => (
          <option key={val} value={val}>{text}</option>
        ))}
      </select>
    </div>
  )
}

function SubmitButton({ label }) {
  return (
    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
      {label}
    </button>
  )
}