"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
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
}

export default function Stories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const storiesCollection = collection(db, "stories");
    const q = query(storiesCollection, orderBy("timestamp", "desc"));

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
        });
      });
      setStories(storiesData);
    });

    return () => unsubscribe();
  }, []);

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

  return (
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
        <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer" onClick={() => setShowCreateModal(true)}>
          <div className="w-16 h-16 rounded-full p-[2px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <PlusIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
          </div>
          <span className="text-xs text-center w-16 truncate dark:text-gray-200">Criar história</span>
        </div>

        {/* User Stories */}
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600">
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

      {showCreateModal && (
        <CreateStoryModal onClose={() => setShowCreateModal(false)} user={user} />
      )}
    </div>
  );
}

interface CreateStoryModalProps {
  onClose: () => void;
  user: any;
}

function CreateStoryModal({ onClose, user }: CreateStoryModalProps) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

    if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
      setError("Formato inválido. Aceitamos fotos e vídeos.");
      return;
    }

    // Validate video resolution for 1080x1920 (portrait)
    if (validVideoTypes.includes(file.type)) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        if (video.videoWidth !== 1080 || video.videoHeight !== 1920) {
          setError("Vídeo deve ter resolução 1080x1920.");
          setMediaFile(null);
          setMediaPreview(null);
          return;
        } else {
          setError("");
          setMediaFile(file);
          setMediaPreview(URL.createObjectURL(file));
        }
      };
      video.src = URL.createObjectURL(file);
    } else {
      // For images, just preview
      setError("");
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!mediaFile) {
      setError("Selecione uma foto ou vídeo para criar a história.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload media to Firebase Storage
      const storageRef = await import("firebase/storage").then(({ ref, uploadBytes, getDownloadURL }) => {
        const { storage } = require("@/lib/firebase-init");
        return { ref, uploadBytes, getDownloadURL, storage };
      });

      const mediaRef = storageRef.ref(storageRef.storage, `stories/${Date.now()}-${mediaFile.name}`);
      await storageRef.uploadBytes(mediaRef, mediaFile);
      const mediaUrl = await storageRef.getDownloadURL(mediaRef);

      // Add story document
      await addDoc(collection(db, "stories"), {
        userId: user.uid,
        username: user.displayName || "Usuário",
        userAvatar: user.photoURL || "/default-avatar.png",
        mediaUrl,
        mediaType: mediaFile.type.startsWith("video") ? "video" : "image",
        timestamp: serverTimestamp(),
      });

      onClose();
    } catch (err) {
      setError("Erro ao criar história. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-auto shadow-xl">
          <div className="border-b border-gray-300 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-gray-200">
              Criar História
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4">
            {mediaPreview ? (
              mediaFile?.type.startsWith("video") ? (
                <video src={mediaPreview} controls className="w-full rounded-lg" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full rounded-lg" />
              )
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-20 flex items-center justify-center text-gray-500 dark:text-gray-400"
              >
                Clique para adicionar foto ou vídeo (1080x1920)
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <button
              onClick={handleSubmit}
              disabled={loading || !mediaFile}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
