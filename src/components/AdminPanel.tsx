import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface AdminRequest {
  id: string;
  user_id: string;
  email: string;
  status: string;
  validation_code: string | null;
  code_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est le super admin
  const isSuperAdmin = user?.email === 'nanouchkaly@yahoo.fr';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdminRequests();
    }
  }, [isSuperAdmin]);

  const fetchAdminRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_requests')
        .select(`
          *,
          profiles!admin_requests_user_id_fkey (
            display_name,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur avec la relation:', error);
        // Fallback sans la relation profiles
        const { data: requestsData, error: requestsError } = await supabase
          .from('admin_requests')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (requestsError) {
          throw requestsError;
        }
        
        setRequests(requestsData || []);
        return;
      }

      setRequests(data || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des demandes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes d'admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('approve-admin-request', {
        body: { requestId }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Demande approuvée",
        description: "Le code de validation a été envoyé par email à l'utilisateur",
      });

      // Actualiser la liste
      fetchAdminRequests();
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'approuver la demande",
        variant: "destructive",
      });
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('admin_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: "Demande rejetée",
        description: "La demande d'admin a été rejetée",
      });

      // Actualiser la liste
      fetchAdminRequests();
    } catch (error: any) {
      console.error('Erreur lors du rejet:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejetée</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Terminée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  if (!isSuperAdmin) {
    return null; // Ne pas afficher le panneau si ce n'est pas le super admin
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Panneau d'Administration</CardTitle>
          <CardDescription>Gestion des demandes d'accès administrateur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Panneau d'Administration</CardTitle>
        <CardDescription>Gestion des demandes d'accès administrateur</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune demande d'admin trouvée
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {request.email}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Email: {request.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Demande créée le: {formatDate(request.created_at)}
                      </p>
                      {request.validation_code && (
                        <p className="text-sm text-muted-foreground">
                          Code de validation: <code className="bg-muted px-1 rounded">{request.validation_code}</code>
                        </p>
                      )}
                      {request.code_expires_at && (
                        <p className="text-sm text-muted-foreground">
                          Code expire le: {formatDate(request.code_expires_at)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectRequest(request.id)}
                          >
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};