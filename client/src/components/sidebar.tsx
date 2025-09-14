import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, TrendingUp, User, Settings } from "lucide-react";

interface SidebarProps {
  filters: {
    genre: string;
    userType: string;
    sortBy: string;
  };
  onFilterChange: (filters: Partial<SidebarProps['filters']>) => void;
}

const genres = [
  "Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Classical", "Country", "Reggae"
];

export default function Sidebar({ filters, onFilterChange }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isAdmin = user && user.userType === 'admin';

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border sticky top-16">
      <div className="p-6">
        {/* Navigation Links */}
        <nav className="space-y-2 mb-8">
          <Link href="/">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              className="w-full justify-start"
              data-testid="nav-home"
            >
              <Home className="w-4 h-4 mr-3" />
              Home
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            data-testid="nav-trending"
          >
            <TrendingUp className="w-4 h-4 mr-3" />
            Trending
          </Button>
          
          <Link href="/profile">
            <Button
              variant={location === "/profile" ? "default" : "ghost"}
              className="w-full justify-start"
              data-testid="nav-profile"
            >
              <User className="w-4 h-4 mr-3" />
              Il Mio Profilo
            </Button>
          </Link>
          
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant={location === "/admin" ? "default" : "ghost"}
                className="w-full justify-start"
                data-testid="nav-admin"
              >
                <Settings className="w-4 h-4 mr-3" />
                Admin Panel
              </Button>
            </Link>
          )}
        </nav>

        {/* Filters Section */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">FILTRI</h3>
          
          {/* Genre Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Genere Musicale</h4>
            <div className="space-y-2">
              {genres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={genre}
                    checked={filters.genre === genre.toLowerCase()}
                    onCheckedChange={(checked) => {
                      onFilterChange({
                        genre: checked ? genre.toLowerCase() : ""
                      });
                    }}
                    data-testid={`filter-genre-${genre.toLowerCase()}`}
                  />
                  <label
                    htmlFor={genre}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {genre}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* User Type Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Tipo Utente</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.userType === "verified"}
                  onCheckedChange={(checked) => {
                    onFilterChange({
                      userType: checked ? "verified" : ""
                    });
                  }}
                  data-testid="filter-verified"
                />
                <label htmlFor="verified" className="text-sm">Solo Verificati</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expert"
                  checked={filters.userType === "expert"}
                  onCheckedChange={(checked) => {
                    onFilterChange({
                      userType: checked ? "expert" : ""
                    });
                  }}
                  data-testid="filter-expert"
                />
                <label htmlFor="expert" className="text-sm">Esperti Musicali</label>
              </div>
            </div>
          </div>

          {/* Sort Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">Ordina per</h4>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => onFilterChange({ sortBy: value })}
            >
              <SelectTrigger data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Più Recenti</SelectItem>
                <SelectItem value="popular">Più Popolari</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </aside>
  );
}
