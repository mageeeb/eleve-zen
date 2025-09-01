import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Student, Subject, SUBJECTS, SUBJECT_COLORS } from '@/types/Student';
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';

interface GradeChartProps {
  student: Student;
}

const GradeChart: React.FC<GradeChartProps> = ({ student }) => {
  const { calculateAverage } = useSupabaseStudents();

  const getSubjectAverage = (subject: Subject) => {
    const grades = student.grades[subject];
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length;
  };

  // Data for bar chart
  const barChartData = Object.entries(SUBJECTS).map(([subject, name]) => {
    const average = getSubjectAverage(subject as Subject);
    const gradeCount = student.grades[subject as Subject].length;
    
    return {
      subject: name,
      average: average,
      gradeCount: gradeCount,
      color: average > 10 ? 'hsl(var(--grade-excellent))' : 
             average > 5 ? 'hsl(var(--grade-good))' : 
             'hsl(var(--grade-poor))'
    };
  });

  // Data for radar chart
  const radarChartData = Object.entries(SUBJECTS).map(([subject, name]) => ({
    subject: name,
    average: getSubjectAverage(subject as Subject),
    fullMark: 20
  }));

  // Timeline data for all grades
  const timelineData = [];
  Object.entries(student.grades).forEach(([subject, grades]) => {
    grades.forEach(grade => {
      timelineData.push({
        date: grade.date,
        subject: SUBJECTS[subject as Subject],
        value: grade.value,
        timestamp: new Date(grade.date).getTime()
      });
    });
  });
  
  timelineData.sort((a, b) => a.timestamp - b.timestamp);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-medium">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            Moyenne: {payload[0].value.toFixed(1)}/20
          </p>
          <p className="text-muted-foreground text-sm">
            {payload[0].payload.gradeCount} note{payload[0].payload.gradeCount > 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const RadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-medium">
          <p className="font-medium">{payload[0].payload.subject}</p>
          <p className="text-primary">
            Moyenne: {payload[0].value.toFixed(1)}/20
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Moyennes par matière</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="subject" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 20]} 
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="average" 
                radius={[4, 4, 0, 0]}
              >
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Vue d'ensemble des compétences</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarChartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 20]} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Radar
                name="Moyenne"
                dataKey="average"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip content={<RadarTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Grades Timeline */}
      {timelineData.length > 0 && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Évolution des notes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {timelineData.slice(-10).reverse().map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-lg ${
                      item.value > 10 ? 'text-grade-excellent' : 
                      item.value > 5 ? 'text-grade-good' : 'text-grade-poor'
                    }`}>
                      {item.value}/20
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-soft text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">
              {Object.values(student.grades).flat().length}
            </p>
            <p className="text-sm text-muted-foreground">Notes totales</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-soft text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-accent">
              {Object.values(student.grades).filter(grades => grades.length > 0).length}/5
            </p>
            <p className="text-sm text-muted-foreground">Matières évaluées</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-soft text-center">
          <CardContent className="p-4">
            <p className={`text-2xl font-bold ${
              calculateAverage(student) > 10 ? 'text-grade-excellent' : 
              calculateAverage(student) > 5 ? 'text-grade-good' : 'text-grade-poor'
            }`}>
              {calculateAverage(student).toFixed(1)}/20
            </p>
            <p className="text-sm text-muted-foreground">Moyenne générale</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GradeChart;