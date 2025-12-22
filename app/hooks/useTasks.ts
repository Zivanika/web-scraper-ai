import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, CreateTaskInput } from "@/app/types/Tasks";
import { getAllTasks, createTask, taskKeys } from "@/app/store/taskStore";

export function useTasks() {
  const queryClient = useQueryClient();

  // Query to fetch all tasks with auto-refetch for real-time updates
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch: refreshTasks,
  } = useQuery({
    queryKey: taskKeys.lists(),
    queryFn: getAllTasks,
    refetchInterval: 3000, // Poll every 3 seconds for task updates
    staleTime: 2000, // Consider data stale after 2 seconds
  });

  // Mutation to create a new task
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Optimistically update the cache with the new task
      queryClient.setQueryData<Task[]>(taskKeys.lists(), (oldTasks = []) => {
        return [newTask, ...oldTasks];
      });
      
      // Optionally refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      // Invalidate queries to refetch on error
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  // Derived stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    processing: tasks.filter((t) => t.status === "processing").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };

  const submitTask = async (input: CreateTaskInput) => {
    return createTaskMutation.mutateAsync(input);
  };

  return {
    tasks,
    stats,
    isSubmitting: createTaskMutation.isPending,
    isLoading,
    error,
    submitTask,
    refreshTasks,
  };
}
