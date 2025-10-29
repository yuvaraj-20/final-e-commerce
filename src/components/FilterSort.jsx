import React, { useState } from "react";

const FilterSort = ({ filters = [], sortOptions = [], onFilterChange, onSortChange }) => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedSort, setSelectedSort] = useState("default");

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const updatedFilters = { ...selectedFilters, [filterType]: value };
    setSelectedFilters(updatedFilters);

    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSelectedSort(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-900 rounded-xl shadow-md text-white">
      
      {/* Render all filters dynamically */}
      <div className="flex flex-wrap gap-4 w-full sm:w-auto">
        {filters.map((filter, index) => (
          <div key={index} className="relative">
            <select
              value={selectedFilters[filter.type] || ""}
              onChange={(e) => handleFilterChange(filter.type, e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Sort dropdown */}
      {sortOptions.length > 0 && (
        <div className="relative w-full sm:w-auto">
          <select
            value={selectedSort}
            onChange={handleSortChange}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full"
          >
            <option value="default">Sort By</option>
            {sortOptions.map((option, i) => (
              <option key={i} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterSort;
