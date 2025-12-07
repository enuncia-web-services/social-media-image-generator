import React from 'react';
import { CONTACT_INFO } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl">
            E
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">{CONTACT_INFO.brand}</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
          <span>Social Media Generator</span>
          <span className="text-slate-300">|</span>
          <span>Internal Tool</span>
        </nav>
      </div>
    </header>
  );
};