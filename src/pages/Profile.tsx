
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useData } from '@/contexts/DataContext';
import { Clock, CalendarDays } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { getUserTimeEntries } = useData();
  
  if (!currentUser) {
    return null;
  }
  
  const userEntries = getUserTimeEntries(currentUser.id);
  
  // Calculate total hours tracked
  const totalMinutes = userEntries.reduce((acc, entry) => acc + entry.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  // Find the first and most recent entry
  const sortedEntries = [...userEntries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const firstEntry = sortedEntries[0];
  const lastEntry = sortedEntries[sortedEntries.length - 1];
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
                  {currentUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-bold">{currentUser.username}</h3>
              <p className="text-sm text-gray-500 mb-4">{currentUser.email}</p>
              
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-6">
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => logout()}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Time Tracking Statistics</CardTitle>
              <CardDescription>
                Summary of your time tracking activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Total Time Tracked</h4>
                  </div>
                  <p className="text-2xl font-bold">{totalHours}h {remainingMinutes}m</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarDays className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Total Entries</h4>
                  </div>
                  <p className="text-2xl font-bold">{userEntries.length}</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Avg. Daily Hours</h4>
                  </div>
                  <p className="text-2xl font-bold">
                    {userEntries.length > 0 
                      ? (totalHours / new Set(userEntries.map(e => e.date)).size).toFixed(1) 
                      : '0'}h
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Time Tracking History</h4>
                <div className="space-y-3">
                  {firstEntry && (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">First Time Entry</p>
                        <p className="text-sm text-gray-500">When you started tracking time</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{new Date(firstEntry.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{firstEntry.startTime}</p>
                      </div>
                    </div>
                  )}
                  
                  {lastEntry && (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Most Recent Entry</p>
                        <p className="text-sm text-gray-500">Your latest time tracking activity</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{new Date(lastEntry.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{lastEntry.startTime}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
