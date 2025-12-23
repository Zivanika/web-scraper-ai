import { Task } from '@/app/types/Tasks';
import { TaskCard } from './TaskCard';
import { ListTodo } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-900/50 border border-gray-800/50 flex items-center justify-center mb-4">
          <ListTodo className="h-8 w-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">
          No tasks yet
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Submit a website URL and question above to start analyzing websites with AI.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
