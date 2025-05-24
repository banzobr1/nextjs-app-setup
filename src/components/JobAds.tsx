"use client";

import React from "react";

interface JobAd {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  link: string;
}

const jobAds: JobAd[] = [
  {
    id: 1,
    title: "Estágio em Desenvolvimento Web",
    company: "Tech Solutions",
    location: "São Paulo, SP",
    description: "Estágio para desenvolvimento front-end com React e Next.js.",
    link: "#",
  },
  {
    id: 2,
    title: "Assistente de Pesquisa",
    company: "Universidade Federal",
    location: "Rio de Janeiro, RJ",
    description: "Auxílio em projetos de pesquisa acadêmica na área de biologia.",
    link: "#",
  },
];

export default function JobAds() {
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4 text-blue-700">Anúncios de Estágio e Emprego</h3>
      {jobAds.map((job) => (
        <div key={job.id} className="mb-4 border-b border-gray-200 pb-2">
          <h4 className="font-semibold text-lg">{job.title}</h4>
          <p className="text-sm text-gray-700">{job.company} - {job.location}</p>
          <p className="text-sm mb-1">{job.description}</p>
          <a href={job.link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Saiba mais
          </a>
        </div>
      ))}
    </div>
  );
}
