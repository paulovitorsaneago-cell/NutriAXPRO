import React from 'react';

// 1. NutriCard Component
export const NutriCard: React.FC<{
  title?: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon, children, className = '' }) => {
  return (
    <div className={`p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4 pb-3 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {icon && <i className={`${icon} text-emerald-400`} />}
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

// 2. NutriButton Component
export const NutriButton: React.FC<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}> = ({ variant = 'primary', size = 'md', onClick, children, disabled, type = 'button', className = '' }) => {
  const baseStyle = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    danger: 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20',
    success: 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// 3. DietThermometerBar Component
export const DietThermometerBar: React.FC<{
  currentKcal: number;
  targetKcal: number;
}> = ({ currentKcal, targetKcal }) => {
  const percentage = Math.min(100, Math.round((currentKcal / (targetKcal || 1)) * 100));
  let statusColor = '#10b981';
  let label = 'Dentro da Meta';

  if (percentage < 90) {
    statusColor = '#3b82f6';
    label = 'Abaixo da Meta';
  } else if (percentage > 110) {
    statusColor = '#ef4444';
    label = 'Acima da Meta';
  }

  return (
    <div className="w-full bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="text-slate-300">
          Consumido: <strong className="text-amber-400">{currentKcal} kcal</strong> / {targetKcal} kcal
        </span>
        <span className="font-bold px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: `${statusColor}25`, color: statusColor }}>
          {label} ({percentage}%)
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${percentage}%`, backgroundColor: statusColor }} />
      </div>
    </div>
  );
};
