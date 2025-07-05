import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    // Redirige vers / en sauvegardant l'emplacement actuel
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si des rôles sont spécifiés et que l'utilisateur n'a pas le bon rôle
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirige vers le dashboard avec un message d'erreur si besoin
    return <Navigate to="/dashboard" state={{ error: "Accès non autorisé" }} replace />;
  }

  return children;
};

export default ProtectedRoute;