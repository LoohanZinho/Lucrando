import { PostsManager } from "@/components/posts/posts-manager";

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
        <p className="text-muted-foreground">
          Gerencie todas as suas publicações em um só lugar.
        </p>
      </div>
      <PostsManager />
    </div>
  );
}
