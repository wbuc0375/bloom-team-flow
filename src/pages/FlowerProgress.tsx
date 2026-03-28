import { useBloom } from "@/contexts/BloomContext";
import { motion } from "framer-motion";

const stages = [
  { name: "Seed", min: 0, max: 10, emoji: "🌰" },
  { name: "Sprouting", min: 10, max: 25, emoji: "🌱" },
  { name: "Growth", min: 25, max: 50, emoji: "🌿" },
  { name: "Budding", min: 50, max: 75, emoji: "🌷" },
  { name: "Full Bloom", min: 75, max: 101, emoji: "🌸" },
];

const FlowerProgress = () => {
  const { delegatedTasks } = useBloom();
  const total = delegatedTasks.length;
  const approved = delegatedTasks.filter(t => t.status === "approved").length;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const stage = stages.find(s => pct >= s.min && pct < s.max) || stages[0];
  const remaining = delegatedTasks.filter(t => t.status !== "approved");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Flower Progress</h1>
        <p className="text-muted-foreground mt-1">Watch your project bloom as tasks are completed.</p>
      </div>

      {/* Flower visualization */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bloom-card text-center mb-8"
      >
        {/* Flower SVG */}
        <div className="relative mx-auto w-64 h-72 mb-6">
          {/* Stem */}
          <svg viewBox="0 0 200 280" className="w-full h-full">
            {/* Ground */}
            <ellipse cx="100" cy="260" rx="60" ry="10" fill="hsl(25, 30%, 75%)" opacity="0.4" />
            
            {/* Stem - always visible */}
            <motion.line
              x1="100" y1="260" x2="100"
              initial={{ y2: 260 }}
              animate={{ y2: pct >= 10 ? (pct >= 50 ? 80 : 140) : 220 }}
              transition={{ duration: 1 }}
              stroke="hsl(120, 35%, 40%)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Leaves - show at growth stage */}
            {pct >= 25 && (
              <>
                <motion.ellipse
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  cx="82" cy="180" rx="20" ry="8"
                  fill="hsl(120, 40%, 45%)"
                  transform="rotate(-30, 82, 180)"
                />
                <motion.ellipse
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  cx="118" cy="160" rx="20" ry="8"
                  fill="hsl(120, 40%, 50%)"
                  transform="rotate(30, 118, 160)"
                />
              </>
            )}

            {/* Bud - show at budding stage */}
            {pct >= 50 && pct < 75 && (
              <motion.ellipse
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                cx="100" cy="75" rx="15" ry="20"
                fill="hsl(340, 60%, 70%)"
              />
            )}

            {/* Full flower - show at bloom stage */}
            {pct >= 75 && (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <motion.ellipse
                    key={angle}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    cx={100 + 22 * Math.cos((angle * Math.PI) / 180)}
                    cy={70 + 22 * Math.sin((angle * Math.PI) / 180)}
                    rx="16" ry="10"
                    fill={i % 2 === 0 ? "hsl(340, 65%, 65%)" : "hsl(340, 55%, 75%)"}
                    transform={`rotate(${angle}, ${100 + 22 * Math.cos((angle * Math.PI) / 180)}, ${70 + 22 * Math.sin((angle * Math.PI) / 180)})`}
                  />
                ))}
                <circle cx="100" cy="70" r="12" fill="hsl(36, 85%, 55%)" />
              </motion.g>
            )}

            {/* Seed - show at seed stage */}
            {pct < 10 && (
              <motion.ellipse
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                cx="100" cy="250" rx="8" ry="6"
                fill="hsl(25, 40%, 40%)"
              />
            )}

            {/* Sprout */}
            {pct >= 10 && pct < 25 && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                d="M100,220 Q95,200 100,190 Q105,200 100,220"
                fill="hsl(120, 45%, 45%)"
              />
            )}
          </svg>
        </div>

        <div className="text-6xl mb-2">{stage.emoji}</div>
        <h2 className="text-3xl font-display font-bold text-foreground mb-1">{pct}% Complete</h2>
        <p className="text-lg text-primary font-medium">Stage: {stage.name}</p>
        {pct < 100 && (
          <p className="text-sm text-muted-foreground mt-2">
            Complete {Math.ceil((stages.find(s => s.min > pct)?.min || 100) - pct)}% more to reach the next stage!
          </p>
        )}
        {pct === 100 && (
          <p className="text-sm text-primary font-medium mt-2">
            🎉 You've completed all tasks! Your flower is fully bloomed!
          </p>
        )}
      </motion.div>

      {/* Remaining tasks */}
      {remaining.length > 0 && (
        <div className="bloom-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Tasks Remaining</h3>
          <div className="space-y-2">
            {remaining.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-foreground">{task.name}</p>
                  <p className="text-xs text-muted-foreground">Assigned to {task.assignedTo}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs border ${
                  task.status === "pending" ? "bloom-badge-pending" : "bloom-badge-rejected"
                }`}>
                  {task.status === "pending" ? "Pending" : "Reassigned"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {remaining.length === 0 && (
        <div className="bloom-card text-center bg-primary/5 border-primary/20">
          <p className="text-lg font-display font-bold text-primary">🌸 Species: Daisy</p>
          <p className="text-sm text-muted-foreground mt-1">All tasks complete — your project is in full bloom!</p>
        </div>
      )}
    </div>
  );
};

export default FlowerProgress;
