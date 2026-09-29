import { articles as defaultArticles } from "./articles";
import { googleMapsUrl, officeLocation } from "./contactDetails";
import { projects, properties as defaultProperties } from "./properties";
import { supabase } from "./lib/supabaseClient";

const STORAGE_KEY = "rentora-cms";
const PROPERTY_STORAGE_KEY = "rentora-properties";

const defaultContact = {
  phone: "+92 318 7630194",
  whatsapp: "+92 318 7630194",
  email: "support@rentora.com",
  address: officeLocation,
  mapsUrl: googleMapsUrl,
  businessHours: "Monday - Saturday, 9:00 AM - 6:00 PM",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  whatsappUrl: "https://wa.me/923187630194",
  whatsappChannelUrl: "",
};

const defaultWebsite = {
  heroHeading: "Find Your Perfect Place. Live Better.",
  heroSubtitle: "Discover premium apartments, houses, plots and commercial properties in Lahore with RENTORA.",
  aboutHeading: "Find your perfect place. Live better.",
  aboutDescription: "RENTORA is a Lahore-focused property platform that brings homes, apartments, and local property opportunities together in one straightforward place.\n\nWe make it easier to compare the details that matter, explore different neighbourhoods, and start a conversation when a listing feels right. Whether you are renting, buying, or exploring your options, our aim is to make the next step clearer.",
  heroImage: "",
  aboutImage: "",
  footerText: "A modern real-estate platform designed to help you discover apartments, houses, plots and commercial properties in Lahore.",
  tagline: "Property Made Simple",
};

const defaultTeam = [
  { id: "team-consultant", name: "Property Consultant", role: "Senior Property Consultant", phone: "", whatsapp: "", email: "", bio: "", image: "", socialLinks: { facebook: "", instagram: "", linkedin: "" }, published: true },
  { id: "team-sales", name: "Sales Consultant", role: "Real Estate Advisor", phone: "", whatsapp: "", email: "", bio: "", image: "", socialLinks: { facebook: "", instagram: "", linkedin: "" }, published: true },
  { id: "team-investment", name: "Investment Advisor", role: "Property Investment Specialist", phone: "", whatsapp: "", email: "", bio: "", image: "", socialLinks: { facebook: "", instagram: "", linkedin: "" }, published: true },
];

const defaultLocations = projects.map((location, index) => ({
  ...location,
  id: `location-${index + 1}`,
  shortDescription: location.description,
  published: true,
}));

const defaultPropertyData = defaultProperties.map((property, index) => ({
  ...property,
  id: `property-${index + 1}`,
  description: `${property.title} in ${property.location}. Contact RENTORA for availability and viewing details.`,
  published: true,
}));

const defaultArticleData = defaultArticles.map((article) => ({
  ...article,
  id: article.slug,
  shortDescription: article.excerpt,
  content: [
    article.introduction,
    ...article.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
    article.takeaway,
  ].filter(Boolean).join("\n\n"),
  date: "2026-09-29",
  author: "RENTORA Editorial",
  published: true,
}));

export const defaultContent = {
  properties: defaultPropertyData,
  locations: defaultLocations,
  articles: defaultArticleData,
  team: defaultTeam,
  contact: defaultContact,
  website: defaultWebsite,
};

export const emptyContent = {
  ...defaultContent,
  properties: [],
  locations: [],
  articles: [],
  team: [],
  socialLinks: [],
};

export function loadContent() {
  return emptyContent;
}

const sectionTables = {
  properties: "properties",
  locations: "locations",
  articles: "articles",
  team: "team_members",
  socialLinks: "social_links",
};

const sectionColumns = {
  locations: { shortDescription: "short_description", propertyCount: "property_count" },
  articles: { shortDescription: "short_description", readTime: "read_time", date: "publication_date" },
  team: { facebookUrl: "facebook_url", instagramUrl: "instagram_url", linkedinUrl: "linkedin_url", socialLinks: "social_links" },
  socialLinks: { displayName: "display_name" },
  contact: {
    mapsUrl: "maps_url", businessHours: "business_hours", facebookUrl: "facebook_url",
    instagramUrl: "instagram_url", tiktokUrl: "tiktok_url", youtubeUrl: "youtube_url",
    whatsappUrl: "whatsapp_url", whatsappChannelUrl: "whatsapp_channel_url",
  },
  website: {
    heroHeading: "hero_heading", heroSubtitle: "hero_subtitle", aboutHeading: "about_heading",
    aboutDescription: "about_description", heroImage: "hero_image", aboutImage: "about_image", footerText: "footer_text",
  },
};

const mapRecordFromSupabase = (section, record) => {
  const columns = sectionColumns[section] ?? {};
  const mapped = Object.fromEntries(Object.entries(record).map(([key, value]) => [
    Object.keys(columns).find((field) => columns[field] === key) ?? key,
    value,
  ]));
  if (section === "articles") mapped.date = mapped.publication_date ?? mapped.date ?? "";
  return mapped;
};

const mapRecordToSupabase = (section, record) => {
  const columns = sectionColumns[section] ?? {};
  return Object.fromEntries(Object.entries(record)
    .filter(([key, value]) => key !== "created_at" && key !== "updated_at" && value !== undefined)
    .map(([key, value]) => [columns[key] ?? key, key === "date" && section === "articles" && !value ? null : value]));
};

const readSingleton = async (table, defaults) => {
  const { data, error } = await supabase.from(table).select("*").eq("id", "default").maybeSingle();
  if (error) throw error;
  return data ? { ...defaults, ...mapRecordFromSupabase(table === "contact_info" ? "contact" : "website", data) } : defaults;
};

export async function loadCmsContentFromSupabase({ admin = false } = {}) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const sections = Object.entries(sectionTables);
  const results = await Promise.all(sections.map(async ([section, table]) => {
    let query = supabase.from(table).select("*");
    if (!admin) query = query.eq("published", true);
    query = query.order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error && !(section === "socialLinks" && error.code === "PGRST205")) throw error;
    return [section, (data ?? []).map((record) => mapRecordFromSupabase(section, record))];
  }));

  return {
    ...emptyContent,
    ...Object.fromEntries(results),
    contact: await readSingleton("contact_info", defaultContact),
    website: await readSingleton("website_settings", defaultWebsite),
  };
}

export const loadPublishedCmsContentFromSupabase = () => loadCmsContentFromSupabase();
export const loadAdminCmsContentFromSupabase = () => loadCmsContentFromSupabase({ admin: true });

export async function saveCmsRecordInSupabase(section, record, { singleton = false } = {}) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const table = section === "contact" ? "contact_info" : section === "website" ? "website_settings" : sectionTables[section];
  if (!table) throw new Error(`Unknown CMS section: ${section}`);
  const payload = { ...mapRecordToSupabase(section, record), id: singleton ? "default" : record.id };
  const query = singleton
    ? supabase.from(table).upsert(payload, { onConflict: "id" })
    : supabase.from(table).insert(payload);
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return singleton
    ? { ...(section === "contact" ? defaultContact : defaultWebsite), ...mapRecordFromSupabase(section, data) }
    : mapRecordFromSupabase(section, data);
}

export async function updateCmsRecordInSupabase(section, id, record) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const table = sectionTables[section];
  if (!table) throw new Error(`Unknown CMS section: ${section}`);
  const { data, error } = await supabase.from(table).update(mapRecordToSupabase(section, record)).eq("id", id).select("*").single();
  if (error) throw error;
  return mapRecordFromSupabase(section, data);
}

export async function deleteCmsRecordFromSupabase(section, id) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const table = sectionTables[section];
  if (!table) throw new Error(`Unknown CMS section: ${section}`);
  const { data, error } = await supabase.from(table).delete().eq("id", id).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function setCmsRecordPublishedInSupabase(section, id, published) {
  return updateCmsRecordInSupabase(section, id, { published });
}

export async function uploadCmsImage(section, recordId, imageFile) {
  if (!supabase) throw new Error("Supabase is not configured.");
  let file = imageFile;
  if (typeof imageFile === "string" && imageFile.startsWith("data:")) {
    const response = await fetch(imageFile);
    file = await response.blob();
  }
  const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  const path = `${section}/${recordId}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("cms-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from("cms-images").getPublicUrl(path).data.publicUrl;
}

export function readLegacyContentForMigration() {
  if (typeof window === "undefined") return null;
  try {
    const legacy = window.localStorage.getItem(STORAGE_KEY);
    const properties = window.localStorage.getItem(PROPERTY_STORAGE_KEY);
    if (!legacy && !properties) return null;
    const parsed = legacy ? JSON.parse(legacy) : {};
    return {
      ...parsed,
      properties: Array.isArray(parsed.properties) ? parsed.properties : properties ? JSON.parse(properties) : [],
    };
  } catch {
    return null;
  }
}

export async function migrateLegacyContentToSupabase(legacyContent) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const current = await loadAdminCmsContentFromSupabase();
  const imported = {};
  let skipped = 0;

  for (const section of Object.keys(sectionTables)) {
    const legacyRecords = Array.isArray(legacyContent[section]) ? legacyContent[section] : [];
    imported[section] = 0;
    for (const legacyRecord of legacyRecords) {
      const label = (legacyRecord.title || legacyRecord.name || legacyRecord.displayName || legacyRecord.platform || "").trim().toLowerCase();
      const duplicate = current[section].some((record) => {
        if (legacyRecord.id && record.id === legacyRecord.id) return true;
        if (section === "articles" && legacyRecord.slug && record.slug === legacyRecord.slug) return true;
        const existingLabel = (record.title || record.name || record.displayName || record.platform || "").trim().toLowerCase();
        return label && label === existingLabel && (!legacyRecord.location || legacyRecord.location === record.location);
      });
      if (duplicate) {
        skipped += 1;
        continue;
      }

      const id = legacyRecord.id && !current[section].some((record) => record.id === legacyRecord.id)
        ? legacyRecord.id
        : `${section}-${crypto.randomUUID()}`;
      const record = { ...legacyRecord, id, published: legacyRecord.published !== false };
      if (typeof record.image === "string" && record.image.startsWith("data:")) {
        record.image = await uploadCmsImage(section, id, record.image);
      }
      const savedRecord = await saveCmsRecordInSupabase(section, record);
      current[section].push(savedRecord);
      imported[section] += 1;
    }
  }

  for (const section of ["contact", "website"]) {
    const legacyValue = legacyContent[section];
    if (!legacyValue || typeof legacyValue !== "object") continue;
    const table = section === "contact" ? "contact_info" : "website_settings";
    const { data, error } = await supabase.from(table).select("id").eq("id", "default").maybeSingle();
    if (error) throw error;
    if (data) {
      skipped += 1;
      continue;
    }
    const migratedValue = { ...legacyValue };
    if (section === "website") {
      for (const key of ["heroImage", "aboutImage"]) {
        if (typeof migratedValue[key] === "string" && migratedValue[key].startsWith("data:")) {
          migratedValue[key] = await uploadCmsImage("website", key, migratedValue[key]);
        }
      }
    }
    await saveCmsRecordInSupabase(section, migratedValue, { singleton: true });
    imported[section] = 1;
  }

  return { imported, skipped };
}