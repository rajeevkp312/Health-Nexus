import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Image,
  Save,
  X,
  Bell,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { AdminNewsManager } from '../components/AdminNewsManager';

export function ModernNewsManagement() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Debug logging
  useEffect(() => {
    console.log('ModernNewsManagement component mounted');
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' or 'ticker'
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author: '',
    image: null,
    status: 'draft'
  });

  const categories = ['All Categories', 'Health Tips', 'Medical Research', 'Hospital News', 'Community Health', 'Technology'];
  const statusOptions = ['draft', 'published', 'archived'];

  const fetchNews = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/news');
      if (response.data.msg === "Success") {
        setNews(response.data.value || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      // Mock data for demo
      setNews([
        {
          _id: '1',
          title: 'New Cardiac Care Unit Opens at HealthNexus',
          content: 'We are excited to announce the opening of our state-of-the-art cardiac care unit...',
          category: 'Hospital News',
          author: 'Dr. Sarah Wilson',
          publishDate: '2024-01-20',
          status: 'published',
          views: 1250,
          image: '/src/assets/news1.jpg'
        },
        {
          _id: '2',
          title: '10 Essential Health Tips for Winter',
          content: 'As winter approaches, it\'s important to take extra care of your health...',
          category: 'Health Tips',
          author: 'Dr. Michael Brown',
          publishDate: '2024-01-18',
          status: 'published',
          views: 890,
          image: '/src/assets/news2.jpg'
        },
        {
          _id: '3',
          title: 'Revolutionary Cancer Treatment Research',
          content: 'Our research team has made significant breakthroughs in cancer treatment...',
          category: 'Medical Research',
          author: 'Dr. Lisa Anderson',
          publishDate: '2024-01-15',
          status: 'draft',
          views: 0,
          image: '/src/assets/news3.jpg'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Push an article into the homepage ticker (localStorage-driven)
  const addToTicker = (newsItem) => {
    try {
      const key = 'healthnexus_ticker_news';
      const stored = localStorage.getItem(key);
      let items = [];
      try { items = stored ? JSON.parse(stored) : []; } catch { items = []; }

      // Compose a concise ticker line from the article
      const baseText = `${newsItem.title || ''}: ${newsItem.content || ''}`.replace(/\s+/g, ' ').trim();
      const text = baseText.slice(0, 280); // keep it short

      // Avoid duplicates by text match
      if (items.some(it => it.text === text)) {
        alert('This news is already in the ticker.');
        return;
      }

      const item = {
        id: Date.now(),
        type: (newsItem.category === 'Hospital News' || newsItem.category === 'Community Health') ? 'notice' : 'news',
        text,
        priority: newsItem.status === 'published' ? 'medium' : 'low',
        createdBy: 'admin'
      };

      const updated = [...items, item];
      localStorage.setItem(key, JSON.stringify(updated));

      // Notify ticker to refresh
      window.dispatchEvent(new Event('tickerNewsUpdated'));
      try {
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(updated), storageArea: localStorage }));
      } catch {}

      alert('Added to ticker successfully.');
    } catch (e) {
      console.error('Failed to add to ticker', e);
      alert('Failed to add to ticker.');
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Use FormData to support file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('status', formData.status);

      // Add image if present
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (editingNews) {
        response = await axios.put(`http://localhost:8000/api/admin/news/${editingNews._id || editingNews.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post('http://localhost:8000/api/admin/news', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.msg === "Success") {
        alert(`News ${editingNews ? 'updated' : 'created'} successfully!`);
        setShowAddForm(false);
        setEditingNews(null);
        setFormData({
          title: '',
          content: '',
          category: '',
          author: '',
          image: null,
          status: 'draft'
        });
        fetchNews();
      } else {
        throw new Error(response.data.msg || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error saving news:', error);
      alert(`Error saving news: ${error.response?.data?.msg || error.message || 'Please try again.'}`);
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category,
      author: newsItem.author,
      image: null,
      status: newsItem.status
    });
    setShowAddForm(true);
  };

  const handleDelete = async (newsId) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        const response = await axios.delete(`http://localhost:8000/api/news/${newsId}`);
        if (response.data.msg === "Success") {
          setNews(news.filter(item => (item._id || item.id) !== newsId));
          alert('News deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting news:', error);
        alert('Error deleting news. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'bg-green-600 text-white';
      case 'draft': return 'bg-yellow-600 text-white';
      case 'archived': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || filterCategory === 'All Categories' || 
                           item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">News & Articles Management</h1>
          <p className="text-gray-600 mt-1">Create and manage health news and articles</p>
        </div>
        <Button 
          onClick={() => {
            setShowAddForm(true);
            setEditingNews(null);
            setFormData({
              title: '',
              content: '',
              category: '',
              author: '',
              image: null,
              status: 'draft'
            });
          }}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Article
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'articles'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            News Articles
          </button>
          <button
            onClick={() => setActiveTab('ticker')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ticker'
                ? 'border-red-500 text-red-600 bg-red-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bell className="h-4 w-4 inline mr-2" />
            News Ticker & Notices
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'articles' ? (
        <>
          {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search articles by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500"
            >
              {categories.map(category => (
                <option key={category} value={category === 'All Categories' ? '' : category} className="text-black">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900">{news.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {news.filter(n => n.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Edit className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">
                {news.filter(n => n.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Filter className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredNews.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNews.map((newsItem) => (
          <div key={newsItem._id || newsItem.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="h-48 bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
              {newsItem.image ? (
                <img 
                  src={newsItem.image} 
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="h-16 w-16 text-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium bg-blue-600 text-white px-2 py-1 rounded">
                  {newsItem.category}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(newsItem.status)}`}>
                  {newsItem.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {newsItem.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {newsItem.content}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{newsItem.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(newsItem.publishDate).toLocaleDateString()}</span>
                </div>
              </div>

              {newsItem.status === 'published' && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <Eye className="h-4 w-4" />
                  <span>{newsItem.views} views</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => addToTicker(newsItem)}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  Add to Ticker
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(newsItem)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleDelete(newsItem._id || newsItem.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNews ? 'Edit Article' : 'Add New Article'}
                </h2>
                <Button 
                  variant="ghost"
                  className="bg-gray-800 text-white hover:bg-gray-900 rounded-md p-2"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingNews(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter article title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    >
                      <option value="">Select Category</option>
                      {categories.slice(1).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Write your article content here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingNews(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingNews ? 'Update Article' : 'Create Article'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

          {/* Empty State */}
          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first article'
                }
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Article
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Ticker Tab Content */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">News Ticker & Notices Management</h2>
            <p className="text-gray-600">Manage the scrolling news ticker that appears on the homepage below the appointment buttons.</p>
          </div>
          <AdminNewsManager embedded={true} />
        </div>
      )}
    </div>
  );
}

export default ModernNewsManagement;
