import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Save, X, AlertCircle, Info, Bell } from 'lucide-react';

export function AdminNewsManager({ onNewsUpdate, embedded = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({
    type: 'notice',
    text: '',
    priority: 'medium'
  });

  // Load existing news from localStorage only (no defaults)
  const getInitialNews = () => {
    try {
      const stored = localStorage.getItem('healthnexus_ticker_news');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stored news:', error);
    }
    // If nothing stored, start with empty list
    return [];
  };

  const [newsItems, setNewsItems] = useState(getInitialNews);

  // Do not seed defaults. Keep storage untouched unless admin adds/edits items.
  useEffect(() => {}, []);

  const getIcon = (type) => {
    switch (type) {
      case 'notice': return AlertCircle;
      case 'news': return Info;
      default: return Bell;
    }
  };

  const saveToLocalStorage = (items) => {
    try {
      // Save to localStorage for ticker to read, tagging each as admin-created
      const itemsForStorage = items.map(({ icon, ...item }) => ({
        ...item,
        createdBy: item.createdBy || 'admin',
      }));
      console.log('Saving to localStorage:', itemsForStorage);
      localStorage.setItem('healthnexus_ticker_news', JSON.stringify(itemsForStorage));
      
      // Trigger custom event to notify ticker
      console.log('Dispatching tickerNewsUpdated event');
      window.dispatchEvent(new Event('tickerNewsUpdated'));
      
      // Also trigger storage event manually for same-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'healthnexus_ticker_news',
        newValue: JSON.stringify(itemsForStorage),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const addNewsItem = () => {
    if (!newItem.text.trim()) return;
    
    const item = {
      id: Date.now(),
      ...newItem,
      createdBy: 'admin',
      icon: getIcon(newItem.type)
    };
    
    const updatedItems = [...newsItems, item];
    setNewsItems(updatedItems);
    saveToLocalStorage(updatedItems);
    onNewsUpdate?.(updatedItems.map(item => ({ ...item, icon: getIcon(item.type) })));
    setNewItem({ type: 'notice', text: '', priority: 'medium' });
  };

  const deleteNewsItem = (id) => {
    const updatedItems = newsItems.filter(item => item.id !== id);
    setNewsItems(updatedItems);
    saveToLocalStorage(updatedItems);
    onNewsUpdate?.(updatedItems.map(item => ({ ...item, icon: getIcon(item.type) })));
  };

  const updateNewsItem = (id, updatedData) => {
    const updatedItems = newsItems.map(item => 
      item.id === id ? { ...item, ...updatedData } : item
    );
    setNewsItems(updatedItems);
    saveToLocalStorage(updatedItems);
    onNewsUpdate?.(updatedItems.map(item => ({ ...item, icon: getIcon(item.type) })));
    setEditingId(null);
  };

  // If embedded, show content directly. If not embedded, show modal behavior
  if (!embedded && !isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg"
        >
          <Edit className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Return based on embedded mode or modal mode
  if (embedded) {
    return (
      <div>
        {/* Add New Item */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
            >
              <option value="notice" className="text-black">Notice</option>
              <option value="news" className="text-black">News</option>
            </select>
            <select
              value={newItem.priority}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
            >
              <option value="low" className="text-black">Low Priority</option>
              <option value="medium" className="text-black">Medium Priority</option>
              <option value="high" className="text-black">High Priority</option>
            </select>
            <Button onClick={addNewsItem} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          <textarea
            value={newItem.text}
            onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
            placeholder="Enter news or notice text..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none text-gray-900 placeholder-gray-500"
            rows="3"
          />
        </div>

        {/* Existing Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Items</h3>
          {newsItems.map((item) => {
            const IconComponent = getIcon(item.type);
            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    item.type === 'notice' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${
                      item.type === 'notice' ? 'text-red-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                        item.type === 'notice' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {item.type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.priority === 'high' 
                          ? 'bg-orange-600 text-white'
                          : item.priority === 'medium'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}>
                        {item.priority} priority
                      </span>
                    </div>
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          defaultValue={item.text}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none text-gray-900"
                          rows="2"
                          onBlur={(e) => updateNewsItem(item.id, { text: e.target.value })}
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">{item.text}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteNewsItem(item.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Manage News & Notices</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Add New Item */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
              >
                <option value="notice" className="text-black">Notice</option>
                <option value="news" className="text-black">News</option>
              </select>
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
              >
                <option value="low" className="text-black">Low Priority</option>
                <option value="medium" className="text-black">Medium Priority</option>
                <option value="high" className="text-black">High Priority</option>
              </select>
              <Button onClick={addNewsItem} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <textarea
              value={newItem.text}
              onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
              placeholder="Enter news or notice text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none text-gray-900 placeholder-gray-500"
              rows="3"
            />
          </div>

          {/* Existing Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Items</h3>
            {newsItems.map((item) => {
              const IconComponent = getIcon(item.type);
              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      item.type === 'notice' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        item.type === 'notice' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                          item.type === 'notice' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {item.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.priority === 'high' 
                            ? 'bg-orange-600 text-white'
                            : item.priority === 'medium'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-green-600 text-white'
                        }`}>
                          {item.priority} priority
                        </span>
                      </div>
                      {editingId === item.id ? (
                        <div className="space-y-2">
                          <textarea
                            defaultValue={item.text}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none text-gray-900"
                            rows="2"
                            onBlur={(e) => updateNewsItem(item.id, { text: e.target.value })}
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => setEditingId(null)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900 font-medium">{item.text}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteNewsItem(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
