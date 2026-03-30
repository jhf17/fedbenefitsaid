import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Redirect to login, saving the page they tried to visit
    return <Navigate to="/login" state={{ from: location, message: 'Please sign in to access the AI Chat.' }} replace />
  }

  return children
}
