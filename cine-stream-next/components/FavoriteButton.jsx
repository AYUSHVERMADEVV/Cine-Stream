"use client";

import { useSyncExternalStore } from "react";

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

export default function FavoriteButton({ movie }) {
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

  const isFavorite = Boolean(
    movie && favorites.some((item) => item.id === movie.id)
  );

  function handleFavorite() {
    if (!movie) return;

    try {
      let updatedFavorites = [];
      if (isFavorite) {
        updatedFavorites = favorites.filter((item) => item.id !== movie.id);
      } else {
        updatedFavorites = [
          ...favorites,
          {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
          },
        ];
      }

      localStorage.setItem(
        "cine-stream-favorites",
        JSON.stringify(updatedFavorites)
      );

      // Notify external store subscribers on the same window
      window.dispatchEvent(new Event("favorites-updated"));
    } catch {
      // Storage fallback
    }
  }

  return (
    <button
      type="button"
      onClick={handleFavorite}
      className="favorite-button"
      suppressHydrationWarning
    >
      {isFavorite ? "Favorited" : "Add to Favorites"}
    </button>
  );
}