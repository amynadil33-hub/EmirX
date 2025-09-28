import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  FileText, 
  Settings, 
  LayoutDashboard,
  LogOut,
  BookOpen,
  FolderOpen,
  Users,
  Briefcase,
  Calculator,
  Megaphone,
  Search,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const assistants = [
    { id: 'hr', name: 'HR Assistant', icon: Users },
    { id: 'secretary', name: 'Secretary', icon: Briefcase },
    { id: 'accounting', name: 'Accounting', icon: Calculator },
    { id: 'marketing', name: 'Marketing', icon: Megaphone },
    { id: 'research', name: 'Research', icon: Search },
    { id: 'lawyer', name: 'Legal', icon: Scale }
  ];

  const isActive = (path: string) => location.pathname === path;
  const isAssistantActive = (id: string) => location.pathname === `/chat/${id}`;

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Musalhu</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="text-sm text-gray-600">Welcome back!</div>
        <div className="text-sm font-medium text-gray-900 truncate">{user?.email}</div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <div className="space-y-1">
            <Button 
              variant={isActive('/dashboard') ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            
            <Button 
              variant={isActive('/documents') ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => navigate('/documents')}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Documents
            </Button>
            
            <Button 
              variant={isActive('/templates') ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => navigate('/templates')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </div>
        </div>

        <div className="px-4 py-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            AI Assistants
          </div>
          <div className="space-y-1">
            {assistants.map((assistant) => {
              const Icon = assistant.icon;
              return (
                <Button
                  key={assistant.id}
                  variant={isAssistantActive(assistant.id) ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    console.log('Sidebar - Navigating to assistant:', assistant.id);
                    navigate(`/chat/${assistant.id}`);
                  }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {assistant.name}
                </Button>
                );
              })}
            </div>
        </div>

        <div className="px-4 py-2">
          <Button 
            variant={isActive('/settings') ? 'secondary' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;