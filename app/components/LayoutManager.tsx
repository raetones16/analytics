"use client";

import React, { useState, useEffect } from "react";

interface LayoutManagerProps {
  storageKey: string;
  defaultLayout: ChartLayoutConfig;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

// Inline types
export type ChartLayoutItem = {
  id: string;
  position: number;
  width: "half" | "full";
};
export type ChartLayoutConfig = ChartLayoutItem[];

// Replace save/load with localStorage persistence
function saveLayoutConfig(key: string, layout: ChartLayoutConfig) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(layout));
    } catch (e) {
      // Handle storage errors if needed
    }
  }
}
function loadLayoutConfig(key: string): ChartLayoutConfig | null {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Handle parse errors if needed
    }
  }
  return null;
}

export function LayoutManager({
  storageKey,
  defaultLayout,
  isEditing,
  onSave,
  onCancel,
  children,
}: LayoutManagerProps) {
  // State for layout configuration
  const [layout, setLayout] = useState<ChartLayoutConfig>([]);
  const [editingLayout, setEditingLayout] = useState<ChartLayoutConfig>([]);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Load layout on initial render
  useEffect(() => {
    const savedLayout = loadLayoutConfig(storageKey);
    const initialLayout = savedLayout || defaultLayout;
    setLayout(initialLayout);
    setEditingLayout(initialLayout);
  }, [storageKey, defaultLayout]);

  // When isEditing changes, update editingLayout
  useEffect(() => {
    if (isEditing) {
      setEditingLayout([...layout]);
    }
  }, [isEditing, layout]);

  // Handle save action
  const handleSave = () => {
    // Sort by position before saving
    const sortedLayout = [...editingLayout].sort(
      (a, b) => a.position - b.position
    );

    // Save the layout
    saveLayoutConfig(storageKey, sortedLayout);

    // Update the current layout
    setLayout(sortedLayout);

    // Notify parent
    onSave();
  };

  // Handle cancel action
  const handleCancel = () => {
    // Reset to the saved layout
    setEditingLayout([...layout]);

    // Notify parent
    onCancel();
  };

  // Handle chart width toggle
  const handleWidthToggle = (id: string) => {
    setEditingLayout((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, width: item.width === "half" ? "full" : "half" }
          : item
      )
    );
  };

  // Handle drag start
  const handleDragStart = (id: string) => {
    setIsDragging(id);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(null);
    setDragOverId(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== isDragging) {
      setDragOverId(id);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!isDragging || isDragging === targetId) {
      return;
    }

    // Find the positions of both items
    const sourceItem = editingLayout.find((item) => item.id === isDragging);
    const targetItem = editingLayout.find((item) => item.id === targetId);

    if (!sourceItem || !targetItem) {
      return;
    }

    // Update the positions
    const sourcePosition = sourceItem.position;
    const targetPosition = targetItem.position;

    // Update the layout with new positions
    setEditingLayout((prev) =>
      prev.map((item) => {
        if (item.id === isDragging) {
          return { ...item, position: targetPosition };
        } else if (item.id === targetId) {
          return { ...item, position: sourcePosition };
        } else {
          return item;
        }
      })
    );

    // Reset drag state
    setIsDragging(null);
    setDragOverId(null);
  };

  // Render different layouts based on edit mode
  if (!isEditing) {
    // Render the normal view
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {layout
          .sort((a, b) => a.position - b.position)
          .map((item, index) => (
            <div
              key={item.id}
              className={`${item.width === "full" ? "md:col-span-2" : ""}`}
              data-id={item.id}
            >
              {/* Find the corresponding child by id */}
              {React.Children.toArray(children).find(
                (child) =>
                  React.isValidElement(child) && child.props.id === item.id
              )}
            </div>
          ))}
      </div>
    );
  }

  // Render the edit mode view
  return (
    <div className="relative">
      <div className="bg-blue-50 p-4 mb-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <p className="text-blue-700 font-medium">Edit Mode</p>
          <div className="space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
        <p className="text-blue-600 text-sm">
          Drag charts to reorder or toggle width using the buttons.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {editingLayout
          .sort((a, b) => a.position - b.position)
          .map((item) => (
            <div
              key={item.id}
              className={`
                relative
                ${item.width === "full" ? "md:col-span-2" : ""}
                ${isDragging === item.id ? "opacity-50" : ""}
                ${
                  dragOverId === item.id
                    ? "border-2 border-blue-400 rounded-lg"
                    : ""
                }
              `}
              draggable={true}
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              data-id={item.id}
            >
              <div className="absolute top-0 right-0 z-10 flex space-x-2 m-2">
                <button
                  onClick={() => handleWidthToggle(item.id)}
                  className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                >
                  {item.width === "half"
                    ? "Make Full Width"
                    : "Make Half Width"}
                </button>
              </div>

              <div className="p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-move">
                {/* Find the corresponding child by id */}
                {React.Children.toArray(children).find(
                  (child) =>
                    React.isValidElement(child) && child.props.id === item.id
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
