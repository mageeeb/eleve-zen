import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserRole } from '@/hooks/useUserRole';
import StudentCard from '@/components/StudentCard';
import StudentForm from '@/components/StudentForm';
import { UserAvatar } from '@/components/UserAvatar';
import { ProfileEdit } from '@/components/ProfileEdit';
import AdminValidation from '@/components/AdminValidation';
import { AdminPanel } from '@/components/AdminPanel';
import { LogOut, Plus, Search, Users, GraduationCap, ChevronDown, User, Shield, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const { students, loading, refreshStudents } = useSupabaseStudents();
  const { profile } = useUserProfile();
  const { isAdmin, isUser } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showAdminValidation, setShowAdminValidation] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Vérifier si l'utilisateur est le super admin
  const isSuperAdmin = user?.email === 'nanouchkaly@yahoo.fr';

  const handleLogout = async () => {
    await logout();
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
      {/* Mobile App Header */}
      <header className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">Gestion Élèves</h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.formation ? `Formation: ${profile.formation}` : 'Administration'}
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-foreground">Gestion</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-2 hover:bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserAvatar 
                        avatarUrl={profile?.avatar_url}
                        displayName={profile?.full_name || profile?.display_name}
                        email={profile?.email}
                        size="md"
                      />
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-foreground">
                          {profile?.full_name || profile?.display_name || 'Utilisateur'}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border border-border shadow-lg z-50">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowProfileEdit(true)}
                    className="cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Modifier le profil
                  </DropdownMenuItem>
                  {!isAdmin && (
                    <DropdownMenuItem 
                      onClick={() => setShowAdminValidation(true)}
                      className="cursor-pointer text-orange-600 focus:text-orange-700"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Devenir admin
                    </DropdownMenuItem>
                  )}
                  {isSuperAdmin && (
                    <DropdownMenuItem 
                      onClick={() => setShowAdminPanel(true)}
                      className="cursor-pointer text-purple-600 focus:text-purple-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Panneau Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8 py-4 sm:py-8 pb-20">
        {/* Mobile Stats Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-200 sm:hover:scale-[1.02]">
              <CardContent className="p-0">
                <div className={`${stat.gradient} p-3 sm:p-4 text-white rounded-xl sm:rounded-lg`}>
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="text-center sm:text-left">
                      <p className="text-white/80 text-xs sm:text-sm font-medium">{stat.title}</p>
                      <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="w-5 h-5 sm:w-8 sm:h-8 text-white/80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Controls */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl border-2 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-all duration-200 transform active:scale-[0.98] rounded-xl shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un élève
            </Button>
          )}
          {isUser && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                👁️ <strong>Mode consultation :</strong> Vous pouvez consulter les informations mais ne pouvez pas les modifier.
              </p>
            </div>
          )}
        </div>

        {/* Students Grid */}
        {loading ? (
          <Card className="text-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Chargement des élèves...</h3>
                <p className="text-muted-foreground">Veuillez patienter.</p>
              </div>
            </div>
          </Card>
        ) : filteredStudents.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}

        {/* Add Student Form Modal */}
        {showAddForm && isAdmin && (
          <StudentForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              refreshStudents(); // Rafraîchir automatiquement les données
              toast({
                title: 'Élève ajouté',
                description: 'Le nouvel élève a été ajouté avec succès.',
              });
            }}
          />
        )}

        {/* Profile Edit Modal */}
        {showProfileEdit && (
          <ProfileEdit
            open={showProfileEdit}
            onClose={() => setShowProfileEdit(false)}
          />
        )}

        {/* Admin Validation Modal */}
        {showAdminValidation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="relative">
              <AdminValidation />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdminValidation(false)}
                className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 p-0 shadow-md hover:bg-gray-100"
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* Admin Panel Modal */}
        {showAdminPanel && isSuperAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <AdminPanel />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdminPanel(false)}
                className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 p-0 shadow-md hover:bg-gray-100"
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;