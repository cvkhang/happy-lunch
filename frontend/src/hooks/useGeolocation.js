import { useState, useEffect } from 'react';

/**
 * Custom hook to get user's geolocation
 * @returns {Object} { userLocation, locationError, locationLoading, requestLocation }
 */
const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'

  // Check if geolocation is supported
  const isGeolocationSupported = 'geolocation' in navigator;

  // Request user location
  const requestLocation = () => {
    if (!isGeolocationSupported) {
      setLocationError('お使いのブラウザは位置情報をサポートしていません。');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationPermission('granted');
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報へのアクセスが拒否されました。';
            setLocationPermission('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません。';
            break;
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました。';
            break;
          default:
            errorMessage = '位置情報の取得に失敗しました。';
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  };

  // Auto-request location on mount (optional)
  useEffect(() => {
    // Check permission status if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);

        // Auto-request if previously granted
        if (result.state === 'granted') {
          requestLocation();
        }
      });
    }
  }, []);

  return {
    userLocation,
    locationError,
    locationLoading,
    locationPermission,
    isGeolocationSupported,
    requestLocation
  };
};

export default useGeolocation;
