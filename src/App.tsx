import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BloomProvider } from "@/contexts/BloomContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BloomLayout from "@/components/BloomLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import PlanAssignment from "./pages/PlanAssignment";
import PersonalCalendar from "./pages/PersonalCalendar";
import DelegateTasks from "./pages/DelegateTasks";
import GanttChart from "./pages/GanttChart";
import FlowerProgress from "./pages/FlowerProgress";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const protect = (el: React.ReactNode) => (
  <ProtectedRoute><BloomLayout>{el}</BloomLayout></ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BloomProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/chat" element={protect(<Chat />)} />
              <Route path="/plan" element={protect(<PlanAssignment />)} />
              <Route path="/calendar" element={protect(<PersonalCalendar />)} />
              <Route path="/delegate" element={protect(<DelegateTasks />)} />
              <Route path="/gantt" element={protect(<GanttChart />)} />
              <Route path="/flower" element={protect(<FlowerProgress />)} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BloomProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
