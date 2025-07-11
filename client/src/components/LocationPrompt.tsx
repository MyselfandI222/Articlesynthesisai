import React, { useState, useEffect } from 'react';
import { MapPin, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { getCurrentLocation, checkLocationPermission, saveLocationToStorage, getSavedLocation, getLocationDisplayName, isUSLocation, type LocationData, type LocationError } from '../utils/locationService';

interface LocationPromptProps {
  onLocationUpdate: (location: LocationData | null) => void;
  onClose: () => void;
}

export const LocationPrompt: React.FC<LocationPromptProps> = ({ onLocationUpdate, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for saved location
    const saved = getSavedLocation();
    if (saved) {
      setCurrentLocation(saved);
      onLocationUpdate(saved);
    }

    // Check permission status
    checkLocationPermission().then(setHasPermission);
  }, [onLocationUpdate]);

  const handleGetLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      saveLocationToStorage(location);
      onLocationUpdate(location);
      setHasPermission(true);
    } catch (err) {
      const locationError = err as LocationError;
      setError(locationError.message);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDenyLocation = () => {
    onLocationUpdate(null);
    onClose();
  };

  const formatLocation = (location: LocationData): string => {
    return getLocationDisplayName(location);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Enable Location</h2>
                <p className="text-sm text-gray-600">Get local news for your area</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {currentLocation ? (
            <div className={`${isUSLocation(currentLocation) ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-4`}>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-5 w-5 ${isUSLocation(currentLocation) ? 'text-green-600' : 'text-blue-600'}`} />
                <div>
                  <p className={`font-medium ${isUSLocation(currentLocation) ? 'text-green-900' : 'text-blue-900'}`}>Location Enabled</p>
                  <p className={`text-sm ${isUSLocation(currentLocation) ? 'text-green-700' : 'text-blue-700'}`}>{formatLocation(currentLocation)}</p>
                  {!isUSLocation(currentLocation) && (
                    <p className="text-xs text-blue-600 mt-1">
                      International location detected - global news sources will be included
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Why enable location?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Get news from your local area and region</li>
                  <li>• See community events and local updates</li>
                  <li>• Access regional and national perspectives</li>
                  <li>• Find local business and government news</li>
                  <li>• Get international coverage for global locations</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Location Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Privacy Notice</h4>
                <p className="text-sm text-gray-700">
                  Your location is only used to find relevant local and regional news sources. 
                  Location data is stored locally on your device and not transmitted to our servers. 
                  Works worldwide for both US and international locations.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleDenyLocation}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Not Now
          </button>
          {!currentLocation && (
            <button
              onClick={handleGetLocation}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Getting Location...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Enable Location</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};