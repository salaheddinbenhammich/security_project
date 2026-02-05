import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { validatePassword, getPasswordStrength } from '../utils/auth';

export default function PasswordStrength({ password }) {
  const validation = validatePassword(password);
  const strength = getPasswordStrength(password);
  
  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };
  
  const strengthLabels = {
    weak: 'Faible',
    medium: 'Moyen',
    strong: 'Fort',
  };
  
  return (
    <div className="space-y-2">
      {/* Strength bar */}
      {password && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Force du mot de passe:</span>
            <span className={`font-semibold ${
              strength === 'weak' ? 'text-red-600' : 
              strength === 'medium' ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {strengthLabels[strength]}
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
              style={{ 
                width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%' 
              }}
            />
          </div>
        </div>
      )}
      
      {/* Requirements checklist */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          {validation.errors.length ? (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          )}
          <span className={validation.errors.length ? 'text-slate-600' : 'text-green-600'}>
            Au moins 8 caractères
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {validation.errors.uppercase ? (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          )}
          <span className={validation.errors.uppercase ? 'text-slate-600' : 'text-green-600'}>
            1 lettre majuscule
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {validation.errors.lowercase ? (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          )}
          <span className={validation.errors.lowercase ? 'text-slate-600' : 'text-green-600'}>
            1 lettre minuscule
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {validation.errors.digit ? (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          )}
          <span className={validation.errors.digit ? 'text-slate-600' : 'text-green-600'}>
            1 chiffre
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {validation.errors.specialChar ? (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          )}
          <span className={validation.errors.specialChar ? 'text-slate-600' : 'text-green-600'}>
            1 caractère spécial (@$!%*?&)
          </span>
        </div>
      </div>
    </div>
  );
}