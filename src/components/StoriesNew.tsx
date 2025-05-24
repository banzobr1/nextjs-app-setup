"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import VideoRecorder from "./VideoRecorder";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase-init";
import { useAuth } from "@/lib/AuthContext";
import StoryViewer from "./StoryViewer";

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

export default function StoriesNew() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isVideoRecorderOpen, setIsVideoRecorderOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Get stories from the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const storiesCollection = collection(db, "stories");
    const q = query(
      storiesCollection,
      where("timestamp", ">=", yesterday),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storiesData: Story[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        storiesData.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          userAvatar: data.userAvatar || "/default-avatar.png",
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          timestamp: data.timestamp,
          viewers: data.viewers || [],
        });
      });
      setStories(storiesData);
    });

    return () => unsubscribe();
  }, [user]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const scrollAmount = 200;
    const newPosition = direction === "left"
      ? scrollPosition - scrollAmount
      : scrollPosition + scrollAmount;

    containerRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

    if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
      setError("Formato inválido. Aceitamos fotos e vídeos.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // For videos, check dimensions
      if (validVideoTypes.includes(file.type)) {
        const video = document.createElement("video");
        video.preload = "metadata";
        
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            if (video.videoWidth !== 1080 || video.videoHeight !== 1920) {
              reject(new Error("Vídeo deve ter resolução 1080x1920."));
            } else {
              resolve(true);
            }
          };
          video.onerror = reject;
          video.src = URL.createObjectURL(file);
        });
      }

      // Upload file
      const storageRef = ref(storage, `stories/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const mediaUrl = await getDownloadURL(storageRef);

      // Create story document
      await addDoc(collection(db, "stories"), {
        userId: user.uid,
        username: user.displayName || "Usuário",
        userAvatar: user.photoURL || "/default-avatar.png",
        mediaUrl,
        mediaType: file.type.startsWith("video") ? "video" : "image",
        timestamp: serverTimestamp(),
        viewers: [],
      });
    } catch (err: any) {
      setError(err.message || "Erro ao criar história.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="relative mb-8">
        {/* Navigation buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1 shadow-md z-10 hover:bg-white dark:hover:bg-gray-800"
          style={{ display: scrollPosition > 0 ? "block" : "none" }}
        >
          <ChevronLeftIcon className="h-5 w-5 dark:text-gray-200" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1 shadow-md z-10 hover:bg-white dark:hover:bg-gray-800"
        >
          <ChevronRightIcon className="h-5 w-5 dark:text-gray-200" />
        </button>

        {/* Stories container */}
        <div
          ref={containerRef}
          className="flex space-x-4 overflow-x-hidden p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
        >
          {/* Create Story Button */}
          <div className="flex space-x-4">
            {/* Upload Story Button */}
            <div 
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <PlusIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="text-xs text-center w-16 truncate dark:text-gray-200">
                {uploading ? "Enviando..." : "Upload"}
              </span>
            </div>

            {/* Record Video Button */}
            <div 
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
              onClick={() => setIsVideoRecorderOpen(true)}
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <VideoCameraIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="text-xs text-center w-16 truncate dark:text-gray-200">
                Gravar
              </span>
            </div>
          </div>

          {/* Stories */}
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
              onClick={() => setSelectedStoryIndex(index)}
            >
              <div className={`w-16 h-16 rounded-full p-[2px] ${
                story.viewers?.includes(user?.uid || "") 
                  ? "bg-gray-300 dark:bg-gray-600"
                  : "bg-gradient-to-tr from-yellow-400 to-pink-600"
              }`}>
                <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
                  <img
                    src={story.userAvatar}
                    alt={story.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-center w-16 truncate dark:text-gray-200">
                {story.username}
              </span>
            </div>
          ))}
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={handleFileSelect}
        />

        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Video Recorder Modal */}
      {isVideoRecorderOpen && (
        <VideoRecorder
          onUpload={async (videoUrl) => {
            if (!user) return;
            
            try {
              await addDoc(collection(db, "stories"), {
                userId: user.uid,
                username: user.displayName || "Usuário",
                userAvatar: user.photoURL || "/default-avatar.png",
                mediaUrl: videoUrl,
                mediaType: "video",
                timestamp: serverTimestamp(),
                viewers: [],
              });
              setIsVideoRecorderOpen(false);
            } catch (err) {
              setError("Erro ao criar história. Tente novamente.");
            }
          }}
          onCancel={() => setIsVideoRecorderOpen(false)}
        />
      )}

      {/* Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </>
  );
}
