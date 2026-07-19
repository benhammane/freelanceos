import { useState, useEffect, useCallback } from 'react';
import { activitiesApi } from '../api/activities';
import type { ActivityLog, ActivityCategory, ResourceType } from '../types/ActivityLog';
import toast from 'react-hot-toast';

export function useActivityTimeline() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchTimeline = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const data = await activitiesApi.getTimeline(page, 20);
      setActivities(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      toast.error('Failed to fetch activity timeline');
      console.error('Error fetching timeline:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline(0);
  }, [fetchTimeline]);

  const filterByResourceType = useCallback(async (resourceType: ResourceType, page = 0) => {
    try {
      setLoading(true);
      const data = await activitiesApi.getByResourceType(resourceType, page, 20);
      setActivities(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      toast.error('Failed to filter activities');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterByCategory = useCallback(async (category: ActivityCategory, page = 0) => {
    try {
      setLoading(true);
      const data = await activitiesApi.getByCategory(category, page, 20);
      setActivities(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      toast.error('Failed to filter activities');
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (keyword: string, page = 0) => {
    if (!keyword.trim()) {
      fetchTimeline(page);
      return;
    }

    try {
      setLoading(true);
      const data = await activitiesApi.search(keyword, page, 20);
      setActivities(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      toast.error('Failed to search activities');
    } finally {
      setLoading(false);
    }
  }, [fetchTimeline]);

  const getByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const data = await activitiesApi.getByDateRange(startDate, endDate);
      setActivities(data);
      setTotalPages(1);
      setCurrentPage(0);
    } catch (err) {
      toast.error('Failed to fetch activities for date range');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    activities,
    loading,
    totalPages,
    currentPage,
    fetchTimeline,
    filterByResourceType,
    filterByCategory,
    search,
    getByDateRange
  };
}
