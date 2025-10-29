import React, { useState } from "react";
import api from "../../lib/apiClient";
import { Image as ImageIcon, Send } from "lucide-react";

export default function PostComposer({ thriftItemId=null, onCreated }) {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState([]); // store uploaded URLs (use your uploader)
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await api.post("/posts", { caption, media, thrift_item_id: thriftItemId });
      onCreated?.(data);
      setCaption(""); setMedia([]);
    } finally { setBusy(false); }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <textarea
        value={caption}
        onChange={(e)=>setCaption(e.target.value)}
        placeholder="Share your fit, tips, or a thrift drop…"
        className="w-full resize-none outline-none text-sm min-h-[64px]"
      />
      {/* TODO: hook your uploader - for now just show pills */}
      <div className="flex items-center justify-between pt-2">
        <button className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
          <ImageIcon size={18}/> Add media
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
        >
          <Send size={16}/> Post
        </button>
      </div>
    </div>
  );
}
