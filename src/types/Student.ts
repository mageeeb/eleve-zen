export interface Grade {
  id: string;
  value: number;
  date: string;
}

export interface SubjectGrades {
  javascript: Grade[];
  linux: Grade[];
  docker: Grade[];
  jquery: Grade[];
  bootstrap: Grade[];
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Masculin' | 'Féminin';
  className: 'Classe 1' | 'Classe 2';
  avatar?: string;
  adminComments: string;
  grades: SubjectGrades;
  createdAt: string;
  updatedAt: string;
}

export type Subject = keyof SubjectGrades;

export const SUBJECTS: Record<Subject, string> = {
  javascript: 'JavaScript',
  linux: 'Linux',
  docker: 'Docker',
  jquery: 'jQuery',
  bootstrap: 'Bootstrap'
};

export const SUBJECT_COLORS: Record<Subject, string> = {
  javascript: '#f7df1e',
  linux: '#fcc624',
  docker: '#2496ed',
  jquery: '#0769ad',
  bootstrap: '#7952b3'
};