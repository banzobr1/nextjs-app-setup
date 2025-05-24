"use client";

import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../lib/AuthContext";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface SearchResult {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  followers_count?: number;
  posts_count?: number;
}

interface Tag {
  id: string;
  name: string;
  posts_count: number;
}

interface Post {
  id: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
}

export default function SearchPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"users" | "tags" | "places">("users");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [tagResults, setTagResults] = useState<Tag[]>([]);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    loadRecentSearches();
    loadTopPosts().catch(console.error);
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const performSearch = async () => {
      if (!isSubscribed) return;

      if (searchTerm) {
        await handleSearch();
      } else {
        setResults([]);
        setTagResults([]);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, searchType]);

  const loadRecentSearches = () => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  };

  const loadTopPosts = async () => {
    try {
      const postsCollection = collection(db, "posts");
      const q = query(postsCollection, orderBy("likes_count", "desc"), limit(9));
      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          image_url: data.image_url,
          likes_count: data.likes_count,
          comments_count: data.comments_count,
        });
      });
      setTopPosts(posts);
    } catch (error) {
      console.error("Error loading top posts:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      if (searchType === "users") {
        const profilesCollection = collection(db, "profiles");
        const q = query(
          profilesCollection,
          where("username", ">=", searchTerm),
          where("username", "<=", searchTerm + "\uf8ff"),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const users: SearchResult[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          users.push({
            id: doc.id,
            username: data.username,
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            bio: data.bio,
            followers_count: data.followers_count,
            posts_count: data.posts_count,
          });
        });
        setResults(users);
      } else if (searchType === "tags") {
        const tagsCollection = collection(db, "tags");
        const q = query(
          tagsCollection,
          where("name", ">=", searchTerm),
          where("name", "<=", searchTerm + "\uf8ff"),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const tags: Tag[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tags.push({
            id: doc.id,
            name: data.name,
            posts_count: data.posts_count,
          });
        });
        setTagResults(tags);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToRecentSearches = (result: SearchResult) => {
    const newRecentSearches = [
      result,
      ...recentSearches.filter((s) => s.id !== result.id),
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
  };

  const removeFromRecent = (id: string) => {
    const newRecentSearches = recentSearches.filter((s) => s.id !== id);
    setRecentSearches(newRecentSearches);
    localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Search Header */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>

        {/* Search Type Tabs */}
        <div className="flex space-x-6 mt-4 border-b border-gray-200 dark:border-gray-700">
          {["users", "tags", "places"].map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type as "users" | "tags" | "places")}
              className={`pb-3 px-1 text-sm font-medium ${
                searchType === type
                  ? "border-b-2 border-gray-900 dark:border-white text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results or Recent Searches */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : searchTerm ? (
        <div className="space-y-4">
          {searchType === "users" &&
            results.map((result) => (
              <div
                key={result.id}
                onClick={() => addToRecentSearches(result)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition"
              >
                <div className="flex items-center">
                  <img
                    src={result.avatar_url || "/default-avatar.png"}
                    alt={result.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="font-semibold dark:text-gray-200">
                      {result.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.full_name}
                    </p>
                    {result.followers_count !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {result.followers_count.toLocaleString()} seguidores
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {searchType === "tags" &&
            tagResults.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-lg text-gray-500 dark:text-gray-400">
                      #
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold dark:text-gray-200">#{tag.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tag.posts_count.toLocaleString()} publicações
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-semibold mb-4 dark:text-gray-200">
                Pesquisas recentes
              </h2>
              <div className="space-y-4">
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center cursor-pointer">
                      <img
                        src={search.avatar_url || "/default-avatar.png"}
                        alt={search.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <p className="font-semibold dark:text-gray-200">
                          {search.username}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {search.full_name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromRecent(search.id);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Posts Grid */}
          <div>
            <h2 className="text-base font-semibold mb-4 dark:text-gray-200">
              Populares
            </h2>
            <div className="grid grid-cols-3 gap-1">
              {topPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square relative group cursor-pointer"
                >
                  <img
                    src={post.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-4">
                    <div className="hidden group-hover:flex items-center text-white">
                      <span className="font-semibold">{post.likes_count}</span>
                      <span className="mx-1">•</span>
                      <span className="font-semibold">{post.comments_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}