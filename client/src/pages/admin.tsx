import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserCheck, Star, Shield } from "lucide-react";
import type { User } from "@shared/schema";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || user.userType !== 'admin')) {
      toast({
        title: "Accesso Negato",
        description: "Solo gli amministratori possono accedere a questa pagina",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [user, isLoading, toast]);

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.userType === 'admin',
  });

  const { data: expertRequests } = useQuery<User[]>({
    queryKey: ["/api/admin/expert-requests"],
    enabled: !!user && user.userType === 'admin',
  });

  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, isVerified }: { userId: string; isVerified: boolean }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/verify`, { isVerified });
    },
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Stato verifica aggiornato",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        description: "Impossibile aggiornare la verifica",
        variant: "destructive",
      });
    },
  });

  const handleExpertRequestMutation = useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      await apiRequest("PUT", `/api/admin/expert-requests/${userId}`, { approved });
    },
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Richiesta esperto gestita",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        description: "Impossibile gestire la richiesta",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user || user.userType !== 'admin') {
    return <div>Caricamento...</div>;
  }

  const getUserBadge = (userToCheck: User) => {
    if (userToCheck.isExpert) {
      return <Badge className="bg-accent text-white"><Star className="w-3 h-3 mr-1" />Esperto</Badge>;
    }
    if (userToCheck.isVerified) {
      return <Badge className="bg-primary text-white"><Shield className="w-3 h-3 mr-1" />Verificato</Badge>;
    }
    return <Badge variant="secondary">Ascoltatore</Badge>;
  };

  const stats = {
    totalUsers: users?.length || 0,
    verifiedUsers: users?.filter(u => u.isVerified).length || 0,
    expertUsers: users?.filter(u => u.isExpert).length || 0,
    pendingRequests: expertRequests?.length || 0,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation onUploadClick={() => {}} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Pannello Amministratore</h1>
          <p className="text-muted-foreground">
            Gestisci utenti, badge e richieste della piattaforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-users">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utenti Verificati</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-verified-users">
                {stats.verifiedUsers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esperti Musicali</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-expert-users">
                {stats.expertUsers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Richieste in Attesa</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-pending-requests">
                {stats.pendingRequests}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-users">Gestione Utenti</TabsTrigger>
            <TabsTrigger value="expert-requests" data-testid="tab-expert-requests">
              Richieste Esperti ({stats.pendingRequests})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Utenti</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((userItem) => (
                      <TableRow key={userItem.id} data-testid={`user-row-${userItem.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={userItem.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"}
                              alt="Profilo"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span>{userItem.firstName} {userItem.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>{userItem.userType}</TableCell>
                        <TableCell>{getUserBadge(userItem)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant={userItem.isVerified ? "destructive" : "default"}
                              onClick={() => verifyUserMutation.mutate({
                                userId: userItem.id,
                                isVerified: !userItem.isVerified
                              })}
                              disabled={verifyUserMutation.isPending}
                              data-testid={`button-verify-${userItem.id}`}
                            >
                              {userItem.isVerified ? "Rimuovi Verifica" : "Verifica"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expert-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Richieste Badge Esperto</CardTitle>
              </CardHeader>
              <CardContent>
                {expertRequests && expertRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utente</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Documenti</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expertRequests.map((request) => (
                        <TableRow key={request.id} data-testid={`expert-request-${request.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={request.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"}
                                alt="Profilo"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span>{request.firstName} {request.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>
                            {request.expertDocuments ? (
                              <a
                                href={request.expertDocuments}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                                data-testid="link-documents"
                              >
                                Visualizza Documenti
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Nessun documento</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleExpertRequestMutation.mutate({
                                  userId: request.id,
                                  approved: true
                                })}
                                disabled={handleExpertRequestMutation.isPending}
                                data-testid={`button-approve-${request.id}`}
                              >
                                Approva
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleExpertRequestMutation.mutate({
                                  userId: request.id,
                                  approved: false
                                })}
                                disabled={handleExpertRequestMutation.isPending}
                                data-testid={`button-reject-${request.id}`}
                              >
                                Rifiuta
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8" data-testid="no-expert-requests">
                    <p className="text-muted-foreground">Nessuna richiesta in attesa</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
