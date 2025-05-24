"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  HeartIcon as HeartOutline,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  orderBy,
  addDoc,
  serverTimestamp,
  getDocs,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase-init";
import { useAuth } from "@/lib/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  id: string;
  authorId: string;
  author: string;
  content: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  authorAvatar?: string;
  imageUrl?: string;
  timestamp?: any;
}

interface Comment {
  id: string;
  authorId: string;
  author: string;
  content: string;
  timestamp?: any;
  authorAvatar?: string;
}

export default function SocialFeedNew() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for posts
    const postsCollection = collection(db, "posts");
    const q = query(postsCollection, orderBy("timestamp", "desc"), limit(5));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          authorId: data.authorId,
          author: data.author,
          content: data.content,
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
          comments: data.comments || [],
          authorAvatar: data.authorAvatar || '/default-avatar.png',
          imageUrl: data.imageUrl,
          timestamp: data.timestamp,
        });
      });
      setPosts(postsData);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const loadMorePosts = async () => {
    if (!lastVisible || !user) return;
    setLoadingMore(true);

    const postsCollection = collection(db, "posts");
    const q = query(
      postsCollection,
      orderBy("timestamp", "desc"),
      startAfter(lastVisible),
      limit(5)
    );

    try {
      const querySnapshot = await getDocs(q);
      const newPosts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        newPosts.push({
          id: doc.id,
          authorId: data.authorId,
          author: data.author,
          content: data.content,
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
          comments: data.comments || [],
          authorAvatar: data.authorAvatar || '/default-avatar.png',
          imageUrl: data.imageUrl,
          timestamp: data.timestamp,
        });
      });

      setPosts((prev) => [...prev, ...newPosts]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loadingMore) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMorePosts();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loadingMore, lastVisible]);

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const postRef = doc(db, "posts", postId);
    const isLiked = post.likedBy.includes(user.uid);

    try {
      await updateDoc(postRef, {
        likes: isLiked ? increment(-1) : increment(1),
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    const postRef = doc(db, "posts", postId);
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.uid,
      author: user.displayName || "Usuário",
      content: newComment[postId].trim(),
      authorAvatar: user.photoURL || '/default-avatar.png',
    };

    try {
      await updateDoc(postRef, {
        comments: arrayUnion(comment),
      });
      await updateDoc(postRef, {
        timestamp: serverTimestamp(),
      });
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-xl mx-auto h-[calc(100vh-4rem)] overflow-y-auto">
      {posts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Nenhuma publicação ainda.
        </p>
      )}
      {posts.map((post) => (
        <article key={post.id} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mb-4 overflow-hidden">
          {/* Post header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
              <span className="font-semibold text-sm dark:text-gray-200">{post.author}</span>
            </div>
            <EllipsisHorizontalIcon className="h-5 w-5 cursor-pointer dark:text-gray-400" />
          </div>

          {/* Post image */}
          {post.imageUrl && (
            <div className="relative pb-[100%]">
              <img
                src={post.imageUrl}
                alt="Post content"
                className="absolute w-full h-full object-cover"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="p-3">
            <div className="flex justify-between mb-2">
              <div className="flex space-x-4">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className="focus:outline-none"
                >
                  {post.likedBy.includes(user?.uid || '') ? (
                    <HeartSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartOutline className="h-6 w-6 dark:text-gray-400" />
                  )}
                </button>
                <ChatBubbleLeftIcon className="h-6 w-6 dark:text-gray-400" />
                <PaperAirplaneIcon className="h-6 w-6 rotate-45 dark:text-gray-400" />
              </div>
              <BookmarkIcon className="h-6 w-6 dark:text-gray-400" />
            </div>

            {/* Likes */}
            <div className="font-semibold text-sm mb-2 dark:text-gray-200">
              {post.likes} curtidas
            </div>

            {/* Caption */}
            <div className="text-sm mb-2 dark:text-gray-200">
              <span className="font-semibold mr-2">{post.author}</span>
              {post.content}
            </div>

            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Ver todos os {post.comments.length} comentários
              </div>
            )}
            {post.comments.slice(-2).map((comment) => (
              <div key={comment.id} className="text-sm mb-1 dark:text-gray-200">
                <span className="font-semibold mr-2">{comment.author}</span>
                {comment.content}
              </div>
            ))}

            {/* Timestamp */}
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-2">
              {formatTimestamp(post.timestamp)}
            </div>
          </div>

          {/* Comment input */}
          <div className="flex items-center border-t border-gray-300 dark:border-gray-700 p-3">
            <input
              type="text"
              value={newComment[post.id] || ""}
              onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
              placeholder="Adicione um comentário..."
              className="flex-1 text-sm outline-none bg-transparent dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleComment(post.id);
                }
              }}
            />
            <button
              onClick={() => handleComment(post.id)}
              disabled={!newComment[post.id]?.trim()}
              className="text-blue-500 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publicar
            </button>
          </div>
        </article>
      ))}
      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
