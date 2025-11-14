import { Filter } from 'lucide-react';

interface AlertFiltersProps {
  filter: string;
  severityFilter: string;
  onFilterChange: (filter: string) => void;
  onSeverityChange: (severity: string) => void;
}

export default function AlertFilters({
  filter,
  severityFilter,
  onFilterChange,
  onSeverityChange,
}: AlertFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-foreground mb-2">
          <Filter className="w-4 h-4 inline mr-2" />
          Status
        </label>
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Alerts</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-foreground mb-2">
          Severity
        </label>
        <select
          value={severityFilter}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
}
