import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Page imports
import Home from "./pages/home";
import Rooster from "./pages/rooster";
import Bookings from "./pages/bookings";
import Tarieven from "./pages/tarieven";
import Profile from "./pages/profile";
import StudioLuna from "./pages/studio-luna";
import Admin from "./pages/admin";
import Village from "./pages/village";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={StudioLuna} />
      <Route path="/aanbod" component={Home} />
      <Route path="/rooster" component={Rooster} />
      <Route path="/tarieven" component={Tarieven} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/admin" component={Admin} />
      <Route path="/village" component={Village} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
