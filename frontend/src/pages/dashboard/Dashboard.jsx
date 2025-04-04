import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { Link } from "react-router-dom"

function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const decoded = token ? jwtDecode(token) : null

  const goToRegister = () => {
    navigate("/register")
  }

  const roles = JSON.parse(localStorage.getItem("roles") || "[]")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("roles")
    localStorage.setItem("language", me.data.language || "fr")
    localStorage.setItem("date_format", me.data.date_format || "DD/MM/YYYY")
    localStorage.setItem("theme", me.data.theme || "light")
    navigate("/")
  }

  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-4">Bienvenue 👋</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Vous êtes connecté à ElStudio.
        </p>

        {decoded && (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow mb-4">
            <p>
              <strong>ID utilisateur :</strong> {decoded.sub}
            </p>
            <p>
              <strong>Rôles :</strong> {decoded.roles?.join(", ")}
            </p>
            <p>
              <strong>Exp (timestamp) :</strong> {decoded.exp}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Se déconnecter
        </button>
      </div>


      {roles.includes("super_admin") && (
  <div
  onClick={() => navigate("/employee")}
  className="cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition w-full max-w-xs text-center"
>
  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">👥 Employés</h2>
  <p className="text-gray-500 dark:text-gray-300 mt-2">Gérer les utilisateurs</p>
</div>
      )}
    </div>
  )
}

export default Dashboard
