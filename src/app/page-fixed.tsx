"use client";

import React from "react";
import { useAuth } from "@/lib/AuthContext";
import StoriesNew from "@/components/StoriesNew";
import SocialFeedNew from "@/components/SocialFeedNew";
import Suggestions from "@/components/Suggestions";

export default function Page() {
  const { user } = useAuth();

  if (!user) return null; // Layout will handle redirect to login

  return (
    <div className="flex max-w-6xl mx-auto gap-8 px-4">
      {/* Main content: Stories and Feed */}
      <div className="flex-1 max-w-[470px] w-full mx-auto">
        <StoriesNew />
        <SocialFeedNew />
      </div>

      {/* Right sidebar */}
      <div className="hidden lg:block w-[320px] mt-6 space-y-6">
        {/* Profile section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <img
                src={user.photoURL || "/default-avatar.png"}
                alt={user.displayName || "Profile"}
                className="w-14 h-14 rounded-full border p-[2px] dark:border-gray-600"
              />
              <div className="ml-4">
                <h2 className="font-semibold text-sm dark:text-gray-200">
                  {user.displayName || "Usuário"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email?.split('@')[0] || ""}
                </p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/profile'} 
              className="text-blue-500 text-sm font-semibold hover:text-blue-600 transition-colors"
            >
              Editar
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <Suggestions />

        {/* Footer */}
        <footer className="text-xs text-gray-500 dark:text-gray-400 space-y-4">
          <nav className="flex flex-wrap gap-x-2 gap-y-1">
            <a href="#" className="hover:underline">Sobre</a>
            <span>•</span>
            <a href="#" className="hover:underline">Ajuda</a>
            <span>•</span>
            <a href="#" className="hover:underline">Privacidade</a>
            <span>•</span>
            <a href="#" className="hover:underline">Termos</a>
            <span>•</span>
            <a href="#" className="hover:underline">Diretrizes da Comunidade</a>
          </nav>
          <div>
            <p>© 2024 Unio - Conectando estudantes universitários</p>
            <p className="mt-1">Todos os direitos reservados</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
