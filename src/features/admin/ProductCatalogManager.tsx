import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Package, Plus, Search, Edit2, Trash2, 
  Save, X, CheckCircle, Globe, Tag, Settings, Ruler, 
  Loader2, Image as ImageIcon, FileText, Check, Power 
} from 'lucide-react';

interface CatalogProduct {
  id: string;
  name: string;
  model_code: string;
  category: 'MR' | 'MRL' | 'HYD' | 'PLAT' | 'CAR';
  description: string;
  image_url?: string;
  datasheet_url?: string;
  min_capacity: number;
  max_capacity: number;
  max_stops: number;
  max_speed: number;
  std_pit: number;
  std_overhead: number;
  min_shaft_width: number;
  min_shaft_depth: number;
  allowed_door_types: string[];
  compliant_standards: string[];
  variants: string[];
  origin_country: string;
  base_price: number;
  currency: 'MXN' | 'USD';
  is_active: boolean;
}

const INITIAL_PRODUCT: Omit<CatalogProduct, 'id'> = {
  name: '',
  model_code: '',
  category: 'MRL',
  description: '',
  min_capacity: 450,
  max_capacity: 1000,
  max_stops: 10,
  max_speed: 1.0,
  std_pit: 1200,
  std_overhead: 3500,
  min_shaft_width: 1500,
  min_shaft_depth: 1500,
  allowed_door_types: [],
  compliant_standards: [],
  variants: [],
  origin_country: 'México',
  base_price: 0,
  currency: 'MXN',
  is_active: true
};

interface Props {
    isEmbedded?: boolean;
    onNotify?: (msg: string, type: 'success' | 'error') => void;
}

export default function ProductCatalogManager({ isEmbedded = false, onNotify }: Props) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const notify = (msg: string, type: 'success' | 'error') => {
      if (onNotify) onNotify(msg, type);
      else console.log(`[${type.toUpperCase()}] ${msg}`);
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('catalog_products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    if (error) notify('Error cargando catálogo', 'error');
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async (formData: any) => {
    try {
      if (editingProduct) {
        const { error } = await supabase.from('catalog_products').update(formData).eq('id', editingProduct.id);
        if (error) throw error;
        notify('Producto actualizado correctamente', 'success');
      } else {
        const { error } = await supabase.from('catalog_products').insert([formData]);
        if (error) throw error;
        notify('Producto creado exitosamente', 'success');
      }
      await fetchProducts();
      setEditingProduct(null);
      setIsCreating(false);
    } catch (error) {
      notify('Error al guardar. Verifica el código de modelo.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('catalog_products').delete().eq('id', id);
    if (!error) {
        notify('Producto eliminado', 'success');
        fetchProducts();
    } else {
        notify('Error al eliminar producto', 'error');
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.model_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={isEmbedded ? "animate-fadeIn" : "p-8 max-w-[1600px] mx-auto min-h-screen pb-20 animate-fadeIn"}>
      
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
            <h1 className="text-3xl font-black text-[#0A2463] tracking-tight">Catálogo Maestro</h1>
            <p className="text-gray-500 mt-1 font-medium">Gestión centralizada de productos y fichas técnicas.</p>
            </div>
            <button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-[#0A2463] to-[#1a3a8f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 border border-[#0A2463]/20"
            >
            <Plus size={20} className="text-[#D4AF37]" /> Nuevo Producto
            </button>
        </div>
      )}

      {/* BUSCADOR */}
      <div className="relative mb-8 group">
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
            <input 
            type="text" 
            placeholder="Buscar por nombre, SKU o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none shadow-sm transition-all text-[#0A2463] font-bold placeholder-gray-400"
            />
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={40} className="animate-spin text-[#D4AF37] mb-4"/>
            <p className="font-medium">Cargando catálogo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col relative">
              <div className="h-40 bg-gray-50 relative overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package size={40} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-[#0A2463] shadow-sm">
                  {product.category}
                </div>
                {/* Indicador de Activo */}
                {!product.is_active && (
                   <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
                      INACTIVO
                   </div>
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-base font-black text-[#0A2463] mb-1">{product.name}</h3>
                <p className="text-[10px] font-bold text-gray-400 mb-4 bg-[#F9F7F2] self-start px-2 py-0.5 rounded border border-gray-200">{product.model_code}</p>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 mb-6 bg-[#F9F7F2] p-3 rounded-xl border border-gray-100 mt-auto">
                  <div>
                    <span className="block text-gray-400 uppercase font-black text-[9px] mb-0.5">Carga</span>
                    <span className="font-bold text-[#0A2463]">{product.min_capacity}-{product.max_capacity} kg</span>
                  </div>
                  <div>
                     <span className="block text-gray-400 uppercase font-black text-[9px] mb-0.5">Velocidad</span>
                     <span className="font-bold text-[#0A2463]">Max {product.max_speed} m/s</span>
                  </div>
                  <div className="col-span-2 border-t border-gray-200/50 pt-2 mt-1 flex justify-between items-center">
                    <span className="text-[#D4AF37] uppercase font-black text-[9px]">Base:</span>
                    <span className="font-bold text-[#0A2463] bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: product.currency }).format(product.base_price)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setEditingProduct(product)} className="flex-1 text-xs py-2.5 flex justify-center gap-2 border border-gray-200 rounded-lg hover:bg-[#F9F7F2] font-bold text-[#0A2463] transition-colors"><Edit2 size={14}/> Editar</button>
                  <button onClick={() => handleDelete(product.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editingProduct || isCreating) && (
        <ProductFormModal 
          product={editingProduct || INITIAL_PRODUCT} 
          onClose={() => { setEditingProduct(null); setIsCreating(false); }}
          onSave={handleSave}
          onNotify={notify}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSave, onNotify }: { product: any, onClose: () => void, onSave: (data: any) => void, onNotify: any }) {
  const [formData, setFormData] = useState(product);
  const [tab, setTab] = useState<'general' | 'tech' | 'commercial'>('general');
  const [uploading, setUploading] = useState(false);

  // ESTILOS DE INPUTS REUTILIZABLES (ZAFIRO)
  const inputClass = "w-full p-3 bg-[#F9F7F2] border border-gray-200 rounded-xl font-bold text-[#0A2463] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm";
  const labelClass = "block text-[10px] font-black text-[#0A2463] uppercase tracking-wider mb-1.5 ml-1";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'datasheet_url') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${field === 'image_url' ? 'images' : 'docs'}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('catalog').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('catalog').getPublicUrl(filePath);
      setFormData((prev: any) => ({ ...prev, [field]: publicUrl }));
      onNotify('Archivo subido correctamente', 'success');
    } catch (error) {
      console.error(error);
      onNotify('Error al subir archivo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleArrayChange = (field: string, value: string) => {
    const array = value.split(',').map(s => s.trim());
    setFormData((prev: any) => ({ ...prev, [field]: array }));
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setTab(id)}
      className={`flex-1 py-4 text-xs font-black flex items-center justify-center gap-2 border-b-2 transition-all tracking-wide
        ${tab === id 
            ? 'border-[#D4AF37] text-[#0A2463] bg-[#F9F7F2]' 
            : 'border-transparent text-gray-400 hover:text-[#0A2463] hover:bg-gray-50'}`}
    >
      <Icon size={16} className={tab === id ? 'text-[#D4AF37]' : ''} /> {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#051338]/80 backdrop-blur-md transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-scaleIn border border-white/20">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#0A2463] to-[#051338] rounded-t-2xl relative overflow-hidden">
          <div className="relative z-10">
             <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                {product.id ? <Edit2 size={20} className="text-[#D4AF37]"/> : <Plus size={20} className="text-[#D4AF37]"/>}
                {product.id ? 'EDITAR FICHA MAESTRA' : 'NUEVO PRODUCTO'}
             </h2>
             <p className="text-xs text-white/60 mt-0.5 font-medium">Información técnica y comercial para cotizaciones</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 bg-white">
          <TabButton id="general" label="IDENTIDAD" icon={Package} />
          <TabButton id="tech" label="INGENIERÍA" icon={Settings} />
          <TabButton id="commercial" label="COMERCIAL" icon={Tag} />
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
          
          {/* TAB: GENERAL */}
          {tab === 'general' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className={labelClass}>Nombre Comercial</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="Ej: Alamex MRL-450" />
                </div>
                <div>
                  <label className={labelClass}>Código SKU</label>
                  <input type="text" value={formData.model_code} onChange={e => setFormData({...formData, model_code: e.target.value})} className={`${inputClass} font-mono uppercase tracking-wider`} />
                </div>
                <div>
                   <label className={labelClass}>Categoría</label>
                   <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass}>
                      <option value="MRL">MRL (Sin Cuarto)</option>
                      <option value="MR">MR (Con Cuarto)</option>
                      <option value="HYD">Hidráulico</option>
                      <option value="PLAT">Plataforma</option>
                   </select>
                </div>

                {/* TOGGLE: ACTIVO / INACTIVO */}
                <div className="col-span-2 flex items-center gap-4 bg-[#F9F7F2] p-4 rounded-xl border border-gray-200">
                    <div className={`p-3 rounded-full ${formData.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                        <Power size={20} />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-black text-[#0A2463] uppercase tracking-wide">Estado del Producto</label>
                        <p className="text-[10px] text-gray-500">Si se desactiva, no aparecerá para nuevas cotizaciones.</p>
                    </div>
                    <button 
                        onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${formData.is_active ? 'bg-[#0A2463]' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                <div className="col-span-2">
                   <label className={labelClass}>Descripción</label>
                   <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputClass} />
                </div>

                {/* UPLOADER DE IMAGEN */}
                <div className="col-span-2 bg-[#F9F7F2] p-4 rounded-xl border border-dashed border-gray-300 hover:border-[#D4AF37] transition-colors">
                   <label className={`${labelClass} mb-2 flex items-center gap-2`}>
                      <ImageIcon size={16} /> Foto Principal
                   </label>
                   <div className="flex items-center gap-4">
                      {formData.image_url && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                            <img src={formData.image_url} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'image_url')}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-[#0A2463] file:text-white hover:file:bg-[#1a3a8f] transition-all cursor-pointer"
                            disabled={uploading}
                          />
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">
                             {uploading ? 'Subiendo imagen...' : 'PNG o JPG (Max 2MB). Fondo transparente recomendado.'}
                          </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TÉCNICO */}
          {tab === 'tech' && (
            <div className="space-y-8 animate-fadeIn">
                <div className="bg-[#0A2463]/5 p-6 rounded-2xl border border-[#0A2463]/10">
                    <h3 className="text-xs font-black text-[#0A2463] uppercase mb-6 flex items-center gap-2 tracking-widest border-b border-[#0A2463]/10 pb-2">
                        <Ruler size={14} className="text-[#D4AF37]"/> Límites Operativos
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className={labelClass}>Carga Mín (Kg)</label>
                            <input type="number" value={formData.min_capacity} onChange={e => setFormData({...formData, min_capacity: Number(e.target.value)})} className={`${inputClass} bg-white`} />
                        </div>
                        <div>
                            <label className={labelClass}>Carga Máx (Kg)</label>
                            <input type="number" value={formData.max_capacity} onChange={e => setFormData({...formData, max_capacity: Number(e.target.value)})} className={`${inputClass} bg-white`} />
                        </div>
                        <div>
                            <label className={labelClass}>Paradas Máx</label>
                            <input type="number" value={formData.max_stops} onChange={e => setFormData({...formData, max_stops: Number(e.target.value)})} className={`${inputClass} bg-white`} />
                        </div>
                        <div>
                            <label className={labelClass}>Velocidad (m/s)</label>
                            <input type="number" step="0.1" value={formData.max_speed} onChange={e => setFormData({...formData, max_speed: Number(e.target.value)})} className={`${inputClass} bg-white`} />
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Fosa Estándar (mm)</label>
                        <input type="number" value={formData.std_pit} onChange={e => setFormData({...formData, std_pit: Number(e.target.value)})} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Huida Estándar (mm)</label>
                        <input type="number" value={formData.std_overhead} onChange={e => setFormData({...formData, std_overhead: Number(e.target.value)})} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Ancho Mín Cubo</label>
                        <input type="number" value={formData.min_shaft_width} onChange={e => setFormData({...formData, min_shaft_width: Number(e.target.value)})} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Fondo Mín Cubo</label>
                        <input type="number" value={formData.min_shaft_depth} onChange={e => setFormData({...formData, min_shaft_depth: Number(e.target.value)})} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Tipos de Puerta (CSV)</label>
                        <input type="text" placeholder="Lateral, Central..." value={formData.allowed_door_types?.join(', ') || ''} onChange={e => handleArrayChange('allowed_door_types', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Variantes (CSV)</label>
                        <input type="text" placeholder="Panorámico..." value={formData.variants?.join(', ') || ''} onChange={e => handleArrayChange('variants', e.target.value)} className={inputClass} />
                    </div>
                </div>
            </div>
          )}

          {/* TAB: COMERCIAL */}
          {tab === 'commercial' && (
             <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className={labelClass}>Precio Base Sugerido</label>
                      <input type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: Number(e.target.value)})} className={`${inputClass} text-lg`} />
                   </div>
                   <div>
                      <label className={labelClass}>Moneda</label>
                      <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className={inputClass}>
                            <option value="MXN">MXN - Pesos</option>
                            <option value="USD">USD - Dólares</option>
                      </select>
                   </div>
                   <div>
                      <label className={labelClass}>País de Origen</label>
                      <input type="text" value={formData.origin_country} onChange={e => setFormData({...formData, origin_country: e.target.value})} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Normas</label>
                      <input type="text" value={formData.compliant_standards?.join(', ') || ''} onChange={e => handleArrayChange('compliant_standards', e.target.value)} className={inputClass} />
                   </div>
                </div>

                {/* UPLOADER DE PDF */}
                <div className="bg-[#F9F7F2] p-4 rounded-xl border border-dashed border-gray-300 mt-4 hover:border-red-400 transition-colors">
                   <label className={`${labelClass} mb-2 flex items-center gap-2 text-red-700`}>
                      <FileText size={16} /> Ficha Técnica (PDF)
                   </label>
                   <div className="flex items-center gap-4">
                      <div className="flex-1">
                          <input 
                            type="file" 
                            accept="application/pdf"
                            onChange={(e) => handleFileUpload(e, 'datasheet_url')}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-red-600 file:text-white hover:file:bg-red-700 transition-all cursor-pointer"
                            disabled={uploading}
                          />
                          {formData.datasheet_url && (
                             <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded">
                                <CheckCircle size={12}/> Archivo vinculado
                             </p>
                          )}
                      </div>
                   </div>
                </div>
             </div>
          )}

        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl bg-white">
          <button onClick={onClose} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors text-sm tracking-wide">CANCELAR</button>
          <button 
            onClick={() => onSave(formData)} 
            disabled={uploading}
            className={`bg-gradient-to-r from-[#0A2463] to-[#1a3a8f] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 text-sm tracking-wide ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-0.5 transition-all'}`}
          >
            {uploading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} className="text-[#D4AF37]"/>}
            {uploading ? 'SUBIENDO...' : 'GUARDAR FICHA'}
          </button>
        </div>

      </div>
    </div>
  );
}