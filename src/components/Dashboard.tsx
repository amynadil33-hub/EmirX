import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Calculator, Megaphone, Search, Gavel, MessageSquare, Briefcase, Scale, Bot, BarChart3 } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import BotManagement from './BotManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assistants');

  const assistants = [
    {
      id: 'hr',
      name: 'HR Specialist',
      description: 'Human resources & talent management for growing teams',
      icon: <Users className="h-8 w-8" />,
      color: 'from-pink-500 to-pink-600',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642376187_d6a291eb.webp',
      bots: 3
    },
    {
      id: 'secretary',
      name: 'Secretary Assistant',
      description: 'Administrative tasks, scheduling, and office management',
      icon: <Briefcase className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642374392_eab221e1.webp',
      bots: 3
    },
    {
      id: 'accounting',
      name: 'Accounting Assistant',
      description: 'Financial management and bookkeeping for businesses',
      icon: <Calculator className="h-8 w-8" />,
      color: 'from-green-500 to-green-600',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642370941_4ab87a5a.webp',
      bots: 3
    },
    {
      id: 'marketing',
      name: 'Marketing Assistant',
      description: 'Tourism marketing and promotional strategies for Maldives',
      icon: <Megaphone className="h-8 w-8" />,
      color: 'from-purple-500 to-purple-600',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642372655_11442034.webp',
      bots: 3
    },
    {
      id: 'research',
      name: 'Research Assistant',
      description: 'Market research and business intelligence',
      icon: <Search className="h-8 w-8" />,
      color: 'from-orange-500 to-orange-600',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642368994_d145d26f.webp',
      bots: 3
    },
    {
      id: 'lawyer',
      name: 'Legal Assistant',
      description: 'Legal guidance for Maldivian business law (not legal advice)',
      icon: <Scale className="h-8 w-8" />,
      color: 'from-indigo-500 to-indigo-600',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642377967_db760c86.webp',
      bots: 3
    }
  ];

  const handleAssistantClick = (assistantId: string) => {
    navigate(`/chat/${assistantId}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50 via-white to-teal-50 min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Musalhu - Your Professional AI Rabbit Team 🐰
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            6 Super Professional AI Rabbits with briefcases, each bringing 3 specialized bots for Maldivian businesses
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assistants</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">AI-powered assistants</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Ready to assist</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">English & Dhivehi</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="assistants" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              AI Assistants
            </TabsTrigger>
            <TabsTrigger value="bots" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Bot Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assistants" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assistants.map((assistant) => (
                <Card 
                  key={assistant.id} 
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white overflow-hidden"
                  onClick={() => handleAssistantClick(assistant.id)}
                >
                  <CardHeader className={`bg-gradient-to-br ${assistant.color} text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                        <img 
                          src={assistant.image} 
                          alt={assistant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-white/90 group-hover:text-white transition-colors">
                        {assistant.icon}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {assistant.name}
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {assistant.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{assistant.bots} specialized bots</span>
                      <Bot className="w-4 h-4" />
                    </div>
                    <Button 
                      className={`w-full bg-gradient-to-r ${assistant.color} hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-white border-0`}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-purple-100">Always Available</div>
                </CardContent>
              </Card>
              
               <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold mb-2">6</div>
                  <div className="text-teal-100">Expert Assistants</div>
                </CardContent>
              </Card>
               
               <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold mb-2">18</div>
                  <div className="text-indigo-100">Specialized Bots</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold mb-2">∞</div>
                  <div className="text-orange-100">Unlimited Chats</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bots">
            <BotManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;