import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, X, User } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  studentName: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  onAvatarChange, 
  studentName 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    console.log('Starting avatar upload for user during signup...');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Attempting to upload file:', filePath);

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Upload successful, data:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      console.log('Public URL generated:', publicUrl);

      onAvatarChange(publicUrl);
      setPreview(null);

      toast({
        title: "Succès",
        description: "Avatar téléchargé avec succès!",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement de l'avatar.",
        variant: "destructive",
      });
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = () => {
    onAvatarChange('');
    setPreview(null);
  };

  const displayAvatar = preview || currentAvatar;

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Avatar de l'élève</Label>
      
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={displayAvatar} alt={`Avatar de ${studentName}`} />
          <AvatarFallback className="text-lg">
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="avatar-upload"
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Téléchargement...' : 'Choisir une image'}
          </Button>

          {displayAvatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveAvatar}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Formats acceptés: JPG, PNG, GIF. Taille max: 2MB.
      </p>
    </div>
  );
};

export default AvatarUpload;