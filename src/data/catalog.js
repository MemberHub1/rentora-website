export const categories = [
  { id: "interior", name: "Interior Paint", shortName: "Interior", description: "Thoughtful color and a velvety finish for the rooms you live in.", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85" },
  { id: "exterior", name: "Exterior Paint", shortName: "Exterior", description: "Confident curb appeal with protection built for the elements.", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85" },
  { id: "ceiling", name: "Ceiling Paint", shortName: "Ceiling", description: "A beautifully even, low-sheen finish from wall to ceiling.", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85" },
  { id: "wood", name: "Wood Paint", shortName: "Wood", description: "Bring the natural character of wood to the surface.", image: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=900&q=85" },
  { id: "metal", name: "Metal Paint", shortName: "Metal", description: "A smooth, durable finish that helps keep metal looking its best.", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85" },
  { id: "primer", name: "Primer", shortName: "Primer", description: "The considered first step towards an exceptional finish.", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85" },
  { id: "waterproofing", name: "Waterproofing", shortName: "Waterproofing", description: "A dependable barrier against damp, rain and everyday wear.", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85" },
];

export const products = [
  { id: "soft-touch-matt", name: "Soft Touch Matt", category: "interior", description: "A beautifully smooth, low-sheen emulsion with rich, even color.", image: categories[0].image, sizes: ["1 L", "4 L", "10 L"], finish: "Matt", features: ["Rich, even coverage", "Low-odour formula", "Easy to maintain"], usage: "Living rooms, bedrooms and hallways" },
  { id: "silk-sheen", name: "Silk Sheen", category: "interior", description: "A subtle silk finish that brings a gentle luminosity to your walls.", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85", sizes: ["1 L", "4 L", "10 L"], finish: "Silk", features: ["Soft light reflection", "Wipeable surface", "Smooth application"], usage: "Kitchens, dining rooms and family spaces" },
  { id: "weather-shield", name: "Weather Shield", category: "exterior", description: "Long-lasting exterior color made to stand up to changing weather.", image: categories[1].image, sizes: ["4 L", "10 L", "20 L"], finish: "Low sheen", features: ["Weather resistant", "Color that lasts", "Excellent adhesion"], usage: "Exterior walls, masonry and render" },
  { id: "ceiling-white", name: "Pure Ceiling White", category: "ceiling", description: "A bright, even white finish that makes ceilings feel beautifully fresh.", image: categories[2].image, sizes: ["4 L", "10 L"], finish: "Flat matt", features: ["Non-drip consistency", "Low splatter", "Bright white finish"], usage: "Plastered and previously painted ceilings" },
  { id: "wood-essence", name: "Wood Essence", category: "wood", description: "Protective color and a refined finish for interior woodwork.", image: categories[3].image, sizes: ["1 L", "2.5 L", "5 L"], finish: "Satin", features: ["Smooth flow", "Tough finish", "Beautiful color depth"], usage: "Doors, trim, furniture and interior joinery" },
  { id: "metal-guard", name: "Metal Guard Enamel", category: "metal", description: "A hard-wearing enamel finish for metal surfaces inside or out.", image: categories[4].image, sizes: ["1 L", "4 L"], finish: "Gloss", features: ["Durable enamel", "Resists everyday scuffs", "Excellent color retention"], usage: "Railings, gates and prepared metalwork" },
  { id: "universal-primer", name: "Universal Primer", category: "primer", description: "A dependable base coat that helps your topcoat look its very best.", image: categories[5].image, sizes: ["1 L", "4 L", "10 L"], finish: "Matt", features: ["Improves adhesion", "Helps seal porous surfaces", "Easy to apply"], usage: "Prepared interior and exterior masonry" },
  { id: "damp-stop", name: "Damp Stop Coat", category: "waterproofing", description: "A protective coating to help shield walls from damp and moisture.", image: categories[6].image, sizes: ["4 L", "10 L", "20 L"], finish: "Textured matt", features: ["Moisture protection", "Flexible coating", "Made for exterior use"], usage: "Exterior masonry and moisture-prone walls" },
];

export const colors = [
  { id: "porcelain", name: "Quiet Porcelain", code: "C-001", family: "White", hex: "#F3F0E8", finish: "Matt" },
  { id: "cloud-linen", name: "Cloud Linen", code: "C-014", family: "White", hex: "#E9E5DB", finish: "Silk" },
  { id: "warm-ivory", name: "Warm Ivory", code: "C-021", family: "Cream", hex: "#E8DCC8", finish: "Matt" },
  { id: "soft-chamois", name: "Soft Chamois", code: "C-036", family: "Cream", hex: "#DCC9A9", finish: "Silk" },
  { id: "quiet-stone", name: "Quiet Stone", code: "C-104", family: "Grey", hex: "#B8B5AD", finish: "Matt" },
  { id: "slate-shadow", name: "Slate Shadow", code: "C-118", family: "Grey", hex: "#626B6D", finish: "Eggshell" },
  { id: "blue-hour", name: "Blue Hour", code: "C-207", family: "Blue", hex: "#7898A3", finish: "Matt" },
  { id: "deep-tide", name: "Deep Tide", code: "C-224", family: "Blue", hex: "#385B67", finish: "Eggshell" },
  { id: "sage-leaf", name: "Sage Leaf", code: "C-305", family: "Green", hex: "#A5AC8F", finish: "Matt" },
  { id: "olive-grove", name: "Olive Grove", code: "C-328", family: "Green", hex: "#697357", finish: "Matt" },
  { id: "sunlit-clay", name: "Sunlit Clay", code: "C-405", family: "Yellow", hex: "#D5B66D", finish: "Matt" },
  { id: "honeyed-light", name: "Honeyed Light", code: "C-418", family: "Yellow", hex: "#E7CC8C", finish: "Silk" },
  { id: "toasted-earth", name: "Toasted Earth", code: "C-507", family: "Brown", hex: "#98775C", finish: "Matt" },
  { id: "cocoa-bean", name: "Cocoa Bean", code: "C-522", family: "Brown", hex: "#634A3B", finish: "Eggshell" },
  { id: "rosewater", name: "Rosewater", code: "C-608", family: "Pink", hex: "#D6B5AE", finish: "Matt" },
  { id: "soft-terracotta", name: "Soft Terracotta", code: "C-615", family: "Pink", hex: "#BC8276", finish: "Matt" },
  { id: "brick-dust", name: "Brick Dust", code: "C-709", family: "Red", hex: "#A85E51", finish: "Eggshell" },
  { id: "oxblood", name: "Oxblood", code: "C-726", family: "Red", hex: "#713E3B", finish: "Matt" },
];

export const familyNames = ["All colors", "White", "Cream", "Grey", "Blue", "Green", "Yellow", "Brown", "Pink", "Red"];

export const defaultSettings = {
  companyName: "COLORA PAINTS",
  email: "hello@colorapaints.example",
  phone: "+1 (555) 010-2026",
  whatsapp: "+1 (555) 010-2026",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  address: "123 Studio Lane, Your City (placeholder address)",
  hours: "Monday–Friday, 8:30 am–5:30 pm",
  tagline: "Colors That Bring Life to Your Space",
  yearsExperience: "12+",
  happyCustomers: "5,000+",
  productRange: "350+",
  citiesServed: "40+",
  heroImage: "",
};

export const initialArticles = [
  { id: "choosing-neutrals", title: "A softer way to choose neutrals", category: "Color notes", excerpt: "Find the undertone that makes a room feel quietly, unmistakably yours." },
  { id: "paint-finish-guide", title: "A finish for every feeling", category: "A considered home", excerpt: "Our simple guide to choosing the right sheen for every surface." },
];
