import { useState } from "react";
import { useBloom, DelegatedTask } from "@/contexts/BloomContext";
import { CheckCircle2, RotateCcw, ArrowRight, Loader2, User, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const rejectionReasons = [
  "Not qualified for this task",
  "Outside of my skillset",
  "Schedule conflict",
  "Workload too heavy",
  "Other",
];

const statusConfig = {
  pending: { label: "Pending", className: "bloom-badge-pending" },
  approved: { label: "Approved", className: "bloom-badge-approved" },
  reassignment_requested: { label: "Reassignment Requested", className: "bloom-badge-rejected" },
  reassigned: { label: "Reassigned", className: "bloom-badge-pending" },
};

const DelegateTasks = () => {
  const { delegatedTasks, currentUser, approveTask, requestReassignment } = useBloom();
  const navigate = useNavigate();
  const [rejectingTask, setRejectingTask] = useState<DelegatedTask | null>(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [showProcessing, setShowProcessing] = useState(false);

  const handleApprove = (taskId: string) => {
    approveTask(taskId);
  };

  const handleReject = () => {
    if (!rejectingTask || !selectedReason) return;
    setRejectingTask(null);
    setShowProcessing(true);
    setTimeout(() => {
      requestReassignment(rejectingTask.id, selectedReason);
      setShowProcessing(false);
      setSelectedReason("");
    }, 1500);
  };

  const pendingTasks = delegatedTasks.filter(t => t.status !== "approved");
  const doneTasks = delegatedTasks.filter(t => t.status === "approved");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Delegate Tasks</h1>
        <p className="text-muted-foreground mt-1">AI-assisted delegation based on availability and workload.</p>
      </div>

      {/* Processing overlay */}
      <AnimatePresence>
        {showProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center"
          >
            <div className="bloom-card text-center p-8">
              <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
              <h2 className="font-display text-lg font-bold text-foreground">Re-analyzing delegation...</h2>
              <p className="text-sm text-muted-foreground mt-2">Bloom is finding the best match</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active tasks */}
      <div className="space-y-4 mb-8">
        <AnimatePresence>
          {delegatedTasks.map((task, i) => {
            const isOwn = task.assignedTo === currentUser;
            const status = statusConfig[task.status];
            return (
              <motion.div
                key={task.id + task.assignedTo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bloom-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {task.assignedTo[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{task.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {task.assignedTo}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-foreground">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated</p>
                      <p className="text-foreground">{task.estimatedHours} hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Reason</p>
                      <p className="text-foreground">{task.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {task.status === "pending" && isOwn && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button size="sm" onClick={() => handleApprove(task.id)} className="gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setRejectingTask(task); setSelectedReason(""); }} className="gap-1">
                      <RotateCcw className="w-4 h-4" /> Request Reassignment
                    </Button>
                  </div>
                )}
                {task.status === "pending" && !isOwn && (
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border italic">
                    Only {task.assignedTo} can approve this task.
                  </p>
                )}
                {task.status === "approved" && (
                  <p className="text-xs text-primary pt-2 border-t border-border font-medium">
                    ✓ Task approved! Your group has been notified.
                  </p>
                )}
                {task.status === "reassigned" && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Reassigned — {task.rejectionReason}
                    </p>
                    {task.assignedTo === currentUser && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(task.id)} className="gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setRejectingTask(task); setSelectedReason(""); }} className="gap-1">
                          <RotateCcw className="w-4 h-4" /> Request Reassignment
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {doneTasks.length > 0 && doneTasks.length === delegatedTasks.length && (
        <div className="bloom-card text-center mb-6 bg-primary/5 border-primary/20">
          <p className="font-display font-bold text-primary text-lg">All tasks delegated!</p>
          <p className="text-sm text-muted-foreground">Your Gantt chart has been updated.</p>
        </div>
      )}

      <Button onClick={() => navigate("/gantt")} className="gap-2">
        Next: Gantt Chart <ArrowRight className="w-4 h-4" />
      </Button>

      {/* Reassignment modal */}
      <Dialog open={!!rejectingTask} onOpenChange={() => setRejectingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Why are you requesting reassignment?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {rejectionReasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                  selectedReason === reason
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingTask(null)}>Cancel</Button>
            <Button onClick={handleReject} disabled={!selectedReason}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DelegateTasks;
