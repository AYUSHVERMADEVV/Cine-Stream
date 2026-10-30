"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        Cine-Stream
      </Link>

      <SearchBar />

      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/favorites">Favorites</Link>
        <Link href="/posts">Community Posts</Link>
      </div>
    </nav>
  );
}