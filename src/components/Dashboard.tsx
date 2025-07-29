import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import StudentCard from '@/components/StudentCard';
import StudentForm from '@/components/StudentForm';
import { LogOut, Plus, Search, Users, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const { students } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès.',
    });
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    {
      title: 'Total Élèves',
      value: students.length,
      icon: Users,
      gradient: 'bg-gradient-primary'
    },
    {
      title: 'Classe 1',
      value: students.filter(s => s.className === 'Classe 1').length,
      icon: GraduationCap,
      gradient: 'bg-gradient-success'
    },
    {
      title: 'Classe 2',
      value: students.filter(s => s.className === 'Classe 2').length,
      icon: GraduationCap,
      gradient: 'bg-gradient-warning'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gestion Élèves</h1>
                <p className="text-sm text-muted-foreground">Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Connecté en tant que <strong>{user?.name}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-200">
              <CardContent className="p-0">
                <div className={`${stat.gradient} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="w-8 h-8 text-white/80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher un élève ou une classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un élève
          </Button>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <Card className="text-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Aucun élève trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Essayez de modifier votre recherche.' : 'Commencez par ajouter votre premier élève.'}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}

        {/* Add Student Form Modal */}
        {showAddForm && (
          <StudentForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              toast({
                title: 'Élève ajouté',
                description: 'Le nouvel élève a été ajouté avec succès.',
              });
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;