
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MainCategory, SubCategory, TimeEntry, TimeAnalytics, DateRange, TimeAnalyticsSummary, PeriodType } from '@/types';
import { useAuth } from './AuthContext';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, differenceInMinutes } from 'date-fns';
import { toast } from '@/components/ui/sonner';

// Initial mock data
const INITIAL_MAIN_CATEGORIES: MainCategory[] = [
  { id: '1', name: 'Development' },
  { id: '2', name: 'Meetings' },
  { id: '3', name: 'Documentation' },
  { id: '4', name: 'Research' },
  { id: '5', name: 'Leave', isLeave: true }
];

const INITIAL_SUB_CATEGORIES: SubCategory[] = [
  { id: '1', name: 'Frontend', mainCategoryId: '1' },
  { id: '2', name: 'Backend', mainCategoryId: '1' },
  { id: '3', name: 'DevOps', mainCategoryId: '1' },
  { id: '4', name: 'Testing', mainCategoryId: '1' },
  { id: '5', name: 'Client Meeting', mainCategoryId: '2' },
  { id: '6', name: 'Team Meeting', mainCategoryId: '2' },
  { id: '7', name: 'Sprint Planning', mainCategoryId: '2' },
  { id: '8', name: 'Technical Specifications', mainCategoryId: '3' },
  { id: '9', name: 'User Manuals', mainCategoryId: '3' },
  { id: '10', name: 'API Documentation', mainCategoryId: '3' },
  { id: '11', name: 'New Technologies', mainCategoryId: '4' },
  { id: '12', name: 'Market Analysis', mainCategoryId: '4' },
  { id: '13', name: 'Competitor Research', mainCategoryId: '4' },
  { id: '14', name: 'Vacation', mainCategoryId: '5', isLeave: true },
  { id: '15', name: 'Sick Leave', mainCategoryId: '5', isLeave: true },
  { id: '16', name: 'Personal Leave', mainCategoryId: '5', isLeave: true }
];

// Generate some mock time entries
const generateMockTimeEntries = (): TimeEntry[] => {
  const entries: TimeEntry[] = [];
  const users = ['1', '2', '3']; // Mock user IDs
  const today = new Date();
  
  for (let i = 0; i < 50; i++) {
    const userId = users[Math.floor(Math.random() * users.length)];
    const date = format(subDays(today, Math.floor(Math.random() * 30)), 'yyyy-MM-dd');
    const mainCategoryId = INITIAL_MAIN_CATEGORIES[Math.floor(Math.random() * INITIAL_MAIN_CATEGORIES.length)].id;
    const filteredSubCategories = INITIAL_SUB_CATEGORIES.filter(sc => sc.mainCategoryId === mainCategoryId);
    const subCategoryId = filteredSubCategories[Math.floor(Math.random() * filteredSubCategories.length)].id;
    
    const startHour = 8 + Math.floor(Math.random() * 8);
    const startTime = `${startHour.toString().padStart(2, '0')}:00`;
    const durationHours = 1 + Math.floor(Math.random() * 4);
    const endHour = startHour + durationHours;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    entries.push({
      id: (i + 1).toString(),
      userId,
      date,
      startTime,
      endTime,
      mainCategoryId,
      subCategoryId,
      description: `Mock entry ${i + 1}`,
      duration: durationHours * 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return entries;
};

const INITIAL_TIME_ENTRIES = generateMockTimeEntries();

interface DataContextType {
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
  timeEntries: TimeEntry[];
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTimeEntry: (entry: TimeEntry) => void;
  deleteTimeEntry: (id: string) => void;
  getSubCategoriesForMainCategory: (mainCategoryId: string) => SubCategory[];
  getUserTimeEntries: (userId: string) => TimeEntry[];
  calculateAnalytics: (userId: string | null, dateRange: DateRange) => TimeAnalytics;
  getDateRangeForPeriod: (periodType: PeriodType, customRange?: DateRange) => DateRange;
  findTimeEntryById: (id: string) => TimeEntry | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mainCategories, setMainCategories] = useState<MainCategory[]>(INITIAL_MAIN_CATEGORIES);
  const [subCategories, setSubCategories] = useState<SubCategory[]>(INITIAL_SUB_CATEGORIES);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const { currentUser } = useAuth();

  // Load time entries from local storage
  useEffect(() => {
    const storedEntries = localStorage.getItem('timeEntries');
    if (storedEntries) {
      setTimeEntries(JSON.parse(storedEntries));
    } else {
      // Use mock data for initial setup
      setTimeEntries(INITIAL_TIME_ENTRIES);
      localStorage.setItem('timeEntries', JSON.stringify(INITIAL_TIME_ENTRIES));
    }
  }, []);

  // Save time entries to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  const addTimeEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTimeEntries(prev => [...prev, newEntry]);
    toast.success('Time entry added successfully');
  };

  const updateTimeEntry = (updatedEntry: TimeEntry) => {
    setTimeEntries(prev => 
      prev.map(entry => 
        entry.id === updatedEntry.id 
          ? { ...updatedEntry, updatedAt: new Date().toISOString() }
          : entry
      )
    );
    toast.success('Time entry updated successfully');
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    toast.success('Time entry deleted successfully');
  };

  const getSubCategoriesForMainCategory = (mainCategoryId: string): SubCategory[] => {
    return subCategories.filter(subCat => subCat.mainCategoryId === mainCategoryId);
  };

  const getUserTimeEntries = (userId: string): TimeEntry[] => {
    return timeEntries.filter(entry => entry.userId === userId);
  };

  const findTimeEntryById = (id: string): TimeEntry | undefined => {
    return timeEntries.find(entry => entry.id === id);
  };

  const getDateRangeForPeriod = (periodType: PeriodType, customRange?: DateRange): DateRange => {
    const today = new Date();
    
    switch (periodType) {
      case 'this_week': {
        const start = startOfWeek(today, { weekStartsOn: 1 });
        const end = endOfWeek(today, { weekStartsOn: 1 });
        return {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd')
        };
      }
      case 'last_week': {
        const lastWeekStart = subDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
        const lastWeekEnd = subDays(endOfWeek(today, { weekStartsOn: 1 }), 7);
        return {
          startDate: format(lastWeekStart, 'yyyy-MM-dd'),
          endDate: format(lastWeekEnd, 'yyyy-MM-dd')
        };
      }
      case 'this_month': {
        const start = startOfMonth(today);
        const end = endOfMonth(today);
        return {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd')
        };
      }
      case 'last_month': {
        const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const start = startOfMonth(lastMonthDate);
        const end = endOfMonth(lastMonthDate);
        return {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd')
        };
      }
      case 'custom':
        if (customRange) {
          return customRange;
        }
        // Default to last 30 days if no custom range provided
        return {
          startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      default:
        return {
          startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
    }
  };

  const calculateAnalytics = (userId: string | null, dateRange: DateRange): TimeAnalytics => {
    // Filter entries by date range and user (if specified)
    const filteredEntries = timeEntries.filter(entry => {
      const entryDate = entry.date;
      const isInDateRange = entryDate >= dateRange.startDate && entryDate <= dateRange.endDate;
      return isInDateRange && (userId ? entry.userId === userId : true);
    });

    let totalDuration = 0;
    const categorySummaries: Record<string, TimeAnalyticsSummary> = {};

    // Calculate duration for each entry and group by main category
    filteredEntries.forEach(entry => {
      const { mainCategoryId, subCategoryId, duration } = entry;
      totalDuration += duration;

      // Get category names
      const mainCategory = mainCategories.find(cat => cat.id === mainCategoryId);
      const subCategory = subCategories.find(cat => cat.id === subCategoryId);

      if (!mainCategory || !subCategory) return;

      if (!categorySummaries[mainCategoryId]) {
        categorySummaries[mainCategoryId] = {
          mainCategory,
          subCategories: [],
          totalDuration: 0,
          percentage: 0
        };
      }

      // Update main category totals
      categorySummaries[mainCategoryId].totalDuration += duration;

      // Find or create sub-category summary
      let subCatSummary = categorySummaries[mainCategoryId].subCategories.find(
        sc => sc.subCategory.id === subCategoryId
      );

      if (!subCatSummary) {
        subCatSummary = {
          subCategory,
          duration: 0,
          percentage: 0,
          entries: []
        };
        categorySummaries[mainCategoryId].subCategories.push(subCatSummary);
      }

      // Update sub-category totals
      subCatSummary.duration += duration;
      subCatSummary.entries.push(entry);
    });

    // Calculate percentages
    const categorySummariesArray = Object.values(categorySummaries);
    categorySummariesArray.forEach(summary => {
      summary.percentage = totalDuration ? (summary.totalDuration / totalDuration) * 100 : 0;
      
      summary.subCategories.forEach(subCatSummary => {
        subCatSummary.percentage = summary.totalDuration 
          ? (subCatSummary.duration / summary.totalDuration) * 100 
          : 0;
      });
    });

    return {
      totalDuration,
      categorySummaries: categorySummariesArray,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };
  };

  return (
    <DataContext.Provider
      value={{
        mainCategories,
        subCategories,
        timeEntries,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        getSubCategoriesForMainCategory,
        getUserTimeEntries,
        calculateAnalytics,
        getDateRangeForPeriod,
        findTimeEntryById
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
