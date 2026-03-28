import { useState } from "react";
import { useBloom } from "@/contexts/BloomContext";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const PlanAssignment = () => {
  const { tasks, addTask, removeTask, projectName, dueDate } = useBloom();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addTask({ name: name.trim(), description: description.trim(), estimatedHours: Number(hours) || 1 });
    setName("");
    setDescription("");
    setHours("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Plan Assignment</h1>
        <p className="text-muted-foreground mt-1">Break your assignment down into actionable tasks.</p>
      </div>

      {/* Project info */}
      <div className="bloom-card mb-6 flex gap-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Project</p>
          <p className="font-semibold text-foreground">{projectName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Due Date</p>
          <p className="font-semibold text-foreground">{dueDate}</p>
        </div>
      </div>

      {/* Add task form */}
      <div className="bloom-card mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Add Task
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="Task name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2">
            <Input placeholder="Est. hours" type="number" min={1} value={hours} onChange={(e) => setHours(e.target.value)} />
            <Button onClick={handleAdd} className="shrink-0">Add</Button>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="bloom-card mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Tasks Added ({tasks.length})</h2>
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{task.name}</p>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {task.estimatedHours}h
                  </span>
                  <button onClick={() => removeTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Button onClick={() => navigate("/calendar")} className="gap-2">
        Next: Personal Calendar <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default PlanAssignment;
