"use client"
import { TaskForm } from '@/app/components/TaskForm';
import { TaskList } from '@/app/components/TaskList';
import { useTasks } from '@/app/hooks/useTasks';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, Bot, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { tasks, stats, isSubmitting, submitTask, refreshTasks } = useTasks();

  return (
    <div className="min-h-screen bg-background bg-grid">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Web Scraper AI
                </h1>
                <p className="text-xs text-muted-foreground">
                  Analyze websites with AI
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshTasks()}
              className="text-muted-foreground"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-start items-start gap-10">
          <div className="space-y-6">
            <TaskForm onSubmit={submitTask} isSubmitting={isSubmitting} />
            
            <div className="grid grid-cols-2 gap-3">
              <StatCard 
                icon={Database} 
                label="Total Tasks" 
                value={stats.total} 
              />
              <StatCard 
                icon={Zap} 
                label="Processing" 
                value={stats.processing}
                highlight={stats.processing > 0}
              />
            </div>
            
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                Powered by
              </p>
              <p className="text-sm text-muted-foreground">
                PostgreSQL • BullMQ • OpenAI • Next.js
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Task Queue
              </h2>
              <div className="flex gap-2">
                {stats.pending > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {stats.pending} pending
                  </Badge>
                )}
                {stats.completed > 0 && (
                  <Badge variant="outline" className="text-xs text-status-completed border-status-completed/30">
                    {stats.completed} done
                  </Badge>
                )}
              </div>
            </div>
            
            <TaskList tasks={tasks} />
          </div>
        </div>
      </main>
    </div>
  );
};

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  highlight = false 
}: { 
  icon: typeof Database; 
  label: string; 
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`
      p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm
      ${highlight ? 'border-primary/50 glow-primary' : ''}
    `}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}

export default Home;
