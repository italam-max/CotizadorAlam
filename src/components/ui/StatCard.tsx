// ARCHIVO: src/components/ui/StatCard.tsx
import React from 'react';
// CORRECCIÓN: Agregamos 'type' aquí
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  color: string;
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon: Icon }) => (
  <div className={`p-4 rounded-xl border border-transparent ${color} bg-opacity-10 flex items-center justify-between`}>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-full bg-white bg-opacity-40`}><Icon size={24} /></div>
  </div>
);