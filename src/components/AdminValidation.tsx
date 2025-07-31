import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminRequest } from '@/hooks/useAdminRequest';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AdminValidation = () => {
  const { adminRequest, loading, requestAdminRole, validateAdminCode } = useAdminRequest();
  const { isAdmin, refetch: refetchRole } = useUserRole();
  const { toast } = useToast();
  const [validationCode, setValidationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestAdmin = async () => {
    setSubmitting(true);
    const result = await requestAdminRole();
    
    if (result.success) {
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'administration a été envoyée. Vous recevrez un email avec le code de validation une fois approuvée.",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  const handleValidateCode = async () => {
    if (!validationCode.trim()) {
      toast({
        title: "Code requis",
        description: "Veuillez saisir votre code de validation",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const result = await validateAdminCode(validationCode.trim());
    
    if (result.success) {
      toast({
        title: "Validation réussie !",
        description: result.message,
      });
      refetchRole();
    } else {
      toast({
        title: "Erreur de validation",
        description: result.error,
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (isAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Administrateur confirmé</CardTitle>
          <CardDescription>
            Vous avez les droits d'administration sur cette application.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Aucune demande d'admin
  if (!adminRequest) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Demander les droits d'administration</CardTitle>
          <CardDescription>
            Pour devenir administrateur, votre demande doit être approuvée par le super administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Une fois votre demande approuvée, vous recevrez un email avec un code de validation à saisir.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleRequestAdmin} 
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Envoi en cours..." : "Demander les droits d'admin"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Demande en attente
  if (adminRequest.status === 'pending') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-700">Demande en attente</CardTitle>
          <CardDescription>
            Votre demande d'administration est en cours de traitement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Vous recevrez un email avec le code de validation une fois que votre demande sera approuvée.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Demande approuvée - saisie du code
  if (adminRequest.status === 'approved' && adminRequest.validation_code) {
    const isExpired = adminRequest.code_expires_at && new Date() > new Date(adminRequest.code_expires_at);
    
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Demande approuvée</CardTitle>
          <CardDescription>
            Saisissez le code de validation reçu par email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExpired ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Le code de validation a expiré. Veuillez faire une nouvelle demande.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="validation-code">Code de validation</Label>
                <Input
                  id="validation-code"
                  type="text"
                  placeholder="Saisissez votre code (ex: ABC123)"
                  value={validationCode}
                  onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-wider"
                />
              </div>
              <Button 
                onClick={handleValidateCode} 
                disabled={submitting || !validationCode.trim()}
                className="w-full"
              >
                {submitting ? "Validation en cours..." : "Valider le code"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Demande rejetée
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-red-700">Demande rejetée</CardTitle>
        <CardDescription>
          Votre demande d'administration a été rejetée.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default AdminValidation;