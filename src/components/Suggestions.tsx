"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, limit, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-init";
import { useAuth } from "@/lib/AuthContext";

interface SuggestedUser {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  university?: string;
}

export default function Suggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;

      try {
        // First get user's following list
        const followingSnapshot = await getDocs(collection(db, `users/${user.uid}/following`));
        const followingIds = new Set(followingSnapshot.docs.map(doc => doc.id));
        setFollowing(followingIds);

        // Then get suggestions excluding users already followed
        const usersRef = collection(db, "users");
        const userDomain = user.email?.split('@')[1];
        
        const q = query(
          usersRef,
          where("emailDomain", "==", userDomain),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const suggestionsData: SuggestedUser[] = [];
        
        querySnapshot.forEach((doc) => {
          // Skip current user and already followed users
          if (doc.id !== user.uid && !followingIds.has(doc.id)) {
            const data = doc.data();
            suggestionsData.push({
              id: doc.id,
              displayName: data.displayName || "Usuário",
              photoURL: data.photoURL || "/default-avatar.png",
              email: data.email,
              university: data.university,
            });
          }
        });

        setSuggestions(suggestionsData.slice(0, 5)); // Show only 5 suggestions
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user]);

  const handleFollow = async (suggestedUser: SuggestedUser) => {
    if (!user) return;

    try {
      const followingRef = doc(db, `users/${user.uid}/following/${suggestedUser.id}`);
      const followersRef = doc(db, `users/${suggestedUser.id}/followers/${user.uid}`);

      const followData = {
        timestamp: new Date(),
        displayName: suggestedUser.displayName,
        photoURL: suggestedUser.photoURL,
        email: suggestedUser.email,
      };

      const followerData = {
        timestamp: new Date(),
        displayName: user.displayName || "Usuário",
        photoURL: user.photoURL || "/default-avatar.png",
        email: user.email,
      };

      await Promise.all([
        setDoc(followingRef, followData),
        setDoc(followersRef, followerData),
      ]);

      // Update local state
      setFollowing(prev => new Set([...prev, suggestedUser.id]));
      setSuggestions(prev => prev.filter(s => s.id !== suggestedUser.id));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Sugestões para você
        </h3>
        <button className="text-sm font-semibold dark:text-gray-200">
          Ver tudo
        </button>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={suggestion.photoURL}
                alt={suggestion.displayName}
                className="w-8 h-8 rounded-full object-cover border dark:border-gray-700"
              />
              <div className="ml-3">
                <p className="text-sm font-semibold dark:text-gray-200">
                  {suggestion.displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {suggestion.university || "Novo no Unio"}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleFollow(suggestion)}
              className="text-blue-500 text-xs font-semibold hover:text-blue-600 transition-colors"
            >
              Seguir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
