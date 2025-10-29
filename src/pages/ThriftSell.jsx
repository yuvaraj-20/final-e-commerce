// src/pages/ThriftSell.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

const ThriftSell = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    price: "",
    tags: "",
  });

  const [images, setImages] = useState([]); // multiple images
  const [preview, setPreview] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle multiple image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreview(files.map((file) => URL.createObjectURL(file)));
  };

  // Remove a selected image
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreview = preview.filter((_, i) => i !== index);
    setImages(newImages);
    setPreview(newPreview);
  };

  // ✨ Auto-generate tags (AI)
  const generateTags = async () => {
    if (!form.title && !form.description) {
      toast.error("Please fill in the title or description first!");
      return;
    }

    try {
      toast.loading("Generating AI tags...");
      const res = await fetch("http://127.0.0.1:8001/ai/generate-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
        }),
      });
      const data = await res.json();
      setForm((prev) => ({ ...prev, tags: data.tags.join(", ") }));
      toast.dismiss();
      toast.success("Tags generated!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to generate tags.");
      console.error(err);
    }
  };

  // 🚀 Upload to Laravel backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.price || images.length === 0) {
      toast.error("Please fill all required fields and upload at least one image!");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    images.forEach((img) => formData.append("images[]", img));

    setLoading(true);
    setProgress(0);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/api/thrift/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      toast.success("Item uploaded successfully!");
      console.log("Uploaded:", data);

      // reset
      setForm({
        title: "",
        description: "",
        category: "",
        condition: "",
        price: "",
        tags: "",
      });
      setImages([]);
      setPreview([]);
      setProgress(0);
    } catch (err) {
      toast.error("Upload failed. Try again!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-6 max-w-2xl mx-auto bg-gray-900 text-white rounded-2xl shadow-xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-semibold mb-6">Sell a Thrift Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Item Title *"
          className="w-full p-3 rounded-xl bg-gray-800 outline-none"
          value={form.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full p-3 rounded-xl bg-gray-800 outline-none"
          value={form.description}
          onChange={handleChange}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            name="category"
            placeholder="Category"
            className="p-3 rounded-xl bg-gray-800 outline-none"
            value={form.category}
            onChange={handleChange}
          />
          <input
            name="condition"
            placeholder="Condition"
            className="p-3 rounded-xl bg-gray-800 outline-none"
            value={form.condition}
            onChange={handleChange}
          />
        </div>
        <input
          name="price"
          placeholder="Price *"
          type="number"
          className="w-full p-3 rounded-xl bg-gray-800 outline-none"
          value={form.price}
          onChange={handleChange}
        />

        <div className="flex items-center gap-2">
          <input
            name="tags"
            placeholder="Tags (comma separated)"
            className="flex-1 p-3 rounded-xl bg-gray-800 outline-none"
            value={form.tags}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={generateTags}
            className="px-3 py-2 bg-blue-600 rounded-xl hover:bg-blue-700"
          >
            AI Tags
          </button>
        </div>

        <div className="p-4 border-2 border-dashed border-gray-600 rounded-xl text-center cursor-pointer bg-gray-800">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            id="fileUpload"
          />
          <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="w-6 h-6" />
            <span>Upload Images</span>
          </label>
        </div>

        {preview.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {preview.map((src, index) => (
              <div key={index} className="relative">
                <img
                  src={src}
                  alt="preview"
                  className="rounded-xl w-full h-28 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-60 p-1 rounded-full"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {progress > 0 && (
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 mt-3 bg-green-600 hover:bg-green-700 rounded-xl flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upload Item"}
        </button>
      </form>
    </motion.div>
  );
};

export default ThriftSell;
