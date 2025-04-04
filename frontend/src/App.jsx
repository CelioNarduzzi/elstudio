import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

// 📦 Pages
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import ChangePassword from "./pages/auth/ChangePassword"

import Dashboard from "./pages/dashboard/Dashboard"
import Profile from "./pages/dashboard/Profile"
import Employee from "./pages/dashboard/Employee"

import EditUser from "./pages/users/EditUser"
import InactiveUsers from "./pages/users/InactiveUsers"

// 🧩 Composants
import PrivateRoute from "./components/PrivateRoute"
import Header from "./components/Header"

function App() {
  const roles = JSON.parse(localStorage.getItem("roles") || "[]")

  const [preferences, setPreferences] = useState({
    language: "fr",
    date_format: "DD/MM/YYYY",
  })

  // ⚙️ Chargement des préférences utilisateur (thème, langue...)
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchPreferences = async () => {
      try {
        const res = await axios.get("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const theme = res.data.theme || "light"
        document.documentElement.classList.toggle("dark", theme === "dark")

        setPreferences({
          language: res.data.language || "fr",
          date_format: res.data.date_format || "DD/MM/YYYY",
        })
      } catch (err) {
        console.error("Erreur chargement préférences", err)
      }
    }

    fetchPreferences()
  }, [])

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 Authentification */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={
          roles.includes("super_admin") ? (
            <PrivateRoute>
              <Header><Register /></Header>
            </PrivateRoute>
          ) : (
            <PrivateRoute>
              <Header>
                <div className="p-8 text-center text-red-500 text-lg font-semibold">
                  🚫 Accès interdit : seuls les super administrateurs peuvent accéder à cette page.
                </div>
              </Header>
            </PrivateRoute>
          )
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        } />

        {/* 🏠 Dashboard principal */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Header><Dashboard /></Header>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Header><Profile /></Header>
          </PrivateRoute>
        } />

        {/* 👥 Gestion des employés */}
        <Route path="/employee" element={
          roles.includes("super_admin") ? (
            <PrivateRoute>
              <Header><Employee /></Header>
            </PrivateRoute>
          ) : (
            <PrivateRoute>
              <Header>
                <div className="p-8 text-center text-red-500 text-lg font-semibold">
                  🚫 Accès interdit : seuls les super administrateurs peuvent accéder à cette page.
                </div>
              </Header>
            </PrivateRoute>
          )
        } />

        <Route path="/employee/:id" element={
          roles.includes("super_admin") ? (
            <PrivateRoute>
              <Header><EditUser /></Header>
            </PrivateRoute>
          ) : (
            <PrivateRoute>
              <Header>
                <div className="p-8 text-center text-red-500 text-lg font-semibold">
                  🚫 Accès interdit.
                </div>
              </Header>
            </PrivateRoute>
          )
        } />

        <Route path="/inactive-users" element={
          roles.includes("super_admin") ? (
            <PrivateRoute>
              <Header><InactiveUsers /></Header>
            </PrivateRoute>
          ) : (
            <PrivateRoute>
              <Header>
                <div className="p-8 text-center text-red-500 text-lg font-semibold">
                  🚫 Accès interdit : seuls les super administrateurs peuvent accéder à cette page.
                </div>
              </Header>
            </PrivateRoute>
          )
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App
