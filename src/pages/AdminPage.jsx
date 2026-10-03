import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CircleHelp, FileText, LayoutDashboard, LoaderCircle, LogOut, Mail, Paintbrush2, Pencil, Plus, Save, Settings, ShieldAlert, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { defaultSettings } from "../data/catalog";
import { catalogRepository } from "../lib/catalogRepository";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { Seo } from "../components/SiteLayout";

const adminSections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Paintbrush2 },
  { id: "colors", label: "Colors", icon: CircleHelp },
  { id: "categories", label: "Categories", icon: Settings },
  { id: "enquiries", label: "Enquiries", icon: Mail },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "settings", label: "Website settings", icon: Settings },
];

const recordDefaults = {
  products: { name: "", category: "interior", description: "", image: "", sizes: [], finish: "Matt", features: [], usage: "", published: false },
  colors: { name: "", code: "", family: "White", hex: "#F3F0E8", finish: "Matt", image: "", published: false },
  categories: { name: "", shortName: "", description: "", image: "", published: false },
  articles: { title: "", category: "", excerpt: "", content: "", image: "", published: false },
};

const definitions = {
  products: [
    { key: "name", label: "Product name", required: true },
    { key: "category", label: "Category", type: "category", required: true },
    { key: "description", label: "Description", type: "textarea", required: true },
    { key: "sizes", label: "Available sizes", type: "list", hint: "Separate sizes with commas, e.g. 1 L, 4 L" },
    { key: "finish", label: "Finish" },
    { key: "features", label: "Features", type: "list", hint: "Separate features with commas" },
    { key: "usage", label: "Recommended usage" },
    { key: "image", label: "Product image", type: "image" },
  ],
  colors: [
    { key: "name", label: "Color name", required: true },
    { key: "code", label: "Color code", required: true },
    { key: "family", label: "Family", type: "select", options: ["White", "Cream", "Grey", "Blue", "Green", "Yellow", "Brown", "Pink", "Red"] },
    { key: "hex", label: "Swatch color", type: "color" },
    { key: "finish", label: "Finish" },
    { key: "image", label: "Color image", type: "image" },
  ],
  categories: [
    { key: "name", label: "Category name", required: true },
    { key: "shortName", label: "Short name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "image", label: "Category image", type: "image" },
  ],
  articles: [
    { key: "title", label: "Article title", required: true },
    { key: "category", label: "Article category" },
    { key: "excerpt", label: "Excerpt", type: "textarea" },
    { key: "content", label: "Article content", type: "textarea" },
    { key: "image", label: "Article image", type: "image" },
  ],
};

function makeId(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function LoadingMessage({ children = "Loading…" }) {
  return <div className="data-state" role="status"><LoaderCircle className="spin" size={17} />{children}</div>;
}

function LoginPage({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      onSignedIn();
    } catch (authError) {
      console.error("Supabase administrator sign-in failed.", authError);
      setError(authError instanceof Error ? authError.message : "Sign in failed. Check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return <main className="admin-auth-page"><Seo title="Admin sign in" description="Secure ANSARI PAINTS content management sign in." /><section className="admin-auth-card"><span className="eyebrow">ANSARI STUDIO</span><h1>Sign in to continue.</h1><p>Use the administrator account created in Supabase Auth.</p><form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"} <ArrowRight size={16} /></button></form><Link className="text-link" to="/">Return to website</Link></section></main>;
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured);
  const [authorization, setAuthorization] = useState(isSupabaseConfigured ? "checking" : "unavailable");
  const [authError, setAuthError] = useState("");
  const [section, setSection] = useState("dashboard");
  const [records, setRecords] = useState({ products: [], colors: [], categories: [], articles: [], enquiries: [] });
  const [settings, setSettings] = useState(defaultSettings);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsLoaded, setRecordsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let alive = true;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!alive) return;
      setSession(nextSession);
      setAuthorization(nextSession ? "checking" : "signed-out");
      setRecordsLoaded(false);
      setCheckingSession(false);
      setAuthError("");
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) {
        console.error("Unable to read Supabase auth session.", error);
        setAuthError(error.message);
      }
      setSession(data.session);
      setAuthorization(data.session ? "checking" : "signed-out");
      setCheckingSession(false);
    }).catch((error) => {
      console.error("Unable to read Supabase auth session.", error);
      if (alive) { setAuthError(error instanceof Error ? error.message : "Unable to check your sign-in."); setCheckingSession(false); }
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id || !isSupabaseConfigured) return undefined;
    let alive = true;
    supabase.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle().then(({ data, error }) => {
      if (!alive) return;
      if (error) {
        console.error("Unable to verify administrator access.", error);
        setAuthError(error.message);
        setAuthorization("error");
      } else setAuthorization(data ? "authorized" : "denied");
    }).catch((error) => {
      console.error("Unable to verify administrator access.", error);
      if (alive) { setAuthError(error instanceof Error ? error.message : "Unable to verify administrator access."); setAuthorization("error"); }
    });
    return () => { alive = false; };
  }, [session]);

  const reload = useCallback(async (showLoading = true) => {
    if (authorization !== "authorized") return;
    if (showLoading) {
      setLoadingRecords(true);
      setLoadError("");
    }
    try {
      const [products, colors, categories, articles, enquiries, nextSettings] = await Promise.all([
        catalogRepository.getAll("products", { admin: true }),
        catalogRepository.getAll("colors", { admin: true }),
        catalogRepository.getAll("categories", { admin: true }),
        catalogRepository.getAll("articles", { admin: true }),
        catalogRepository.getAll("enquiries", { admin: true }),
        catalogRepository.getSettings(),
      ]);
      setRecords({ products, colors, categories, articles, enquiries });
      setSettings(nextSettings);
      setRecordsLoaded(true);
    } catch (error) {
      console.error("Unable to load admin content.", error);
      setLoadError(error instanceof Error ? error.message : "Unable to load admin content.");
      setRecordsLoaded(true);
    } finally {
      if (showLoading) setLoadingRecords(false);
    }
  }, [authorization]);

  useEffect(() => {
    const timer = window.setTimeout(() => reload(false), 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setAuthorization("signed-out");
      setRecords({ products: [], colors: [], categories: [], articles: [], enquiries: [] });
    } catch (error) {
      console.error("Supabase sign-out failed.", error);
      setAuthError(error instanceof Error ? error.message : "Could not sign out.");
    }
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setMutationError("");
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? formData.get("title") ?? "").trim();
    const data = Object.fromEntries(formData);
    const collection = editing.collection;
    const item = { ...editing.record, ...data, id: editing.record.id || makeId(name), published: formData.get("published") === "on" };
    if (collection === "products") {
      item.sizes = String(data.sizes ?? "").split(",").map((value) => value.trim()).filter(Boolean);
      item.features = String(data.features ?? "").split(",").map((value) => value.trim()).filter(Boolean);
    }
    delete item.upload;
    let uploadedUrl = "";
    let cleanupWarning = "";
    try {
      if (imageFile) {
        uploadedUrl = await catalogRepository.uploadImage(imageFile, collection);
        item.image = uploadedUrl;
      }
      await catalogRepository.save(collection, item);
      if (uploadedUrl && editing.record.image && editing.record.image !== uploadedUrl) {
        try { await catalogRepository.removeImage(editing.record.image); }
        catch (cleanupError) {
          console.error("Saved new content but old image cleanup failed.", cleanupError);
          cleanupWarning = " The old image could not be removed from Storage.";
        }
      }
      setEditing(null);
      setImageFile(null);
      setImageError("");
      setNotice(`${collection.slice(0, -1)} saved.${cleanupWarning}`);
      await reload();
    } catch (error) {
      console.error(`Unable to save ${collection} record.`, error);
      if (uploadedUrl) {
        try { await catalogRepository.removeImage(uploadedUrl); }
        catch (cleanupError) {
          console.error("Could not clean up uploaded image after save failed.", cleanupError);
          setMutationError(`${error instanceof Error ? error.message : `Could not save ${collection}.`} The uploaded image also could not be removed.`);
          return;
        }
      }
      setMutationError(error instanceof Error ? error.message : `Could not save ${collection}.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (collection, id) => {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    setMutationError("");
    try {
      const record = records[collection]?.find((item) => item.id === id);
      await catalogRepository.remove(collection, id);
      let cleanupFailed = false;
      if (record?.image) {
        try { await catalogRepository.removeImage(record.image); }
        catch (cleanupError) { cleanupFailed = true; console.error("Record deleted but its image cleanup failed.", cleanupError); }
      }
      setNotice(cleanupFailed ? `${collection.slice(0, -1)} deleted. The old image could not be removed from Storage.` : `${collection.slice(0, -1)} deleted.`);
      await reload();
    } catch (error) {
      console.error(`Unable to delete ${collection} record.`, error);
      setMutationError(error instanceof Error ? error.message : `Could not delete ${collection}.`);
    }
  };

  const togglePublished = async (collection, record) => {
    setMutationError("");
    try {
      await catalogRepository.setPublished(collection, record.id, !record.published);
      setNotice(`${record.name ?? record.title} ${record.published ? "unpublished" : "published"}.`);
      await reload();
    } catch (error) {
      console.error(`Unable to change ${collection} publication.`, error);
      setMutationError(error instanceof Error ? error.message : "Could not update publishing status.");
    }
  };

  const updateEnquiryStatus = async (id, read) => {
    setMutationError("");
    try {
      await catalogRepository.setEnquiryRead(id, read);
      setNotice(read ? "Enquiry marked as read." : "Enquiry marked as new.");
      await reload();
    } catch (error) {
      console.error("Unable to update enquiry status.", error);
      setMutationError(error instanceof Error ? error.message : "Could not update enquiry status.");
    }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMutationError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    let uploadedUrl = "";
    let cleanupWarning = "";
    try {
      if (imageFile) {
        uploadedUrl = await catalogRepository.uploadImage(imageFile, "site");
        data.heroImage = uploadedUrl;
      }
      await catalogRepository.updateSettings(data);
      setImageFile(null);
      setNotice("Website settings saved.");
      const savedSettings = await catalogRepository.getSettings();
      window.dispatchEvent(new CustomEvent("colora:settings-updated", { detail: savedSettings }));
      if (uploadedUrl && settings.heroImage) {
        try { await catalogRepository.removeImage(settings.heroImage); }
        catch (cleanupError) {
          console.error("Settings saved but previous hero image cleanup failed.", cleanupError);
          cleanupWarning = " The prior website image could not be removed from Storage.";
        }
      }
      if (cleanupWarning) setNotice((current) => `${current}${cleanupWarning}`);
      await reload();
    } catch (error) {
      console.error("Unable to save website settings.", error);
      if (uploadedUrl) {
        try { await catalogRepository.removeImage(uploadedUrl); }
        catch (cleanupError) {
          console.error("Could not clean up uploaded image after settings save failed.", cleanupError);
          setMutationError(`${error instanceof Error ? error.message : "Could not save settings."} The uploaded image also could not be removed.`);
          return;
        }
      }
      setMutationError(error instanceof Error ? error.message : "Could not save settings.");
    } finally { setSaving(false); }
  };

  const count = useMemo(() => ({ products: records.products.length, colors: records.colors.length, categories: records.categories.length, articles: records.articles.length, enquiries: records.enquiries.length }), [records]);

  if (checkingSession || authorization === "checking") return <main className="admin-auth-page"><LoadingMessage>Checking administrator access…</LoadingMessage></main>;
  if (!isSupabaseConfigured || authorization === "unavailable") return <main className="admin-auth-page"><Seo title="Admin unavailable" description="Supabase configuration is required to access the admin." /><section className="admin-auth-card"><ShieldAlert size={28} /><h1>Admin setup required.</h1><p>Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to enable secure administrator sign-in.</p><Link className="text-link" to="/">Return to website</Link></section></main>;
  if (!session || authorization === "signed-out") return <LoginPage onSignedIn={() => setAuthorization("checking")} />;
  if (authorization === "denied" || authorization === "error") return <main className="admin-auth-page"><Seo title="Admin access denied" description="Administrator access is required." /><section className="admin-auth-card"><ShieldAlert size={28} /><h1>{authorization === "denied" ? "You don’t have admin access." : "Couldn’t verify access."}</h1><p>{authorization === "denied" ? "This signed-in Supabase user is not listed in the admin_users table." : authError || "Please try again after confirming database access."}</p>{authError && <p className="form-error" role="alert">{authError}</p>}<button className="button button-outline" type="button" onClick={signOut}>Sign out</button></section></main>;

  const active = adminSections.find((item) => item.id === section);
  const beginEdit = (collection, record = recordDefaults[collection]) => {
    setNotice("");
    setMutationError("");
    setImageError("");
    setImageFile(null);
    setEditing({ collection, record: { ...record } });
  };

  return <main className="admin-page"><Seo title="Admin dashboard" description="Manage ANSARI PAINTS website content." /><div className="container admin-layout">
    <aside className="admin-sidebar"><div className="admin-sidebar-title"><span className="eyebrow">ANSARI STUDIO</span><strong>Content manager</strong><span className="admin-session-email">{session.user.email}</span></div><nav aria-label="Admin sections">{adminSections.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={section === id ? "admin-nav-item active" : "admin-nav-item"} onClick={() => { setSection(id); setEditing(null); setImageFile(null); setNotice(""); setMutationError(""); }}><Icon size={17} />{label}{id === "enquiries" && records.enquiries.some((item) => item.status === "new") && <span className="admin-nav-count">{records.enquiries.filter((item) => item.status === "new").length}</span>}</button>)}</nav><div className="admin-security-note"><span className="security-dot security-dot-good" /><div><strong>Verified administrator</strong><span>Supabase Auth · RLS protected</span></div></div><button type="button" className="admin-signout" onClick={signOut}><LogOut size={15} /> Sign out</button></aside>
    <section className="admin-content">
      <div className="admin-page-heading"><div><span className="eyebrow">WEBSITE CONTENT</span><h1>{active?.label}</h1></div><div className="admin-heading-actions"><button className="button button-outline admin-refresh" type="button" onClick={reload} disabled={loadingRecords}>Refresh</button><Link className="text-link" to="/">View website <ArrowRight size={15} /></Link></div></div>
      {notice && <div className="admin-notice" role="status"><Check size={16} />{notice}<button className="icon-button" type="button" onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={15} /></button></div>}
      {mutationError && <div className="admin-error" role="alert">{mutationError}</div>}
      {loadError && <div className="admin-error" role="alert">{loadError}<button className="text-link" type="button" onClick={reload}>Try again <ArrowRight size={14} /></button></div>}
      {(loadingRecords || !recordsLoaded) && <LoadingMessage>Loading admin content…</LoadingMessage>}
      {!loadingRecords && recordsLoaded && !loadError && section === "dashboard" && <><div className="admin-stats-grid">{[{ label: "Products", value: count.products }, { label: "Colors", value: count.colors }, { label: "Categories", value: count.categories }, { label: "Articles", value: count.articles }, { label: "Enquiries", value: count.enquiries }].map((stat) => <div className="admin-stat-card" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}</div><div className="admin-info-panel"><span className="eyebrow">CONNECTED CONTENT</span><h2>Your website content, in one place.</h2><p>Records are read from Supabase. Changes are persisted in the configured database and image bucket.</p><ul><li>Only published catalog and article records are visible publicly.</li><li>Enquiries are visible only to verified administrators.</li><li>Product images are stored in Supabase Storage.</li></ul></div></>}
      {!loadingRecords && recordsLoaded && !loadError && ["products", "colors", "categories", "articles"].includes(section) && <div className="admin-list-panel"><div className="admin-panel-heading"><div><span>{count[section]} records</span><p>Changes are saved to Supabase.</p></div><button className="button button-dark" type="button" onClick={() => beginEdit(section)}><Plus size={16} /> Add {section.slice(0, -1)}</button></div>
        {editing?.collection === section && <RecordForm collection={section} editing={editing} categories={records.categories} saving={saving} imageFile={imageFile} setImageFile={setImageFile} imageError={imageError} setImageError={setImageError} onClose={() => setEditing(null)} onSubmit={saveRecord} />}
        {records[section].length ? records[section].map((record) => <article className="admin-record" key={record.id}>{record.image ? <img src={record.image} alt="" /> : section === "colors" ? <span className="admin-record-color" style={{ backgroundColor: record.hex }} /> : <span className="admin-record-color admin-record-placeholder" />}<div><strong>{record.name ?? record.title}</strong><span>{record.published ? "Published" : "Draft"} · {record.category ?? record.code ?? record.shortName ?? record.finish}</span></div><button className="admin-publish-button" type="button" onClick={() => togglePublished(section, record)}>{record.published ? "Unpublish" : "Publish"}</button><button className="icon-button" type="button" aria-label={`Edit ${record.name ?? record.title}`} onClick={() => beginEdit(section, record)}><Pencil size={16} /></button><button className="icon-button danger-icon" type="button" aria-label={`Delete ${record.name ?? record.title}`} onClick={() => deleteRecord(section, record.id)}><Trash2 size={16} /></button></article>) : <div className="empty-state"><h2>No {section} yet</h2><p>Add your first {section.slice(0, -1)} to get started.</p></div>}
      </div>}
      {!loadingRecords && recordsLoaded && !loadError && section === "enquiries" && <div className="admin-list-panel"><div className="admin-panel-heading"><div><span>{count.enquiries} enquiries</span><p>Private to verified administrators.</p></div></div>{records.enquiries.length ? records.enquiries.map((item) => <article className="enquiry-record" key={item.id}><div className="enquiry-record-heading"><strong>{item.name}</strong><span>{new Date(item.created_at).toLocaleString()}</span></div>{item.receipt_number && <span className="interest-tag">Receipt {item.receipt_number}</span>}<div>{item.email && <span>{item.email}</span>}<span>{item.phone}</span>{item.city && <span>{item.city}</span>}</div>{item.interest && <span className="interest-tag">{item.interest}</span>}<p>{item.message}</p><div className="enquiry-actions"><span className={`enquiry-status ${item.status}`}>{item.status}</span><button className="admin-publish-button" type="button" onClick={() => updateEnquiryStatus(item.id, item.status !== "read")}>{item.status === "read" ? "Mark as new" : "Mark as read"}</button><button className="icon-button danger-icon" type="button" aria-label={`Delete enquiry from ${item.name}`} onClick={() => deleteRecord("enquiries", item.id)}><Trash2 size={16} /></button></div></article>) : <div className="empty-state"><Mail size={22} /><h2>No enquiries yet</h2><p>New customer enquiries will appear here.</p></div>}</div>}
      {!loadingRecords && recordsLoaded && !loadError && section === "settings" && <SettingsForm settings={settings} saving={saving} onSubmit={saveSettings} imageFile={imageFile} setImageFile={setImageFile} imageError={imageError} setImageError={setImageError} />}
    </section>
  </div></main>;
}

function RecordForm({ collection, editing, categories, saving, imageFile, setImageFile, imageError, setImageError, onClose, onSubmit }) {
  const record = editing.record;
  return <form key={`${collection}-${record.id ?? "new"}`} className="admin-edit-form" onSubmit={onSubmit}>
    <div className="admin-form-heading"><h2>{record.id ? "Edit" : "Add"} {collection.slice(0, -1)}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Close form"><X size={17} /></button></div>
    {definitions[collection].map((field) => <AdminField key={field.key} field={field} value={record[field.key]} categories={categories} setImageFile={setImageFile} setImageError={setImageError} />)}
    <label className="admin-checkbox"><input type="checkbox" name="published" defaultChecked={Boolean(record.published)} /> Published on public website</label>
    {imageFile && <span className="placeholder-label">Selected image: {imageFile.name}</span>}
    {imageError && <p className="form-error" role="alert">{imageError}</p>}
    <button className="button button-dark" type="submit" disabled={saving}>{saving ? "Saving…" : `Save ${collection.slice(0, -1)}`} <Save size={15} /></button>
  </form>;
}

function AdminField({ field, value, categories, setImageFile, setImageError }) {
  if (field.type === "category") return <label>{field.label}<select name={field.key} defaultValue={value || categories[0]?.id} required={field.required}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{!categories.length && <span className="form-error">Create a category before adding products.</span>}</label>;
  if (field.type === "select") return <label>{field.label}<select name={field.key} defaultValue={value}>{field.options.map((option) => <option key={option}>{option}</option>)}</select></label>;
  if (field.type === "textarea") return <label>{field.label}<textarea name={field.key} rows="4" defaultValue={value ?? ""} required={field.required} /></label>;
  if (field.type === "list") return <label>{field.label}<input name={field.key} defaultValue={Array.isArray(value) ? value.join(", ") : ""} placeholder={field.hint} /><span className="placeholder-label">{field.hint}</span></label>;
  if (field.type === "color") return <label>{field.label}<input name={field.key} type="color" defaultValue={value || "#F3F0E8"} /></label>;
  if (field.type === "image") return <div className="admin-image-field"><label>{field.label}{value && <img className="admin-image-preview" src={value} alt="Current image" />}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(event) => {
    const file = event.target.files?.[0] ?? null;
    if (file && (!file.type.startsWith("image/") || file.size > 8_000_000)) {
      setImageError(!file.type.startsWith("image/") ? "Choose a valid image file." : "Choose an image smaller than 8 MB.");
      event.target.value = "";
      setImageFile(null);
      return;
    }
    setImageError("");
    setImageFile(file);
  }} /></label><span className="placeholder-label">Image uploads to the public website-images bucket (8 MB maximum).</span></div>;
  return <label>{field.label}<input name={field.key} defaultValue={value ?? ""} required={field.required} /></label>;
}

function SettingsForm({ settings, saving, onSubmit, imageFile, setImageFile, imageError, setImageError }) {
  const [imageUrl, setImageUrl] = useState(settings.heroImage ?? "");
  return <form key={settings.companyName + settings.email} className="admin-settings-form" onSubmit={onSubmit}>
    <span className="eyebrow">PUBLIC WEBSITE INFORMATION</span><h2>Keep your details up to date.</h2><p>Saved site information appears on the public website.</p>
    {[["companyName","Company name"],["tagline","Tagline"],["phone","Phone"],["email","Email"],["address","Address"],["whatsapp","Business WhatsApp number (international format)"],["facebookUrl","Facebook URL"],["instagramUrl","Instagram URL"],["tiktokUrl","TikTok URL"],["hours","Business hours"],["yearsExperience","Years of experience"],["happyCustomers","Happy customers"],["productRange","Product range"],["citiesServed","Cities served"]].map(([key,label]) => <label key={key}>{label}<input name={key} type={key === "email" ? "email" : key === "whatsapp" ? "tel" : ["facebookUrl","instagramUrl","tiktokUrl"].includes(key) ? "url" : "text"} defaultValue={settings[key] ?? ""} placeholder={key === "whatsapp" ? "Include country code, e.g. +44 7700 900000" : ""} /></label>)}
    <input type="hidden" name="heroImage" value={settings.heroImage ?? ""} readOnly />
    <label>Website / hero image{imageUrl && <img className="admin-image-preview" src={imageUrl} alt="Current website image" />}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(event) => {
      const file = event.target.files?.[0] ?? null;
      if (file && (!file.type.startsWith("image/") || file.size > 8_000_000)) {
        setImageError(!file.type.startsWith("image/") ? "Choose a valid image file." : "Choose an image smaller than 8 MB.");
        event.target.value = "";
        setImageFile(null);
        return;
      }
      setImageError("");
      setImageFile(file);
      if (file) setImageUrl(URL.createObjectURL(file));
    }} /></label>
    {imageError && <p className="form-error" role="alert">{imageError}</p>}
    {imageFile && <span className="placeholder-label">Selected image: {imageFile.name}</span>}
    <button className="button button-dark" type="submit" disabled={saving}>{saving ? "Saving…" : "Save website settings"} <Save size={15} /></button>
  </form>;
}
