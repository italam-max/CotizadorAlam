// ARCHIVO: src/components/ui/SectionTitle.tsx
import React from 'react';
// CORRECCIÓN: Agregamos 'type' aquí también
import type { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  icon?: LucideIcon;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, icon: Icon }) => (
  <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2 mt-6">
    {Icon && <Icon size={20} className="text-yellow-500" />} {title}
  </h3>
);