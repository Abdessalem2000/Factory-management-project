// Re-export shared types from backend
export * from '../../../shared/types';

// Additional frontend-specific types
export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  current: boolean;
}

export interface SidebarProps {
  children: React.ReactNode;
}

export interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
