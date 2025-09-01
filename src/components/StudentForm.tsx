import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents';
import { Student, SubjectGrades } from '@/types/Student';
import { X, Save, User } from 'lucide-react';
import AvatarUpload from './AvatarUpload';

interface StudentFormProps {
  student?: Student;
  onClose: () => void;
  onSuccess: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onClose, onSuccess }) => {
  const { addStudent, updateStudent } = useSupabaseStudents();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    age: student?.age || 18,
    gender: student?.gender || 'Masculin' as 'Masculin' | 'Féminin',
    className: student?.className || 'Classe 1' as 'Classe 1' | 'Classe 2',
    avatar: student?.avatar || '',
    adminComments: student?.adminComments || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (student) {
        // Update existing student
        await updateStudent(student.id, formData);
      } else {
        // Add new student
        const emptyGrades: SubjectGrades = {
          javascript: [],
          linux: [],
          docker: [],
          jquery: [],
          bootstrap: []
        };
        
        await addStudent({
          ...formData,
          grades: emptyGrades
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const predefinedAvatars = [
    'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1',
    'https://images.unsplash.com/photo-1501286353178-1ec891214838',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
    'https://images.unsplash.com/photo-1472396961693-142e6e269027'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-strong">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {student ? 'Modifier l\'élève' : 'Ajouter un élève'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Âge *</Label>
                <Input
                  id="age"
                  type="number"
                  min="16"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label>Sexe *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Féminin">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Classe *</Label>
                <Select value={formData.className} onValueChange={(value) => handleChange('className', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Classe 1">Classe 1</SelectItem>
                    <SelectItem value="Classe 2">Classe 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AvatarUpload
              currentAvatar={formData.avatar}
              onAvatarChange={(avatarUrl) => handleChange('avatar', avatarUrl)}
              studentName={`${formData.firstName} ${formData.lastName}`}
            />

            <div>
              <Label htmlFor="adminComments">Commentaires de l'administrateur</Label>
              <Textarea
                id="adminComments"
                placeholder="Commentaires sur l'élève..."
                value={formData.adminComments}
                onChange={(e) => handleChange('adminComments', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentForm;