import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Page imports
import Home from "./pages/home";
import Rooster from "./pages/rooster";
import Bookings from "./pages/bookings";
import Tarieven from "./pages/tarieven";
import Profile from "./pages/profile";
import StudioLuna from "./pages/studio-luna";
import Admin from "./pages/admin";
import Village from "./pages/village";
import Inspiratie from "./pages/inspiratie";
import BlogArtikel from "./pages/blog-artikel";
import OverMij from "./pages/over-mij";
import { BetalingSucces } from "./pages/betaling-succes";
import { PakketSucces } from "./pages/pakket-succes";
import { LidSucces } from "./pages/lid-succes";
import { WachtwoordReset } from "./pages/wachtwoord-reset";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={StudioLuna} />
        <Route path="/aanbod" component={Home} />
        <Route path="/rooster" component={Rooster} />
        <Route path="/tarieven" component={Tarieven} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/admin" component={Admin} />
        <Route path="/village" component={Village} />
        <Route path="/blog/:id" component={BlogArtikel} />
        <Route path="/blog" component={Inspiratie} />
        <Route path="/over-mij" component={OverMij} />
        <Route path="/profile" component={Profile} />
        <Route path="/betaling/succes" component={BetalingSucces} />
        <Route path="/betaling/pakket-succes" component={PakketSucces} />
        <Route path="/betaling/lid-succes" component={LidSucces} />
        <Route path="/betaling/geannuleerd" component={() => { const [,nav] = useLocation(); nav("/rooster"); return null; }} />
        <Route path="/wachtwoord-reset" component={WachtwoordReset} />
        <Route component={NotFound} />
      </Switch>
    </>
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
