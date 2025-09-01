import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Student } from '@/types/Student';
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents';
import StudentDetail from '@/components/StudentDetail';
import { Eye, Edit, Trash2, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student: initialStudent }) => {
  const { deleteStudent, calculateAverage, getGradeColor, getStudentById, updateTrigger } = useSupabaseStudents();
  const [showDetail, setShowDetail] = useState(false);
  
  // Get the current student data from the hook to ensure real-time updates
  const student = getStudentById(initialStudent.id) || initialStudent;
  const average = calculateAverage(student);
  const gradeColorClass = getGradeColor(average);

  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${student.firstName} ${student.lastName} ?`)) {
      try {
        await deleteStudent(student.id);
        toast({
          title: 'Élève supprimé',
          description: `${student.firstName} ${student.lastName} a été supprimé avec succès.`,
        });
      } catch (error) {
        console.error('Delete error:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer l\'élève. Vérifiez vos permissions.',
          variant: 'destructive'
        });
      }
    }
  };

  const getInitials = () => {
    return `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  };

  const getGradeText = (average: number) => {
    if (average > 10) return 'Excellent';
    if (average >= 7) return 'Bien';
    return 'À améliorer';
  };

  return (
    <>
      <Card className="hover:shadow-medium transition-all duration-200 border-0 shadow-soft overflow-hidden group active:scale-[0.98] sm:active:scale-100 sm:hover:scale-[1.02] rounded-2xl">
        <CardHeader className="pb-4 p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className="h-14 w-14 sm:h-12 sm:w-12 ring-2 ring-primary/20 shadow-lg">
              <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
              <AvatarFallback className="bg-gradient-primary text-white font-semibold text-lg sm:text-base">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate text-lg sm:text-base">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {student.age} ans • {student.gender}
              </p>
              <Badge variant="outline" className="mt-2 text-xs font-medium rounded-full">
                {student.className}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 p-4 sm:p-6 sm:pt-0">
          <div className="space-y-4 sm:space-y-4">
            {/* Average Grade */}
            <div className="text-center p-4 sm:p-3 rounded-2xl sm:rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 shadow-inner">
              <p className="text-sm text-muted-foreground mb-2 sm:mb-1 font-medium">Moyenne générale</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <span className={`text-3xl sm:text-2xl font-bold tracking-tight ${
                  average > 10 ? 'text-grade-excellent' : 
                  average > 5 ? 'text-grade-good' : 'text-grade-poor'
                }`}>
                  {average.toFixed(1)}/20
                </span>
                <Badge 
                  variant="outline" 
                  className={`rounded-full font-medium ${
                    average > 10 ? 'bg-grade-excellent/10 text-grade-excellent border-grade-excellent/20' : 
                    average > 5 ? 'bg-grade-good/10 text-grade-good border-grade-good/20' : 
                    'bg-grade-poor/10 text-grade-poor border-grade-poor/20'
                  }`}
                >
                  {getGradeText(average)}
                </Badge>
              </div>
            </div>

            {/* Comments Preview */}
            {student.adminComments && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Commentaire :</p>
                <p className="line-clamp-2 bg-muted/30 p-3 rounded-xl text-xs leading-relaxed">
                  {student.adminComments}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDetail(true);
                  // Scroll après l'ouverture du modal
                  setTimeout(() => {
                    const modal = document.querySelector('[class*="fixed inset-0"]');
                    if (modal) {
                      modal.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="flex-1 hover:bg-primary hover:text-primary-foreground transition-all h-10 sm:h-9 rounded-xl font-medium shadow-sm"
              >
                <Eye className="w-4 h-4 mr-2 sm:mr-1" />
                Voir détails
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="hover:bg-destructive hover:text-destructive-foreground transition-all h-10 sm:h-9 w-12 sm:w-auto rounded-xl shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      {showDetail && (
        <StudentDetail
          student={student}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default StudentCard;