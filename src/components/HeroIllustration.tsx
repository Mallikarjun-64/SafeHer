import React from 'react';
import { Shield, MapPin, Bell, Smartphone, Users, AlertCircle } from 'lucide-react';

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl"></div>
      
      {/* Main Illustration Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Central Phone with Woman */}
        <div className="relative z-20">
          {/* Phone Device */}
          <div className="relative w-48 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border-4 border-gray-700">
            {/* Phone Screen */}
            <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl overflow-hidden">
              {/* SOS Alert Screen */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                {/* SOS Button Active */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <Bell className="w-12 h-12 text-white" />
                    {/* Alert Waves */}
                    <div className="absolute inset-0 w-24 h-24 bg-red-600 rounded-full animate-ping opacity-30"></div>
                    <div className="absolute inset-0 w-24 h-24 bg-red-600 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                
                {/* Status Text */}
                <div className="text-center">
                  <div className="text-white font-bold text-lg mb-2">SOS ACTIVATED</div>
                  <div className="text-white/80 text-sm">Sending emergency alert...</div>
                </div>
              </div>
              
              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium">9:41 AM</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-3 bg-white rounded-sm"></div>
                  <div className="w-1 h-2 bg-white rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Phone Home Button */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-600"></div>
          </div>
          
          {/* Woman Silhouette (Minimal) */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-40 bg-gradient-to-b from-purple-200 to-purple-300 rounded-t-full opacity-80"></div>
            <div className="w-32 h-24 bg-gradient-to-b from-purple-300 to-purple-400 rounded-b-lg opacity-80"></div>
          </div>
        </div>
        
        {/* Floating Elements Around Phone */}
        
        {/* Location Pin */}
        <div className="absolute top-8 right-12 animate-float" style={{ animationDelay: '1s' }}>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-600"></div>
            {/* Location Pulse */}
            <div className="absolute inset-0 w-16 h-16 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        
        {/* Guardian Notifications */}
        <div className="absolute top-20 left-8 animate-float" style={{ animationDelay: '2s' }}>
          <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-gray-900">Guardians</div>
                <div className="text-gray-600">3 notified</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security Shield */}
        <div className="absolute bottom-20 right-8 animate-float" style={{ animationDelay: '3s' }}>
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            {/* Shield Glow */}
            <div className="absolute inset-0 w-20 h-20 bg-purple-500 rounded-full animate-pulse opacity-20"></div>
          </div>
        </div>
        
        {/* Alert Circle */}
        <div className="absolute bottom-32 left-16 animate-float" style={{ animationDelay: '4s' }}>
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            {/* Alert Pulse */}
            <div className="absolute inset-0 w-14 h-14 bg-red-500 rounded-full animate-ping opacity-30"></div>
          </div>
        </div>
        
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
          {/* Phone to Location Pin */}
          <line 
            x1="50%" 
            y1="40%" 
            x2="75%" 
            y2="20%" 
            stroke="url(#gradient1)" 
            strokeWidth="2" 
            strokeDasharray="5,5" 
            opacity="0.3"
            className="animate-pulse"
          />
          
          {/* Phone to Guardians */}
          <line 
            x1="50%" 
            y1="40%" 
            x2="25%" 
            y2="30%" 
            stroke="url(#gradient2)" 
            strokeWidth="2" 
            strokeDasharray="5,5" 
            opacity="0.3"
            className="animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          
          {/* Phone to Shield */}
          <line 
            x1="50%" 
            y1="60%" 
            x2="75%" 
            y2="70%" 
            stroke="url(#gradient3)" 
            strokeWidth="2" 
            strokeDasharray="5,5" 
            opacity="0.3"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
      </div>
    </div>
  );
}
