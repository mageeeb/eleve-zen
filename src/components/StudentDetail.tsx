import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Student, Subject, SUBJECTS } from '@/types/Student';
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents';
import StudentForm from '@/components/StudentForm';
import GradeChart from '@/components/GradeChart';
import GradeManagement from '@/components/GradeManagement';
import { X, Edit, User, BarChart3, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StudentDetailProps {
  student: Student;
  onClose: () => void;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student: initialStudent, onClose }) => {
  const { students, calculateAverage, getGradeColor, getStudentById, updateTrigger } = useSupabaseStudents();
  
  // Get the current student data from the hook to ensure real-time updates
  const student = getStudentById(initialStudent.id) || initialStudent;
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const average = calculateAverage(student);
  const gradeColorClass = getGradeColor(average);

  const getInitials = () => {
    return `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  };

  const getSubjectAverage = (subject: Subject) => {
    const grades = student.grades[subject];
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
        <Card className="w-full sm:max-w-4xl min-h-screen sm:min-h-0 sm:max-h-[90vh] overflow-hidden shadow-strong rounded-none sm:rounded-2xl my-0 sm:my-4">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-primary text-white sticky top-0 z-10 p-3 sm:p-6 pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12 sm:h-12 sm:w-12 ring-2 ring-white/20">
                <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-white/80 text-sm">
                  {student.age} ans • {student.gender} • {student.className}
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditForm(true)}
                className="text-white hover:bg-white/20 h-9 w-9 sm:w-auto"
              >
                <Edit className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Modifier</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-white hover:bg-white/20 h-9 w-9"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <div className="overflow-y-auto flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 sticky top-0 z-10 mx-0 rounded-none border-b p-1">
                <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Vue d'ensemble</span>
                  <span className="sm:hidden">Vue</span>
                </TabsTrigger>
                <TabsTrigger value="grades" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Gestion des notes</span>
                  <span className="sm:hidden">Notes</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Statistiques</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                {/* General Average */}
                <Card className="border-0 shadow-soft rounded-2xl">
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-3 sm:mb-2">Moyenne générale</h3>
                       <div className={`text-5xl sm:text-4xl font-bold mb-3 sm:mb-2 ${
                         average > 10 ? 'text-grade-excellent' : 
                         average > 5 ? 'text-grade-good' : 'text-grade-poor'
                       }`}>
                        {average.toFixed(1)}/20
                      </div>
                       <Badge 
                         variant="outline" 
                         className={`rounded-full ${
                           average > 10 ? 'bg-grade-excellent/10 text-grade-excellent border-grade-excellent/20' : 
                           average > 5 ? 'bg-grade-good/10 text-grade-good border-grade-good/20' : 
                           'bg-grade-poor/10 text-grade-poor border-grade-poor/20'
                         }`}
                       >
                        {average > 10 ? 'Excellent' : average >= 7 ? 'Bien' : 'À améliorer'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Subject Averages */}
                <Card className="border-0 shadow-soft rounded-2xl">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg">Moyennes par matière</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {Object.entries(SUBJECTS).map(([subject, name]) => {
                        const subjectAverage = getSubjectAverage(subject as Subject);
                        const subjectColorClass = getGradeColor(subjectAverage);
                        const gradeCount = student.grades[subject as Subject].length;
                        
                        return (
                          <div key={subject} className="flex items-center justify-between p-4 sm:p-3 bg-muted/30 rounded-xl sm:rounded-lg">
                            <div>
                              <p className="font-medium text-base sm:text-sm">{name}</p>
                              <p className="text-sm text-muted-foreground">
                                {gradeCount} note{gradeCount > 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg sm:text-base ${
                                gradeCount > 0 ? 
                                  (subjectAverage > 10 ? 'text-grade-excellent' : 
                                   subjectAverage > 5 ? 'text-grade-good' : 'text-grade-poor')
                                  : 'text-muted-foreground'
                              }`}>
                                {gradeCount > 0 ? `${subjectAverage.toFixed(1)}/20` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Comments */}
                {student.adminComments && (
                  <Card className="border-0 shadow-soft">
                    <CardHeader>
                      <CardTitle>Commentaires de l'administrateur</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                        {student.adminComments}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Student Info */}
                <Card className="border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle>Informations de l'élève</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Ajouté le</p>
                        <p className="font-medium">{formatDate(student.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dernière modification</p>
                        <p className="font-medium">{formatDate(student.updatedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="grades" className="p-4 sm:p-6 overflow-y-auto">
                <GradeManagement student={student} />
              </TabsContent>

              <TabsContent value="stats" className="p-4 sm:p-6 overflow-y-auto">
                <GradeChart student={student} />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <StudentForm
          student={student}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            toast({
              title: 'Élève modifié',
              description: 'Les informations ont été mises à jour avec succès.',
            });
          }}
        />
      )}
    </>
  );
};

export default StudentDetail;