"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-init";
import { Tab } from "@headlessui/react";
import { CogIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/AuthContext";

interface Post {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
}

interface UserProfile {
  username: string;
  fullName: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  posts: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    username: "username",
    fullName: "Nome Completo",
    bio: "Estudante universitário",
    avatar: "/default-avatar.png",
    followers: 0,
    following: 0,
    posts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const postsRef = collection(db, "posts");
        const q = query(postsRef, where("authorId", "==", user?.uid));
        const querySnapshot = await getDocs(q);
        
        const postsData: Post[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          postsData.push({
            id: doc.id,
            imageUrl: data.imageUrl,
            likes: data.likes || 0,
            comments: data.comments?.length || 0,
          });
        });
        
        setPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const tabItems = ["Publicações", "Salvos", "Marcados"];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-start space-x-8 mb-8 p-4">
        <img
          src={profile.avatar}
          alt={profile.username}
          className="w-32 h-32 rounded-full border-2 border-gray-200 dark:border-gray-700"
        />
        <div className="flex-grow">
          <div className="flex items-center space-x-4 mb-4">
            <h1 className="text-2xl font-semibold dark:text-gray-200">{profile.username}</h1>
            <button className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md font-medium text-sm">
              Editar perfil
            </button>
            <button className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
              <CogIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex space-x-8 mb-4">
            <div>
              <span className="font-semibold dark:text-gray-200">{posts.length}</span>{" "}
              <span className="text-gray-500 dark:text-gray-400">publicações</span>
            </div>
            <div>
              <span className="font-semibold dark:text-gray-200">{profile.followers}</span>{" "}
              <span className="text-gray-500 dark:text-gray-400">seguidores</span>
            </div>
            <div>
              <span className="font-semibold dark:text-gray-200">{profile.following}</span>{" "}
              <span className="text-gray-500 dark:text-gray-400">seguindo</span>
            </div>
          </div>

          <div>
            <h2 className="font-semibold dark:text-gray-200">{profile.fullName}</h2>
            <p className="text-gray-500 dark:text-gray-400">{profile.bio}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tab.Group onChange={setActiveTab}>
        <Tab.List className="flex justify-center border-t border-gray-300 dark:border-gray-700">
          {tabItems.map((item, index) => (
            <Tab
              key={index}
              className={({ selected }: { selected: boolean }) =>
                `flex-1 py-3 text-sm font-medium border-t-2 focus:outline-none ${
                  selected
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`
              }
            >
              {item}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square relative group cursor-pointer"
                  >
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white">
                      <div className="flex items-center">
                        <span className="font-semibold mr-1">{post.likes}</span>
                        ❤️
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-1">{post.comments}</span>
                        💬
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Nenhuma publicação ainda</p>
              </div>
            )}
          </Tab.Panel>
          <Tab.Panel>
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Nenhum post salvo</p>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Nenhuma marcação</p>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
