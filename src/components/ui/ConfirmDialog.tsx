// ARCHIVO: src/components/ui/ConfirmDialog.tsx
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-slideUp" onClick={e => e.stopPropagation()}>
        
        {/* Encabezado */}
        <div className={`p-6 flex items-start gap-4 ${isDanger ? 'bg-red-50' : 'bg-blue-50'}`}>
          <div className={`p-3 rounded-full flex-shrink-0 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            {isDanger ? <AlertTriangle size={24} /> : <HelpCircle size={24} />}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${isDanger ? 'text-red-900' : 'text-blue-900'}`}>
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Botones */}
        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 rounded-lg text-white font-bold text-sm shadow-md transition-transform active:scale-95 ${
                isDanger 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}