import { useState } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const token = localStorage.getItem("token")
  const decoded = token ? jwtDecode(token) : null
  const userId = decoded?.sub

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError("")
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    try {
      await axios.put("http://localhost:8000/auth/change-password-on-first-login", {
        new_password: newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setSuccess("Mot de passe changé avec succès ✅")
      setTimeout(() => navigate("/dashboard"), 1500)

    } catch (err) {
      setError("Erreur : Aucun utilisateur à mettre à jour.")
    }
  }

  if (!userId) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Utilisateur non connecté. <br />
        <a href="/" className="underline text-blue-500">Retour au login</a>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleChangePassword} className="bg-white p-8 shadow-md rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Changer votre mot de passe</h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}

        <div className="mb-4">
          <label className="block text-gray-700">Nouveau mot de passe</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Confirmer le mot de passe</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </form>
    </div>
  )
}

export default ChangePassword
