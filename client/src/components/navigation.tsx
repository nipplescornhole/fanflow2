import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Search, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";

interface NavigationProps {
  onUploadClick: () => void;
}

export default function Navigation({ onUploadClick }: NavigationProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const canUpload = user && (user.userType === 'creator' || user.userType === 'expert');

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Music className="text-primary-foreground text-sm" />
            </div>
            <span className="text-xl font-bold gradient-text">FanFlow</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Cerca musica, artisti, utenti..."
                className="w-full pl-10"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {canUpload && (
              <Button
                onClick={onUploadClick}
                className="px-4 py-2 text-sm font-medium"
                data-testid="button-upload"
              >
                <Plus className="w-4 h-4 mr-2" />
                Carica
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <Link
                href="/profile"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                data-testid="link-profile"
              >
                <img
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                  alt="Profilo utente"
                  className="w-8 h-8 rounded-full ring-2 ring-primary object-cover"
                />
                {user && user.isExpert && (
                  <div className="w-4 h-4 bg-accent rounded-full flex items-center justify-center -ml-1">
                    <span className="text-white text-xs">★</span>
                  </div>
                )}
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                Esci
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
