'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartLayoutConfig, 
  ChartLayoutItem, 
  saveLayoutConfig, 
  loadLayoutConfig 
} from '../utils/storage/layoutStorage';

interface LayoutManagerProps {
  storageKey: string;
  defaultLayout: ChartLayoutConfig;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

export function LayoutManagerWithGrid({
  storageKey,
  defaultLayout,
  isEditing,
  onSave,
  onCancel,
  children
}: LayoutManagerProps) {
  // State for layout configuration
  const [layout, setLayout] = useState<ChartLayoutConfig>([]);
  const [editingLayout, setEditingLayout] = useState<ChartLayoutConfig>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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
    const sortedLayout = [...editingLayout].sort((a, b) => a.position - b.position);
    saveLayoutConfig(storageKey, sortedLayout);
    setLayout(sortedLayout);
    onSave();
  };

  // Handle cancel action
  const handleCancel = () => {
    setEditingLayout([...layout]);
    onCancel();
  };

  // Handle chart width toggle
  const handleWidthToggle = (id: string) => {
    setEditingLayout(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newWidth: 'half' | 'full' = item.width === 'half' ? 'full' : 'half';
          return { ...item, width: newWidth };
        }
        return item;
      })
    );
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    
    // Add a little delay to show visual feedback
    setTimeout(() => {
      const element = document.querySelector(`[data-chart-id="${id}"]`) as HTMLElement;
      if (element) {
        element.classList.add('dragging');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Remove dragging class from any element that might have it
    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    
    setDraggedItem(null);
  };

  // Handle drag over another chart
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle dropping onto another chart
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the dragged item ID from the data transfer, or use our state variable
    const draggedId = e.dataTransfer.getData('text/plain') || draggedItem;
    
    if (!draggedId || targetId === draggedId) return;

    // Find both chart items
    const srcItem = editingLayout.find(item => item.id === draggedId);
    const destItem = editingLayout.find(item => item.id === targetId);
    if (!srcItem || !destItem) return;

    // Swap positions
    const srcPos = srcItem.position;
    const destPos = destItem.position;

    console.log(`Swapping ${draggedId} (pos ${srcPos}) with ${targetId} (pos ${destPos})`);

    // Update layout with swapped positions
    setEditingLayout(prev => 
      prev.map(item => {
        if (item.id === draggedId) {
          return { ...item, position: destPos };
        } else if (item.id === targetId) {
          return { ...item, position: srcPos };
        }
        return item;
      })
    );

    // Reset drag state
    setDraggedItem(null);
  };

  // Find the React child corresponding to the chart ID
  const findChildById = (id: string) => {
    return React.Children.toArray(children).find(
      (child) => React.isValidElement(child) && child.props.id === id
    );
  };

  // Get chart title
  const getChartTitle = (child: React.ReactNode): string => {
    if (!React.isValidElement(child)) return 'Chart';
    
    // Try to extract the ID, which is often descriptive
    const id = child.props.id || '';
    const readableId = id
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str: string) => str.toUpperCase()) // Capitalize first letter
      .trim(); // Cleanup extra spaces
    
    let title = readableId || 'Chart';
    
    // Also try to find the actual h3 title
    for (const c of React.Children.toArray(child.props.children)) {
      if (React.isValidElement(c) && 
          c.props && 
          typeof c.props === 'object' &&
          'className' in c.props && 
          typeof c.props.className === 'string' &&
          c.props.className.includes('flex')) {
        
        for (const tc of React.Children.toArray(c.props.children)) {
          // Look for an h3 element
          if (React.isValidElement(tc) && tc.type === 'h3' && tc.props.children) {
            return tc.props.children;
          }
        }
      }
    }
    
    return title;
  };

  // Create a component that hides the visualization toggle
  const ChartWithoutToggle = ({ child }: { child: React.ReactElement }) => {
    return React.cloneElement(
      child, 
      {}, 
      React.Children.map(child.props.children, (grandChild) => {
        if (
          React.isValidElement(grandChild) && 
          grandChild.props && 
          typeof grandChild.props === 'object' &&
          'className' in grandChild.props && 
          typeof grandChild.props.className === 'string' &&
          (grandChild.props.className.includes('flex justify-between') || 
           grandChild.props.className.includes('items-center mb-3'))
        ) {
          // Skip the toggle container
          return null;
        }
        return grandChild;
      })
    );
  };
  
  // Normal viewing mode - unchanged from original
  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {layout
          .sort((a, b) => a.position - b.position)
          .map((item) => (
            <div
              key={item.id}
              className={`${item.width === 'full' ? 'md:col-span-2' : ''}`}
              data-id={item.id}
            >
              {findChildById(item.id)}
            </div>
          ))}
      </div>
    );
  }

  // Edit mode - uses the exact same grid layout as the normal mode
  return (
    <div>
      <div className="bg-blue-90 p-4 mb-6 rounded-lg border border-blue-70">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-30 font-semibold">Layout Edit Mode</p>
            <p className="text-blue-40 text-sm mt-1">
              Drag charts to reorder or toggle between full/half width
            </p>
          </div>
          <div className="space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white text-grey-40 rounded border border-grey-70 hover:bg-grey-90 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-50 text-white rounded hover:bg-blue-40 transition-colors shadow-sm"
            >
              Save Layout
            </button>
          </div>
        </div>
      </div>

      <div className="edit-mode-grid">
        {editingLayout
          .sort((a, b) => a.position - b.position)
          .map((item) => {
            const child = findChildById(item.id);
            
            return (
              <div 
                key={item.id}
                className={`
                  relative 
                  edit-chart-container
                  ${item.width === 'full' ? 'col-span-full' : 'col-span-1'} 
                  ${draggedItem === item.id ? 'opacity-50' : ''}
                `}
                draggable={true}
                data-chart-id={item.id}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
              >
                {/* Control bar overlay */}
                <div className="absolute top-0 right-0 left-0 bg-grey-90 bg-opacity-90 z-10 p-2 flex justify-between items-center border-b border-grey-70">
                  <h3 className="text-grey-30 text-md truncate">
                    {getChartTitle(child)}
                  </h3>
                  <button
                    onClick={() => handleWidthToggle(item.id)}
                    className={`
                      px-3 py-1 text-xs font-medium rounded transition-colors shadow-sm
                      ${item.width === 'half' 
                        ? 'bg-blue-90 text-blue-30 border border-blue-70 hover:bg-blue-80' 
                        : 'bg-blue-80 text-blue-40 border border-blue-60 hover:bg-blue-70'}
                    `}
                  >
                    {item.width === 'half' ? 'Make Full Width' : 'Make Half Width'}
                  </button>
                </div>

                {/* Chart content with grab handle */}
                <div className="pt-10 relative border-2 border-dashed border-grey-70 rounded-lg cursor-grab bg-white">
                  {/* Hide the original toggle in edit mode */}
                  {React.isValidElement(child) && (
                    <div className="p-4">
                      <ChartWithoutToggle child={child} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
