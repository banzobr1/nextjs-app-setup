"use client";

import React from "react";

interface NetworkUser {
  id: number;
  name: string;
  interests: string[];
  profileLink: string;
}

const networkUsers: NetworkUser[] = [
  {
    id: 1,
    name: "Lucas Almeida",
    interests: ["Programação", "Inteligência Artificial", "Jogos"],
    profileLink: "#",
  },
  {
    id: 2,
    name: "Fernanda Costa",
    interests: ["Biologia", "Pesquisa Científica", "Voluntariado"],
    profileLink: "#",
  },
];

export default function Networking() {
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4 text-blue-700">Networking</h3>
      {networkUsers.map((user) => (
        <div key={user.id} className="mb-4 border-b border-gray-200 pb-2">
          <h4 className="font-semibold text-lg">{user.name}</h4>
          <p className="text-sm text-gray-700">Interesses: {user.interests.join(", ")}</p>
          <a href={user.profileLink} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Ver Perfil
          </a>
        </div>
      ))}
    </div>
  );
}
