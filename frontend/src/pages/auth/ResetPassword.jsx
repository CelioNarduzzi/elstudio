import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleReset = async (e) => {
    e.preventDefault()
    setMessage("")

    if (!token) {
      setMessage("Lien invalide.")
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.")
      return
    }

    try {
      await axios.post("http://localhost:8000/auth/reset-password", {
        token,
        new_password: newPassword,
      })

      setMessage("Mot de passe réinitialisé avec succès ✅")
      setTimeout(() => navigate("/"), 2000)
    } catch (err) {
      setMessage("Erreur lors de la réinitialisation.")
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Réinitialisation du mot de passe
        </h2>

        {message && (
          <p className="text-center mb-4 text-red-600 font-semibold">{message}</p>
        )}

        <div className="mb-4">
          <label className="block text-gray-700">Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Réinitialiser le mot de passe
        </button>
      </form>
    </div>
  )
}

export default ResetPassword
