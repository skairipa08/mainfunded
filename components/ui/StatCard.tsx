import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  valueClassName?: string;
}

export function StatCard({ title, value, subtitle, loading, icon, valueClassName }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <p className={`text-3xl font-bold ${valueClassName ?? 'text-gray-900'}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Skeleton className="h-4 w-28 mb-3" />
      <Skeleton className="h-8 w-24 mb-1" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
