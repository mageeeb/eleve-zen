import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { GraduationCap, Lock, Mail, User, Upload, Link, Shield, UserCircle } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';
import TermsDialog from '@/components/TermsDialog';
import { supabase } from '@/integrations/supabase/client';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [formation, setFormation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [requestedRole, setRequestedRole] = useState<'user' | 'admin'>('user');
  const { login, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup') {
      if (!fullName.trim()) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir votre nom complet.",
          variant: "destructive",
        });
        return;
      }
      
      if (!formation.trim()) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir votre formation.",
          variant: "destructive",
        });
        return;
      }
      
      if (!acceptedTerms) {
        toast({
          title: "Erreur",
          description: "Vous devez accepter les conditions d'utilisation.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsLoading(true);

    try {
      const result = mode === 'login' 
        ? await login(email, password)
        : await signUp(email, password);
        
      if (result.error) {
        toast({
          title: mode === 'login' ? "Erreur de connexion" : "Erreur d'inscription",
          description: result.error,
          variant: "destructive",
        });
      } else {
        if (mode === 'signup') {
          // Update the user profile with name and avatar
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('profiles')
              .update({
                full_name: fullName,
                formation: formation,
                avatar_url: avatarUrl || null
              })
              .eq('id', user.id);

            // Si l'utilisateur demande le rôle admin, créer une demande
            if (requestedRole === 'admin') {
              try {
                const { data: requestData, error: requestError } = await supabase
                  .from('admin_requests')
                  .insert({
                    user_id: user.id,
                    email: user.email || '',
                    status: 'pending'
                  })
                  .select()
                  .single();

                if (!requestError) {
                  // Envoyer la notification d'admin
                  await supabase.functions.invoke('send-admin-notification', {
                    body: {
                      userEmail: user.email,
                      userName: fullName,
                      requestId: requestData.id
                    }
                  });
                }
              } catch (adminRequestError) {
                console.error('Erreur lors de la demande admin:', adminRequestError);
              }
            }
          }
          
          toast({
            title: "Inscription réussie",
            description: "Vérifiez votre email pour confirmer votre compte.",
          });
        } else {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue dans le tableau de bord !",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="w-full max-w-md p-6">
        <Card className="shadow-strong border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Gestion Élèves
            </CardTitle>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Connexion Admin' : 'Inscription Admin'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nom complet
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Votre nom complet"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="formation" className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Formation
                    </Label>
                    <Input
                      id="formateur du secteur"
                      type="text"
                      placeholder="Ex: Web, DD, Réseaux..."
                      value={formation}
                      onChange={(e) => setFormation(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                   <div className="space-y-2">
                     <Label className="flex items-center gap-2">
                       <Shield className="w-4 h-4" />
                       Type de compte
                     </Label>
                     <Select value={requestedRole} onValueChange={(value: 'user' | 'admin') => setRequestedRole(value)}>
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Choisissez votre type de compte" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="user">
                           <div className="flex items-center gap-2">
                             <UserCircle className="w-4 h-4" />
                             <span>Utilisateur (consultation seule)</span>
                           </div>
                         </SelectItem>
                         <SelectItem value="admin">
                           <div className="flex items-center gap-2">
                             <Shield className="w-4 h-4" />
                             <span>Administrateur (gestion complète)</span>
                           </div>
                         </SelectItem>
                       </SelectContent>
                     </Select>
                     {requestedRole === 'admin' && (
                       <p className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                         ⚠️ Les demandes d'administration doivent être approuvées. Vous recevrez un code par email.
                       </p>
                     )}
                   </div>
                   
                   <div className="space-y-2">
                     <Label className="flex items-center gap-2">
                       <Upload className="w-4 h-4" />
                       Photo de profil (optionnel)
                     </Label>
                     <AvatarUpload
                       currentAvatar={avatarUrl}
                       onAvatarChange={setAvatarUrl}
                       studentName={fullName || "Admin"}
                     />
                   </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              {mode === 'signup' && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="terms"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        J'ai lu et j'accepte les conditions d'utilisation
                      </Label>
                      <div>
                        <TermsDialog>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary"
                          >
                            <Link className="w-3 h-3 mr-1" />
                            Afficher les conditions
                          </Button>
                        </TermsDialog>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading 
                  ? (mode === 'login' ? "Connexion..." : "Inscription...") 
                  : (mode === 'login' ? "Se connecter" : "S'inscrire")
                }
              </Button>
            </form>
            
            <div className="mt-4">
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-sm" 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' 
                  ? "Pas de compte ? S'inscrire" 
                  : "Déjà un compte ? Se connecter"
                }
              </Button>
            </div>

            {mode === 'login' && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-medium mb-2">Pour créer le premier admin :</h3>
                <p className="text-xs text-muted-foreground">
                  Utilisez "S'inscrire" pour créer votre compte admin.<br />
                  Le premier utilisateur inscrit devient automatiquement admin.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
