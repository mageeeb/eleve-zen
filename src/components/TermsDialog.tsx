import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

interface TermsDialogProps {
  children: React.ReactNode;
}

const TermsDialog: React.FC<TermsDialogProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Conditions d'utilisation
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Utilisation des données</h3>
              <p className="text-muted-foreground">
                En vous inscrivant en tant qu'administrateur sur cette application, vous acceptez que les données personnelles 
                que vous fournissez lors de l'inscription, y compris votre nom et votre image téléchargée, puissent être utilisées 
                par l'application à des fins administratives et de personnalisation. Ces données seront stockées de manière sécurisée 
                et utilisées uniquement pour le fonctionnement et l'amélioration de l'application.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">2. Responsabilité du compte</h3>
              <p className="text-muted-foreground">
                Vous êtes responsable de maintenir la confidentialité de votre compte et mot de passe et de restreindre 
                l'accès à votre ordinateur. Vous acceptez d'assumer la responsabilité de toutes les activités qui se 
                produisent sous votre compte.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">3. Contenu</h3>
              <p className="text-muted-foreground">
                Vous acceptez de ne pas télécharger d'images qui sont offensantes, illégales, ou qui violent les droits 
                d'autrui. L'application se réserve le droit de supprimer tout contenu jugé inapproprié.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">4. Modification des conditions</h3>
              <p className="text-muted-foreground">
                Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Tout changement 
                sera effectif immédiatement après publication sur l'application.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">5. Protection des données</h3>
              <p className="text-muted-foreground">
                Vos données personnelles sont traitées conformément à notre politique de confidentialité. Nous nous 
                engageons à protéger vos informations et à ne les partager qu'en cas de nécessité pour le fonctionnement 
                de l'application ou si requis par la loi.
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                En cochant la case, vous confirmez avoir lu, compris et accepté ces conditions d'utilisation.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;