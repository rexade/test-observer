import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Activity className="h-6 w-6 text-primary" />
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Reactive Mirror
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/explorer" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/explorer') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Explorer
          </Link>
          <Link 
            to="/oracles" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/oracles') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Oracles
          </Link>
          <Button size="sm" className="bg-gradient-primary shadow-glow">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
