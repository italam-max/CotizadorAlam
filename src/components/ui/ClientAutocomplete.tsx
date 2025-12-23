// ARCHIVO: src/components/ui/ClientAutocomplete.tsx
import { useState, useEffect, useRef } from 'react';
import { User, Search, Plus } from 'lucide-react';
import type { QuoteData } from '../../types';

interface ClientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  existingQuotes: QuoteData[]; // Pasamos todas las cotizaciones para extraer nombres
}

export const ClientAutocomplete = ({ value, onChange, existingQuotes }: ClientAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 1. Extraer clientes únicos y ordenarlos
  const uniqueClients = Array.from(new Set(
    existingQuotes
      .map(q => q.clientName)
      .filter(name => name && name.trim().length > 0)
  )).sort();

  // 2. Filtrar sugerencias mientras escribes
  useEffect(() => {
    if (value.length > 0) {
      const filtered = uniqueClients.filter(client => 
        client.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(uniqueClients.slice(0, 5)); // Mostrar 5 recientes si está vacío
    }
  }, [value, existingQuotes]);

  // 3. Manejar selección
  const handleSelect = (clientName: string) => {
    onChange(clientName); // Asigna el valor exacto
    setShowDropdown(false);
  };

  // 4. Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-[#0A2463] uppercase tracking-wider mb-2">
        Nombre del Cliente
      </label>
      
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
          <User size={18} />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Buscar o escribir nuevo cliente..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#0A2463]/10 rounded-xl text-sm font-bold text-[#0A2463] focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none shadow-sm transition-all"
        />
        
        {/* Indicador de "Nuevo" o "Existente" */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {suggestions.includes(value) ? (
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Existente</span>
            ) : value.length > 2 ? (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Plus size={10}/> Nuevo
                </span>
            ) : null}
        </div>
      </div>

      {/* DROPDOWN DE SUGERENCIAS */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-[#0A2463]/10 max-h-60 overflow-y-auto animate-fadeIn custom-scrollbar">
            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 border-b border-gray-100 sticky top-0">
                Sugerencias
            </div>
            {suggestions.map((client, idx) => (
                <button
                    key={idx}
                    onClick={() => handleSelect(client)}
                    className="w-full text-left px-4 py-3 hover:bg-[#0A2463]/5 text-sm text-[#0A2463] font-medium flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0"
                >
                    <Search size={14} className="text-gray-300"/>
                    {client}
                </button>
            ))}
        </div>
      )}
    </div>
  );
};