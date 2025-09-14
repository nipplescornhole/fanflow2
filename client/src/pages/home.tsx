import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import PostCard from "@/components/post-card";
import UploadModal from "@/components/upload-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostWithUser } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState({
    genre: "",
    userType: "",
    sortBy: "recent",
  });
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.genre) params.append("genre", filters.genre);
      if (filters.userType) params.append("userType", filters.userType);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation onUploadClick={() => setShowUploadModal(true)} />
      
      <div className="flex max-w-7xl mx-auto">
        <Sidebar filters={filters} onFilterChange={handleFilterChange} />
        
        {/* Main Content */}
        <main className="flex-1 p-6" data-testid="main-feed">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Feed Musicale</h1>
            <p className="text-muted-foreground">
              Scopri i contenuti più recenti dalla community
            </p>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12" data-testid="empty-feed">
                <p className="text-muted-foreground text-lg">
                  Nessun contenuto trovato per i filtri selezionati.
                </p>
              </div>
            )}
          </div>

          {posts && posts.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button
                variant="secondary"
                className="px-6 py-3"
                data-testid="button-load-more"
              >
                Carica Altri Contenuti
              </Button>
            </div>
          )}
        </main>

        {/* Right Sidebar - Trending & Suggestions */}
        <aside className="w-80 min-h-screen bg-card border-l border-border sticky top-16 hidden xl:block">
          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">In Tendenza</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Contenuti trending in arrivo...
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Utenti Suggeriti</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Suggerimenti in arrivo...
                </p>
              </div>
            </div>

            <Card className="bg-primary/10 border-primary/20 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-primary">📊</span>
                <h3 className="font-semibold text-sm">Sondaggio Interesse</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Aiutaci a migliorare FanFlow condividendo le tue preferenze musicali
              </p>
              <Button size="sm" className="w-full" data-testid="button-survey">
                Partecipa al Sondaggio
              </Button>
            </Card>
          </div>
        </aside>
      </div>

      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}
