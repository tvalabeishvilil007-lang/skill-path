import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";
import LessonPage from "./pages/LessonPage";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminModules from "./pages/admin/AdminModules";
import AdminLessons from "./pages/admin/AdminLessons";

import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminRequests from "./pages/admin/AdminRequests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/course/:slug" element={<CoursePage />} />
            <Route path="/lesson/:courseSlug/:lessonSlug" element={<LessonPage />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Admin CMS */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="modules" element={<AdminModules />} />
              <Route path="lessons" element={<AdminLessons />} />
              
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="requests" element={<AdminRequests />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
