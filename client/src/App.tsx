import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ApiList from "@/pages/api-list";
import ApiDetail from "@/pages/api-detail";
import Dashboard from "@/pages/dashboard";
import AlertSettings from "@/pages/alert-settings";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/footer";

function Router() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/api-list" component={ApiList} />
          <Route path="/api-detail/:endpoint" component={ApiDetail} />
          <Route path="/docs" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/alerts" component={AlertSettings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;