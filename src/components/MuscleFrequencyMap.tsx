import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import Model from 'react-body-highlighter';
import type { IExerciseData } from 'react-body-highlighter';

interface MuscleFrequencyMapProps {
  muscleFrequencies: Map<string, number>; // Map of muscle name to hit count
}

export const MuscleFrequencyMap: React.FC<MuscleFrequencyMapProps> = ({ muscleFrequencies }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = front, 1 = back
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate brightness levels (0-100%) and group muscles by brightness
  const muscleGroupsByBrightness = useMemo(() => {
    if (muscleFrequencies.size === 0) {
      return [];
    }

    // Find max hit count
    const maxHitCount = Math.max(...Array.from(muscleFrequencies.values()));
    
    if (maxHitCount === 0) {
      return [];
    }

    // Group muscles by brightness percentage (rounded to nearest 5% for balance between accuracy and performance)
    const groups: Array<{ brightness: number; muscles: string[] }> = [];
    const brightnessMap = new Map<number, string[]>();

    muscleFrequencies.forEach((hitCount, muscle) => {
      if (hitCount === 0) return;
      
      // Calculate brightness percentage (0-100)
      const brightness = (hitCount / maxHitCount) * 100;
      
      // Round to nearest 5% to reduce number of layers while maintaining reasonable accuracy
      const roundedBrightness = Math.round(brightness / 5) * 5;
      
      // Ensure minimum brightness of 5% for visibility
      const finalBrightness = Math.max(5, roundedBrightness);
      
      if (!brightnessMap.has(finalBrightness)) {
        brightnessMap.set(finalBrightness, []);
      }
      brightnessMap.get(finalBrightness)!.push(muscle);
    });

    // Convert to array and sort by brightness (descending)
    brightnessMap.forEach((muscles, brightness) => {
      groups.push({ brightness, muscles });
    });

    return groups.sort((a, b) => b.brightness - a.brightness);
  }, [muscleFrequencies]);

  // Handle touch/mouse events for sliding
  const dragStartX = useRef(0);
  const initialTranslateX = useRef(0);
  const isDraggingRef = useRef(false);
  const currentIndexRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    isDraggingRef.current = isDragging;
    currentIndexRef.current = currentIndex;
  }, [isDragging, currentIndex]);

  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    initialTranslateX.current = translateX;
  }, [translateX]);

  const handleMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;
    
    const diff = clientX - dragStartX.current;
    const containerWidth = sliderRef.current?.offsetWidth || 0;
    const newTranslateX = initialTranslateX.current + diff;
    
    // Constrain the translation
    const minTranslate = -containerWidth;
    const maxTranslate = 0;
    setTranslateX(Math.max(minTranslate, Math.min(maxTranslate, newTranslateX)));
  }, []);

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    setIsDragging(false);
    const containerWidth = sliderRef.current?.offsetWidth || 0;
    const threshold = containerWidth * 0.25; // 25% threshold for switching
    const dragDistance = translateX - initialTranslateX.current;
    
    let newIndex = currentIndexRef.current;
    
    if (Math.abs(dragDistance) > threshold) {
      // Switch to next/previous slide
      if (dragDistance < 0 && currentIndexRef.current < 1) {
        // Dragging left (negative), move to next slide
        newIndex = currentIndexRef.current + 1;
      } else if (dragDistance > 0 && currentIndexRef.current > 0) {
        // Dragging right (positive), move to previous slide
        newIndex = currentIndexRef.current - 1;
      }
    }
    
    setCurrentIndex(newIndex);
  }, [translateX]);

  // Initialize translateX on mount and update when currentIndex changes
  useEffect(() => {
    if (!isDragging) {
      const updateTranslateX = () => {
        const containerWidth = sliderRef.current?.offsetWidth || 0;
        if (containerWidth > 0) {
          setTranslateX(-currentIndex * containerWidth);
        }
      };
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(updateTranslateX);
    }
  }, [currentIndex, isDragging]);

  // Initialize on mount
  useEffect(() => {
    const containerWidth = sliderRef.current?.offsetWidth || 0;
    if (containerWidth > 0) {
      setTranslateX(0); // Start at front view (index 0)
    }
  }, []);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  // Global mouse move handler
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
      };
      const handleGlobalMouseUp = () => {
        handleEnd();
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  // Convert brightness percentage to hex color with opacity
  const getColorForBrightness = (brightness: number): string => {
    // Use emerald-500 (#10b981) as base color
    // Convert brightness (0-100) to opacity (0-1)
    const opacity = brightness / 100;
    
    // Convert to hex with opacity
    const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `#10b981${opacityHex}`;
  };

  // Render a single view (front or back)
  const renderSingleView = (type: 'anterior' | 'posterior', label: string) => {
    return (
      <div className="flex-shrink-0 w-full px-4">
        {/* Label above the graphic */}
        <h4 className="text-sm font-medium text-light-muted mb-3 text-center">{label}</h4>
        
        <div className="relative" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', aspectRatio: '1 / 2' }}>
          {/* Background body outline - rendered first */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible" style={{ transform: 'translateY(5%)' }}>
            <Model
              data={[]}
              type={type}
              bodyColor="#1f1f1f"
              highlightedColors={[]}
              style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}
            />
          </div>
          
          {/* Render each brightness group as a separate layer */}
          {muscleGroupsByBrightness.map((group, idx) => {
            if (group.muscles.length === 0) return null;
            
            const exerciseData: IExerciseData[] = [{
              name: `brightness-${group.brightness}`,
              muscles: group.muscles as any
            }];
            
            const color = getColorForBrightness(group.brightness);
            
            return (
              <div
                key={`brightness-${group.brightness}-${idx}`}
                className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
                style={{ transform: 'translateY(5%)' }}
              >
                <Model
                  data={exerciseData}
                  type={type}
                  bodyColor="transparent"
                  highlightedColors={[color]}
                  style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (muscleFrequencies.size === 0 || muscleGroupsByBrightness.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-light-muted text-sm">No muscle data available for this period</p>
      </div>
    );
  }

  try {
    return (
      <div className="w-full">
        {/* Slider Container */}
        <div
          ref={sliderRef}
          className="relative overflow-hidden cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {/* Slider Track */}
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${translateX}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {/* Front View */}
            {renderSingleView('anterior', 'Front View')}
            
            {/* Back View */}
            {renderSingleView('posterior', 'Back View')}
          </div>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentIndex(0)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === 0
                ? 'bg-emerald-500 w-6'
                : 'bg-dark-border hover:bg-light-muted'
            }`}
            aria-label="Front view"
          />
          <button
            onClick={() => setCurrentIndex(1)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === 1
                ? 'bg-emerald-500 w-6'
                : 'bg-dark-border hover:bg-light-muted'
            }`}
            aria-label="Back view"
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering muscle frequency map:', error);
    return (
      <div className="text-center py-8">
        <p className="text-light-muted text-sm">
          Unable to display muscle visualization
        </p>
      </div>
    );
  }
};

