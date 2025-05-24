"use client";

import React, { useState, useRef } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase-init";
import { useAuth } from "@/lib/AuthContext";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    setSelectedImage(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!content.trim() && !selectedImage) {
      setError("Adicione um texto ou uma imagem para criar a publicação.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        const imageRef = ref(storage, `posts/${Date.now()}-${selectedImage.name}`);
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Create post document
      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        author: user.displayName || "Usuário",
        authorAvatar: user.photoURL || "/default-avatar.png",
        content: content.trim(),
        imageUrl,
        likes: 0,
        likedBy: [],
        comments: [],
        timestamp: serverTimestamp(),
      });

      // Reset form and close modal
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      onPostCreated();
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Erro ao criar publicação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
              Criar publicação
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={user?.photoURL || "/default-avatar.png"}
                alt={user?.displayName || "User"}
                className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
              <span className="font-semibold dark:text-gray-200">
                {user?.displayName || "Usuário"}
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="O que você está pensando?"
              className="w-full min-h-[100px] p-2 border border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />

            {imagePreview && (
              <div className="relative mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-[300px] rounded-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-gray-900/50 rounded-full p-1 hover:bg-gray-900/75"
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <PhotoIcon className="h-6 w-6" />
                <span>Adicionar foto</span>
              </button>

              <button
                type="submit"
                disabled={loading || (!content.trim() && !selectedImage)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Publicando..." : "Publicar"}
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
