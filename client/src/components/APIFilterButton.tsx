import React, { useState, useEffect } from 'react';
import { Filter, Database } from 'lucide-react';
import { getEnabledAPICount } from '../utils/apiFilters';
import { APIFilterModal } from './APIFilterModal';

interface APIFilterButtonProps {
  onFiltersChanged: () => void;
}

export const APIFilterButton: React.FC<APIFilterButtonProps> = ({ onFiltersChanged }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enabledCount, setEnabledCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  useEffect(() => {
    updateCounts();
  }, []);
  
  const updateCounts = () => {
    import('../utils/apiFilters').then(({ getEnabledAPICount, allAPISources }) => {
      setEnabledCount(getEnabledAPICount());
      setTotalCount(allAPISources.length);
    });
  };
  
  const handleFiltersChanged = () => {
    updateCounts();
    onFiltersChanged();
  };
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-colors text-xs font-medium text-indigo-800"
        title="Filter API sources"
      >
        <Filter className="h-3.5 w-3.5" />
        <div className="flex items-center space-x-1">
          <Database className="h-3.5 w-3.5" />
          <span>{enabledCount}/{totalCount} APIs</span>
        </div>
      </button>
      
      <APIFilterModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFiltersChanged={handleFiltersChanged}
      />
    </>
  );
};