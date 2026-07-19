import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useActivityTimeline } from '../hooks/useActivityTimeline';
import type { ResourceType, ActivityCategory } from '../types/ActivityLog';
import { Button } from '../components/ui/Button';

export function ActivityTimelinePage() {
  const {
    activities,
    loading,
    totalPages,
    currentPage,
    fetchTimeline,
    filterByResourceType,
    filterByCategory,
    search
  } = useActivityTimeline();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | ''>('');
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | ''>('');

  const handleSearch = (keyword: string) => {
    setSearchTerm(keyword);
    search(keyword, 0);
  };

  const handleCategoryFilter = (category: ActivityCategory | '') => {
    setSelectedCategory(category);
    setSearchTerm('');
    if (category) {
      filterByCategory(category, 0);
    } else {
      fetchTimeline(0);
    }
  };

  const handleResourceTypeFilter = (resourceType: ResourceType | '') => {
    setSelectedResourceType(resourceType);
    setSearchTerm('');
    if (resourceType) {
      filterByResourceType(resourceType, 0);
    } else {
      fetchTimeline(0);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedResourceType('');
    fetchTimeline(0);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'VIEW': return 'bg-slate-100 text-slate-800';
      case 'DOWNLOAD': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getResourceTypeIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'PROJECT': return '📁';
      case 'TASK': return '✓';
      case 'INVOICE': return '💰';
      case 'NOTE': return '📝';
      case 'CLIENT': return '👤';
      case 'MEETING': return '📞';
      case 'ROOM': return '📹';
      default: return '📌';
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fg mb-2">Activity Timeline</h1>
          <p className="text-fg/60">View all your account activities and changes</p>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Search Activities
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg/40 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by description, action, or resource..."
                  className="w-full pl-10 pr-4 py-2 bg-app-bg border border-border rounded-lg text-fg placeholder-fg/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value as ActivityCategory | '')}
                  className="w-full px-4 py-2 bg-app-bg border border-border rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="PROJECTS">Projects</option>
                  <option value="INVOICES">Invoices</option>
                  <option value="TEAMS">Teams</option>
                  <option value="CALENDAR">Calendar</option>
                  <option value="VIDEO">Video</option>
                  <option value="SYSTEM">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  Resource Type
                </label>
                <select
                  value={selectedResourceType}
                  onChange={(e) => handleResourceTypeFilter(e.target.value as ResourceType | '')}
                  className="w-full px-4 py-2 bg-app-bg border border-border rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Resources</option>
                  <option value="PROJECT">Project</option>
                  <option value="TASK">Task</option>
                  <option value="INVOICE">Invoice</option>
                  <option value="NOTE">Note</option>
                  <option value="CLIENT">Client</option>
                  <option value="MEETING">Meeting</option>
                  <option value="ROOM">Video Room</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCategory || selectedResourceType) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <div className="w-8 h-8 border-4 border-border border-t-blue-500 rounded-full"></div>
              </div>
              <p className="text-fg/60 mt-4">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border rounded-lg">
              <AlertCircle className="w-12 h-12 text-fg/40 mx-auto mb-4" />
              <p className="text-fg/60">No activities found</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-surface border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <span className="text-2xl">{getResourceTypeIcon(activity.resourceType)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Title with Action Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-fg text-lg">
                            {activity.description || `${activity.action} ${activity.resourceType}`}
                          </h3>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getActionBadgeColor(activity.action)}`}>
                            {activity.action}
                          </span>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-sm text-fg/60 flex-wrap">
                          <span>{activity.userEmail}</span>
                          <span>•</span>
                          <span>{new Date(activity.dateCreation).toLocaleString()}</span>
                          {activity.category && (
                            <>
                              <span>•</span>
                              <span className="bg-surface px-2 py-1 rounded border border-border text-xs font-medium">
                                {activity.category}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Metadata Info */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-3 p-3 bg-app-bg rounded border border-border text-xs text-fg/70 font-mono">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => fetchTimeline(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-fg/60">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages - 1}
              onClick={() => fetchTimeline(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
