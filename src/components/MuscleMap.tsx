import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import Model from 'react-body-highlighter';
import type { IExerciseData } from 'react-body-highlighter';
import type { Exercise } from '../types';
import { getMusclesFromExercises, getMuscleHitCounts, getMusclesForExercise } from '../lib/muscleMapping';

interface MuscleMapProps {
  exercises: Exercise[];
}

export const MuscleMap: React.FC<MuscleMapProps> = ({ exercises }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = front, 1 = back
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate muscle hit counts
  const muscleHitCounts = useMemo(() => {
    const counts = getMuscleHitCounts(exercises);
    
    // Debug logging
    console.log('=== Muscle Map Debug ===');
    console.log('Exercises:', exercises.map(e => e.exercise_name));
    exercises.forEach(exercise => {
      const muscles = getMusclesForExercise(exercise.exercise_name);
      console.log(`Exercise "${exercise.exercise_name}" maps to:`, muscles);
    });
    console.log('Final muscle hit counts:', Array.from(counts.entries()));
    console.log('Calves hit count:', counts.get('calves'));
    console.log('======================');
    
    return counts;
  }, [exercises]);

  if (!exercises || exercises.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-light-muted text-sm">No exercises to visualize</p>
      </div>
    );
  }

  // Separate muscles by intensity: 1 hit vs 2+ hits
  // Build sets directly from the hit counts map to ensure no duplication
  const singleHitMuscles: string[] = [];
  const multiHitMuscles: string[] = [];

  // Iterate through the hit counts map directly (each muscle appears only once)
  muscleHitCounts.forEach((hitCount, muscle) => {
    if (hitCount >= 2) {
      multiHitMuscles.push(muscle);
    } else if (hitCount === 1) {
      singleHitMuscles.push(muscle);
    }
  });

  // Debug logging for intensity separation
  console.log('Single-hit muscles (partial intensity):', singleHitMuscles);
  console.log('Multi-hit muscles (max intensity):', multiHitMuscles);

  // Create single exercise entries with all muscles of the same hit count
  // Note: react-body-highlighter accepts string[] for muscles at runtime, but TypeScript expects Muscle[]
  const singleHitExercises: IExerciseData[] = singleHitMuscles.length > 0 ? [{
    name: 'single-hit-muscles',
    muscles: singleHitMuscles as any
  }] : [];
  
  const multiHitExercises: IExerciseData[] = multiHitMuscles.length > 0 ? [{
    name: 'multi-hit-muscles',
    muscles: multiHitMuscles as any
  }] : [];

  // Get all unique muscles hit in this workout
  const musclesHit = getMusclesFromExercises(exercises);

  if (musclesHit.length === 0 || (singleHitExercises.length === 0 && multiHitExercises.length === 0)) {
    return (
      <div className="text-center py-8">
        <p className="text-light-muted text-sm">
          Muscle mapping not available for these exercises
        </p>
      </div>
    );
  }

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
          
          {/* Base layer for muscles hit 2+ times (max intensity) */}
          {multiHitExercises.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible" style={{ transform: 'translateY(5%)' }}>
              <Model
                data={multiHitExercises}
                type={type}
                bodyColor="transparent"
                highlightedColors={['#10b981']} // emerald-500 - max intensity
                style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}
              />
            </div>
          )}
          
          {/* Overlay layer for muscles hit once (partial intensity) */}
          {singleHitExercises.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible" style={{ transform: 'translateY(5%)' }}>
              <Model
                data={singleHitExercises}
                type={type}
                bodyColor="transparent"
                highlightedColors={['#10b98180']} // emerald-500 with ~50% opacity - partial intensity
                style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

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
    console.error('Error rendering muscle map:', error);
    return (
      <div className="text-center py-8">
        <p className="text-light-muted text-sm">
          Unable to display muscle visualization
        </p>
      </div>
    );
  }
};
