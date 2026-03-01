'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import { useCurrency } from '../../context/CurrencyContext';

// Extracted Inventory Components
import InventoryStats  from '../../app/inventory/InventoryStats';
import InventorySearch from '../../app/inventory/InventorySearch';
import InventoryTable  from '../../app/inventory/InventoryTable';
import InventoryModal  from '../../app/inventory/InventoryModal';

const EMPTY_FORM = {
  name: '', sku: '', costPrice: '', sellingPrice: '', quantity: '', category: '',
};

export default function InventoryPage() {
  const { fmt, isMounted } = useCurrency();

  const [items,        setItems]        = useState([]);
  const [loaded,       setLoaded]       = useState(false);

  // ── Filter & Sort State ──────────────────────────────────────────────────────
  const [searchQuery,       setSearchQuery]       = useState('');
  const [selectedCategory,  setSelectedCategory]  = useState('All');
  const [showLowStock,      setShowLowStock]      = useState(false);
  const [sortConfig,        setSortConfig]        = useState({ key: null, direction: 'asc' });

  // ── Modal / CRUD State ───────────────────────────────────────────────────────
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [deleteId,     setDeleteId]     = useState(null);
  // Image state
  const [imageBase64,  setImageBase64]  = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await api.get('/inventory');
      setItems(data);
    } catch (e) { console.error(e); }
    finally    { setLoaded(true); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Derived: unique categories for dropdown ──────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [items]);

  // ── Derived: filtered + sorted rows ─────────────────────────────────────────
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 1. Text search on name and sku
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.sku || '').toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // 3. Low stock filter
    if (showLowStock) {
      result = result.filter((item) => item.quantity < 5);
    }

    // 4. Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [items, searchQuery, selectedCategory, showLowStock, sortConfig]);

  // ── Sort handler ─────────────────────────────────────────────────────────────
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ── Image helpers ────────────────────────────────────────────────────────────
  const resetImageState = () => {
    setImageBase64('');
    setImagePreview('');
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    resetImageState();
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name:         item.name,
      sku:          item.sku          || '',
      costPrice:    item.costPrice,
      sellingPrice: item.sellingPrice,
      quantity:     item.quantity,
      category:     item.category     || '',
    });
    setImageBase64('');
    setImagePreview(item.imageUrl || '');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name:         form.name,
        sku:          form.sku,
        costPrice:    Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        quantity:     Number(form.quantity),
        category:     form.category,
        ...(imageBase64 ? { image: imageBase64 } : {}),
      };

      if (editItem) {
        await api.put(`/inventory/${editItem._id}`, payload);
      } else {
        await api.post('/inventory', payload);
      }

      setModalOpen(false);
      resetImageState();
      await fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeleteId(id);
    try {
      await api.delete(`/inventory/${id}`);
      await fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Inventory</h1>
          <p className="text-sm text-zinc-600 mt-0.5">Manage your products &amp; stock levels</p>
        </div>
        <Button onClick={openAdd}>
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add product
        </Button>
      </div>

      <InventoryStats items={items} loaded={loaded} isMounted={isMounted} fmt={fmt} />

      <InventorySearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showLowStock={showLowStock}
        setShowLowStock={setShowLowStock}
        categories={categories}
      />

      <InventoryTable
        items={items}
        filtered={filteredAndSortedItems}
        loaded={loaded}
        isMounted={isMounted}
        fmt={fmt}
        openEdit={openEdit}
        handleDelete={handleDelete}
        deleteId={deleteId}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      <InventoryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetImageState(); }}
        editItem={editItem}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        saving={saving}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
      />
    </AppLayout>
  );
}