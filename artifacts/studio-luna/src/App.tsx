import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import { lazy, Suspense, useEffect } from "react";

// Page imports
// Aanbod, Rooster, Tarieven en het boekingssysteem staan tijdelijk uit; de
// bestanden blijven bewaard in src/pages en de oude routes verwijzen door,
// zodat ze later zo weer aan te zetten zijn. Admin en wachtwoord-reset laden
// apart, zodat bezoekers ze niet meedownloaden.
import Geboortereeks from "./pages/geboortereeks";
import Geboortezorg from "./pages/geboortezorg";
import GeboortezorgCategorie from "./pages/geboortezorg-categorie";
import StudioLuna from "./pages/studio-luna";
import Inspiratie from "./pages/inspiratie";
import BlogArtikel from "./pages/blog-artikel";
import OverMij from "./pages/over-mij";

const Admin = lazy(() => import("./pages/admin"));
const WachtwoordReset = lazy(() => import("./pages/wachtwoord-reset").then((m) => ({ default: m.WachtwoordReset })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const CANONICAL_BASE = "https://www.studiolunazuidplas.nl";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

function CanonicalUpdater() {
  const [location] = useLocation();
  useEffect(() => {
    const path = location === "/" ? "" : location;
    const canonical = `${CANONICAL_BASE}${path}`;
    let tag = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!tag) {
      tag = document.createElement("link");
      tag.setAttribute("rel", "canonical");
      document.head.appendChild(tag);
    }
    tag.setAttribute("href", canonical);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <CanonicalUpdater />
      <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={StudioLuna} />
        <Route path="/aanbod" component={() => { const [,nav] = useLocation(); useEffect(() => { nav("/geboortereeks", { replace: true }); }, [nav]); return null; }} />
        <Route path="/geboortereeks" component={Geboortereeks} />
        <Route path="/geboortezorg-zuidplas" component={Geboortezorg} />
        <Route path="/geboortezorg-zuidplas/:categorie" component={GeboortezorgCategorie} />
        <Route path="/geboortezorg" component={() => { const [,nav] = useLocation(); useEffect(() => { nav("/geboortezorg-zuidplas", { replace: true }); }, [nav]); return null; }} />
        <Route path="/rooster" component={() => { const [,nav] = useLocation(); useEffect(() => { nav("/geboortereeks", { replace: true }); }, [nav]); return null; }} />
        <Route path="/tarieven" component={() => { const [,nav] = useLocation(); useEffect(() => { nav("/geboortereeks", { replace: true }); }, [nav]); return null; }} />
        <Route path="/bookings" component={() => { const [,nav] = useLocation(); useEffect(() => { nav("/geboortereeks", { replace: true }); }, [nav]); return null; }} />
        <Route path="/profile" component={() => { const [,nav] = useLocation(); useEffect(() => { nav("/geboortereeks", { replace: true }); }, [nav]); return null; }} />
        <Route path="/betaling/:rest*" component={() => { const [,nav] = useLocation(); useEffect(() => { nav("/geboortereeks", { replace: true }); }, [nav]); return null; }} />
        <Route path="/admin" component={Admin} />
        <Route path="/blog/:id" component={BlogArtikel} />
        <Route path="/blog" component={Inspiratie} />
        <Route path="/over-mij" component={OverMij} />
        <Route path="/wachtwoord-reset" component={WachtwoordReset} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
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
