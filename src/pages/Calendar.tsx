
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TimeEntry } from '@/types';
import { format, parse, isSameDay } from 'date-fns';

const Calendar: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserTimeEntries, mainCategories, subCategories } = useData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!currentUser) {
    return null;
  }
  
  const userEntries = getUserTimeEntries(currentUser.id);
  
  // Get entries for the selected date
  const getEntriesForDate = (date: Date | undefined): TimeEntry[] => {
    if (!date) return [];
    
    return userEntries.filter(entry => {
      const entryDate = parse(entry.date, 'yyyy-MM-dd', new Date());
      return isSameDay(entryDate, date);
    });
  };
  
  const selectedDateEntries = getEntriesForDate(selectedDate);
  
  // Get dates with entries for highlighting in the calendar
  const datesWithEntries = userEntries.map(entry => 
    parse(entry.date, 'yyyy-MM-dd', new Date())
  );
  
  const getCategoryName = (categoryId: string, isMainCategory: boolean) => {
    if (isMainCategory) {
      return mainCategories.find(cat => cat.id === categoryId)?.name || 'Unknown';
    } else {
      return subCategories.find(cat => cat.id === categoryId)?.name || 'Unknown';
    }
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View your time entries in a calendar view
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Time Entries Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={date => {
                  setSelectedDate(date);
                  if (date) {
                    const entriesForDate = getEntriesForDate(date);
                    if (entriesForDate.length > 0) {
                      setIsDialogOpen(true);
                    }
                  }
                }}
                className="rounded-md border"
                modifiers={{
                  hasEntry: datesWithEntries,
                }}
                modifiersStyles={{
                  hasEntry: {
                    backgroundColor: '#f3e8ff',
                    color: '#6d28d9',
                    fontWeight: 'bold',
                  },
                }}
              />
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEntries.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    {selectedDateEntries.length} {selectedDateEntries.length === 1 ? 'entry' : 'entries'} for this date
                  </p>
                  
                  {selectedDateEntries.map(entry => (
                    <div 
                      key={entry.id} 
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{entry.startTime} - {entry.endTime}</span>
                        <span className="text-gray-500 text-sm">{formatDuration(entry.duration)}</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        {getCategoryName(entry.mainCategoryId, true)} / {getCategoryName(entry.subCategoryId, false)}
                      </div>
                      {entry.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{entry.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No entries for this date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Entries'}
              </DialogTitle>
              <DialogDescription>
                Time entries for this date
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto mt-4">
              {selectedDateEntries.map(entry => (
                <div key={entry.id} className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{entry.startTime} - {entry.endTime}</span>
                    <span className="text-gray-500">{formatDuration(entry.duration)}</span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm font-medium">Category: </span>
                    <span className="text-sm">
                      {getCategoryName(entry.mainCategoryId, true)} / {getCategoryName(entry.subCategoryId, false)}
                    </span>
                  </div>
                  
                  {entry.description && (
                    <div>
                      <span className="text-sm font-medium">Description: </span>
                      <p className="text-sm mt-1">{entry.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Calendar;
