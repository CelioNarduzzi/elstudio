import { useState } from "react"
import axios from "axios"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    try {
      await axios.post("http://localhost:8000/auth/forgot-password", {
        email,
      })
      setMessage("Un email de réinitialisation a été envoyé ✅")
    } catch (err) {
      setError("Aucun utilisateur trouvé avec cet email.")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Mot de passe oublié</h2>

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Envoyer le lien de réinitialisation
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <a href="/" className="text-blue-600 hover:underline">
            Retour à la connexion
          </a>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
