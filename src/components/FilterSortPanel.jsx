import React, { useEffect, useMemo, useState, useCallback } from "react";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const FilterSortPanel = ({
  filters = [],
  sortOptions = [],
  onFilterChange,
  onSortChange,
  buttonLabel = "Filters & Sort",
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState({});
  const [selectedSort, setSelectedSort] = useState("default");
  const reduceMotion = useReducedMotion();

  // lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  // esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const activeChips = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v && v !== "" && v !== "All")
        .map(([k, v]) => ({ key: k, value: v })),
    [selected]
  );

  const handleFilterChange = useCallback(
    (type, value) => {
      const next = { ...selected, [type]: value };
      setSelected(next);
      onFilterChange && onFilterChange(next);
    },
    [selected, onFilterChange]
  );

  const handleSortChange = useCallback(
    (value) => {
      setSelectedSort(value);
      onSortChange && onSortChange(value);
    },
    [onSortChange]
  );

  const clearAll = () => {
    setSelected({});
    setSelectedSort("default");
    onFilterChange && onFilterChange({});
    onSortChange && onSortChange("default");
  };

  const panelVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: reduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 260, damping: 30 },
    },
    exit: { x: "100%", transition: { duration: reduceMotion ? 0 : 0.25 } },
  };

  const listVariants = {
    hidden: {},
    visible: { transition: reduceMotion ? {} : { staggerChildren: 0.06, delayChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.18 } },
  };

  return (
    <div className="mb-4">
      {/* Always just a button on page (desktop + mobile) */}
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white shadow hover:bg-gray-800 transition"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>{buttonLabel}</span>
        {activeChips.length > 0 && (
          <span className="ml-1 text-xs bg-white/10 rounded px-2 py-0.5">
            {activeChips.length}
          </span>
        )}
      </motion.button>

      {/* Optional active chips preview under the button */}
      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span
              key={`${chip.key}-${chip.value}`}
              className="text-xs px-2.5 py-1 rounded-full bg-gray-200 text-gray-700"
            >
              {chip.key}: <span className="font-medium">{chip.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* Drawer overlay for ALL screen sizes */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex"
          >
            {/* Backdrop */}
            <div onClick={() => setOpen(false)} className="flex-1 backdrop-blur-sm bg-black/40" />

            {/* Drawer */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-[88%] sm:w-[420px] max-w-full h-full bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">Filters & Sort</span>
                  {activeChips.length > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {activeChips.length} applied
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-gray-100"
                    title="Clear all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded hover:bg-gray-100"
                    aria-label="Close filters panel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Filters list */}
              <motion.div variants={listVariants} initial="hidden" animate="visible" className="flex-1 overflow-y-auto p-4 space-y-5">
                {filters.map((f) => (
                  <motion.div key={f.type} variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                    <motion.select
                      whileFocus={{ scale: 1.01 }}
                      value={selected[f.type] || ""}
                      onChange={(e) => handleFilterChange(f.type, e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">{`Select ${f.label}`}</option>
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </motion.select>
                  </motion.div>
                ))}
              </motion.div>

              {/* Sort + footer */}
              <div className="border-t p-4 space-y-3">
                {sortOptions?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <motion.select
                      whileFocus={{ scale: 1.01 }}
                      value={selectedSort}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="default">Default</option>
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </motion.select>
                  </div>
                )}

                <div className="flex gap-3">
                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                    Apply
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={clearAll} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterSortPanel;
