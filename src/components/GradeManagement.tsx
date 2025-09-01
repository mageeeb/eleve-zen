import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student, Subject, SUBJECTS, Grade } from '@/types/Student';
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents';
import { useSubjectComments } from '@/hooks/useSubjectComments';
import { UserAvatar } from '@/components/UserAvatar';
import { Plus, Trash2, Save, Calendar, MessageCircle, Edit2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GradeManagementProps {
  student: Student;
}

const GradeManagement: React.FC<GradeManagementProps> = ({ student: initialStudent }) => {
  const { addGrade, deleteGrade, getStudentById, updateTrigger } = useSupabaseStudents();
  const { addComment, updateComment, deleteComment, getCommentsBySubject, loading: commentsLoading } = useSubjectComments(initialStudent.id);
  
  // Get the current student data from the hook to ensure real-time updates
  const student = getStudentById(initialStudent.id) || initialStudent;
  const [selectedSubject, setSelectedSubject] = useState<Subject>('javascript');
  const [newGradeValue, setNewGradeValue] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [newComment, setNewComment] = useState<string>('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>('');

  const handleAddGrade = async () => {
    const value = parseFloat(newGradeValue);
    
    if (isNaN(value) || value < 0 || value > 20) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une note valide entre 0 et 20.',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      await addGrade(student.id, selectedSubject, value);
      setNewGradeValue('');
      toast({
        title: 'Note ajoutée',
        description: `Note de ${value}/20 ajoutée en ${SUBJECTS[selectedSubject]}.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la note.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteGrade = async (subject: Subject, gradeId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      try {
        await deleteGrade(student.id, subject, gradeId);
        toast({
          title: 'Note supprimée',
          description: 'La note a été supprimée avec succès.',
        });
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la note.',
          variant: 'destructive',
        });
      }
    }
  };

  const getSubjectAverage = (subject: Subject) => {
    const grades = student.grades[subject];
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length;
  };

  const getGradeColor = (value: number) => {
    if (value > 10) return 'text-grade-excellent bg-grade-excellent/10 border-grade-excellent/20';
    if (value >= 7) return 'text-grade-good bg-grade-good/10 border-grade-good/20';
    return 'text-grade-poor bg-grade-poor/10 border-grade-poor/20';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleAddComment = async (subject: Subject) => {
    if (!newComment.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un commentaire.',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingComment(true);
    try {
      const result = await addComment(subject, newComment.trim());
      if (result.success) {
        setNewComment('');
        toast({
          title: 'Commentaire ajouté',
          description: `Commentaire ajouté pour ${SUBJECTS[subject]}.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editCommentText.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un commentaire.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await updateComment(commentId, editCommentText.trim());
      if (result.success) {
        setEditingComment(null);
        setEditCommentText('');
        toast({
          title: 'Commentaire modifié',
          description: 'Le commentaire a été modifié avec succès.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le commentaire.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      try {
        const result = await deleteComment(commentId);
        if (result.success) {
          toast({
            title: 'Commentaire supprimé',
            description: 'Le commentaire a été supprimé avec succès.',
          });
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le commentaire.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Grade Form */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter une note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Matière</Label>
              <Select value={selectedSubject} onValueChange={(value) => setSelectedSubject(value as Subject)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUBJECTS).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gradeValue">Note (sur 20)</Label>
              <Input
                id="gradeValue"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={newGradeValue}
                onChange={(e) => setNewGradeValue(e.target.value)}
                placeholder="Ex: 15.5"
              />
            </div>
            <div className="md:col-span-2">
              <Button
                onClick={handleAddGrade}
                disabled={isAdding || !newGradeValue}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                {isAdding ? 'Ajout...' : 'Ajouter la note'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades by Subject */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(SUBJECTS).map(([subject, name]) => {
          const grades = student.grades[subject as Subject];
          const average = getSubjectAverage(subject as Subject);
          const subjectComments = getCommentsBySubject(subject as Subject);
          
          return (
            <Card key={subject} className="border-0 shadow-soft">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={grades.length > 0 ? getGradeColor(average) : 'text-muted-foreground'}
                    >
                      {grades.length > 0 ? `${average.toFixed(1)}/20` : 'Aucune note'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {grades.length} note{grades.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Grades Section */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Notes
                  </h4>
                  {grades.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-lg">
                      <p>Aucune note pour cette matière</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {grades
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((grade) => (
                          <div
                            key={grade.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div>
                              <span className={`font-bold text-lg ${
                                grade.value > 10 ? 'text-grade-excellent' : 
                                grade.value >= 7 ? 'text-grade-good' : 'text-grade-poor'
                              }`}>
                                {grade.value}/20
                              </span>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(grade.date)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGrade(subject as Subject, grade.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Commentaires
                  </h4>
                  
                  {/* Add Comment Form */}
                  <div className="space-y-2 mb-3">
                    <Textarea
                      placeholder={`Ajouter un commentaire pour ${name}...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <Button
                      onClick={() => handleAddComment(subject as Subject)}
                      disabled={isAddingComment || !newComment.trim()}
                      size="sm"
                      className="w-full bg-gradient-primary hover:opacity-90"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {isAddingComment ? 'Ajout...' : 'Ajouter un commentaire'}
                    </Button>
                  </div>

                  {/* Comments List */}
                  {subjectComments.length === 0 ? (
                    <div className="text-center py-3 text-muted-foreground bg-muted/20 rounded-lg">
                      <p className="text-sm">Aucun commentaire pour cette matière</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {subjectComments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-muted/20 rounded-lg">
                          {editingComment === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleUpdateComment(comment.id)}
                                  size="sm"
                                  className="bg-gradient-primary hover:opacity-90"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Sauvegarder
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditCommentText('');
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  Annuler
                                </Button>
                              </div>
                            </div>
                           ) : (
                             <div>
                               <div className="flex items-start gap-3 mb-2">
                                 <UserAvatar 
                                   avatarUrl={comment.user_avatar}
                                   displayName={comment.user_name}
                                   size="sm"
                                 />
                                 <div className="flex-1">
                                   <p className="text-sm font-medium mb-1">
                                     {comment.user_name}
                                   </p>
                                   <p className="text-sm text-muted-foreground">{comment.contenu}</p>
                                 </div>
                               </div>
                               <div className="flex items-center justify-between ml-11">
                                 <p className="text-xs text-muted-foreground">
                                   {formatDate(comment.created_at)}
                                 </p>
                                 <div className="flex gap-1">
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => {
                                       setEditingComment(comment.id);
                                       setEditCommentText(comment.contenu);
                                     }}
                                     className="h-6 w-6 p-0"
                                   >
                                     <Edit2 className="w-3 h-3" />
                                   </Button>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => handleDeleteComment(comment.id)}
                                     className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                   >
                                     <Trash2 className="w-3 h-3" />
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Statistiques rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {Object.values(student.grades).flat().length}
              </p>
              <p className="text-sm text-muted-foreground">Notes totales</p>
            </div>
            <div className="text-center p-4 bg-grade-excellent/5 rounded-lg">
              <p className="text-2xl font-bold text-grade-excellent">
                {Object.values(student.grades).flat().filter(g => g.value > 10).length}
              </p>
              <p className="text-sm text-muted-foreground">Excellentes (&gt;10)</p>
            </div>
            <div className="text-center p-4 bg-grade-good/5 rounded-lg">
              <p className="text-2xl font-bold text-grade-good">
                {Object.values(student.grades).flat().filter(g => g.value >= 7 && g.value <= 10).length}
              </p>
              <p className="text-sm text-muted-foreground">Bonnes (7-10)</p>
            </div>
            <div className="text-center p-4 bg-grade-poor/5 rounded-lg">
              <p className="text-2xl font-bold text-grade-poor">
                {Object.values(student.grades).flat().filter(g => g.value < 7).length}
              </p>
              <p className="text-sm text-muted-foreground">À améliorer (&lt;7)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeManagement;