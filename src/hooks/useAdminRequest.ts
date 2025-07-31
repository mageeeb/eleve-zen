import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

export const useAdminRequest = () => {
  const { user } = useAuth();
  const [adminRequest, setAdminRequest] = useState<AdminRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAdminRequest();
    } else {
      setAdminRequest(null);
      setLoading(false);
    }
  }, [user]);

  const fetchAdminRequest = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_requests')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setAdminRequest(data);
    } catch (err: any) {
      console.error('Erreur lors de la récupération de la demande admin:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestAdminRole = async () => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      setLoading(true);
      setError(null);

      // Créer la demande d'admin
      const { data: requestData, error: requestError } = await supabase
        .from('admin_requests')
        .insert({
          user_id: user.id,
          email: user.email || '',
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) {
        throw requestError;
      }

      // Obtenir le profil utilisateur
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('id', user.id)
        .single();

      const userName = profileData?.display_name || profileData?.full_name || user.email || 'Utilisateur';

      // Envoyer la notification à l'admin principal
      const response = await supabase.functions.invoke('send-admin-notification', {
        body: {
          userEmail: user.email,
          userName: userName,
          requestId: requestData.id
        }
      });

      if (response.error) {
        throw response.error;
      }

      setAdminRequest(requestData);
      return { success: true, message: 'Demande envoyée avec succès' };
    } catch (err: any) {
      console.error('Erreur lors de la demande admin:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const validateAdminCode = async (code: string) => {
    if (!user || !adminRequest) {
      throw new Error('Aucune demande d\'admin trouvée');
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier le code
      if (adminRequest.validation_code !== code.toUpperCase()) {
        throw new Error('Code de validation incorrect');
      }

      // Vérifier l'expiration
      if (adminRequest.code_expires_at && new Date() > new Date(adminRequest.code_expires_at)) {
        throw new Error('Le code de validation a expiré');
      }

      // Ajouter le rôle admin à l'utilisateur
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', user.id);

      if (roleError) {
        throw roleError;
      }

      // Marquer la demande comme utilisée
      const { error: updateError } = await supabase
        .from('admin_requests')
        .update({ status: 'completed' })
        .eq('id', adminRequest.id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de la demande:', updateError);
      }

      return { success: true, message: 'Vous êtes maintenant administrateur !' };
    } catch (err: any) {
      console.error('Erreur lors de la validation du code:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    adminRequest,
    loading,
    error,
    requestAdminRole,
    validateAdminCode,
    refetch: fetchAdminRequest
  };
};