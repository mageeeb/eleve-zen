import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { GraduationCap, Lock, Mail } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { login, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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