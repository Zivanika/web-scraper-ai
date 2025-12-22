export async function fetchTasks() {
    const res = await fetch("/api/tasks");
    return res.json();
}