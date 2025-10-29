// src/utils/filtering.js

// Convert UI label → numeric [min, max]
export const parsePriceRange = (label) => {
  if (label === "Under ₹500") return [0, 500];
  if (label === "₹500–₹1000") return [500, 1000];
  if (label === "₹1000–₹2000") return [1000, 2000];
  if (label === "Above ₹2000") return [2000, Infinity];
  return [0, 10000];
};

// Merge incoming panel selections into your existing useStore filters
export const mergeIncomingFilters = (currentFilters, incoming) => {
  const next = { ...currentFilters };

  // single-value fields
  if (incoming.category !== undefined) next.category = incoming.category === "All" ? "" : incoming.category;
  if (incoming.gender !== undefined) next.gender = incoming.gender;
  if (incoming.occasion !== undefined) next.occasion = incoming.occasion;
  if (incoming.fabric !== undefined) next.fabric = incoming.fabric;
  if (incoming.fit !== undefined) next.fit = incoming.fit;
  if (incoming.season !== undefined) next.season = incoming.season;
  if (incoming.brand !== undefined) next.brand = incoming.brand;
  if (incoming.condition !== undefined) next.condition = incoming.condition;
  if (incoming.era !== undefined) next.era = incoming.era;
  if (incoming.setType !== undefined) next.setType = incoming.setType;
  if (incoming.clothingType !== undefined) next.clothingType = incoming.clothingType;
  if (incoming.printingType !== undefined) next.printingType = incoming.printingType;
  if (incoming.colorBase !== undefined) next.colorBase = incoming.colorBase;

  // size / color are arrays in your store — keep as single select for now
  if (incoming.size !== undefined) next.sizes = incoming.size ? [incoming.size] : [];
  if (incoming.color !== undefined) next.colors = incoming.color ? [incoming.color] : [];

  // price -> priceRange array
  if (incoming.price !== undefined) next.priceRange = parsePriceRange(incoming.price);

  return next;
};

// Safe matcher: only enforces a field if it's present on product and selected in filters
export const productMatchesFilters = (product, filters) => {
  const matchesText = (v) => (typeof v === "string" ? v.toLowerCase() : v);

  // category
  const categoryOk =
    !filters.category || filters.category === "All" || product.category === filters.category;

  // price
  const priceOk =
    !filters.priceRange ||
    (product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]);

  // sizes (array on product)
  const sizeOk =
    !filters.sizes || filters.sizes.length === 0 ||
    (Array.isArray(product.sizes) && filters.sizes.some((s) => product.sizes.includes(s)));

  // colors (array on product)
  const colorOk =
    !filters.colors || filters.colors.length === 0 ||
    (Array.isArray(product.colors) && filters.colors.some((c) => product.colors.includes(c)));

  // rating
  const ratingOk = !filters.rating || product.rating >= filters.rating;

  // gender
  const genderOk = !filters.gender || product.gender === filters.gender || product.gender === "Unisex";

  // occasion
  const occasionOk =
    !filters.occasion || (Array.isArray(product.occasions) && product.occasions.includes(filters.occasion));

  // fabric
  const fabricOk = !filters.fabric || product.fabric === filters.fabric;

  // fit
  const fitOk = !filters.fit || product.fit === filters.fit;

  // season
  const seasonOk =
    !filters.season || (Array.isArray(product.seasons) && product.seasons.includes(filters.season));

  // brand (thrift)
  const brandOk = !filters.brand || product.brand === filters.brand;

  // condition (thrift)
  const conditionOk = !filters.condition || product.condition === filters.condition;

  // era (thrift)
  const eraOk = !filters.era || product.era === filters.era;

  // setType (monofit)
  const setTypeOk = !filters.setType || product.setType === filters.setType;

  // customization
  const clothingTypeOk = !filters.clothingType || product.clothingType === filters.clothingType;
  const printingTypeOk = !filters.printingType || product.printingType === filters.printingType;
  const colorBaseOk =
    !filters.colorBase || product.colorBase === filters.colorBase || (Array.isArray(product.colors) && product.colors.includes(filters.colorBase));

  return (
    categoryOk &&
    priceOk &&
    sizeOk &&
    colorOk &&
    ratingOk &&
    genderOk &&
    occasionOk &&
    fabricOk &&
    fitOk &&
    seasonOk &&
    brandOk &&
    conditionOk &&
    eraOk &&
    setTypeOk &&
    clothingTypeOk &&
    printingTypeOk &&
    colorBaseOk
  );
};
