import React, { createContext, useContext, useState, useCallback } from "react";

export type TaskStatus = "pending" | "approved" | "reassignment_requested" | "reassigned";

export interface Task {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
}

export interface DelegatedTask extends Task {
  assignedTo: string;
  status: TaskStatus;
  reason: string;
  rejectionReason?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface Availability {
  [member: string]: { [day: string]: string[] };
}

interface BloomState {
  projectName: string;
  dueDate: string;
  members: string[];
  currentUser: string;
  tasks: Task[];
  delegatedTasks: DelegatedTask[];
  availability: Availability;
  chatMessages: ChatMessage[];
  groupCode: string;
  onboardingStep: number;
}

interface BloomContextType extends BloomState {
  addTask: (task: Omit<Task, "id">) => void;
  removeTask: (id: string) => void;
  toggleAvailability: (member: string, day: string, time: string) => void;
  approveTask: (taskId: string) => void;
  requestReassignment: (taskId: string, reason: string) => void;
  addChatMessage: (text: string, sender?: string) => void;
  setOnboardingStep: (step: number) => void;
}

const defaultMembers = ["Sarah", "Sam", "Ella", "Oliver"];
const currentUser = "Sarah";

const defaultTasks: Task[] = [
  { id: "t1", name: "Initial Architecture Implementation", description: "Set up the base project architecture and folder structure", estimatedHours: 4 },
  { id: "t2", name: "GUI", description: "Design and implement the graphical user interface", estimatedHours: 4 },
  { id: "t3", name: "Test Cases", description: "Write comprehensive unit and integration tests", estimatedHours: 3 },
  { id: "t4", name: "Parsing Class", description: "Implement the data parsing module", estimatedHours: 1 },
];

const defaultDelegated: DelegatedTask[] = [
  { ...defaultTasks[0], assignedTo: "Ella", status: "approved", reason: "Ella has the most availability on Mon-Wed and has architecture experience." },
  { ...defaultTasks[1], assignedTo: "Sarah", status: "pending", reason: "Sarah has 8 free hours Tues-Thurs, matching the estimated time." },
  { ...defaultTasks[2], assignedTo: "Oliver", status: "pending", reason: "Oliver's availability aligns well with the 3-hour estimate." },
  { ...defaultTasks[3], assignedTo: "Sam", status: "pending", reason: "Sam has a light workload and availability matches." },
];

const defaultAvailability: Availability = {
  Sarah: { Mon: ["9:00 AM", "10:00 AM"], Tue: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"], Wed: ["10:00 AM", "11:00 AM", "2:00 PM"], Thu: ["9:00 AM", "10:00 AM", "11:00 AM", "3:00 PM"], Fri: [], Sat: ["10:00 AM", "11:00 AM"], Sun: [] },
  Sam: { Mon: ["2:00 PM", "3:00 PM", "4:00 PM"], Tue: [], Wed: ["9:00 AM", "10:00 AM"], Thu: ["2:00 PM", "3:00 PM"], Fri: ["9:00 AM", "10:00 AM", "11:00 AM"], Sat: [], Sun: ["10:00 AM", "11:00 AM", "12:00 PM"] },
  Ella: { Mon: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"], Tue: ["9:00 AM", "10:00 AM"], Wed: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"], Thu: [], Fri: ["2:00 PM", "3:00 PM"], Sat: ["9:00 AM", "10:00 AM"], Sun: [] },
  Oliver: { Mon: [], Tue: ["2:00 PM", "3:00 PM", "4:00 PM"], Wed: [], Thu: ["9:00 AM", "10:00 AM", "11:00 AM"], Fri: ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"], Sat: [], Sun: ["2:00 PM", "3:00 PM", "4:00 PM"] },
};

const defaultMessages: ChatMessage[] = [
  { id: "m1", sender: "system", text: "Welcome to Bloom! Your group SOFT2412 A1 has been created.", timestamp: new Date(2026, 3, 20, 9, 0), isSystem: true },
  { id: "m2", sender: "Ella", text: "Hey everyone! Let's get started on the assignment.", timestamp: new Date(2026, 3, 20, 9, 5) },
  { id: "m3", sender: "Oliver", text: "Sounds good! I've looked at the requirements.", timestamp: new Date(2026, 3, 20, 9, 10) },
  { id: "m4", sender: "Sam", text: "I can handle the parsing — it's pretty straightforward.", timestamp: new Date(2026, 3, 20, 9, 15) },
  { id: "m5", sender: "system", text: "Ella has approved Initial Architecture Implementation.", timestamp: new Date(2026, 3, 21, 10, 0), isSystem: true },
];

const BloomContext = createContext<BloomContextType | null>(null);

export const useBloom = () => {
  const ctx = useContext(BloomContext);
  if (!ctx) throw new Error("useBloom must be used within BloomProvider");
  return ctx;
};

export const BloomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [delegatedTasks, setDelegatedTasks] = useState<DelegatedTask[]>(defaultDelegated);
  const [availability, setAvailability] = useState<Availability>(defaultAvailability);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(defaultMessages);
  const [onboardingStep, setOnboardingStep] = useState(1);

  const addTask = useCallback((task: Omit<Task, "id">) => {
    setTasks(prev => [...prev, { ...task, id: `t${Date.now()}` }]);
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleAvailability = useCallback((member: string, day: string, time: string) => {
    setAvailability(prev => {
      const memberAvail = { ...prev[member] };
      const daySlots = memberAvail[day] || [];
      memberAvail[day] = daySlots.includes(time)
        ? daySlots.filter(t => t !== time)
        : [...daySlots, time];
      return { ...prev, [member]: memberAvail };
    });
  }, []);

  const addChatMessage = useCallback((text: string, sender?: string) => {
    setChatMessages(prev => [...prev, {
      id: `m${Date.now()}`,
      sender: sender || currentUser,
      text,
      timestamp: new Date(),
      isSystem: sender === "system",
    }]);
  }, []);

  const approveTask = useCallback((taskId: string) => {
    setDelegatedTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: "approved" as TaskStatus } : t
    ));
    const task = delegatedTasks.find(t => t.id === taskId);
    if (task) {
      addChatMessage(`${task.assignedTo} has approved ${task.name}.`, "system");
    }
  }, [delegatedTasks, addChatMessage]);

  const requestReassignment = useCallback((taskId: string, reason: string) => {
    setDelegatedTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== taskId) return t;
        const otherMembers = defaultMembers.filter(m => m !== t.assignedTo && prev.filter(dt => dt.assignedTo === m && dt.status !== "approved").length < 2);
        const newAssignee = otherMembers[0] || t.assignedTo;
        return {
          ...t,
          status: "reassigned" as TaskStatus,
          rejectionReason: reason,
          assignedTo: newAssignee,
          reason: `Reassigned from ${t.assignedTo}. ${newAssignee} has availability that fits this task.`,
        };
      });
      return updated;
    });
    const task = delegatedTasks.find(t => t.id === taskId);
    if (task) {
      addChatMessage(`${task.assignedTo} requested reassignment of ${task.name}: "${reason}"`, "system");
    }
  }, [delegatedTasks, addChatMessage]);

  return (
    <BloomContext.Provider value={{
      projectName: "SOFT2412 A1",
      dueDate: "02/05/2026",
      members: defaultMembers,
      currentUser,
      tasks,
      delegatedTasks,
      availability,
      chatMessages,
      groupCode: "EG85RJ",
      onboardingStep,
      addTask,
      removeTask,
      toggleAvailability,
      approveTask,
      requestReassignment,
      addChatMessage,
      setOnboardingStep,
    }}>
      {children}
    </BloomContext.Provider>
  );
};
