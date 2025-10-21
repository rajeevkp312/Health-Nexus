import React from 'react';
import { X, Calendar, Clock, User, Stethoscope, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppointmentDetailsModal({ isOpen, onClose, appointment }) {
  if (!isOpen || !appointment) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-600 text-white border-green-700';
      case 'pending': return 'bg-yellow-200 text-yellow-900 border-yellow-300';
      case 'completed': return 'bg-blue-200 text-blue-900 border-blue-300';
      case 'cancelled': return 'bg-red-600 text-white border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 relative rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-white/20 hover:bg-white/30 rounded-full p-2"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Appointment Details</h2>
              <p className="text-blue-100 text-sm">Complete appointment information</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Unknown'}
            </span>
          </div>

          {/* Doctor Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-secondary">
                  {appointment.doctorName || appointment.did?.name || 'Not assigned'}
                </span>
              </div>
              {(appointment.specialty || appointment.did?.specialty || appointment.did?.spe) && (
                <div className="flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-secondary">{appointment.specialty || appointment.did?.specialty || appointment.did?.spe}</span>
                </div>
              )}
              {(appointment.did?.phone || appointment.phone) && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-secondary">{appointment.did?.phone || appointment.phone}</span>
                </div>
              )}
              {appointment.did?.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-secondary">{appointment.did.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Appointment Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-secondary">Date:</span>
                <span className="font-medium text-secondary">{formatDate(appointment.date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Time Slot:</span>
                <span className="font-medium text-secondary">{appointment.slot || 'Not specified'}</span>
              </div>
              {appointment.description && (
                <div>
                  <span className="text-secondary block mb-1">Description:</span>
                  <p className="text-secondary bg-white p-3 rounded border text-sm">
                    {appointment.description}
                  </p>
                </div>
              )}
              {appointment.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Booked on:</span>
                  <span className="text-sm text-secondary">{formatDate(appointment.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(appointment.notes || appointment.instructions) && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Additional Information</h3>
              {appointment.notes && (
                <div className="mb-2">
                  <span className="text-blue-800 font-medium">Notes:</span>
                  <p className="text-blue-700 mt-1">{appointment.notes}</p>
                </div>
              )}
              {appointment.instructions && (
                <div>
                  <span className="text-blue-800 font-medium">Instructions:</span>
                  <p className="text-blue-700 mt-1">{appointment.instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
