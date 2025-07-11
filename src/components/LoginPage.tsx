import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    setCurrentDate(now.toLocaleDateString('en-US', options));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Subtle Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-[200vmax] h-[200vmax] bg-[radial-gradient(circle,rgba(0,0,0,0.02)_0%,transparent_70%)] animate-[pulse_40s_ease-in-out_infinite]"></div>
        <div className="absolute top-2/3 left-2/5 w-[180vmax] h-[180vmax] bg-[radial-gradient(circle,rgba(0,0,0,0.015)_0%,transparent_65%)] animate-[pulse_35s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/3 left-3/4 w-[220vmax] h-[220vmax] bg-[radial-gradient(circle,rgba(0,0,0,0.025)_0%,transparent_75%)] animate-[pulse_45s_ease-in-out_infinite]"></div>
      </div>
      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translate(-5%, -3%) scale(1.02);
            opacity: 0.4;
          }
          66% {
            transform: translate(4%, 2%) scale(0.98);
            opacity: 0.25;
          }
        }
      `}</style>

      {/* Title in Top Left */}
      <div className="absolute top-8 left-8">
        <h1 className="text-3xl font-medium text-gray-900 tracking-tight">
          Timesheet
        </h1>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md">
        <Card className="shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 rounded-xl bg-white/95 backdrop-blur-sm animate-fade-in">
          {/* Date Header */}
          <div className="w-full bg-gray-900 py-5 rounded-t-xl">
            <div className="text-center text-gray-100 font-normal text-md tracking-wider">
              {currentDate}
            </div>
          </div>
          
          <CardContent className="px-8 py-10">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-4">
                <Label 
                  htmlFor="username" 
                  className="text-xs font-medium text-gray-600 tracking-wide uppercase"
                >
                  Username or email address
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-300 px-4 text-gray-800"
                  placeholder="Enter your username or email"
                />
              </div>
              
              <div className="space-y-4">
                <Label 
                  htmlFor="password" 
                  className="text-xs font-medium text-gray-600 tracking-wide uppercase"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-xl border-gray-200 focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-300 px-4 text-gray-800"
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 focus:scale-[0.98]"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm tracking-wide">
          Enter username and password to continue
        </div>
      </div>
    </div>
  );
};

export default LoginPage;