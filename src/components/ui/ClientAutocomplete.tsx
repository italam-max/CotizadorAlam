// ARCHIVO: src/components/ui/ClientAutocomplete.tsx
import { useState, useEffect, useRef } from 'react';
import { User, Search, Plus, Sparkles } from 'lucide-react';
import type { QuoteData } from '../../types';

interface ClientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  existingQuotes: QuoteData[]; 
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
      setSuggestions(uniqueClients.slice(0, 5)); 
    }
  }, [value, existingQuotes]);

  // 3. Manejar selección
  const handleSelect = (clientName: string) => {
    onChange(clientName); 
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
      {/* LABEL ACTUALIZADO: Color claro para fondo oscuro */}
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Nombre del Cliente
      </label>
      
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">
          <User size={18} />
        </div>
        
        {/* INPUT ACTUALIZADO: Estilo Dark Glass Premium */}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Buscar o escribir nuevo cliente..."
          className="w-full pl-10 pr-4 py-3 bg-[#020610]/80 border border-white/10 rounded-xl text-sm font-bold text-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none shadow-inner transition-all placeholder-white/20"
        />
        
        {/* INDICADORES (BADGES) ACTUALIZADOS: Tonos oscuros/neon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {suggestions.includes(value) ? (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles size={10}/> Existente
                </span>
            ) : value.length > 2 ? (
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Plus size={10}/> Nuevo
                </span>
            ) : null}
        </div>
      </div>

      {/* DROPDOWN ACTUALIZADO: Fondo oscuro y bordes dorados */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#020A1A] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#D4AF37]/20 max-h-60 overflow-y-auto animate-fadeIn custom-scrollbar">
            <div className="px-3 py-2 text-[10px] font-bold text-[#D4AF37]/50 uppercase bg-[#051338]/50 border-b border-white/5 sticky top-0 backdrop-blur-sm">
                Sugerencias
            </div>
            {suggestions.map((client, idx) => (
                <button
                    key={idx}
                    onClick={() => handleSelect(client)}
                    className="w-full text-left px-4 py-3 hover:bg-[#D4AF37]/10 text-sm text-gray-300 hover:text-white font-medium flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 group"
                >
                    <Search size={14} className="text-gray-600 group-hover:text-[#D4AF37] transition-colors"/>
                    {client}
                </button>
            ))}
        </div>
      )}
    </div>
  );
};