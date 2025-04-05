
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const Index = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <Clock className="h-16 w-16 text-purple-600 mx-auto mb-6" />
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          TimeTracker
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          A comprehensive time tracking system with categorization, analytics, and user management.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          
          <Button
            variant="outline"
            className="text-lg px-8 py-3"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-purple-800 mb-2">Track Time</h3>
            <p className="text-gray-600">Log your work hours with detailed categorization</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-purple-800 mb-2">Analyze Data</h3>
            <p className="text-gray-600">View comprehensive reports and insights</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-purple-800 mb-2">Manage Users</h3>
            <p className="text-gray-600">Admin controls for team management</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
