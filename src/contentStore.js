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
};

const defaultWebsite = {
  heroHeading: "Find Your Perfect Place. Live Better.",
  heroSubtitle: "Discover premium apartments, houses, plots and commercial properties in Lahore with RENTORA.",
  aboutHeading: "Find your perfect place. Live better.",
  aboutDescription: "RENTORA is a Lahore-focused property platform that brings homes, apartments, and local property opportunities together in one straightforward place.\n\nWe make it easier to compare the details that matter, explore different neighbourhoods, and start a conversation when a listing feels right. Whether you are renting, buying, or exploring your options, our aim is to make the next step clearer.",
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

const normalizeRecords = (records, defaults, prefix) => records.map((record, index) => ({
  ...defaults[index],
  ...record,
  id: record.id || `${prefix}-${index + 1}`,
  published: record.published !== false,
}));

export const defaultContent = {
  properties: defaultPropertyData,
  locations: defaultLocations,
  articles: defaultArticleData,
  team: defaultTeam,
  contact: defaultContact,
  website: defaultWebsite,
};

export function loadContent() {
  try {
    const savedContent = window.localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      const parsed = JSON.parse(savedContent);
      return {
        ...defaultContent,
        ...parsed,
        properties: Array.isArray(parsed.properties) ? normalizeRecords(parsed.properties, defaultPropertyData, "property") : defaultPropertyData,
        locations: Array.isArray(parsed.locations) ? normalizeRecords(parsed.locations, defaultLocations, "location") : defaultLocations,
        articles: Array.isArray(parsed.articles) ? normalizeRecords(parsed.articles, defaultArticleData, "article") : defaultArticleData,
        team: Array.isArray(parsed.team) ? normalizeRecords(parsed.team, defaultTeam, "team") : defaultTeam,
        contact: { ...defaultContact, ...parsed.contact },
        website: { ...defaultWebsite, ...parsed.website },
      };
    }

    const savedProperties = window.localStorage.getItem(PROPERTY_STORAGE_KEY);
    const properties = savedProperties ? JSON.parse(savedProperties) : defaultPropertyData;
    return {
      ...defaultContent,
      properties: normalizeRecords(properties, defaultPropertyData, "property"),
    };
  } catch {
    return defaultContent;
  }
}

const mapSupabaseProperty = (property) => ({
  id: property.id,
  title: property.title ?? "",
  location: property.location ?? "",
  price: property.price ?? "",
  type: property.type ?? "Apartment",
  purpose: property.purpose ?? "For Rent",
  beds: Number(property.beds ?? 0),
  baths: Number(property.baths ?? 0),
  area: property.area ?? "",
  description: property.description ?? "",
  image: property.image ?? "",
  published: property.published === true,
  created_at: property.created_at ?? null,
  updated_at: property.updated_at ?? null,
});

export function loadStoredPropertiesFallback() {
  try {
    const savedProperties = window.localStorage.getItem(PROPERTY_STORAGE_KEY);
    const properties = savedProperties ? JSON.parse(savedProperties) : defaultPropertyData;
    return normalizeRecords(properties, defaultPropertyData, "property");
  } catch {
    return defaultPropertyData;
  }
}

export async function loadPublishedPropertiesFromSupabase() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data.map(mapSupabaseProperty) : [];
}

export async function loadAdminPropertiesFromSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data.map(mapSupabaseProperty) : [];
}

export async function insertPropertyInSupabase(property) {
  const { data, error } = await supabase
    .from("properties")
    .insert(property)
    .select("*")
    .single();

  if (error) throw error;
  return mapSupabaseProperty(data);
}

export async function updatePropertyInSupabase(id, property) {
  const { data, error } = await supabase
    .from("properties")
    .update(property)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapSupabaseProperty(data);
}

export async function deletePropertyFromSupabase(id) {
  const { data, error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function setPropertyPublishedInSupabase(id, published) {
  const { data, error } = await supabase
    .from("properties")
    .update({ published })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapSupabaseProperty(data);
}

export function saveContent(content) {
  try {
    const existingContent = window.localStorage.getItem(STORAGE_KEY);
    if (!window.localStorage.getItem(PROPERTY_STORAGE_KEY) && existingContent) {
      const legacyProperties = JSON.parse(existingContent).properties;
      if (Array.isArray(legacyProperties)) {
        window.localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(legacyProperties));
      }
    }

    const contentWithoutProperties = { ...content };
    delete contentWithoutProperties.properties;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contentWithoutProperties));
  } catch (error) {
    console.error("RENTORA content could not be saved in this browser.", error);
  }
}