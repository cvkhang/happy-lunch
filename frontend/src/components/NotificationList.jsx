import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { initSocket, disconnectSocket } from '../services/socket';

const NotificationList = () => {
  const { token, user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      fetchNotifications(); // Initial fetch

      // Initialize Socket
      const socket = initSocket(token);

      socket.on('new_notification', (newNotification) => {
        console.log('New notification received via socket:', newNotification);

        // Add to list
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast
        toast.custom((t) => (
          <div
            onClick={() => {
              handleNotificationClick(newNotification);
              toast.dismiss(t.id);
            }}
            className={`${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              } transform transition-all duration-300 max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer hover:bg-slate-50`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <span className="text-2xl">❤️</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    いいね！
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {newNotification.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 5000 });
      });

      return () => {
        socket.off('new_notification');
        disconnectSocket();
      };
    }
  }, [user, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const fetchedNotifications = response.data.notifications;
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prevNotifications => prevNotifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prevNotifications => prevNotifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);

    // Navigate if it's a review like
    if (notification.type === 'like_review' && notification.Review && notification.Review.restaurant_id) {
      navigate(`/restaurants/${notification.Review.restaurant_id}?refresh=${Date.now()}#review-${notification.reference_id}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-orange-600 transition-colors rounded-full hover:bg-slate-50 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">通知</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                すべて既読にする
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer ${!notification.is_read ? 'bg-orange-50/30' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className="text-sm text-slate-700 mb-1">{notification.message}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(notification.createdAt).toLocaleString('ja-JP')}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                通知はありません
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
