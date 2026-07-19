import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../api/notifications';
import type { Notification } from '../types/Notification';
import toast from 'react-hot-toast';

const POLL_INTERVAL = 5000; // 5 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchNotifications = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const data = await notificationsApi.getUserNotifications(page, 20);
      setNotifications(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(0);
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      await fetchUnreadCount();
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  }, [fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchUnreadCount();
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  }, [fetchUnreadCount]);

  const deleteAllRead = useCallback(async () => {
    try {
      await notificationsApi.deleteAllRead();
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (err) {
      toast.error('Failed to delete read notifications');
    }
  }, []);

  const getUnreadNotifications = useCallback(async (page = 0) => {
    try {
      const data = await notificationsApi.getUnreadNotifications(page, 20);
      return { notifications: data.content, totalPages: data.totalPages };
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
      return { notifications: [], totalPages: 0 };
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    totalPages,
    currentPage,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getUnreadNotifications,
    fetchUnreadCount
  };
}
