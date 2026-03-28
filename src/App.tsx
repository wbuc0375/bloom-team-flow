import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BloomProvider } from "@/contexts/BloomContext";
import BloomLayout from "@/components/BloomLayout";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import PlanAssignment from "./pages/PlanAssignment";
import PersonalCalendar from "./pages/PersonalCalendar";
import DelegateTasks from "./pages/DelegateTasks";
import GanttChart from "./pages/GanttChart";
import FlowerProgress from "./pages/FlowerProgress";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BloomProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<BloomLayout><Chat /></BloomLayout>} />
            <Route path="/plan" element={<BloomLayout><PlanAssignment /></BloomLayout>} />
            <Route path="/calendar" element={<BloomLayout><PersonalCalendar /></BloomLayout>} />
            <Route path="/delegate" element={<BloomLayout><DelegateTasks /></BloomLayout>} />
            <Route path="/gantt" element={<BloomLayout><GanttChart /></BloomLayout>} />
            <Route path="/flower" element={<BloomLayout><FlowerProgress /></BloomLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BloomProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
