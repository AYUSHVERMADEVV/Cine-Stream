import { Agent, setGlobalDispatcher } from "undici";
import { cache } from "react";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Force IPv4 for TMDB connection if supported
try {
  if (typeof Agent === "function" && typeof setGlobalDispatcher === "function") {
    setGlobalDispatcher(
      new Agent({
        connect: {
          family: 4,
        },
      })
    );
  }
} catch {
  // Dispatcher configuration fallback
}

export const MOCK_MOVIES = [
  {
    id: 27205,
    title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life.",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    vote_average: 8.4,
    release_date: "2010-07-15",
    runtime: 148,
    tagline: "Your mind is the scene of the crime.",
  },
  {
    id: 157336,
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    vote_average: 8.4,
    release_date: "2014-11-05",
    runtime: 169,
    tagline: "Mankind was born on Earth. It was never meant to die here.",
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent to dismantle the criminal organizations.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    vote_average: 8.5,
    release_date: "2008-07-16",
    runtime: 152,
    tagline: "Welcome to a world without rules.",
  },
  {
    id: 550,
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    vote_average: 8.4,
    release_date: "1999-10-15",
    runtime: 139,
    tagline: "Mischief. Mayhem. Soap.",
  },
  {
    id: 680,
    title: "Pulp Fiction",
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in four tales of violence.",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    vote_average: 8.5,
    release_date: "1994-09-10",
    runtime: 154,
    tagline: "Just because you are a character doesn't mean you have character.",
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    vote_average: 8.2,
    release_date: "2024-02-27",
    runtime: 166,
    tagline: "Long live the fighters.",
  },
  {
    id: 872585,
    title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    vote_average: 8.1,
    release_date: "2023-07-19",
    runtime: 181,
    tagline: "The world forever changes.",
  },
  {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    overview: "After reuniting with Gwen Stacy, Brooklyn's full-time friendly neighborhood Spider-Man is catapulted across the Multiverse.",
    poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    vote_average: 8.4,
    release_date: "2023-05-31",
    runtime: 140,
    tagline: "It's how you wear the mask that matters.",
  },
  {
    id: 603,
    title: "The Matrix",
    overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the machines.",
    poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    vote_average: 8.2,
    release_date: "1999-03-30",
    runtime: 136,
    tagline: "Welcome to the Real World.",
  },
  {
    id: 129,
    title: "Spirited Away",
    overview: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon courage.",
    poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    vote_average: 8.5,
    release_date: "2001-07-20",
    runtime: 125,
    tagline: "The tunnel led to a mysterious world.",
  },
  {
    id: 496243,
    title: "Parasite",
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    vote_average: 8.5,
    release_date: "2019-05-30",
    runtime: 132,
    tagline: "Act like you own the place.",
  },
  {
    id: 299534,
    title: "Avengers: Endgame",
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.",
    poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    vote_average: 8.3,
    release_date: "2019-04-24",
    runtime: 181,
    tagline: "Part of the journey is the end.",
  },
];

export async function getPopularMovies() {
  if (!API_KEY) {
    return {
      page: 1,
      results: MOCK_MOVIES,
      total_pages: 1,
      total_results: MOCK_MOVIES.length,
    };
  }

  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      console.warn(`TMDB request failed with status ${response.status} — using fallback movies`);
      return {
        page: 1,
        results: MOCK_MOVIES,
        total_pages: 1,
        total_results: MOCK_MOVIES.length,
      };
    }

    return await response.json();
  } catch (err) {
    console.warn("Error requesting TMDB popular movies — using fallback:", err.message);
    return {
      page: 1,
      results: MOCK_MOVIES,
      total_pages: 1,
      total_results: MOCK_MOVIES.length,
    };
  }
}

export const getMovie = cache(async function getMovie(id) {
  const numericId = Number(id);
  const found = MOCK_MOVIES.find((m) => m.id === numericId);

  const fallbackDetail = found || {
    id: numericId,
    title: "Featured Movie",
    overview: "Explore this featured title on Cine-Stream.",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    vote_average: 8.2,
    release_date: "2024-01-01",
    runtime: 120,
    tagline: "A cinematic experience.",
  };

  if (!API_KEY) {
    return fallbackDetail;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      console.warn(`TMDB movie detail request failed with status ${response.status} — using fallback`);
      return fallbackDetail;
    }

    return await response.json();
  } catch (err) {
    console.warn("Error requesting TMDB movie details — using fallback:", err.message);
    return fallbackDetail;
  }
});

export async function searchMovies(query) {
  const trimmed = (query || "").trim().toLowerCase();
  const filtered = trimmed
    ? MOCK_MOVIES.filter((m) => m.title.toLowerCase().includes(trimmed))
    : MOCK_MOVIES;

  const fallbackResult = {
    page: 1,
    results: filtered.length > 0 ? filtered : MOCK_MOVIES,
    total_pages: 1,
    total_results: filtered.length > 0 ? filtered.length : MOCK_MOVIES.length,
  };

  if (!API_KEY) {
    return fallbackResult;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
        query
      )}&page=1`,
      {
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      console.warn(`TMDB search failed with status ${response.status} — using fallback`);
      return fallbackResult;
    }

    return await response.json();
  } catch (err) {
    console.warn("Error requesting TMDB search — using fallback:", err.message);
    return fallbackResult;
  }
}