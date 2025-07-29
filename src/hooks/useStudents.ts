import { useState, useEffect } from 'react';
import { Student, Subject, Grade } from '@/types/Student';

const STORAGE_KEY = 'students-data';

// Mock data for initial setup
const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dupont',
    age: 20,
    gender: 'Féminin',
    className: 'Classe 1',
    avatar: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
    adminComments: 'Excellente étudiante, très motivée et assidue.',
    grades: {
      javascript: [
        { id: '1', value: 16, date: '2024-01-15' },
        { id: '2', value: 14, date: '2024-02-10' }
      ],
      linux: [
        { id: '3', value: 12, date: '2024-01-20' }
      ],
      docker: [
        { id: '4', value: 18, date: '2024-02-05' }
      ],
      jquery: [
        { id: '5', value: 15, date: '2024-01-25' }
      ],
      bootstrap: [
        { id: '6', value: 13, date: '2024-02-15' }
      ]
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-02-15'
  },
  {
    id: '2',
    firstName: 'Pierre',
    lastName: 'Martin',
    age: 22,
    gender: 'Masculin',
    className: 'Classe 2',
    avatar: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1',
    adminComments: 'Bon niveau technique, peut encore progresser en Docker.',
    grades: {
      javascript: [
        { id: '7', value: 8, date: '2024-01-15' },
        { id: '8', value: 10, date: '2024-02-10' }
      ],
      linux: [
        { id: '9', value: 9, date: '2024-01-20' }
      ],
      docker: [
        { id: '10', value: 5, date: '2024-02-05' }
      ],
      jquery: [
        { id: '11', value: 11, date: '2024-01-25' }
      ],
      bootstrap: [
        { id: '12', value: 12, date: '2024-02-15' }
      ]
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-02-15'
  }
];

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      setStudents(JSON.parse(savedData));
    } else {
      setStudents(mockStudents);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStudents));
    }
  }, []);

  const saveStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStudents));
  };

  const addStudent = (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedStudents = [...students, newStudent];
    saveStudents(updatedStudents);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const updatedStudents = students.map(student =>
      student.id === id
        ? { ...student, ...updates, updatedAt: new Date().toISOString() }
        : student
    );
    saveStudents(updatedStudents);
  };

  const deleteStudent = (id: string) => {
    const updatedStudents = students.filter(student => student.id !== id);
    saveStudents(updatedStudents);
  };

  const addGrade = (studentId: string, subject: Subject, value: number) => {
    const newGrade: Grade = {
      id: Date.now().toString(),
      value,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedStudents = students.map(student =>
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
    );
    saveStudents(updatedStudents);
  };

  const deleteGrade = (studentId: string, subject: Subject, gradeId: string) => {
    const updatedStudents = students.map(student =>
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
    );
    saveStudents(updatedStudents);
  };

  const getStudentById = (id: string) => {
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
    addStudent,
    updateStudent,
    deleteStudent,
    addGrade,
    deleteGrade,
    getStudentById,
    calculateAverage,
    getGradeColor
  };
};