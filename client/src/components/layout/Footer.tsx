// client/src/components/layout/Footer.tsx

import React, { useContext } from 'react';
import { AppContext } from '../../state/AppContext';
import { ActiveView as ActiveViewEnum } from '../../types';

export const Footer: React.FC = () => {
  const { setActiveView } = useContext(AppContext);

  return (
    <footer className="w-full border-t border-slate-700/50 bg-slate-800/20 backdrop-blur-sm px-4 py-2 text-center"> {/* <-- Updated padding here */}
      <div className="flex justify-center items-center space-x-6 text-sm">
        <button 
          onClick={() => setActiveView(ActiveViewEnum.TERMS)} 
          className="text-slate-400 hover:text-white transition-colors"
        >
          Terms of Service
        </button>
        <span className="text-slate-600">|</span>
        <button 
          onClick={() => setActiveView(ActiveViewEnum.PRIVACY)} 
          className="text-slate-400 hover:text-white transition-colors"
        >
          Privacy Policy
        </button>
      </div>
    </footer>
  );
};
