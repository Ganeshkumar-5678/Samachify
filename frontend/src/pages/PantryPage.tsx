import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, Trash2, AlertCircle, Sparkles, Search,
  Calendar, Check, Filter, ChefHat, ArrowRight
} from 'lucide-react';
import { PantryItem } from '../types';
import { api } from '../services/api';

export const PantryPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);

  // New item form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Vegetables');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnit, setNewUnit] = useState('pieces');
  const [newState, setNewState] = useState<'fresh' | 'frozen' | 'canned' | 'cooked' | 'dried'>('fresh');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  useEffect(() => {
    const loadPantry = async () => {
      try {
        const data = await api.getPantry();
        setItems(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadPantry();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: PantryItem = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      quantity: newQuantity,
      unit: newUnit,
      state: newState,
      purchase_date: new Date().toISOString().split('T')[0],
      expiry_date: newExpiryDate || undefined,
      days_to_expiry: newExpiryDate ? Math.ceil((new Date(newExpiryDate).getTime() - Date.now()) / (1000 * 3600 * 24)) : undefined,
      is_expiring_soon: newExpiryDate ? (new Date(newExpiryDate).getTime() - Date.now()) / (1000 * 3600 * 24) <= 4 : false,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    await api.updatePantry(updated);

    setNewName('');
    setIsAdding(false);
  };

  const handleRemoveItem = async (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    await api.updatePantry(updated);
  };

  const handleCookWithPantry = () => {
    const names = items.map((i) => i.name).slice(0, 6);
    navigate(`/recipes?q=${encodeURIComponent(names.join(','))}`);
  };


  const filteredItems = items.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === 'all' || i.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const expiringSoonCount = items.filter((i) => i.is_expiring_soon).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
              My Kitchen Pantry
            </h1>
            <span className="px-3 py-1 rounded-full bg-cream text-forest text-xs font-bold">
              {items.length} items
            </span>
          </div>
          <p className="text-deep-muted font-medium text-sm mt-1">
            Track what's in your cupboards and fridge. Never let good food go to waste.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ingredient</span>
          </button>

          <button
            onClick={handleCookWithPantry}
            className="px-5 py-2.5 rounded-xl bg-spice text-white text-xs font-bold hover:bg-spice-hover transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Find Meals with My Pantry</span>
          </button>
        </div>
      </div>

      {/* Expiring Soon Alert Badge */}
      {expiringSoonCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{expiringSoonCount} item(s) are approaching their expiry date soon!</span>
          </div>
          <button
            onClick={handleCookWithPantry}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 shrink-0"
          >
            Use Them Today →
          </button>
        </div>
      )}

      {/* Add New Item Form */}
      {isAdding && (
        <form onSubmit={handleAddItem} className="p-6 rounded-3xl bg-white border border-cream-border shadow-soft space-y-4 animate-in fade-in">
          <h3 className="font-bold text-sm text-forest uppercase tracking-wider">
            Record New Pantry Ingredient
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-deep-muted mb-1">Ingredient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Tomatoes, Basmati Rice"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-cream-border text-xs focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-deep-muted mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-cream-border text-xs focus:outline-none focus:border-forest"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Grains">Grains & Cereals</option>
                <option value="Spices">Spices</option>
                <option value="Pulses">Pulses</option>
                <option value="Oils">Oils & Condiments</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-deep-muted mb-1">Condition</label>
              <select
                value={newState}
                onChange={(e) => setNewState(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-cream-border text-xs focus:outline-none focus:border-forest"
              >
                <option value="fresh">Fresh</option>
                <option value="frozen">Frozen</option>
                <option value="canned">Canned</option>
                <option value="cooked">Cooked</option>
                <option value="dried">Dried / Staple</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-deep-muted mb-1">Expiry Date</label>
              <input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-cream-border text-xs focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-cream-surface text-deep text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light"
            >
              Save to Pantry
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-cream-border">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-deep-subtle absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search pantry items..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-cream-border text-xs focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'vegetables', 'dairy & eggs', 'grains', 'spices'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize shrink-0 transition-colors ${
                categoryFilter === cat ? 'bg-forest text-white' : 'bg-cream text-deep'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              item.is_expiring_soon
                ? 'bg-amber-50/50 border-amber-300'
                : 'bg-white border-cream-border'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-forest">{item.name}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cream text-forest">
                  {item.state}
                </span>
              </div>
              <p className="text-xs text-deep-muted">
                {item.quantity} {item.unit} • {item.category}
              </p>
              {item.days_to_expiry !== undefined && (
                <p className={`text-[11px] font-semibold ${item.is_expiring_soon ? 'text-amber-700' : 'text-deep-subtle'}`}>
                  {item.days_to_expiry > 0
                    ? `Expires in ${item.days_to_expiry} days`
                    : 'Check freshness today'}
                </p>
              )}
            </div>

            <button
              onClick={() => handleRemoveItem(item.id)}
              className="p-2 rounded-lg text-deep-subtle hover:text-red-600 hover:bg-cream-surface transition-colors"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
