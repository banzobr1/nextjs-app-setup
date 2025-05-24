"use client";

import React, { useState, useEffect } from "react";
import { FaUserEdit, FaUsers, FaUserFriends } from "react-icons/fa";
import SocialFeedNew from "./SocialFeedNew";

export default function UserProfile() {
  const [user, setUser] = useState({
    username: "username",
    fullName: "Nome Completo",
    bio: "Esta é a bio do usuário. Aqui você pode falar um pouco sobre você.",
    followers: 123,
    following: 45,
    avatar: "/default-avatar.png",
  });

  // For simplicity, reuse SocialFeedNew for user's posts
  // In a real app, filter posts by user

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center space-x-6 mb-6">
        <img
          src={user.avatar}
          alt={user.username}
          className="w-24 h-24 rounded-full border p-[2px] dark:border-gray-600"
        />
        <div>
          <h2 className="text-2xl font-semibold dark:text-gray-200">{user.username}</h2>
          <p className="text-gray-600 dark:text-gray-400">{user.fullName}</p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{user.bio}</p>
          <button className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 flex items-center space-x-2">
            <FaUserEdit />
            <span>Editar Perfil</span>
          </button>
        </div>
      </div>
      <div className="flex space-x-8 mb-6 text-center text-gray-700 dark:text-gray-300">
        <div>
          <span className="block font-semibold text-lg">{user.followers}</span>
          <span className="text-sm">Seguidores</span>
        </div>
        <div>
          <span className="block font-semibold text-lg">{user.following}</span>
          <span className="text-sm">Seguindo</span>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4 dark:text-gray-200">Publicações</h3>
        <SocialFeedNew />
      </div>
    </section>
  );
}
