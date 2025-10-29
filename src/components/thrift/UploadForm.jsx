// src/components/thrift/UploadForm.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  X,
  Plus,
  Tag,
  DollarSign,
  Package,
  Ruler,
  Palette,
  Truck,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import {api}  from "../../../services/api"; // axios instance (withCredentials:true)
import { useStore } from "../../../store/useStore";

const CATEGORIES = [
  "T-Shirts",
  "Hoodies",
  "Jackets",
  "Pants",
  "Shorts",
  "Dresses",
  "Skirts",
  "Shoes",
  "Accessories",
  "Bags",
  "Coats",
  "Sweaters",
];

const SIZES = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  shoes: ["5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12"],
  accessories: ["One Size"],
};

const CONDITIONS = [
  { value: "new", label: "New with tags", desc: "Brand new, never worn" },
  { value: "like-new", label: "Like new", desc: "Excellent condition, barely worn" },
  { value: "good", label: "Good", desc: "Good condition with minor signs of wear" },
  { value: "fair", label: "Fair", desc: "Noticeable wear but still functional" },
];

const MAX_IMAGES = 5;
const MAX_IMAGE_MB = 5;

export default function UploadForm({ onSuccess, onCancel }) {
  const { user } = useStore(); // expects { id, name, email, phone, ... }
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    size: "",
    condition: "",
    gender: "",
    color: "",
    tags: [],
    images: [], // File[]
    shippingMethod: "shipping",
    shippingCost: "",
    location: "",
    contactPhone: user?.phone || "",
  });

  const [newTag, setNewTag] = useState("");
  const [previews, setPreviews] = useState([]); // dataURL previews
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // helpers
  const getSizesForCategory = useCallback(() => {
    if (form.category === "Shoes") return SIZES.shoes;
    if (["Accessories", "Bags"].includes(form.category)) return SIZES.accessories;
    return SIZES.clothing;
  }, [form.category]);

  useEffect(() => {
    setForm((p) => ({ ...p, contactPhone: user?.phone || p.contactPhone }));
  }, [user?.phone]);

  // file handling
  const addFiles = (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;

    if (form.images.length + arr.length > MAX_IMAGES) {
      toast.error(`Max ${MAX_IMAGES} images allowed`);
      return;
    }

    const tooLarge = arr.find((f) => f.size / 1024 / 1024 > MAX_IMAGE_MB);
    if (tooLarge) {
      toast.error(`Each image must be ≤ ${MAX_IMAGE_MB} MB`);
      return;
    }

    // append files
    setForm((p) => ({ ...p, images: [...p.images, ...arr] }));

    // create previews
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result].slice(0, MAX_IMAGES));
      reader.readAsDataURL(file);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  };

  const onFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = null;
  };

  const removeImage = (i) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const moveImage = (from, to) => {
    setForm((p) => {
      const arr = [...p.images];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...p, images: arr };
    });
    setPreviews((p) => {
      const arr = [...p];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  // tags
  const addTag = () => {
    const t = (newTag || "").trim().toLowerCase();
    if (!t) return setNewTag("");
    if (form.tags.includes(t)) { setNewTag(""); return; }
    setForm((p) => ({ ...p, tags: [...p.tags, t] }));
    setNewTag("");
  };
  const removeTag = (tag) => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  // validation
  const validate = () => {
    if (!form.name.trim()) return "Enter item name";
    if (!form.description.trim()) return "Enter description";
    const price = Number(form.price);
    if (Number.isNaN(price) || price <= 0) return "Enter valid price";
    if (!form.category) return "Choose category";
    if (!form.condition) return "Choose condition";
    if (form.images.length === 0) return "Add at least one image";
    if (!user?.id) return "Please login to submit";
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    setProgress(0);

    try {
      // Build FormData
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", String(Number(form.price)));
      fd.append("category", form.category || "");
      fd.append("size", form.size || "");
      fd.append("condition", form.condition || "");
      fd.append("gender", form.gender || "");
      fd.append("color", form.color || "");
      fd.append("shipping_method", form.shippingMethod || "");
      fd.append("shipping_cost", String(form.shippingCost || ""));
      fd.append("location", form.location || "");
      fd.append("contact_phone", form.contactPhone || "");

      form.tags.forEach((t, i) => fd.append(`tags[${i}]`, t));
      form.images.forEach((file) => fd.append("images[]", file));

      const res = await http.post("/thrift/items", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        onUploadProgress: (ev) => {
          if (!ev.total) return;
          const pct = Math.round((ev.loaded / ev.total) * 100);
          setProgress(pct);
        },
      });

      const created = res.data;
      toast.success("Item submitted — awaiting review");
      setProgress(100);

      // Attempt auto post (non-blocking)
      try {
        const firstUrl = Array.isArray(created.images) && created.images.length
          ? (typeof created.images[0] === "string" ? created.images[0] : created.images[0]?.url)
          : null;
        await http.post("/posts", {
          caption: `Selling: ${form.name} — $${Number(form.price).toFixed(2)}`,
          thrift_item_id: created.id ?? created._id,
          media: firstUrl ? [firstUrl] : [],
        });
      } catch (err) {
        // ignore auto-post errors
        console.warn("auto-post failed", err?.response?.data ?? err);
      }

      setIsSubmitting(false);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        size: "",
        condition: "",
        gender: "",
        color: "",
        tags: [],
        images: [],
        shippingMethod: "shipping",
        shippingCost: "",
        location: "",
        contactPhone: user?.phone || "",
      });
      setPreviews([]);
      setProgress(0);

      if (typeof onSuccess === "function") onSuccess(created);
    } catch (err) {
      console.error(err?.response ?? err);
      toast.error("Upload failed — try again");
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  // UI - dark theme
  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left: form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-850 bg-opacity-25 rounded-2xl p-6 shadow-lg border border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Sell your item</h2>
                  <p className="text-sm text-gray-300 mt-1">
                    List a pre-loved item — buyers search by condition, size and tags.
                  </p>
                </div>
                <div className="text-right text-sm text-gray-300">
                  <div className="text-xs text-gray-500">Signed in as</div>
                  <div className="font-medium">{user?.name ?? "Guest"}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* name */}
                <div>
                  <label className="text-sm text-gray-300">Item name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Vintage leather jacket"
                    className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* description */}
                <div>
                  <label className="text-sm text-gray-300">Description *</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Fit, flaws, measurements, age..."
                    className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  />
                </div>

                {/* Price / category / size */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-300 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" /> Price (USD) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                      className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" /> Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value, size: "" }))}
                      className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-gray-400" /> Size
                    </label>
                    <select
                      value={form.size}
                      onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                      className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select size</option>
                      {getSizesForCategory().map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Condition / gender / color */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-300">Condition *</label>
                    <select
                      value={form.condition}
                      onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                      className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select condition</option>
                      {CONDITIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                      className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select</option>
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">Color</label>
                    <select
                      value={form.color}
                      onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                      className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select color</option>
                      <option>Black</option>
                      <option>White</option>
                      <option>Gray</option>
                      <option>Navy</option>
                      <option>Blue</option>
                      <option>Red</option>
                      <option>Beige</option>
                      <option>Multicolor</option>
                    </select>
                  </div>
                </div>

                {/* tags */}
                <div>
                  <label className="text-sm text-gray-300">Tags</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add a tag and press Enter"
                      className="flex-1 rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button type="button" onClick={addTag} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700">
                      <Plus className="h-4 w-4 text-gray-200" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-2 bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-sm">
                        #{t}
                        <button type="button" onClick={() => removeTag(t)} className="text-xs text-gray-400 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* images */}
                <div>
                  <label className="text-sm text-gray-300">Photos (max {MAX_IMAGES}) *</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
                    onDrop={onDrop}
                    className="mt-2 rounded-xl border-2 border-dashed border-gray-700 p-4 bg-gray-900"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 flex flex-col items-center justify-center py-6 rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-800">
                        <UploadCloud className="h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-400 mt-3">Drag & drop or click to upload</div>
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Browse
                          </button>
                          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
                        </div>
                        <div className="text-xs text-gray-500 mt-2">JPG, PNG · up to {MAX_IMAGE_MB}MB each</div>
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-3 auto-rows-fr">
                        {previews.length === 0 ? (
                          <div className="col-span-3 flex items-center justify-center text-gray-500">No images selected</div>
                        ) : (
                          previews.map((src, i) => (
                            <motion.div
                              key={i}
                              layout
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900"
                            >
                              <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                              <div className="absolute top-2 right-2 flex gap-1">
                                <button type="button" onClick={() => removeImage(i)} className="bg-black/70 p-1 rounded-full">
                                  <X className="h-4 w-4 text-white" />
                                </button>
                                {i > 0 && (
                                  <button type="button" onClick={() => moveImage(i, i - 1)} className="bg-black/70 p-1 rounded-full">
                                    ◀
                                  </button>
                                )}
                                {i < previews.length - 1 && (
                                  <button type="button" onClick={() => moveImage(i, i + 1)} className="bg-black/70 p-1 rounded-full">
                                    ▶
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* shipping & location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-300 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-400" /> Fulfillment
                    </label>
                    <div className="mt-2 flex gap-2">
                      <label className={`px-3 py-2 rounded-lg cursor-pointer ${form.shippingMethod === "shipping" ? "bg-gray-800 border border-gray-600" : "bg-gray-900 border border-gray-700"}`}>
                        <input type="radio" name="shipping" value="shipping" checked={form.shippingMethod === "shipping"} onChange={() => setForm((p) => ({ ...p, shippingMethod: "shipping" }))} className="hidden" /> Ship
                      </label>
                      <label className={`px-3 py-2 rounded-lg cursor-pointer ${form.shippingMethod === "pickup" ? "bg-gray-800 border border-gray-600" : "bg-gray-900 border border-gray-700"}`}>
                        <input type="radio" name="shipping" value="pickup" checked={form.shippingMethod === "pickup"} onChange={() => setForm((p) => ({ ...p, shippingMethod: "pickup" }))} className="hidden" /> Pickup
                      </label>
                    </div>

                    <div className="mt-3">
                      <label className="text-sm text-gray-400">Shipping cost (optional)</label>
                      <input type="number" min="0" step="0.01" value={form.shippingCost} onChange={(e) => setForm((p) => ({ ...p, shippingCost: e.target.value }))} className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g., 5.00" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> Location (optional)</label>
                    <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="City or meet-up spot" className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" />
                    <div className="mt-3">
                      <label className="text-sm text-gray-400">Contact phone</label>
                      <input value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))} className="mt-2 w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Optional" />
                    </div>
                  </div>
                </div>

                {/* actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    {isSubmitting ? (
                      <div className="w-56">
                        <div className="h-2 bg-gray-700 rounded overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-600 to-blue-400" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{progress}%</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">Ready to list</div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => { setForm({ name: "", description: "", price: "", category: "", size: "", condition: "", gender: "", color: "", tags: [], images: [], shippingMethod: "shipping", shippingCost: "", location: "", contactPhone: user?.phone || "" }); setPreviews([]); toast("Cleared"); }} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700">Reset</button>

                    <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} onClick={handleSubmit} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold disabled:opacity-60">
                      {isSubmitting ? "Uploading…" : "Submit item"}
                    </motion.button>

                    {onCancel && (
                      <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-900">Cancel</button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right: preview & tips */}
          <aside className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="sticky top-20 space-y-4">
              <div className="bg-gray-850 bg-opacity-20 rounded-2xl p-4 border border-gray-700">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                  {previews[0] ? <img src={previews[0]} alt="preview" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-gray-500"><UploadCloud className="h-10 w-10" /><div className="text-xs mt-2">Preview</div></div>}
                </div>

                <div className="mt-3">
                  <h3 className="text-lg font-semibold">{form.name || "Untitled item"}</h3>
                  <div className="text-sm text-gray-400">{form.category || "Category"}</div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">Price</div>
                      <div className="text-lg font-bold">${form.price ? Number(form.price).toFixed(2) : "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Condition</div>
                      <div className="text-sm text-gray-200">{form.condition || "—"}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <img src={user?.avatar_url || `https://i.pravatar.cc/40?u=${user?.email || "anon"}`} alt="seller" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-sm font-medium">{user?.name || "Seller"}</div>
                      <div className="text-xs text-gray-400">{form.location || user?.city || "Location"}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-gray-400">Tags</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.tags.length ? form.tags.map((t) => <span key={t} className="text-xs bg-gray-800 px-2 py-1 rounded-full">#{t}</span>) : <div className="text-xs text-gray-500">No tags yet</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-850 bg-opacity-20 rounded-2xl p-4 border border-gray-700">
                <h4 className="text-sm font-semibold text-white">Listing tips</h4>
                <ul className="mt-2 text-sm text-gray-400 space-y-2">
                  <li>Use clear, well-lit photos.</li>
                  <li>Be honest about wear and include measurements.</li>
                  <li>Add tags so buyers can find your item.</li>
                </ul>
              </div>
            </motion.div>
          </aside>
        </motion.div>
      </div>
    </div>
  );
}
