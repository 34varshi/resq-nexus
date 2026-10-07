import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Resource, ResourceCategory, ResourceStatus } from '../../types';
import {
  Box,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Truck,
  RotateCw,
  MapPin,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ResourceManagement: React.FC = () => {
  const { resources, addResource, setCurrentView } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Resource Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Water');
  const [quantity, setQuantity] = useState(5000);
  const [unit, setUnit] = useState('Liters');
  const [location, setLocation] = useState('');
  const [owner, setOwner] = useState('');
  const [lowThreshold, setLowThreshold] = useState(1000);

  const categories: ResourceCategory[] = [
    'Water',
    'Medical Supplies',
    'Food',
    'Blankets & Tents',
    'Vehicles',
    'Fuel & Energy',
    'Rescue Equipment',
    'Communication Equipment',
    'Sanitation Kits'
  ];

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || res.category === categoryFilter;
    const matchesStat = statusFilter === 'ALL' || res.status === statusFilter;
    return matchesSearch && matchesCat && matchesStat;
  });

  const lowStockItems = resources.filter(
    (r) => r.status === 'LOW_STOCK' || r.available < r.lowStockThreshold
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addResource({
      name: name || 'Emergency Supply Pack',
      category,
      quantity: Number(quantity) || 100,
      available: Number(quantity) || 100,
      reserved: 0,
      unit: unit || 'Units',
      location: location || 'Regional Logistics Hub',
      coordinates: { lat: 17.412, lng: 78.455 },
      condition: 'EXCELLENT',
      owner: owner || 'State Civil Defense',
      status: 'AVAILABLE',
      lowStockThreshold: Number(lowThreshold) || 50
    });
    setShowAddModal(false);
    setName('');
    setLocation('');
    setOwner('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-emerald-400" />
            Humanitarian Resource Inventory & Logistics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-depot stock monitoring, low-inventory alerts, and emergency reserve buffers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('forecasting')}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors"
          >
            Demand Forecasting →
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Asset Stock</span>
          </button>
        </div>
      </div>

      {/* Low-Stock Warnings Alert Strip */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>LOW-STOCK WARNING: {lowStockItems.length} Essential Resources Below Safe Buffer Threshold</span>
            </div>
            <button
              onClick={() => setStatusFilter('LOW_STOCK')}
              className="text-[11px] font-mono text-rose-400 hover:underline"
            >
              Filter Low Stock Only
            </button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {lowStockItems.map((item) => (
              <span
                key={item.id}
                className="px-2.5 py-1 rounded bg-slate-900/80 border border-rose-800/60 font-mono text-rose-300 text-[11px]"
              >
                {item.name}: <strong className="text-white">{item.available} {item.unit}</strong> (Min: {item.lowStockThreshold})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search resource, depot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-52"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="RESERVED">Reserved</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DEPLOYED">Deployed</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {filteredResources.length} Assets Registered
        </span>
      </div>

      {/* Resource Inventory Table */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <th className="pb-3 font-semibold">Asset ID</th>
                <th className="pb-3 font-semibold">Resource Description</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold text-right">Available / Total</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Storage Location</th>
                <th className="pb-3 font-semibold">Custodian</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredResources.map((res) => {
                const pct = Math.round((res.available / res.quantity) * 100);
                const isLow = res.status === 'LOW_STOCK' || res.available < res.lowStockThreshold;
                return (
                  <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-300">{res.id}</td>
                    <td className="py-3">
                      <div className="font-semibold text-white">{res.name}</div>
                      {res.expiry && (
                        <div className="text-[10px] font-mono text-slate-500">
                          Expires: {res.expiry}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {res.category}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="font-mono font-bold text-slate-200 tabular-nums">
                        {res.available.toLocaleString()} / {res.quantity.toLocaleString()} {res.unit}
                      </div>
                      <div className="w-24 ml-auto h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            isLow ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border font-semibold ${
                          isLow
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : res.status === 'RESERVED'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[150px]">{res.location}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400 text-xs truncate max-w-[120px]">
                      {res.owner}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setCurrentView('resource-allocation')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 transition-colors"
                      >
                        Allocate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-400" />
                Register New Supply Stock in Logistics Depot
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bottled Water 5L Packs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    placeholder="e.g. Liters, Kits, Boxes"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Low Stock Warning Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={lowThreshold}
                    onChange={(e) => setLowThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Depot Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Logistics Hub North"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Owner / Custodian Agency</label>
                  <input
                    type="text"
                    placeholder="e.g. Red Crescent Logistics"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg"
                >
                  Register Inventory Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
