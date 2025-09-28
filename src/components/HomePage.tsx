import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Shield, Globe, Users, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const assistants = [
    {
      id: 1,
      name: "Business Strategist",
      description: "Strategic planning & market analysis for Maldivian enterprises",
      image: "https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642368994_d145d26f.webp",
      specialty: "Strategy",
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Finance Expert", 
      description: "Financial planning & investment guidance for local businesses",
      image: "https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642370941_4ab87a5a.webp",
      specialty: "Finance",
      color: "bg-green-500"
    },
    {
      id: 3,
      name: "Marketing Guru",
      description: "Digital marketing & brand development for Maldivian market",
      image: "https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642372655_11442034.webp",
      specialty: "Marketing",
      color: "bg-purple-500"
    },
    {
      id: 4,
      name: "Operations Manager",
      description: "Streamline operations & boost efficiency across your business",
      image: "https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642374392_eab221e1.webp",
      specialty: "Operations",
      color: "bg-orange-500"
    },
    {
      id: 5,
      name: "HR Specialist",
      description: "Human resources & talent management for growing teams",
      image: "https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642376187_d6a291eb.webp",
      specialty: "HR",
      color: "bg-pink-500"
    },
    {
      id: 6,
      name: "Legal Advisor",
      description: "Legal compliance & business regulations in Maldives",
      image: "https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642377967_db760c86.webp",
      specialty: "Legal",
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2">
                  🇲🇻 Made for Maldivian Businesses
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Musalhu
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {" "}AI Assistants
                  </span>
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed">
                  Boost productivity for Maldivian entrepreneurs, businesses & employees with 6 specialized AI rabbits. 
                  Each assistant brings 3 powerful bots to transform your workflow.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg"
                  onClick={() => navigate('/login')}
                >
                  Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-8">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="text-white font-medium">500+ Businesses</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-white ml-2">4.9/5 Rating</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68d08519ba92301c0d9c4564_1758642357939_277bc593.webp"
                alt="Futuristic AI Rabbit Assistant"
                className="relative w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-bold text-white mb-4">Why Choose Musalhu AI Rabbits?</h2>
             <p className="text-xl text-gray-300">Built specifically for the Maldivian business ecosystem</p>
           </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <Zap className="w-12 h-12 text-blue-400 mb-4" />
                <CardTitle className="text-white">Lightning Fast</CardTitle>
                <CardDescription className="text-gray-300">
                  Get instant responses and solutions tailored to Maldivian business needs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <Shield className="w-12 h-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Secure & Private</CardTitle>
                <CardDescription className="text-gray-300">
                  Enterprise-grade security with local data protection compliance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <Globe className="w-12 h-12 text-green-400 mb-4" />
                <CardTitle className="text-white">Local Expertise</CardTitle>
                <CardDescription className="text-gray-300">
                  Deep understanding of Maldivian market, culture, and business practices
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Assistants Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Your AI Assistant Team</h2>
            <p className="text-xl text-gray-300">6 Specialized Rabbits × 3 Bots Each = 18 Powerful Tools</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assistants.map((assistant) => (
              <Card key={assistant.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <div className={`absolute inset-0 ${assistant.color} rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                    <img 
                      src={assistant.image}
                      alt={assistant.name}
                      className="relative w-24 h-24 rounded-full mx-auto border-4 border-white/20"
                    />
                  </div>
                  <Badge className={`${assistant.color} text-white mb-2`}>
                    {assistant.specialty}
                  </Badge>
                  <CardTitle className="text-white text-xl">{assistant.name}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {assistant.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => navigate('/login')}
                  >
                    Access Assistant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
              <div className="text-gray-300">Maldivian Businesses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">18</div>
              <div className="text-gray-300">AI Bots Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">95%</div>
              <div className="text-gray-300">Productivity Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">24/7</div>
              <div className="text-gray-300">Always Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Become Super Professional?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of Maldivian entrepreneurs and businesses already boosting their productivity
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-4 text-xl"
            onClick={() => navigate('/signup')}
          >
            Get Started Free <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;