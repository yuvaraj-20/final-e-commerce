import React, { useState, useMemo } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import api from "../../lib/apiClient";
import { Link } from "react-router-dom";

export default function PostCard({ post, onChange }) {
  const [local, setLocal] = useState(post);

  const likedByMe = useMemo(()=>{
    // if API returns likes array with user ids, replace this with real check
    return (local.likes || []).some(l => l.user_id === local?.user?.id__me); // replace with auth id if you embed it
  }, [local]);

  async function toggleLike(){
    const prev = local;
    const optimistic = {
      ...local,
      likes_count: (local.likes_count ?? local.likes?.length ?? 0) + (likedByMe ? -1 : 1)
    };
    setLocal(optimistic); onChange?.(optimistic);
    try {
      const { data } = await api.post(`/posts/${local.id}/like`);
      const next = { ...local, likes_count: data.likes_count };
      setLocal(next); onChange?.(next);
    } catch {
      setLocal(prev); onChange?.(prev);
    }
  }

  function share() {
    const url = `${window.location.origin}/post/${local.id}`;
    const text = local.caption || "Check this thrift post!";
    if (navigator.share) navigator.share({ title: "AI Fashion", text, url });
    else window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
  }

  return (
    <article className="bg-white rounded-2xl shadow p-4">
      <header className="flex items-center gap-3">
        <img src={local.user?.avatar_url || "/avatar.png"} className="w-9 h-9 rounded-full" />
        <div className="text-sm">
          <div className="font-medium">{local.user?.name}</div>
          <div className="text-gray-500">{new Date(local.created_at).toLocaleString()}</div>
        </div>
      </header>

      {local.media?.length ? (
        <div className="mt-3">
          <img src={local.media[0]} className="w-full rounded-xl object-cover" />
        </div>
      ) : null}

      {local.caption && <p className="mt-3 text-sm">{local.caption}</p>}

      {local.thrift_item_id && (
        <div className="mt-3">
          <Link to={`/thrift/${local.thrift_item_id}`}
                className="inline-flex text-xs px-3 py-1 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-700">
            View linked thrift item →
          </Link>
        </div>
      )}

      <footer className="mt-4 flex items-center gap-4">
        <button onClick={toggleLike} className="flex items-center gap-2 text-sm hover:opacity-80">
          <Heart size={18} className={likedByMe ? "fill-red-500 text-red-500" : ""}/>
          <span>{local.likes_count ?? local.likes?.length ?? 0}</span>
        </button>
        <a href={`#comment-${local.id}`} className="flex items-center gap-2 text-sm hover:opacity-80">
          <MessageCircle size={18}/> Comment
        </a>
        <button onClick={share} className="flex items-center gap-2 text-sm hover:opacity-80">
          <Share2 size={18}/> Share
        </button>
      </footer>

      {/* Minimal comment box */}
      <CommentBox postId={local.id} onAdded={(c)=>{
        const next = { ...local, comments: [c, ...(local.comments||[])] };
        setLocal(next); onChange?.(next);
      }}/>
      <div className="mt-3 space-y-2">
        {(local.comments||[]).map(c=>(
          <div key={c.id} className="text-sm bg-gray-50 rounded-xl p-2">
            <span className="font-medium">{c.user?.name}</span> {c.text}
          </div>
        ))}
      </div>
    </article>
  );
}

function CommentBox({ postId, onAdded }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(){
    if(!text.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      onAdded?.(data); setText("");
    } finally { setBusy(false); }
  }
  return (
    <div id={`comment-${postId}`} className="mt-3 flex items-center gap-2">
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment…"
        className="flex-1 text-sm px-3 py-2 rounded-xl border outline-none"/>
      <button onClick={submit} disabled={busy}
        className="text-sm px-3 py-2 rounded-xl bg-black text-white disabled:opacity-60">Post</button>
    </div>
  );
}
