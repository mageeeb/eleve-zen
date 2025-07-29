import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Student, Subject, Grade } from '@/types/Student';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchStudents();
    }
  }, [isAuthenticated]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eleves')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        return;
      }

      // Transform Supabase data to our Student interface
      const transformedStudents: Student[] = data?.map(student => ({
        id: student.id,
        firstName: student.prenom,
        lastName: student.nom,
        age: student.age || 0,
        gender: (student.sexe === 'Masculin' || student.sexe === 'Féminin') ? student.sexe : 'Masculin',
        className: (student.classe === 'Classe 1' || student.classe === 'Classe 2') ? student.classe : 'Classe 1',
        avatar: student.avatar_url || '',
        adminComments: '',
        grades: {
          javascript: [],
          linux: [],
          docker: [],
          jquery: [],
          bootstrap: []
        },
        createdAt: student.created_at,
        updatedAt: student.created_at
      })) || [];

      // Fetch grades for each student
      for (const student of transformedStudents) {
        await fetchGradesForStudent(student);
      }

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error in fetchStudents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGradesForStudent = async (student: Student) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('eleve_id', student.id);

      if (error) {
        console.error('Error fetching grades:', error);
        return;
      }

      const grades = {
        javascript: [],
        linux: [],
        docker: [],
        jquery: [],
        bootstrap: []
      };

      data?.forEach(note => {
        const subject = note.matiere.toLowerCase() as Subject;
        if (grades[subject]) {
          grades[subject].push({
            id: note.id,
            value: Number(note.note),
            date: note.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
          });
        }
      });

      student.grades = grades;
    } catch (error) {
      console.error('Error fetching grades for student:', error);
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data, error } = await supabase
        .from('eleves')
        .insert([{
          nom: studentData.lastName,
          prenom: studentData.firstName,
          age: studentData.age,
          sexe: studentData.gender,
          classe: studentData.className,
          avatar_url: studentData.avatar,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding student:', error);
        throw error;
      }

      const newStudent: Student = {
        id: data.id,
        firstName: data.prenom,
        lastName: data.nom,
        age: data.age || 0,
        gender: (data.sexe === 'Masculin' || data.sexe === 'Féminin') ? data.sexe : 'Masculin' as const,
        className: (data.classe === 'Classe 1' || data.classe === 'Classe 2') ? data.classe : 'Classe 1' as const,
        avatar: data.avatar_url || '',
        adminComments: studentData.adminComments,
        grades: {
          javascript: [],
          linux: [],
          docker: [],
          jquery: [],
          bootstrap: []
        },
        createdAt: data.created_at,
        updatedAt: data.created_at
      };

      // Add comments if any
      if (studentData.adminComments) {
        await supabase
          .from('commentaires')
          .insert([{
            eleve_id: data.id,
            contenu: studentData.adminComments
          }]);
      }

      setStudents(prev => [newStudent, ...prev]);
      return newStudent;
    } catch (error) {
      console.error('Error in addStudent:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updateData: any = {};
      if (updates.firstName) updateData.prenom = updates.firstName;
      if (updates.lastName) updateData.nom = updates.lastName;
      if (updates.age !== undefined) updateData.age = updates.age;
      if (updates.gender) updateData.sexe = updates.gender;
      if (updates.className) updateData.classe = updates.className;
      if (updates.avatar) updateData.avatar_url = updates.avatar;

      const { error } = await supabase
        .from('eleves')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating student:', error);
        throw error;
      }

      setStudents(prev => 
        prev.map(student => 
          student.id === id 
            ? { ...student, ...updates, updatedAt: new Date().toISOString() }
            : student
        )
      );
    } catch (error) {
      console.error('Error in updateStudent:', error);
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('eleves')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        throw error;
      }

      setStudents(prev => prev.filter(student => student.id !== id));
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      throw error;
    }
  };

  const addGrade = async (studentId: string, subject: Subject, value: number) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          eleve_id: studentId,
          matiere: subject,
          note: value
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding grade:', error);
        throw error;
      }

      const newGrade: Grade = {
        id: data.id,
        value: Number(data.note),
        date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      };

      setStudents(prev =>
        prev.map(student =>
          student.id === studentId
            ? {
                ...student,
                grades: {
                  ...student.grades,
                  [subject]: [...student.grades[subject], newGrade]
                },
                updatedAt: new Date().toISOString()
              }
            : student
        )
      );
      
      // Forcer la mise à jour des composants
      setUpdateTrigger(prev => prev + 1);
      
      // Retourner la nouvelle note pour confirmation
      return newGrade;
    } catch (error) {
      console.error('Error in addGrade:', error);
      throw error;
    }
  };

  const deleteGrade = async (studentId: string, subject: Subject, gradeId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', gradeId);

      if (error) {
        console.error('Error deleting grade:', error);
        throw error;
      }

      setStudents(prev =>
        prev.map(student =>
          student.id === studentId
            ? {
                ...student,
                grades: {
                  ...student.grades,
                  [subject]: student.grades[subject].filter(grade => grade.id !== gradeId)
                },
                updatedAt: new Date().toISOString()
              }
            : student
        )
      );
      
      // Forcer la mise à jour des composants
      setUpdateTrigger(prev => prev + 1);
      
      return true;
    } catch (error) {
      console.error('Error in deleteGrade:', error);
      throw error;
    }
  };

  const getStudentById = (id: string) => {
    // Le updateTrigger force la re-evaluation même si l'objet est le même
    return students.find(student => student.id === id);
  };

  const calculateAverage = (student: Student): number => {
    const allGrades: number[] = [];
    Object.values(student.grades).forEach(subjectGrades => {
      subjectGrades.forEach(grade => allGrades.push(grade.value));
    });
    
    if (allGrades.length === 0) return 0;
    return allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length;
  };

  const getGradeColor = (average: number): string => {
    if (average > 10) return 'grade-excellent';
    if (average >= 7) return 'grade-good';
    return 'grade-poor';
  };

  return {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    addGrade,
    deleteGrade,
    getStudentById,
    calculateAverage,
    getGradeColor,
    refreshStudents: fetchStudents,
    updateTrigger // Exposer le trigger pour forcer les mises à jour
  };
};