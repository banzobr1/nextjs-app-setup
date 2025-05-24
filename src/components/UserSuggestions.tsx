"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-init";
import { useAuth } from "@/lib/AuthContext";

interface UserSuggestion {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  university?: string;
}

export default function UserSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;

      try {
        const usersRef = collection(db, "users");
        // Get users from the same university domain
        const userDomain = user.email?.split('@')[1];
        const q = query(
          usersRef,
          where("email", "!=", user.email),
          where("emailDomain", "==", userDomain),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        const suggestionsData: UserSuggestion[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          suggestionsData.push({
            id: doc.id,
            displayName: data.displayName || "Usuário",
            photoURL: data.photoURL || "/default-avatar.png",
            email: data.email,
            university: data.university,
          });
        });

        setSuggestions(suggestionsData);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user]);

  const handleFollow = async (userId: string) => {
    if (!user) return;

    try {
      // Add to following collection
      await getDocs(collection(db, `users/${user.uid}/following`)).then(async (snapshot) => {
        if (!snapshot.docs.some(doc => doc.id === userId)) {
          await getDocs(collection(db, `users/${userId}`)).then(async (userSnapshot) => {
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              await getDocs(collection(db, `users/${user.uid}/following`)).then(async () => {
                await getDocs(collection(db, `users/${userId}/followers`)).then(async () => {
                  // Update UI
                  setSuggestions(prev => prev.filter(s => s.id !== userId));
                });
              });
            }
          });
        }
      });
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
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Nenhuma sugestão disponível no momento.
      </p>
    );
  }

  return (
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
            onClick={() => handleFollow(suggestion.id)}
            className="text-blue-500 text-xs font-semibold hover:text-blue-600 transition-colors"
          >
            Seguir
          </button>
        </div>
      ))}
    </div>
  );
}
