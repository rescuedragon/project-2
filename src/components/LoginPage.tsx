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
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-8 relative"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      {/* Title in Top Left */}
      <div className="absolute top-8 left-8">
        <h1 className="text-4xl font-light text-gray-900 tracking-tight">
          Timesheet
        </h1>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md">
        <Card className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-300 rounded-xl bg-white/95 backdrop-blur-xl animate-scale-in">
          {/* Date Header - Extended height and matching button color */}
          <div className="w-full bg-gradient-to-r from-gray-900 to-black py-6 rounded-t-xl">
            <div className="text-center text-white font-medium text-lg">
              {currentDate}
            </div>
          </div>
          
          <CardContent className="px-8 py-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username or email address
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500 transition-all duration-200"
                  placeholder="Enter your username or email"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500 transition-all duration-200"
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          Enter username and password to continue
        </div>
      </div>
    </div>
  );
};

export default LoginPage;