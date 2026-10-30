"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("favorites-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("favorites-updated", callback);
  };
}

function getFavoritesSnapshot() {
  try {
    return localStorage.getItem("cine-stream-favorites") || "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot() {
  return "[]";
}

export default function FavoriteList() {
  const favoritesJson = useSyncExternalStore(
    subscribe,
    getFavoritesSnapshot,
    getServerSnapshot
  );

  let favorites = [];
  try {
    favorites = JSON.parse(favoritesJson);
  } catch {
    favorites = [];
  }

  if (favorites.length === 0) {
    return (
      <div className="empty-favorites">
        <p>No favorite movies yet.</p>

        <Link href="/">
          Explore Movies
        </Link>
      </div>
    );
  }

  return (
    <section className="movie-grid">
      {favorites.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
        />
      ))}
    </section>
  );
}