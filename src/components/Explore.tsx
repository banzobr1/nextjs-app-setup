"use client";

import React from "react";

const samplePosts = [
  { id: 1, imageUrl: "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg", caption: "Nature beauty" },
  { id: 2, imageUrl: "https://images.pexels.com/photos/34950/pexels-photo.jpg", caption: "City life" },
  { id: 3, imageUrl: "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg", caption: "Mountain view" },
  { id: 4, imageUrl: "https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg", caption: "Beach vibes" },
  { id: 5, imageUrl: "https://images.pexels.com/photos/349758/pexels-photo-349758.jpeg", caption: "Sunset" },
  { id: 6, imageUrl: "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg", caption: "Forest trail" },
];

export default function Explore() {
  return (
    <section className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 dark:text-gray-200">Explorar</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {samplePosts.map((post) => (
          <div key={post.id} className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md">
            <img
              src={`${post.imageUrl}?auto=compress&cs=tinysrgb&dpr=2&h=300&w=300`}
              alt={post.caption}
              className="w-full h-full object-cover transform group-hover:scale-110 transition duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white font-semibold">
              {post.caption}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
