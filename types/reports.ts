export interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

export interface ReportSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportQuery {
  table: string;
  fields: string[];
  joins?: {
    table: string;
    on: {
      left: string;
      right: string;
    };
    fields?: string[];
  }[];
  filters?: ReportFilter[];
  groupBy?: string[];
  sort?: ReportSort[];
  limit?: number;
}

export interface TimeRangeFilter {
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  last?: number;
}

export interface ReportResult {
  data: any[];
  meta: {
    count: number;
    aggregations?: Record<string, any>;
  };
}

export interface ReportRequest {
  template_id?: string;
  query: ReportQuery;
  timeRange?: TimeRangeFilter;
  parameters?: Record<string, any>;
  chartConfig?: any;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  query_definition: Record<string, any>;
  chart_type: 'BAR' | 'LINE' | 'PIE' | 'TABLE' | 'CARD' | 'CUSTOM';
  permissions: Record<string, any> | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedReport {
  id: string;
  template_id: string | null;
  name: string;
  parameters: Record<string, any> | null;
  result_data: Record<string, any> | null;
  created_by: string | null;
  created_at: string;
}

export interface ReportChartConfig {
  type: 'BAR' | 'LINE' | 'PIE' | 'TABLE' | 'CARD' | 'CUSTOM';
  xAxis?: {
    field: string;
    label?: string;
  };
  yAxis?: {
    field: string;
    label?: string;
  };
  colorBy?: string;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  options?: Record<string, any>;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  reportId?: string;
  templateId?: string;
  type: 'CHART' | 'KPI' | 'TABLE' | 'LIST';
  size: 'sm' | 'md' | 'lg' | 'xl';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  settings: Record<string, any>;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  widgets: DashboardWidgetConfig[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
} 