import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { supabase } from '../../config/supabase';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SearchControl = ({ setPosition }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: '住所を入力して検索...',
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result) => {
      if (result.location) {
        setPosition({ lat: result.location.y, lng: result.location.x });
      }
    });

    return () => map.removeControl(searchControl);
  }, [map, setPosition]);

  return null;
};

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const RestaurantEditModal = ({ restaurant, onClose, onSuccess }) => {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    image_url: '',
    cuisine_type: '',
    latitude: '',
    longitude: ''
  });

  // Separate state for opening hours (array of ranges)
  const [timeRanges, setTimeRanges] = useState([{ open: '', close: '' }]);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone || '',
        description: restaurant.description || '',
        image_url: restaurant.image_url || '',
        cuisine_type: restaurant.cuisine_type || '',
        latitude: restaurant.latitude || '',
        longitude: restaurant.longitude || ''
      });

      // Parse opening hours
      if (restaurant.opening_hours) {
        const ranges = restaurant.opening_hours.split(', ');
        const parsedRanges = ranges.map(range => {
          const parts = range.split(' - ');
          return parts.length === 2 ? { open: parts[0], close: parts[1] } : { open: '', close: '' };
        }).filter(r => r.open && r.close);

        setTimeRanges(parsedRanges.length > 0 ? parsedRanges : [{ open: '', close: '' }]);
      } else {
        setTimeRanges([{ open: '', close: '' }]);
      }
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        description: '',
        image_url: '',
        cuisine_type: '',
        latitude: '',
        longitude: ''
      });
      setTimeRanges([{ open: '', close: '' }]);
    }
  }, [restaurant]);

  const handleAddTimeRange = () => {
    setTimeRanges([...timeRanges, { open: '', close: '' }]);
  };

  const handleRemoveTimeRange = (index) => {
    const newRanges = timeRanges.filter((_, i) => i !== index);
    setTimeRanges(newRanges.length > 0 ? newRanges : [{ open: '', close: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Combine opening hours
      const validRanges = timeRanges.filter(r => r.open && r.close);
      const opening_hours = validRanges.map(r => `${r.open} - ${r.close}`).join(', ');

      let imageUrl = formData.image_url;

      // Upload image to Supabase if it's a File object
      if (formData.image_url instanceof File) {
        if (!supabase) {
          throw new Error('システム設定エラー: 画像アップロード機能が無効です');
        }

        const file = formData.image_url;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `restaurants/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('restaurant-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from('restaurant-images')
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      const data = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
        cuisine_type: formData.cuisine_type,
        latitude: formData.latitude,
        longitude: formData.longitude,
        opening_hours: opening_hours,
        image_url: imageUrl
      };

      if (restaurant) {
        await axios.put(`${API_BASE_URL}/restaurants/${restaurant.id}`, data, config);
        toast.success('レストラン情報を更新しました');
      } else {
        await axios.post(`${API_BASE_URL}/restaurants`, data, config);
        toast.success('新しいレストランを追加しました');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || error.response?.data?.errors?.[0]?.msg || '保存に失敗しました');
    }
  };

  const handleMapClick = (latlng) => {
    setFormData(prev => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-white">
            {restaurant ? 'レストラン編集' : '新規レストラン追加'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">店名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">住所</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">電話番号</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">営業時間</label>
                <div className="space-y-2">
                  {timeRanges.map((range, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={range.open}
                        onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                      />
                      <span className="text-slate-500">~</span>
                      <input
                        type="time"
                        value={range.close}
                        onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                      />
                      {timeRanges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeRange(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTimeRange}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    + 時間帯を追加
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">料理ジャンル</label>
              <input
                type="text"
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                placeholder="例: 日本料理, イタリアン"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">画像</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.image_url ? (
                    <img
                      src={typeof formData.image_url === 'string' ? formData.image_url : URL.createObjectURL(formData.image_url)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-400 text-xs">No Img</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ ...formData, image_url: file });
                      }
                    }}
                    className="w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-orange-50 file:text-orange-700
                      hover:file:bg-orange-100
                    "
                  />
                  <p className="text-xs text-slate-500 mt-1 ml-32">推奨: 1MB以下のJPG/PNG</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">説明</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">位置情報 (地図をクリックして選択)</label>
              <div className="h-64 rounded-xl overflow-hidden border border-slate-300 mb-2">
                <MapContainer
                  center={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : [21.0070, 105.8430]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <SearchControl setPosition={handleMapClick} />
                  <LocationMarker
                    position={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
                    setPosition={handleMapClick}
                  />
                </MapContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">緯度 (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">経度 (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-sm"
              >
                保存する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantEditModal;
