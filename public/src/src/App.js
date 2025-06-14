import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Search, AlertTriangle, Package, TrendingUp, Calendar, Edit2, Trash2, Eye } from 'lucide-react';

// Configuração do Supabase
const supabaseUrl = 'https://jmpjipyzccpeuimnwuqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcGppcHl6Y2NwZXVpbW53dXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzkyNTQsImV4cCI6MjA2NTUxNTI1NH0.M5kB9kMApT4By7b8Vdl7VZMsS0UlzqHb1VtMTePddoI';

const supabase = createClient(supabaseUrl, supabaseKey);

const MedicalInventorySystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    batch: '',
    quantity: '',
    min_stock: '',
    expiry_date: '',
    supplier: '',
    location: '',
    price: ''
  });

  // Função para determinar status do produto
  const getProductStatus = (product) => {
    const today = new Date();
    const expiryDate = new Date(product.expiry_date);
    const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (product.quantity <= product.min_stock) return 'low';
    if (daysToExpiry <= 30 && daysToExpiry > 0) return 'expiring';
    return 'normal';
  };

  // Carregar produtos do Supabase
  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const productsWithStatus = data.map(product => ({
        ...product,
        status: getProductStatus(product)
      }));
      
      setProducts(productsWithStatus);
      
      if (data.length === 0) {
        setSuccess('Banco conectado! Adicione seu primeiro produto.');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Teste de conexão
  const testConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('count', { count: 'exact', head: true });

      if (error) throw error;
      
      setSuccess('✅ Conexão com Supabase funcionando!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('❌ Erro de conexão: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.batch?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Estatísticas do dashboard
  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.status === 'low').length,
    expiring: products.filter(p => p.status === 'expiring').length,
    totalValue: products.reduce((sum, p) => sum + (p.quantity * (p.price || 0)), 0)
  };

  // Adicionar produto
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.quantity) {
      setError('Nome e quantidade são obrigatórios');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          category: newProduct.category,
          batch: newProduct.batch,
          quantity: parseInt(newProduct.quantity),
          min_stock: parseInt(newProduct.min_stock) || 0,
          expiry_date: newProduct.expiry_date || null,
          supplier: newProduct.supplier,
          location: newProduct.location,
          price: parseFloat(newProduct.price) || 0
        }]);

      if (error) throw error;
      
      setSuccess('Produto adicionado com sucesso!');
      setNewProduct({
        name: '', category: '', batch: '', quantity: '', min_stock: '',
        expiry_date: '', supplier: '', location: '', price: ''
      });
      setShowAddModal(false);
      loadProducts();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao adicionar produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar produto
  const handleUpdateProduct = async () => {
    if (!selectedProduct.name || !selectedProduct.quantity) {
      setError('Nome e quantidade são obrigatórios');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: selectedProduct.name,
          category: selectedProduct.category,
          batch: selectedProduct.batch,
          quantity: parseInt(selectedProduct.quantity),
          min_stock: parseInt(selectedProduct.min_stock) || 0,
          expiry_date: selectedProduct.expiry_date || null,
          supplier: selectedProduct.supplier,
          location: selectedProduct.location,
          price: parseFloat(selectedProduct.price) || 0
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;
      
      setSuccess('Produto atualizado com sucesso!');
      setShowEditModal(false);
      setSelectedProduct(null);
      loadProducts();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao atualizar produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remover produto
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSuccess('Produto excluído com sucesso!');
      loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao excluir produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Componente de status
  const StatusBadge = ({ status }) => {
    const colors = {
      normal: 'bg-green-100 text-green-800',
      low: 'bg-red-100 text-red-800',
      expiring: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      normal: 'Normal',
      low: 'Estoque Baixo',
      expiring: 'Vencendo'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notificações */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">×</button>
        </div>
      )}
      
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md">
          {success}
          <button onClick={() => setSuccess('')} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Controle de Estoque - Clínica Médica</h1>
              {loading && <div className="ml-4 text-sm text-gray-500 animate-pulse">Carregando...</div>}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => setShowAddModal(true)}
                disabled={loading}
                className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Adicionar Produto</span>
                <span className="sm:hidden">Adicionar</span>
              </button>
              <button 
                onClick={testConnection}
                disabled={loading}
                className="bg-green-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
              >
                <span className="hidden sm:inline">Testar Conexão</span>
                <span className="sm:hidden">Testar</span>
              </button>
              <button 
                onClick={loadProducts}
                disabled={loading}
                className="bg-gray-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
              >
                ↻
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'products', label: 'Produtos', icon: Package },
              { id: 'alerts', label: 'Alertas', icon: AlertTriangle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Baixo</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.lowStock}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Vencendo</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.expiring}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Valor</p>
                    <p className="text-sm sm:text-xl font-bold text-gray-900">R$ {stats.totalValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Alertas Recentes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {products.filter(p => p.status !== 'normal').slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <AlertTriangle className={`h-5 w-5 ${product.status === 'low' ? 'text-red-500' : 'text-yellow-500'}`} />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.status === 'low' ? 'Estoque baixo' : 'Vencendo em breve'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={product.status} />
                    </div>
                  ))}
                  {products.filter(p => p.status !== 'normal').length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum alerta no momento 🎉</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="Medicamento">Medicamentos</option>
                  <option value="Material">Materiais</option>
                  <option value="EPI">EPI</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os Status</option>
                  <option value="normal">Normal</option>
                  <option value="low">Estoque Baixo</option>
                  <option value="expiring">Vencendo</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.location || '-'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.batch || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.quantity} unidades</div>
                          <div className="text-sm text-gray-500">Min: {product.min_stock || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={product.status} />
                        <button 
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Resolver
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {products.filter(p => p.status !== 'normal').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">Tudo certo! 🎉</p>
                      <p>Não há alertas no momento.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Adicionar Produto</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Medicamento">Medicamento</option>
                  <option value="Material">Material</option>
                  <option value="EPI">EPI</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
                <input
                  type="text"
                  value={newProduct.batch}
                  onChange={(e) => setNewProduct({...newProduct, batch: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                  <input
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={newProduct.min_stock}
                    onChange={(e) => setNewProduct({...newProduct, min_stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
                <input
                  type="date"
                  value={newProduct.expiry_date}
                  onChange={(e) => setNewProduct({...newProduct, expiry_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                <input
                  type="text"
                  value={newProduct.supplier}
                  onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input
                  type="text"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Editar Produto</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  value={selectedProduct.name || ''}
                  onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={selectedProduct.category || ''}
                  onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Medicamento">Medicamento</option>
                  <option value="Material">Material</option>
                  <option value="EPI">EPI</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
                <input
                  type="text"
                  value={selectedProduct.batch || ''}
                  onChange={(e) => setSelectedProduct({...selectedProduct, batch: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                  <input
                    type="number"
                    value={selectedProduct.quantity || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={selectedProduct.min_stock || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, min_stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
                <input
                  type="date"
                  value={selectedProduct.expiry_date || ''}
                  onChange={(e) => setSelectedProduct({...selectedProduct, expiry_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                <input
                  type="text"
                  value={selectedProduct.supplier || ''}
                  onChange={(e) => setSelectedProduct({...selectedProduct, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input
                  type="text"
                  value={selectedProduct.location || ''}
                  onChange={(e) => setSelectedProduct({...selectedProduct, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedProduct.price || ''}
                  onChange={(e) => setSelectedProduct({...selectedProduct, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateProduct}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Detalhes do Produto</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <p className="text-sm text-gray-900">{selectedProduct.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <p className="text-sm text-gray-900">{selectedProduct.category || '-'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Lote</label>
                <p className="text-sm text-gray-900">{selectedProduct.batch || '-'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                  <p className="text-sm text-gray-900">{selectedProduct.quantity} unidades</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estoque Mínimo</label>
                  <p className="text-sm text-gray-900">{selectedProduct.min_stock || 0}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Validade</label>
                <p className="text-sm text-gray-900">
                  {selectedProduct.expiry_date ? new Date(selectedProduct.expiry_date).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Fornecedor</label>
                <p className="text-sm text-gray-900">{selectedProduct.supplier || '-'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Localização</label>
                <p className="text-sm text-gray-900">{selectedProduct.location || '-'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Preço Unitário</label>
                <p className="text-sm text-gray-900">R$ {(selectedProduct.price || 0).toFixed(2)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <StatusBadge status={selectedProduct.status} />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalInventorySystem;
