// src/config/filters.js

// ---------- Universal sort options ----------
export const UNIVERSAL_SORTS = [
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

// ---------- Shop (new products) ----------
export const SHOP_FILTERS = [
  { type: "gender", label: "Gender", options: ["Men", "Women", "Unisex", "Kids"] },
  { type: "category", label: "Category", options: ["T-Shirts", "Hoodies", "Shirts", "Pants", "Shoes", "Accessories"] },
  { type: "size", label: "Size", options: ["XS", "S", "M", "L", "XL", "XXL"] },
  { type: "color", label: "Color", options: ["Black", "White", "Blue", "Red", "Green", "Beige"] },
  { type: "price", label: "Price", options: ["Under ₹500", "₹500–₹1000", "₹1000–₹2000", "Above ₹2000"] },
  { type: "occasion", label: "Occasion", options: ["Casual", "Office", "Party", "Travel", "Gym", "Date Night"] },
  { type: "fabric", label: "Fabric", options: ["Cotton", "Linen", "Polyester", "Silk", "Wool", "Sustainable"] },
  { type: "fit", label: "Fit", options: ["Slim Fit", "Oversized", "Regular", "Relaxed"] },
  { type: "season", label: "Season", options: ["Summer", "Winter", "Rainy", "All-season"] },
];

// ---------- Thrift (preloved) ----------
export const THRIFT_FILTERS = [
  { type: "gender", label: "Gender", options: ["Men", "Women", "Unisex", "Kids"] },
  { type: "category", label: "Category", options: ["Tops", "Bottoms", "Shoes", "Jackets", "Accessories"] },
  { type: "condition", label: "Condition", options: ["Like New", "Gently Used", "Fair", "Vintage"] },
  { type: "brand", label: "Brand", options: ["Nike", "Adidas", "H&M", "Zara", "Levi's"] },
  { type: "size", label: "Size", options: ["XS", "S", "M", "L", "XL", "XXL"] },
  { type: "color", label: "Color", options: ["Black", "White", "Blue", "Brown", "Grey"] },
  { type: "price", label: "Price", options: ["Under ₹500", "₹500–₹1000", "₹1000–₹2000", "Above ₹2000"] },
  { type: "era", label: "Era", options: ["90s", "2000s", "2010s"] }, // unique
];

// ---------- MonoFit (matching sets) ----------
export const MONOFIT_FILTERS = [
  { type: "gender", label: "Gender", options: ["Men", "Women", "Unisex"] },
  { type: "setType", label: "Set Type", options: ["Casual Set", "Gymwear Set", "Lounge Set", "Formal Set"] },
  { type: "size", label: "Size", options: ["XS", "S", "M", "L", "XL", "XXL"] },
  { type: "color", label: "Color", options: ["Black", "White", "Grey", "Beige", "Blue"] },
  { type: "fabric", label: "Fabric", options: ["Cotton", "Linen", "Polyester", "Stretch"] },
  { type: "occasion", label: "Occasion", options: ["Casual", "Gym", "Office", "Party"] },
];

// ---------- Customization (design-your-own) ----------
export const CUSTOM_FILTERS = [
  { type: "clothingType", label: "Clothing Type", options: ["T-Shirt", "Hoodie", "Shirt", "Jacket"] },
  { type: "gender", label: "Gender", options: ["Men", "Women", "Unisex"] },
  { type: "fabric", label: "Fabric", options: ["Cotton", "Linen", "Polyester", "Blend"] },
  { type: "printingType", label: "Printing", options: ["DTF", "DTG", "Embroidery", "Screen Printing"] },
  { type: "colorBase", label: "Base Color", options: ["White", "Black", "Blue", "Red"] },
  { type: "occasion", label: "Occasion", options: ["Casual", "Office", "Party", "Travel", "Sports"] },
];
