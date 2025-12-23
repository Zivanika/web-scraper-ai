"use client";
import { TaskForm } from "@/app/components/TaskForm";
import { TaskList } from "@/app/components/TaskList";
import { useTasks } from "@/app/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Zap, Database, Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { tasks, stats, isSubmitting, isLoading, error, submitTask, refreshTasks } = useTasks();

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_90%,transparent_100%)]" />

      <header className="border-b border-gray-800/50 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10 relative">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Web Scraper AI
                </h1>
                <p className="text-xs text-gray-500">
                  Analyze websites with AI
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshTasks()}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative">
        <div className="flex flex-col md:flex-row justify-start items-start gap-10 w-full">
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

            <div className="hidden md:block p-4 rounded-lg bg-gray-900/30 border border-gray-800/50">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                Powered by
              </p>
              <p className="text-sm text-gray-400">
                PostgreSQL • BullMQ • Redis • Cheerio • OpenAI • Next.js
              </p>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Task Queue
              </h2>
              <div className="flex gap-2">
                {stats.pending > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-700 text-gray-400"
                  >
                    {stats.pending} pending
                  </Badge>
                )}
                {stats.completed > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-emerald-400 border-emerald-500/30"
                  >
                    {stats.completed} done
                  </Badge>
                )}
              </div>
            </div>

            <TaskList tasks={tasks} isLoading={isLoading} error={error} />
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
  highlight = false,
}: {
  icon: typeof Database;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
      p-4 rounded-lg border bg-gray-900/30 backdrop-blur-sm
      ${
        highlight
          ? "border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
          : "border-gray-800/50"
      }
    `}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon
          className={`h-4 w-4 ${highlight ? "text-teal-400" : "text-gray-500"}`}
        />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p
        className={`text-2xl font-semibold ${
          highlight ? "text-teal-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default Home;
