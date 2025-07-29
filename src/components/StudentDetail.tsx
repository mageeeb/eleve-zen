import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Student, Subject, SUBJECTS } from '@/types/Student';
import { useStudents } from '@/hooks/useStudents';
import StudentForm from '@/components/StudentForm';
import GradeChart from '@/components/GradeChart';
import GradeManagement from '@/components/GradeManagement';
import { X, Edit, User, BarChart3, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StudentDetailProps {
  student: Student;
  onClose: () => void;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, onClose }) => {
  const { calculateAverage, getGradeColor } = useStudents();
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-strong">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-primary text-white">
            <CardTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-white/20">
                <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-white/80 text-sm">
                  {student.age} ans • {student.gender} • {student.className}
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditForm(true)}
                className="text-white hover:bg-white/20"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="grades" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Gestion des notes
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Statistiques
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6 space-y-6">
                {/* General Average */}
                <Card className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Moyenne générale</h3>
                      <div className={`text-4xl font-bold text-${gradeColorClass} mb-2`}>
                        {average.toFixed(1)}/20
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`bg-${gradeColorClass}/10 text-${gradeColorClass} border-${gradeColorClass}/20`}
                      >
                        {average > 10 ? 'Excellent' : average >= 7 ? 'Bien' : 'À améliorer'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Subject Averages */}
                <Card className="border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle>Moyennes par matière</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(SUBJECTS).map(([subject, name]) => {
                        const subjectAverage = getSubjectAverage(subject as Subject);
                        const subjectColorClass = getGradeColor(subjectAverage);
                        const gradeCount = student.grades[subject as Subject].length;
                        
                        return (
                          <div key={subject} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium">{name}</p>
                              <p className="text-sm text-muted-foreground">
                                {gradeCount} note{gradeCount > 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-${subjectColorClass}`}>
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

              <TabsContent value="grades" className="p-6">
                <GradeManagement student={student} />
              </TabsContent>

              <TabsContent value="stats" className="p-6">
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