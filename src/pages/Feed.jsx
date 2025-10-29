import React, { useEffect, useState } from "react";
import api from "../lib/apiClient";
import PostComposer from "../components/community/PostComposer";
import PostCard from "../components/community/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/feed");
    setPosts(data.data || data); // laravel paginate or array
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <PostComposer onCreated={(p)=>setPosts(prev=>[p, ...prev])} />
      {loading ? (
        <div className="text-sm text-gray-500">Loading feed…</div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-gray-500">No posts yet. Be the first!</div>
      ) : (
        <div className="space-y-4">
          {posts.map(p => <PostCard key={p.id} post={p} onChange={(np)=>{
            setPosts(prev=>prev.map(x=>x.id===np.id?np:x));
          }} />)}
        </div>
      )}
    </div>
  );
}
