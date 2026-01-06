
import React from 'react';

export const GlassPanel: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`backdrop-blur-xl bg-white/80 border border-white/20 shadow-2xl rounded-3xl overflow-hidden transition-all hover:shadow-brand-blue/10 ${className}`}>
        {children}
    </div>
);
