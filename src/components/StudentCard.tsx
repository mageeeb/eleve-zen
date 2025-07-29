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
  const { deleteStudent, calculateAverage, getGradeColor, getStudentById } = useSupabaseStudents();
  const [showDetail, setShowDetail] = useState(false);
  
  // Get the current student data from the hook to ensure real-time updates
  const student = getStudentById(initialStudent.id) || initialStudent;
  const average = calculateAverage(student);
  const gradeColorClass = getGradeColor(average);

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${student.firstName} ${student.lastName} ?`)) {
      deleteStudent(student.id);
      toast({
        title: 'Élève supprimé',
        description: `${student.firstName} ${student.lastName} a été supprimé avec succès.`,
      });
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
      <Card className="hover:shadow-medium transition-all duration-200 border-0 shadow-soft overflow-hidden group">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
              <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {student.age} ans • {student.gender}
              </p>
              <Badge variant="outline" className="mt-1 text-xs">
                {student.className}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Average Grade */}
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Moyenne générale</p>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-2xl font-bold text-${gradeColorClass}`}>
                  {average.toFixed(1)}/20
                </span>
                <Badge 
                  variant="outline" 
                  className={`bg-${gradeColorClass}/10 text-${gradeColorClass} border-${gradeColorClass}/20`}
                >
                  {getGradeText(average)}
                </Badge>
              </div>
            </div>

            {/* Comments Preview */}
            {student.adminComments && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Commentaire :</p>
                <p className="line-clamp-2 bg-muted/30 p-2 rounded text-xs">
                  {student.adminComments}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetail(true)}
                className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Eye className="w-4 h-4 mr-1" />
                Voir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
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