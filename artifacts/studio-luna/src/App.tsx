import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Page imports
import Home from "./pages/home";
import Rooster from "./pages/rooster";
import Bookings from "./pages/bookings";
import Tarieven from "./pages/tarieven";
import Profile from "./pages/profile";
import StudioLuna from "./pages/studio-luna";

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
      <Route path="/studio" component={StudioLuna} />
      <Route path="/" component={Home} />
      <Route path="/rooster" component={Rooster} />
      <Route path="/tarieven" component={Tarieven} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
