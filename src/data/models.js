/**
 * Supabase-ready record shapes. The repository can be replaced without changing page components.
 * @typedef {{ id: string, name: string, category: string, description: string, image: string, sizes: string[], finish: string, features: string[], usage: string, published: boolean }} Product
 * @typedef {{ id: string, name: string, code: string, family: string, hex: string, finish: string, image: string, published: boolean }} PaintColor
 * @typedef {{ id: string, name: string, shortName: string, description: string, image: string, published: boolean }} Category
 * @typedef {{ id: string, name: string, phone: string, email: string|null, city: string|null, interest: string|null, message: string, status: "new"|"read"|"closed", created_at: string }} Enquiry
 * @typedef {{ id: string, title: string, category: string, excerpt: string, content: string, image: string, published: boolean }} Article
 * @typedef {{ companyName: string, email: string, phone: string, whatsapp: string, address: string, hours: string, tagline: string, facebookUrl: string, instagramUrl: string, tiktokUrl: string, yearsExperience: string, happyCustomers: string, productRange: string, citiesServed: string, heroImage: string }} SiteSettings
 */

export const collectionNames = ["products", "colors", "categories", "enquiries", "articles", "site_settings"];
