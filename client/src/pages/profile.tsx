import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User, Star, Shield, Upload } from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    bio: "",
    userType: "listener",
    requestExpert: false,
    expertDocuments: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || "",
        userType: user.userType || "listener",
        requestExpert: false,
        expertDocuments: user.expertDocuments || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("bio", formData.bio);
      data.append("userType", formData.userType);
      if (formData.requestExpert) {
        data.append("requestExpert", "true");
        data.append("expertDocuments", formData.expertDocuments);
      }
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: data,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Profilo aggiornato con successo!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setFormData(prev => ({ ...prev, requestExpert: false }));
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading || !user) {
    return <div>Caricamento...</div>;
  }

  const getUserBadge = () => {
    if (user.isExpert) {
      return (
        <Badge className="bg-accent text-white">
          <Star className="w-3 h-3 mr-1" />
          Esperto Musicale
        </Badge>
      );
    }
    if (user.isVerified) {
      return (
        <Badge className="bg-primary text-white">
          <Shield className="w-3 h-3 mr-1" />
          Verificato
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <User className="w-3 h-3 mr-1" />
        Ascoltatore
      </Badge>
    );
  };

  const getExpertRequestStatus = () => {
    if (user.expertRequestStatus === 'pending') {
      return (
        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
          Richiesta in Attesa
        </Badge>
      );
    }
    if (user.expertRequestStatus === 'rejected') {
      return (
        <Badge variant="outline" className="text-red-500 border-red-500">
          Richiesta Rifiutata
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation onUploadClick={() => {}} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Il Mio Profilo</h1>
          <p className="text-muted-foreground">
            Gestisci le informazioni del tuo profilo e le preferenze
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Panoramica Profilo</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <img
                src={user.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"}
                alt="Profilo"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                data-testid="img-profile-avatar"
              />
              <h3 className="font-semibold text-lg mb-2" data-testid="text-profile-name">
                {user.firstName} {user.lastName}
              </h3>
              <div className="mb-4" data-testid="profile-badge">
                {getUserBadge()}
              </div>
              {getExpertRequestStatus()}
              <p className="text-sm text-muted-foreground mt-4" data-testid="text-profile-bio">
                {user.bio || "Nessuna biografia disponibile"}
              </p>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Modifica Profilo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Image */}
                <div>
                  <Label htmlFor="profileImage" className="text-sm font-medium mb-2 block">
                    Immagine Profilo
                  </Label>
                  <div className="border border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      id="profileImage"
                      type="file"
                      onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                      accept="image/*"
                      className="hidden"
                      data-testid="input-profile-image"
                    />
                    <label htmlFor="profileImage" className="cursor-pointer">
                      <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {profileImage ? profileImage.name : "Cambia immagine profilo"}
                      </p>
                    </label>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio" className="text-sm font-medium mb-2 block">
                    Biografia
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Raccontaci qualcosa di te..."
                    className="h-24 resize-none"
                    data-testid="textarea-bio"
                  />
                </div>

                {/* User Type */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tipo Utente</Label>
                  <Select 
                    value={formData.userType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value }))}
                  >
                    <SelectTrigger data-testid="select-user-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="listener">Ascoltatore</SelectItem>
                      <SelectItem value="creator">Creatore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Expert Request */}
                {!user.isExpert && user.expertRequestStatus !== 'pending' && (
                  <div className="space-y-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requestExpert"
                        checked={formData.requestExpert}
                        onChange={(e) => setFormData(prev => ({ ...prev, requestExpert: e.target.checked }))}
                        className="rounded"
                        data-testid="checkbox-request-expert"
                      />
                      <Label htmlFor="requestExpert" className="text-sm font-medium">
                        Richiedi Badge Esperto Musicale
                      </Label>
                    </div>
                    
                    {formData.requestExpert && (
                      <div>
                        <Label htmlFor="expertDocuments" className="text-sm font-medium mb-2 block">
                          Documenti di Studi Musicali (URL)
                        </Label>
                        <Input
                          id="expertDocuments"
                          type="url"
                          value={formData.expertDocuments}
                          onChange={(e) => setFormData(prev => ({ ...prev, expertDocuments: e.target.value }))}
                          placeholder="https://example.com/diploma-musicale.pdf"
                          data-testid="input-expert-documents"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Fornisci un link ai tuoi documenti di studi musicali per la verifica
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Salvando..." : "Salva Modifiche"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
