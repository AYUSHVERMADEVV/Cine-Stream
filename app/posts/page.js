import PostsDashboard from "../../components/PostsDashboard";

export const metadata = {
  title: "Posts Dashboard | Cine-Stream",
  description: "Manage posts using the Cine-Stream Full Stack API.",
};

export default function PostsPage() {
  return (
    <main className="posts-page">
      <PostsDashboard />
    </main>
  );
}