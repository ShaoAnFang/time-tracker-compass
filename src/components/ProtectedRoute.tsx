
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (requireAdmin && !isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, isAdmin, navigate, requireAdmin]);
  
  if (!currentUser) {
    return null;
  }
  
  if (requireAdmin && !isAdmin) {
    return null;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
