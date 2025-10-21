import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  MessageSquare, 
  Newspaper,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function ModernAdminDash() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [tick, setTick] = useState(0); // rerender timer for time-ago updates

  // Icon/color mapping for activity types
  const typeMap = {
    appointment: { icon: Calendar, color: 'text-blue-600' },
    doctor: { icon: Stethoscope, color: 'text-green-600' },
    feedback: { icon: MessageSquare, color: 'text-purple-600' },
    news: { icon: Newspaper, color: 'text-red-600' },
  };
  const iconByType = (type) => typeMap[type] || { icon: Activity, color: 'text-gray-600' };

  const timeAgo = (ts) => {
    const t = new Date(ts);
    const diff = Math.floor((Date.now() - t.getTime()) / 1000);
    if (diff < 60) return `${Math.max(diff, 1)} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return t.toLocaleString();
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/stats');
      if (response.data.msg === "Success") {
        setStats(response.data.value);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails
      setStats({
        d: 0,
        p: 0,
        pena: 0,
        c: 0,
        n: 0,
        f: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const [activities, setActivities] = useState([]);

  // Load initial real activities
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/admin/activity/recent');
        if (res.data?.msg === 'Success') {
          const list = (res.data.value || []).map(a => ({ ...a, ...iconByType(a.type) }));
          if (!ignore) setActivities(list);
        }
      } catch (_) {
        // Leave empty on failure
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Real-time SSE connection
  useEffect(() => {
    const es = new EventSource('http://localhost:8000/api/admin/activity/stream');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const { type, message, ts } = data;
        const meta = iconByType(type);
        const item = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type,
          message: message || 'Activity',
          ts: ts || new Date().toISOString(),
          ...meta,
        };
        setActivities(prev => [item, ...prev].slice(0, 20));
      } catch (_) {
        // ignore parse errors / heartbeats
      }
    };
    es.onerror = () => {
      // Keep connection; browser will auto-retry. Could switch to backoff if needed.
    };
    // Update times every minute
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => {
      try { es.close(); } catch (_) {}
      clearInterval(iv);
    };
  }, []);

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simple CSV report
      const reportData = [
        ['Metric', 'Value', 'Change'],
        ['Total Doctors', stats.d || 0, '+12%'],
        ['Total Patients', stats.p || 0, '+8%'],
        ['Appointments', stats.pena || 0, '+15%'],
        ['Complaints', stats.c || 0, '-5%'],
        ['News Articles', stats.n || 0, '+3%'],
        ['Feedback', stats.f || 0, '+7%']
      ];
      
      const csvContent = reportData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `healthnexus-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const statCards = [
    {
      title: 'Total Doctors',
      value: stats.d || 0,
      icon: Stethoscope,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: '+12%',
      changeType: 'increase',
      route: '/admin/dash/viewdoc'
    },
    {
      title: 'Total Patients',
      value: stats.p || 0,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      change: '+8%',
      changeType: 'increase',
      route: '/admin/dash/viewpatient'
    },
    {
      title: 'Appointments',
      value: stats.pena || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      change: '+15%',
      changeType: 'increase',
      route: '/admin/dash/viewapp'
    },
    {
      title: 'Complaints',
      value: stats.c || 0,
      icon: AlertCircle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      change: '-5%',
      changeType: 'decrease',
      route: '/admin/dash/viewfeed?type=Complain'
    },
    {
      title: 'News Articles',
      value: stats.n || 0,
      icon: Newspaper,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      change: '+3%',
      changeType: 'increase',
      route: '/admin/dash/adnews'
    },
    {
      title: 'Feedback',
      value: stats.f || 0,
      icon: MessageSquare,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700',
      change: '+7%',
      changeType: 'increase',
      route: '/admin/dash/viewfeed'
    }
  ];

  // activities state used instead of static list

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at HealthNexus today.</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 w-full sm:w-auto"
          onClick={generateReport}
          disabled={generatingReport}
        >
          <Activity className="h-4 w-4 mr-2" />
          {generatingReport ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer hover:scale-105"
            onClick={() => navigate(card.route)}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  card.changeType === 'decrease' ? 'rotate-180' : ''
                }`} />
                {card.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/dash/viewapp')}
            >
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full bg-gray-100`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeAgo(activity.ts)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50 transition-colors"
              onClick={() => navigate('/admin/dash/addoc')}
            >
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Add Doctor</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50 transition-colors"
              onClick={() => navigate('/admin/dash/adpatient')}
            >
              <Users className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Add Patient</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50 transition-colors"
              onClick={() => navigate('/admin/dash/viewapp')}
            >
              <Calendar className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">View Appointments</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 border-red-200 hover:bg-red-50 transition-colors"
              onClick={() => navigate('/admin/dash/adnews')}
            >
              <Newspaper className="h-6 w-6 text-red-600" />
              <span className="text-sm font-medium">Add News</span>
            </Button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Database</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">API Services</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Backup System</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModernAdminDash;
