
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { format } from 'date-fns';
import { DateRange, PeriodType, TimeAnalyticsSummary } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow
} from '@/components/ui/table';
import TimeEntryList from './TimeEntryList';

const COLORS = [
  '#8b5cf6', // Primary purple
  '#a78bfa', // Medium purple
  '#c4b5fd', // Light purple
  '#6d28d9', // Dark purple
  '#4c1d95', // Deeper purple
  '#7c3aed', // Bright purple
  '#5b21b6', // Rich purple
  '#ddd6fe', // Pale purple
  '#9333ea', // Magenta purple
  '#6366f1', // Indigo
];

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onRangeChange: (range: { from: Date; to: Date }) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onRangeChange,
}) => {
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startDate,
    to: endDate,
  });

  // When a date changes in the calendar component
  const handleSelect = (selectedDate: any) => {
    const { from, to } = selectedDate;
    setDate(selectedDate);
    
    if (from && to) {
      onRangeChange({ from, to });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
                </>
              ) : (
                format(date.from, "MMM d, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={startDate}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const TimeAnalytics: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { calculateAnalytics, getDateRangeForPeriod } = useData();
  
  const [periodType, setPeriodType] = useState<PeriodType>('this_week');
  const [customDateRange, setCustomDateRange] = useState<DateRange>(
    getDateRangeForPeriod('custom')
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    currentUser?.id || null
  );

  // Get the date range based on period type
  const dateRange = periodType === 'custom'
    ? customDateRange
    : getDateRangeForPeriod(periodType);

  // Get analytics data
  const analytics = calculateAnalytics(
    isAdmin ? selectedUserId : currentUser?.id || null,
    dateRange
  );

  // Prepare data for charts
  const pieChartData = analytics.categorySummaries.map(summary => ({
    name: summary.mainCategory.name,
    value: summary.totalDuration,
    color: COLORS[parseInt(summary.mainCategory.id) % COLORS.length]
  }));

  const barChartData = analytics.categorySummaries.map(summary => ({
    name: summary.mainCategory.name,
    duration: Math.round(summary.totalDuration / 60), // Convert to hours
    color: COLORS[parseInt(summary.mainCategory.id) % COLORS.length]
  }));

  // Handle period change
  const handlePeriodChange = (value: string) => {
    setPeriodType(value as PeriodType);
  };

  // Handle custom date range change
  const handleCustomDateChange = (range: { from: Date; to: Date }) => {
    setCustomDateRange({
      startDate: format(range.from, 'yyyy-MM-dd'),
      endDate: format(range.to, 'yyyy-MM-dd')
    });
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNoEntries = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No time entries found</h3>
        <p className="text-sm text-gray-500 mt-2">
          There are no time entries for the selected period.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Select 
            value={periodType} 
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {periodType === 'custom' && (
            <DateRangePicker
              startDate={new Date(customDateRange.startDate)}
              endDate={new Date(customDateRange.endDate)}
              onRangeChange={handleCustomDateChange}
            />
          )}
        </div>
        
        {isAdmin && (
          <Select 
            value={selectedUserId || 'all'} 
            onValueChange={(value) => setSelectedUserId(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value={currentUser?.id || ''}>Your Entries</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Time Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="text-2xl font-bold">{formatDuration(analytics.totalDuration)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="text-md">
                    {format(new Date(dateRange.startDate), 'MMM d')} - {format(new Date(dateRange.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              {analytics.totalDuration > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatDuration(value)} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                handleNoEntries()
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.totalDuration > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => [`${value} hours`, 'Duration']} />
                  <Legend />
                  <Bar dataKey="duration" name="Hours">
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              handleNoEntries()
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Analysis */}
      {analytics.totalDuration > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" value={expandedCategories}>
              {analytics.categorySummaries.map((summary) => (
                <AccordionItem 
                  value={summary.mainCategory.id} 
                  key={summary.mainCategory.id}
                >
                  <AccordionTrigger
                    onClick={() => toggleCategoryExpansion(summary.mainCategory.id)}
                    className="hover:no-underline"
                  >
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: COLORS[parseInt(summary.mainCategory.id) % COLORS.length] 
                          }}
                        />
                        <span>{summary.mainCategory.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500">{formatDuration(summary.totalDuration)}</span>
                        <span className="text-gray-500">{summary.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-5 space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sub-Category</TableHead>
                            <TableHead className="text-right">Duration</TableHead>
                            <TableHead className="text-right">Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary.subCategories.map((subCat) => (
                            <TableRow key={subCat.subCategory.id}>
                              <TableCell>{subCat.subCategory.name}</TableCell>
                              <TableCell className="text-right">{formatDuration(subCat.duration)}</TableCell>
                              <TableCell className="text-right">{subCat.percentage.toFixed(1)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Time Entries</h4>
                        {summary.subCategories.flatMap(subCat => subCat.entries).length > 0 ? (
                          <TimeEntryList 
                            entries={summary.subCategories.flatMap(subCat => subCat.entries)}
                            onEdit={() => {}}
                            onDelete={() => {}}
                          />
                        ) : (
                          <p className="text-sm text-gray-500">No detailed entries available.</p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimeAnalytics;
