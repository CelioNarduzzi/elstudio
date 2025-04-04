import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import DateTimeFooter from "./DateTimeFooter"

function Header({ children }) {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(response.data)

        // ⬛ appliquer le thème sur le <html>
        if (response.data.theme === "dark") {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }

      } catch (err) {
        console.error("Erreur lors de la récupération des infos utilisateur", err)
        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("roles")
          navigate("/")
        }
      }
    }

    const fetchOrganization = async () => {
      try {
        const response = await axios.get("http://localhost:8000/organization")
        setOrganization(response.data)
      } catch (err) {
        console.error("Erreur lors de la récupération de l'organisation", err)
        setOrganization(null)
      }
    }

    fetchUser().then(() => fetchOrganization())
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("roles")
    navigate("/")
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900 dark:text-gray-100">
        <p className="text-gray-500 dark:text-gray-300">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-white">
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between relative">
        {/* Colonne gauche : logo entreprise + nom */}
        <Link to="/dashboard" className="flex items-center gap-2">
          {organization?.logo_url && (
            <img src={organization.logo_url} alt="Logo" className="h-8 w-auto" />
          )}
          <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            {organization?.name || "ElStudioTemp"}
          </div>
        </Link>

        {/* Centre : logo ElStudio */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img src="/elstudio.svg" alt="ElStudio Logo" className="h-8" />
        </div>

        {/* Colonne droite : utilisateur */}
        <div className="relative" ref={menuRef}>
        <button
  onClick={() => setOpen(!open)}
  className="flex items-center gap-2 px-3 py-1 rounded-md
             bg-white text-gray-700 
             dark:bg-gray-700 dark:text-white 
             hover:bg-gray-100 dark:hover:bg-gray-600 transition"
>
  <img
    src={`https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=0D8ABC&color=fff`}
    alt="Avatar"
    className="w-9 h-9 rounded-full"
  />
  <span className="font-medium">
    {user.first_name} {user.last_name}
  </span>
</button>


          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg py-2 z-50">
              <div className="px-4 py-2 text-sm text-gray-400 dark:text-gray-300">
                {user.roles?.[0] || "Rôle inconnu"}
              </div>
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Mon compte
              </Link>
              <button
  onClick={handleLogout}
  className="w-full text-left px-4 py-2 text-sm 
             bg-white text-red-600 hover:bg-gray-100 
             dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
>
  Se déconnecter
</button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow p-6">{children}</main>

      <DateTimeFooter
      language={user.language}
      date_format={user.date_format}
      hour_format={user.time_format}
    />
    </div>

    
  )
}

export default Header
