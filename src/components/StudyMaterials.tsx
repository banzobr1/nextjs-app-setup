"use client";

import React from "react";

interface StudyMaterial {
  id: number;
  title: string;
  author: string;
  description: string;
  link: string;
}

const studyMaterials: StudyMaterial[] = [
  {
    id: 1,
    title: "Cálculo Diferencial e Integral",
    author: "James Stewart",
    description: "Livro de referência para cálculo, com exercícios e teoria.",
    link: "#",
  },
  {
    id: 2,
    title: "Introdução à Programação",
    author: "Paul Deitel",
    description: "Material para iniciantes em programação com exemplos práticos.",
    link: "#",
  },
];

export default function StudyMaterials() {
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4 text-blue-700">Materiais de Estudo e Livros</h3>
      {studyMaterials.map((material) => (
        <div key={material.id} className="mb-4 border-b border-gray-200 pb-2">
          <h4 className="font-semibold text-lg">{material.title}</h4>
          <p className="text-sm text-gray-700">Autor: {material.author}</p>
          <p className="text-sm mb-1">{material.description}</p>
          <a href={material.link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Saiba mais
          </a>
        </div>
      ))}
    </div>
  );
}
