import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { jwtDecode } from "jwt-decode"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) navigate("/dashboard")
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const response = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      })
  
      const token = response.data.access_token
      const decoded = jwtDecode(token)
  
      localStorage.setItem("token", token)
      localStorage.setItem("roles", JSON.stringify(decoded.roles || []))
      localStorage.setItem("user_id", decoded.sub)
  
      // 🔥 Rediriger vers changement mot de passe si nécessaire
      if (response.data.must_change_password) {
        window.location.href = "/change-password"
      } else {
        window.location.href = "/dashboard"
      }
  
    } catch (err) {
      setError("Identifiants incorrects. Veuillez réessayer.")
    }
  }
  

  return (
    <div className="min-h-screen flex"> {/* ✅ flex ici pour faire deux colonnes */}
    {/* Colonne gauche */}
    <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 text-white w-1/2 p-10">
      <img src="/elstudio.svg" alt="ElStudio Logo" className="w-128 h-128" />
      <p className="mt-4 text-lg text-blue-100 text-center max-w-xs">
        Simplifiez la gestion de vos outils avec style.
      </p>
    </div>

     {/* Colonne droite */}
     <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
            Connexion à ElStudio
          </h2>

          {error && (
            <div className="text-red-600 text-sm text-center font-medium mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-black py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all">
              Se connecter
            </button>
            <p className="text-center text-sm text-blue-600 mt-4">
  <a href="/forgot-password" className="hover:underline">
    Mot de passe oublié ?
  </a>
</p>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} ElStudio – Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
