
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Mock user data for demo
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    role: 'user'
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@example.com',
    role: 'user'
  }
];

const Users: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { getUserTimeEntries } = useData();
  const navigate = useNavigate();
  
  if (!currentUser || !isAdmin) {
    navigate('/dashboard');
    return null;
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users and their permissions
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Time Entries</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_USERS.map(user => {
                  const userEntries = getUserTimeEntries(user.id);
                  const totalMinutes = userEntries.reduce((acc, entry) => acc + entry.duration, 0);
                  const totalHours = Math.floor(totalMinutes / 60);
                  const remainingMinutes = totalMinutes % 60;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-100 text-purple-800">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {userEntries.length} entries
                        <div className="text-xs text-gray-500">
                          {totalHours}h {remainingMinutes}m total
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // In a real application, this would navigate to a user-specific analytics page
                            // For demo purposes, we'll just alert
                            alert(`View analytics for ${user.username}`);
                          }}
                        >
                          View Analytics
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Users;
