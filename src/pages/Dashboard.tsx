
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ListChecks, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6d28d9', '#4c1d95'];

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { calculateAnalytics, getDateRangeForPeriod, getUserTimeEntries } = useData();
  const navigate = useNavigate();
  
  if (!currentUser) {
    return null;
  }
  
  // Get current week's date range
  const thisWeekRange = getDateRangeForPeriod('this_week');
  
  // Get user's time entries
  const userEntries = getUserTimeEntries(currentUser.id);
  
  // Get this week's analytics
  const weeklyAnalytics = calculateAnalytics(currentUser.id, thisWeekRange);
  
  // Prepare data for pie chart
  const pieChartData = weeklyAnalytics.categorySummaries.map((summary, index) => ({
    name: summary.mainCategory.name,
    value: summary.totalDuration,
    color: COLORS[index % COLORS.length]
  }));
  
  // Calculate total entries and recently added
  const totalEntries = userEntries.length;
  const recentEntries = userEntries.filter(entry => {
    const createdAt = new Date(entry.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;
  
  // Format duration for display
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate('/time-entries')}
          >
            Add Time Entry
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Hours This Week
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(weeklyAnalytics.totalDuration)}</div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(thisWeekRange.startDate), 'MMM d')} - {format(new Date(thisWeekRange.endDate), 'MMM d')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Time Entries
              </CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
              <p className="text-xs text-muted-foreground">
                {recentEntries} added in the last 7 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Main Categories
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyAnalytics.categorySummaries.length}</div>
              <p className="text-xs text-muted-foreground">
                Used this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Date
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{format(new Date(), 'MMM d, yyyy')}</div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), 'EEEE')}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Weekly Summary Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Time Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {weeklyAnalytics.totalDuration > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatDuration(value), 'Duration']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No time entries this week</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Start tracking your time to see analytics here.
                </p>
                <Button 
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate('/time-entries')}
                >
                  Add Time Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/time-entries')}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Clock className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-medium">Time Entries</h3>
              <p className="text-sm text-gray-500 mt-2">
                Add or manage your time entries
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/analytics')}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <BarChart3 className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-medium">Analytics</h3>
              <p className="text-sm text-gray-500 mt-2">
                View detailed time analytics
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/calendar')}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <CalendarIcon className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-medium">Calendar</h3>
              <p className="text-sm text-gray-500 mt-2">
                View your time entries in calendar view
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
