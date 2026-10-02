import { colors as sampleColors, defaultSettings, products as sampleProducts, categories as sampleCategories, initialArticles } from "../data/catalog";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

const storageBucket = "website-images";

const mapCategory = (row) => ({
  id: row.id,
  name: row.name,
  shortName: row.short_name,
  description: row.description ?? "",
  image: row.image_url ?? "",
  published: row.published,
});

const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category_id,
  description: row.description,
  image: row.image_url ?? "",
  sizes: row.sizes ?? [],
  finish: row.finish ?? "",
  features: row.features ?? [],
  usage: row.recommended_usage ?? "",
  published: row.published,
});

const mapColor = (row) => ({
  id: row.id,
  name: row.name,
  code: row.code,
  family: row.family,
  hex: row.hex,
  finish: row.finish,
  image: row.image_url ?? "",
  published: row.published,
});

const mapArticle = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  excerpt: row.excerpt,
  content: row.content,
  image: row.image_url ?? "",
  published: row.published,
});

const mapSettings = (row) => ({
  companyName: row.company_name?.trim().toUpperCase() === "COLORA PAINTS" ? "ANSARI PAINTS" : row.company_name,
  tagline: row.tagline,
  email: row.email,
  phone: row.phone,
  address: row.address,
  whatsapp: row.whatsapp,
  facebookUrl: row.facebook_url,
  instagramUrl: row.instagram_url,
  tiktokUrl: row.tiktok_url,
  hours: row.hours,
  yearsExperience: row.years_experience,
  happyCustomers: row.happy_customers,
  productRange: row.product_range,
  citiesServed: row.cities_served,
  heroImage: row.hero_image_url,
});

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
  return supabase;
}

function unwrap(result, operation) {
  if (result.error) {
    console.error(`Supabase ${operation} failed.`, result.error);
    throw new Error(result.error.message || `Unable to ${operation}.`);
  }
  return result.data;
}

export const catalogRepository = {
  isConfigured: isSupabaseConfigured,
  async getAll(collection, { admin = false } = {}) {
    if (!isSupabaseConfigured) {
      if (admin) throw new Error("Admin data requires a configured Supabase project.");
      const preview = { products: sampleProducts, colors: sampleColors, categories: sampleCategories, articles: initialArticles };
      return preview[collection] ?? [];
    }
    const client = requireSupabase();
    const table = collection === "settings" ? "site_settings" : collection;
    let query = client.from(table).select("*");
    if (!admin && ["products", "colors", "categories", "articles"].includes(collection)) {
      query = query.eq("published", true);
    }
    if (collection === "enquiries" && !admin) throw new Error("Enquiries are private to authorized administrators.");
    const data = unwrap(await query, `load ${collection}`);
    if (collection === "settings") return data?.[0] ? mapSettings(data[0]) : defaultSettings;
    const mapper = { products: mapProduct, colors: mapColor, categories: mapCategory, articles: mapArticle }[collection];
    return mapper ? data.map(mapper) : data;
  },
  async getById(collection, id, { admin = false } = {}) {
    if (collection === "enquiries" && !admin) throw new Error("Enquiries are private to authorized administrators.");
    if (!isSupabaseConfigured) {
      const records = await this.getAll(collection, { admin });
      return records.find((item) => item.id === id) ?? null;
    }
    const client = requireSupabase();
    const mapper = { products: mapProduct, colors: mapColor, categories: mapCategory, articles: mapArticle }[collection];
    let query = client.from(collection).select("*").eq("id", id);
    if (!admin) query = query.eq("published", true);
    const row = unwrap(await query.maybeSingle(), `load ${collection} record`);
    return row ? (mapper ? mapper(row) : row) : null;
  },
  async save(collection, item) {
    const client = requireSupabase();
    const payloads = {
      categories: (record) => ({ id: record.id, name: record.name, short_name: record.shortName, description: record.description, image_url: record.image, published: record.published, updated_at: new Date().toISOString() }),
      products: (record) => ({ id: record.id, name: record.name, category_id: record.category, description: record.description, image_url: record.image, sizes: record.sizes, finish: record.finish, features: record.features, recommended_usage: record.usage, published: record.published, updated_at: new Date().toISOString() }),
      colors: (record) => ({ id: record.id, name: record.name, code: record.code, family: record.family, hex: record.hex, finish: record.finish, image_url: record.image, published: record.published, updated_at: new Date().toISOString() }),
      articles: (record) => ({ id: record.id, title: record.title, category: record.category, excerpt: record.excerpt, content: record.content, image_url: record.image, published: record.published, updated_at: new Date().toISOString() }),
    };
    if (!payloads[collection]) throw new Error(`Unsupported content collection: ${collection}`);
    return unwrap(await client.from(collection).upsert(payloads[collection](item)).select().single(), `save ${collection}`);
  },
  async remove(collection, id) {
    if (!["products", "colors", "categories", "articles", "enquiries"].includes(collection)) {
      throw new Error(`Unsupported content collection: ${collection}`);
    }
    const client = requireSupabase();
    return unwrap(await client.from(collection).delete().eq("id", id).select().single(), `delete ${collection}`);
  },
  async setPublished(collection, id, published) {
    if (!["products", "colors", "categories", "articles"].includes(collection)) throw new Error(`Publishing is not supported for ${collection}.`);
    const client = requireSupabase();
    return unwrap(await client.from(collection).update({ published, updated_at: new Date().toISOString() }).eq("id", id).select().single(), `update ${collection} publication`);
  },
  async setEnquiryRead(id, read) {
    const client = requireSupabase();
    return unwrap(await client.from("enquiries").update({ status: read ? "read" : "new" }).eq("id", id).select().single(), "update enquiry status");
  },
  async createEnquiry(enquiry, receiptNumber) {
    const client = requireSupabase();
    unwrap(await client.from("enquiries").insert({
      receipt_number: receiptNumber,
      name: enquiry.name.trim(),
      phone: enquiry.phone.trim(),
      email: enquiry.email?.trim() || null,
      city: enquiry.city?.trim() || null,
      interest: enquiry.interest?.trim() || null,
      message: enquiry.message.trim(),
      status: "new",
    }), "submit enquiry");
    return { receiptNumber };
  },
  async getSettings() {
    if (!isSupabaseConfigured) return defaultSettings;
    const client = requireSupabase();
    const data = unwrap(await client.from("site_settings").select("*").eq("id", true).maybeSingle(), "load website settings");
    return data ? mapSettings(data) : defaultSettings;
  },
  async updateSettings(settings) {
    const client = requireSupabase();
    const payload = {
      id: true,
      company_name: settings.companyName,
      tagline: settings.tagline,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      whatsapp: settings.whatsapp,
      facebook_url: settings.facebookUrl,
      instagram_url: settings.instagramUrl,
      tiktok_url: settings.tiktokUrl,
      hours: settings.hours,
      years_experience: settings.yearsExperience,
      happy_customers: settings.happyCustomers,
      product_range: settings.productRange,
      cities_served: settings.citiesServed,
      hero_image_url: settings.heroImage,
      updated_at: new Date().toISOString(),
    };
    return unwrap(await client.from("site_settings").upsert(payload).select().single(), "save website settings");
  },
  async uploadImage(file, folder) {
    if (!file.type.startsWith("image/")) throw new Error("Choose a valid image file.");
    if (file.size > 8_000_000) throw new Error("Choose an image smaller than 8 MB.");
    const client = requireSupabase();
    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const result = await client.storage.from(storageBucket).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (result.error) {
      console.error("Supabase image upload failed.", result.error);
      throw new Error(result.error.message || "Image upload failed.");
    }
    return client.storage.from(storageBucket).getPublicUrl(path).data.publicUrl;
  },
  async removeImage(url) {
    const path = url.split(`/storage/v1/object/public/${storageBucket}/`)[1];
    if (!path) return;
    const client = requireSupabase();
    const result = await client.storage.from(storageBucket).remove([decodeURIComponent(path)]);
    if (result.error) {
      console.error("Could not remove obsolete image from storage.", result.error);
      throw new Error(result.error.message || "Could not remove the old image.");
    }
  },
};
