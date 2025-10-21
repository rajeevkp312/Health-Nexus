import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Edit3, Save, X, Trash2, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

function AdminProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('admin');
    if (!email) {
      navigate('/admin');
      return;
    }
    setAdminEmail(email);
    setEditedEmail(email);
    fetchProfile(email);
  }, [navigate]);

  const fetchProfile = async (email) => {
    try {
      setLoading(true);
      // Fetch current admin (email is sufficient for our schema)
      const res = await axios.get(`http://localhost:8000/api/admin/profile/${encodeURIComponent(email)}`);
      if (res.data?.msg === 'Success') {
        setEditedEmail(res.data?.value?.email || email);
      }
    } catch (e) {
      // Non-fatal; continue with local value
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setEditedEmail(adminEmail);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSave = async () => {
    try {
      const payload = {};
      if (editedEmail && editedEmail !== adminEmail) payload.email = editedEmail;
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          window.alert('Passwords do not match');
          return;
        }
        if (!newPassword) {
          window.alert('New password cannot be empty');
          return;
        }
        payload.password = newPassword;
      }
      if (Object.keys(payload).length === 0) {
        window.alert('No changes to save');
        return;
      }

      const res = await axios.put(`http://localhost:8000/api/admin/profile/${encodeURIComponent(adminEmail)}` , payload);
      if (res.data?.msg === 'Success') {
        const updatedEmail = res.data?.value?.email || editedEmail || adminEmail;
        localStorage.setItem('admin', updatedEmail);
        setAdminEmail(updatedEmail);
        setIsEditing(false);
        setNewPassword('');
        setConfirmPassword('');
        window.alert('Profile updated successfully');
      } else {
        window.alert('Failed to update profile');
      }
    } catch (e) {
      console.error(e);
      window.alert('Network error while updating profile');
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm('Are you sure you want to delete this admin account? This action cannot be undone.');
    if (!ok) return;
    try {
      const res = await axios.delete(`http://localhost:8000/api/admin/profile/${encodeURIComponent(adminEmail)}`);
      if (res.data?.msg === 'Success') {
        localStorage.removeItem('admin');
        window.alert('Admin account deleted');
        navigate('/admin');
      } else {
        window.alert('Failed to delete admin');
      }
    } catch (e) {
      console.error(e);
      window.alert('Network error while deleting admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-3xl mx-auto p-3 md:p-6 pt-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-3">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Admin Profile</h1>
              <p className="text-sm text-gray-600">Manage your admin account settings</p>
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          {/* Email */}
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Email</p>
              {!isEditing ? (
                <p className="text-gray-900 font-medium">{adminEmail}</p>
              ) : (
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full mt-1 border rounded px-3 py-2"
                />
              )}
            </div>
          </div>

          {/* Password Change */}
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Change Password</p>
              {!isEditing ? (
                <p className="text-gray-900 font-medium flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-500" />
                  ••••••••
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full border rounded px-3 py-2 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full border rounded px-3 py-2 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        {!isEditing && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
            <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-600 mb-3">Deleting your account is irreversible.</p>
            <Button onClick={handleDelete} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Admin Account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;
