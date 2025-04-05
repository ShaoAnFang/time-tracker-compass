
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface MainCategory {
  id: string;
  name: string;
  isLeave?: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  mainCategoryId: string;
  isLeave?: boolean;
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  mainCategoryId: string;
  subCategoryId: string;
  description: string;
  duration: number; // duration in minutes
  createdAt: string;
  updatedAt: string;
}

export interface TimeAnalyticsSummary {
  mainCategory: MainCategory;
  subCategories: Array<{
    subCategory: SubCategory;
    duration: number;
    percentage: number;
    entries: TimeEntry[];
  }>;
  totalDuration: number;
  percentage: number;
}

export interface TimeAnalytics {
  totalDuration: number;
  categorySummaries: TimeAnalyticsSummary[];
  startDate: string;
  endDate: string;
}

export type PeriodType = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}
