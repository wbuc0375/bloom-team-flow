import { useBloom } from "@/contexts/BloomContext";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const dayLabels = ["26/4", "27/4", "28/4", "29/4", "30/4", "1/5", "2/5"];
const colors = [
  "bg-primary/70",
  "bg-bloom-sky/70",
  "bg-bloom-petal/70",
  "bg-bloom-sun/70",
];

const GanttChart = () => {
  const { delegatedTasks } = useBloom();
  const navigate = useNavigate();
  const approvedTasks = delegatedTasks.filter(t => t.status === "approved");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Gantt Chart</h1>
        <p className="text-muted-foreground mt-1">Timeline view of approved tasks.</p>
      </div>

      <div className="bloom-card overflow-x-auto mb-6">
        {/* Header */}
        <div className="grid gap-0" style={{ gridTemplateColumns: "200px repeat(7, 1fr)" }}>
          <div className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Task</div>
          {dayLabels.map((d) => (
            <div key={d} className="p-3 text-sm text-center text-muted-foreground border-b border-l border-border">{d}</div>
          ))}

          {/* Rows */}
          {delegatedTasks.map((task, i) => {
            const isApproved = task.status === "approved";
            const startCol = i % 4;
            const span = Math.min(task.estimatedHours, 7 - startCol);
            return (
              <div key={task.id} className="contents">
                <div className="p-3 text-sm text-foreground border-b border-border">
                  <p className="font-medium">{task.name}</p>
                  <p className="text-xs text-muted-foreground">{task.assignedTo}</p>
                </div>
                {dayLabels.map((_, colIdx) => (
                  <div key={colIdx} className="p-1 border-b border-l border-border min-h-[3rem] flex items-center">
                    {colIdx === startCol && isApproved && (
                      <div
                        className={`h-7 rounded-md ${colors[i % colors.length]} flex items-center px-2 text-xs font-medium text-primary-foreground`}
                        style={{ width: `${span * 100}%`, minWidth: "100%" }}
                      >
                        {task.estimatedHours}h
                      </div>
                    )}
                    {colIdx === startCol && !isApproved && (
                      <div className="h-7 rounded-md bg-muted border border-dashed border-border flex items-center px-2 text-xs text-muted-foreground" style={{ width: "100%" }}>
                        Pending
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <Button onClick={() => navigate("/flower")} className="gap-2">
        View Flower Progress <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default GanttChart;
