"use client";

import React, { useState } from "react";

interface Post {
  id: number;
  author: string;
  content: string;
  likes: number;
  likedByUser: boolean;
  comments: Comment[];
}

interface Comment {
  id: number;
  author: string;
  content: string;
}

const initialPosts: Post[] = [
  {
    id: 1,
    author: "João Silva",
    content: "Alguém sabe quando é a prova de cálculo?",
    likes: 3,
    likedByUser: false,
    comments: [
      { id: 1, author: "Maria", content: "É na próxima semana!" },
      { id: 2, author: "Carlos", content: "Confere o calendário acadêmico." },
    ],
  },
  {
    id: 2,
    author: "Ana Pereira",
    content: "Dica: usem o site XYZ para pesquisa acadêmica.",
    likes: 5,
    likedByUser: true,
    comments: [],
  },
];

export default function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const toggleLike = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByUser: !post.likedByUser,
              likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4 text-blue-700">Feed de Notícias</h3>
      {posts.map((post) => (
        <div key={post.id} className="mb-6 border-b border-gray-200 pb-4">
          <p className="font-semibold">{post.author}</p>
          <p className="mb-2">{post.content}</p>
          <button
            onClick={() => toggleLike(post.id)}
            className={`text-sm font-semibold ${
              post.likedByUser ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Curtir ({post.likes})
          </button>
          <div className="mt-2">
            {post.comments.map((comment) => (
              <div key={comment.id} className="text-sm text-gray-600 ml-4">
                <span className="font-semibold">{comment.author}: </span>
                {comment.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
