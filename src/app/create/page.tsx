"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CreatePostModal from "@/components/CreatePostModal";
import { useAuth } from "@/lib/AuthContext";

export default function CreatePage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  if (!user) {
    return (
      <div className="container mx-auto p-8 max-w-md">
        <p className="text-center text-red-600">Você precisa estar logado para criar uma publicação.</p>
      </div>
    );
  }

  const handleClose = () => {
    setIsModalOpen(false);
    router.back();
  };

  const handlePostCreated = () => {
    router.push("/"); // Redirect to home page after post creation
  };

  return (
    <CreatePostModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onPostCreated={handlePostCreated}
    />
  );
}
