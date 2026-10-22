# 🎬 Cine-Stream

Cine-Stream is a Netflix-style movie discovery application built with Next.js and React. It allows users to discover popular movies, search for movies, view movie details, and save their favorite movies.

## ✨ Features

- 🎬 Browse popular movies using the TMDB API
- 🔎 Search for movies
- 🎥 View detailed movie information
- ❤️ Save and manage favorite movies
- 💾 Persist favorites using browser localStorage
- 🖼️ Display movie posters from TMDB
- 📱 Responsive movie browsing interface
- ⚡ Next.js App Router
- 🚀 Production build and server rendering
- 🔄 API response caching and revalidation

## 🛠️ Tech Stack

- Next.js 15
- React 19
- Redux Toolkit
- React Redux
- Tailwind CSS
- TypeScript
- TMDB REST API
- Undici

## 📁 Project Structure

```text
cine-stream-next/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/
│   └── tmdb.js          # TMDB API utilities
├── public/              # Static assets
├── .env.local           # Local environment variables
├── next.config.mjs      # Next.js configuration
├── package.json
└── README.md