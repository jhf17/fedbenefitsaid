import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Generate route-aware message
    let message = 'Please sign in to continue.'
    const path = location.pathname.toLowerCase()

    if (path.includes('chat')) {
      message = 'Please sign in to access the AI Chat.'
    }

    // Redirect to login, saving the page they tried to visit
    return <Navigate to="/login" state={{ from: location, message }} replace />
  }

  return children
}
