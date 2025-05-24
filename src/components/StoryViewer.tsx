"use client";

import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-init";
import { useAuth } from "@/lib/AuthContext";

interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  timestamp: any;
  viewers?: string[];
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialStoryIndex, onClose }: StoryViewerProps) {
  const { user } = useAuth();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStory = stories[currentStoryIndex];
  const isLastStory = currentStoryIndex === stories.length - 1;
  const isFirstStory = currentStoryIndex === 0;

  useEffect(() => {
    if (!currentStory || !user) return;

    // Mark story as viewed
    const markAsViewed = async () => {
      const storyRef = doc(db, "stories", currentStory.id);
      const storyDoc = await getDoc(storyRef);
      
      if (storyDoc.exists()) {
        const viewers = storyDoc.data().viewers || [];
        if (!viewers.includes(user.uid)) {
          await updateDoc(storyRef, {
            viewers: arrayUnion(user.uid)
          });
        }
      }
    };

    markAsViewed();

    // Start progress bar
    if (currentStory.mediaType === "image") {
      // For images, progress over 5 seconds
      const duration = 5000;
      const interval = 50;
      let elapsed = 0;

      progressInterval.current = setInterval(() => {
        elapsed += interval;
        setProgress((elapsed / duration) * 100);

        if (elapsed >= duration) {
          if (isLastStory) {
            onClose();
          } else {
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
          }
        }
      }, interval);

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [currentStory, user, isLastStory, onClose]);

  const handleVideoProgress = () => {
    if (!videoRef.current) return;
    
    const { currentTime, duration } = videoRef.current;
    setProgress((currentTime / duration) * 100);

    if (currentTime >= duration) {
      if (isLastStory) {
        onClose();
      } else {
        setCurrentStoryIndex(prev => prev + 1);
        setProgress(0);
      }
    }
  };

  const handleNext = () => {
    if (isLastStory) {
      onClose();
    } else {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStory) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white z-50"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* Navigation buttons */}
      {!isFirstStory && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-50"
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>
      )}
      {!isLastStory && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white z-50"
        >
          <ChevronRightIcon className="h-8 w-8" />
        </button>
      )}

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Story content */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {/* User info */}
        <div className="absolute top-8 left-4 right-4 flex items-center space-x-3 z-50">
          <img
            src={currentStory.userAvatar}
            alt={currentStory.username}
            className="w-8 h-8 rounded-full border border-white"
          />
          <span className="text-white font-semibold">{currentStory.username}</span>
        </div>

        {/* Media */}
        {currentStory.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={currentStory.mediaUrl}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            onTimeUpdate={handleVideoProgress}
          />
        ) : (
          <img
            src={currentStory.mediaUrl}
            alt="Story"
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
}
