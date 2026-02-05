import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApplicationStatus } from '@/types';

interface StatusBadgeProps {
    status: ApplicationStatus | string;
    showIcon?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function StatusBadge({ status, showIcon = false, className, children }: StatusBadgeProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Received':
                return {
                    color: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
                    icon: <Clock className="h-4 w-4 mr-1" />,
                };
            case 'Under Review':
                return {
                    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
                    icon: <Clock className="h-4 w-4 mr-1" />,
                };
            case 'Approved':
                return {
                    color: 'bg-green-100 text-green-800 hover:bg-green-100',
                    icon: <CheckCircle className="h-4 w-4 mr-1" />,
                };
            case 'Rejected':
                return {
                    color: 'bg-red-100 text-red-800 hover:bg-red-100',
                    icon: <XCircle className="h-4 w-4 mr-1" />,
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
                    icon: <Clock className="h-4 w-4 mr-1" />,
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Badge
            className={cn(config.color, className, showIcon ? "pl-2" : "")}
            variant="outline"
        >
            {showIcon && config.icon}
            {children || status}
        </Badge>
    );
}
