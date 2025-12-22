import { Task, TaskStatus } from '@/app/types/Tasks';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
}

const statusConfig: Record<TaskStatus, {
  icon: typeof Clock;
  label: string;
  className: string;
}> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'bg-status-pending/20 text-status-pending border-status-pending/30',
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    className: 'bg-status-processing/20 text-status-processing border-status-processing/30',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    className: 'bg-status-completed/20 text-status-completed border-status-completed/30',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    className: 'bg-status-failed/20 text-status-failed border-status-failed/30',
  },
};

export function TaskCard({ task }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[task.status];
  const StatusIcon = config.icon;
  
  const hostname = (() => {
    try {
      return new URL(task.websiteUrl).hostname;
    } catch {
      return task.websiteUrl;
    }
  })();

  return (
    <Card className={cn(
      "border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300",
      task.status === 'processing' && "border-status-processing/50 glow-primary"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <a 
                href={task.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline truncate"
              >
                {hostname}
              </a>
            </div>
            
            <p className="text-sm text-foreground line-clamp-2 mb-3">
              {task.question}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn("gap-1 text-xs font-medium", config.className)}
              >
                <StatusIcon className={cn(
                  "h-3 w-3",
                  task.status === 'processing' && "animate-spin"
                )} />
                {config.label}
              </Badge>
              
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(task.createdAt)}
              </span>
            </div>
          </div>
          
          {(task.status === 'completed' || task.status === 'failed') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/50">
            {task.status === 'completed' && task.aiAnswer && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  AI Answer
                </p>
                <div className="text-sm text-foreground bg-background/50 rounded-lg p-4 whitespace-pre-wrap">
                  {task.aiAnswer}
                </div>
              </div>
            )}
            
            {task.status === 'failed' && task.errorMessage && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-status-failed uppercase tracking-wide">
                  Error
                </p>
                <p className="text-sm text-muted-foreground">
                  {task.errorMessage}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return date.toLocaleDateString();
}
