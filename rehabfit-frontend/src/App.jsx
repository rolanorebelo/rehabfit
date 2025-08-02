import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <GoogleOAuthProvider clientId="477022837854-r1nt2k3r2bq6j5hcbf4d0t0t8lefpune.apps.googleusercontent.com">
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer position="top-center" autoClose={3000} />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;