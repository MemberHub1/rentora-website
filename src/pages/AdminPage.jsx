import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  ArrowLeft,
  Building2,
  FileText,
  Globe2,
  ImagePlus,
  MapPin,
  Phone,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

const sections = [
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "articles", label: "Articles & Tips", icon: FileText },
  { id: "team", label: "Our Team", icon: Users },
  { id: "contact", label: "Contact Information", icon: Phone },
  { id: "website", label: "Website Content", icon: Globe2 },
];

const fieldDefinitions = {
  properties: [
    { key: "title", label: "Property Title", required: true },
    { key: "location", label: "Location", required: true },
    { key: "price", label: "Price", required: true },
    { key: "type", label: "Type", type: "select", options: ["Apartment", "House", "Plot", "Commercial"] },
    { key: "purpose", label: "Purpose", type: "select", options: ["For Rent", "For Sale"] },
    { key: "beds", label: "Bedrooms", type: "number" },
    { key: "baths", label: "Bathrooms", type: "number" },
    { key: "area", label: "Area" },
    { key: "description", label: "Description", type: "textarea", wide: true },
  ],
  locations: [
    { key: "title", label: "Location Name", required: true },
    { key: "shortDescription", label: "Short Description", type: "textarea", wide: true },
    { key: "propertyCount", label: "Property Count", type: "number" },
  ],
  articles: [
    { key: "title", label: "Article Title", required: true },
    { key: "shortDescription", label: "Short Description", type: "textarea", wide: true },
    { key: "content", label: "Full Content", type: "textarea", wide: true, rows: 8 },
    { key: "date", label: "Date", type: "date" },
    { key: "author", label: "Author" },
  ],
  team: [
    { key: "name", label: "Name", required: true },
    { key: "role", label: "Job Title / Designation", required: true },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "whatsapp", label: "WhatsApp", type: "tel" },
    { key: "email", label: "Email", type: "email" },
    { key: "bio", label: "Short Bio", type: "textarea", wide: true },
    { key: "facebookUrl", label: "Facebook URL", type: "url" },
    { key: "instagramUrl", label: "Instagram URL", type: "url" },
    { key: "linkedinUrl", label: "LinkedIn URL", type: "url" },
  ],
};

const contactFields = [
  { key: "phone", label: "Company Phone", type: "tel" },
  { key: "whatsapp", label: "WhatsApp Number", type: "tel" },
  { key: "email", label: "Email", type: "email" },
  { key: "address", label: "Office Address", type: "textarea", wide: true },
  { key: "mapsUrl", label: "Google Maps Link", type: "url", wide: true },
  { key: "businessHours", label: "Business Hours", type: "textarea", wide: true },
  { key: "facebookUrl", label: "Facebook URL", type: "url" },
  { key: "instagramUrl", label: "Instagram URL", type: "url" },
  { key: "tiktokUrl", label: "TikTok URL", type: "url" },
  { key: "youtubeUrl", label: "YouTube URL", type: "url" },
  { key: "whatsappUrl", label: "WhatsApp URL", type: "url", wide: true },
];

const websiteFields = [
  { key: "heroHeading", label: "Hero Heading", type: "textarea", wide: true },
  { key: "heroSubtitle", label: "Hero Subtitle", type: "textarea", wide: true },
  { key: "aboutHeading", label: "About Us Heading", type: "textarea", wide: true },
  { key: "aboutDescription", label: "About Us Description", type: "textarea", wide: true, rows: 6 },
  { key: "footerText", label: "Footer Text", type: "textarea", wide: true },
  { key: "tagline", label: "Company Tagline", wide: true },
];

const emptyRecords = {
  properties: { title: "", location: "", price: "", type: "Apartment", purpose: "For Rent", beds: 1, baths: 1, area: "", description: "", image: "", published: true },
  locations: { title: "", shortDescription: "", image: "", published: true },
  articles: { title: "", shortDescription: "", content: "", date: new Date().toISOString().slice(0, 10), author: "", image: "", published: true },
  team: { name: "", role: "", phone: "", whatsapp: "", email: "", bio: "", facebookUrl: "", instagramUrl: "", linkedinUrl: "", image: "", published: true },
};

const labels = {
  properties: "property",
  locations: "location",
  articles: "article",
  team: "team member",
};
const pluralLabels = { properties: "properties", locations: "locations", articles: "articles", team: "team members" };

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function AdminPage({ content, onChange, onBackHome }) {
  const [activeSection, setActiveSection] = useState("properties");
  const [form, setForm] = useState(emptyRecords.properties);
  const [editingId, setEditingId] = useState(null);
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const [notice, setNotice] = useState("");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authStatus, setAuthStatus] = useState("Checking admin access...");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [sessionUserEmail, setSessionUserEmail] = useState("");
  const [adminSessionChecked, setAdminSessionChecked] = useState(false);
  const imageInputRef = useRef(null);
  const isSupabaseReady = Boolean(supabase);
  const activeMeta = sections.find((section) => section.id === activeSection);
  const sectionItems = content[activeSection] ?? [];
  const isRecordSection = Boolean(emptyRecords[activeSection]);
  const fields = fieldDefinitions[activeSection] ?? [];
  const imagePreview = useMemo(() => form.image?.trim(), [form.image]);

  const verifyAdminAuthorization = async (userId) => {
    if (!userId || !supabase) return false;

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return Boolean(data);
  };

  useEffect(() => {
    let active = true;

    const syncAdminSession = async () => {
      if (!supabase) {
        if (!active) return;
        setIsAdminAuthenticated(false);
        setSessionUserEmail("");
        setAdminSessionChecked(true);
        setIsCheckingAuth(false);
        setAuthStatus("Supabase admin configuration is missing. Add the deployment env values to enable login.");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;

        if (session?.user) {
          const authorized = await verifyAdminAuthorization(session.user.id);
          setIsAdminAuthenticated(authorized);
          setSessionUserEmail(session.user.email ?? "");
          setAuthStatus(authorized ? "Authorized admin session active." : "This account is not registered in admin_users.");
        } else {
          setIsAdminAuthenticated(false);
          setSessionUserEmail("");
          setAuthStatus("Sign in with a RENTORA admin account.");
        }
      } catch (error) {
        console.error("Admin session verification failed.", error);
        if (!active) return;
        setIsAdminAuthenticated(false);
        setSessionUserEmail("");
        setAuthStatus("Unable to verify admin access right now.");
      } finally {
        if (active) {
          setAdminSessionChecked(true);
          setIsCheckingAuth(false);
        }
      }
    };

    syncAdminSession();

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;

      if (session?.user) {
        try {
          const authorized = await verifyAdminAuthorization(session.user.id);
          setIsAdminAuthenticated(authorized);
          setSessionUserEmail(session.user.email ?? "");
          setAuthStatus(authorized ? "Authorized admin session active." : "This account is not registered in admin_users.");
        } catch (error) {
          console.error("Auth state sync failed.", error);
          setIsAdminAuthenticated(false);
          setSessionUserEmail("");
          setAuthStatus("Unable to verify admin access right now.");
        }
      } else {
        setIsAdminAuthenticated(false);
        setSessionUserEmail("");
        setAuthStatus("Sign in with a RENTORA admin account.");
      }

      setAdminSessionChecked(true);
      setIsCheckingAuth(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInAdmin = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setAuthError("Supabase admin configuration is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployment environment.");
      setAuthStatus("Login unavailable.");
      return;
    }

    setAuthError("");
    setAuthStatus("Signing in...");

    const email = authForm.email.trim();
    const password = authForm.password;

    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      setAuthStatus("Sign in failed.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthError(error.message);
      setAuthStatus("Sign in failed.");
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setAuthError("No user session was returned. Please try again.");
      setAuthStatus("Sign in failed.");
      return;
    }

    try {
      const authorized = await verifyAdminAuthorization(userId);
      if (!authorized) {
        await supabase.auth.signOut();
        setIsAdminAuthenticated(false);
        setSessionUserEmail("");
        setAuthError("This account is not authorized as a RENTORA admin.");
        setAuthStatus("Account not authorized.");
        return;
      }

      setIsAdminAuthenticated(true);
      setSessionUserEmail(data.user.email ?? "");
      setAuthStatus("Authorized admin session active.");
      setAuthForm({ email: "", password: "" });
    } catch (error) {
      console.error("Admin authorization check failed.", error);
      await supabase.auth.signOut();
      setIsAdminAuthenticated(false);
      setSessionUserEmail("");
      setAuthError("Unable to verify admin access for this account.");
      setAuthStatus("Authorization check failed.");
    }
  };

  const signOutAdmin = async () => {
    if (!supabase) {
      setIsAdminAuthenticated(false);
      setSessionUserEmail("");
      setNotice("Supabase configuration is not available.");
      setAuthStatus("Signed out. Please configure the deployment env values.");
      setAuthError("");
      return;
    }

    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    setSessionUserEmail("");
    setNotice("You have been signed out.");
    setAuthStatus("Signed out. Please sign in to continue.");
    setAuthError("");
  };

  const selectSection = (sectionId) => {
    setActiveSection(sectionId);
    setEditingId(null);
    setForm(emptyRecords[sectionId] || content[sectionId] || {});
    setImageName("");
    setImageError("");
    setNotice("");
  };

  const startNewRecord = () => {
    setEditingId(null);
    setForm({ ...emptyRecords[activeSection], date: new Date().toISOString().slice(0, 10) });
    setImageName("");
    setImageError("");
  };

  const editRecord = (record) => {
    setEditingId(record.id);
    setForm({ ...emptyRecords[activeSection], ...record });
    setImageName("");
    setImageError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const validType = ["image/jpeg", "image/png", "image/webp"].includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!validType) {
      setImageError("Please select a JPG, JPEG, PNG or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be 5 MB or smaller.");
      return;
    }
    const optimizeImage = async () => {
      try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const optimizedImage = await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image compression failed.")), "image/webp", 0.78);
        });
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") {
            setImageError("This image could not be read. Please try another file.");
            return;
          }
          updateForm("image", reader.result);
          setImageName(file.name);
          setImageError("");
        };
        reader.onerror = () => setImageError("This image could not be read. Please try another file.");
        reader.readAsDataURL(optimizedImage);
      } catch {
        setImageError("This image could not be processed. Please try another file.");
      }
    };
    optimizeImage();
  };

  const saveRecord = (event) => {
    event.preventDefault();

    if (!isAdminAuthenticated) {
      setNotice("Admin property writes are disabled until a Supabase authenticated admin session is configured.");
      return;
    }

    if (activeSection === "properties" && !form.image) {
      setImageError("Please upload a property image before saving.");
      return;
    }
    const title = form.title || form.name;
    const id = editingId || `${activeSection}-${Date.now()}`;
    const record = {
      ...form,
      id,
      ...(activeSection === "articles" ? { slug: slugify(title), excerpt: form.shortDescription } : {}),
      ...(activeSection === "locations" ? { description: form.shortDescription } : {}),
      ...(activeSection === "properties" ? { beds: Number(form.beds) || 0, baths: Number(form.baths) || 0 } : {}),
    };
    const nextItems = editingId
      ? sectionItems.map((item) => item.id === editingId ? record : item)
      : [record, ...sectionItems];
    onChange({ ...content, [activeSection]: nextItems });
    setNotice(`${labels[activeSection]} ${editingId ? "updated" : "added"}.`);
    startNewRecord();
  };

  const deleteRecord = (id) => {
    if (!isAdminAuthenticated) {
      setNotice("Admin property writes are disabled until a Supabase authenticated admin session is configured.");
      return;
    }

    if (!window.confirm(`Delete this ${labels[activeSection]}?`)) return;
    onChange({ ...content, [activeSection]: sectionItems.filter((item) => item.id !== id) });
    if (editingId === id) startNewRecord();
  };

  const togglePublished = (record) => {
    if (!isAdminAuthenticated) {
      setNotice("Admin property writes are disabled until a Supabase authenticated admin session is configured.");
      return;
    }

    onChange({
      ...content,
      [activeSection]: sectionItems.map((item) => item.id === record.id ? { ...item, published: !item.published } : item),
    });
  };

  const saveSettings = (event) => {
    event.preventDefault();
    onChange({ ...content, [activeSection]: form });
    setNotice(`${activeMeta.label} saved.`);
  };

  const adminWriteStatus = adminSessionChecked
    ? isAdminAuthenticated
      ? "Authenticated admin access is available for CMS writes."
      : "Admin write operations are disabled because there is no authenticated Supabase admin session yet."
    : "Checking Supabase admin session status...";

  const renderFields = (definitions) => definitions.map((field) => (
    <label className={field.wide ? "admin-field-wide" : ""} key={field.key}>
      {field.label}
      {field.type === "textarea" ? (
        <textarea rows={field.rows || 4} value={form[field.key] ?? ""} onChange={(event) => updateForm(field.key, event.target.value)} required={field.required} />
      ) : field.type === "select" ? (
        <select value={form[field.key] ?? field.options[0]} onChange={(event) => updateForm(field.key, event.target.value)}>
          {field.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : (
        <input type={field.type || "text"} min={field.type === "number" ? "0" : undefined} value={form[field.key] ?? ""} onChange={(event) => updateForm(field.key, event.target.value)} required={field.required} />
      )}
    </label>
  ));

  if (isCheckingAuth || (!isAdminAuthenticated && !adminSessionChecked)) {
    return (
      <div className="site admin-page">
        <header className="header">
          <div className="container nav-container admin-nav">
            <button className="back-button" onClick={onBackHome}><ArrowLeft size={16} /> Back to Website</button>
            <button className="logo" onClick={onBackHome}><span className="logo-mark">R</span><span>RENT<span>ORA</span></span></button>
            <span className="admin-label">ADMIN ACCESS</span>
          </div>
        </header>
        <main className="admin-main">
          <div className="container">
            <section className="admin-settings-card">
              <div className="admin-card-heading"><div><h3>Checking admin access</h3><p>{authStatus}</p></div></div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="site admin-page">
        <header className="header">
          <div className="container nav-container admin-nav">
            <button className="back-button" onClick={onBackHome}><ArrowLeft size={16} /> Back to Website</button>
            <button className="logo" onClick={onBackHome}><span className="logo-mark">R</span><span>RENT<span>ORA</span></span></button>
            <span className="admin-label">ADMIN LOGIN</span>
          </div>
        </header>

        <main className="admin-main">
          <div className="container">
            <section className="admin-form-card" style={{ maxWidth: 520, margin: "2rem auto" }}>
              <div className="admin-card-heading">
                <div>
                  <h3>RENTORA Admin Login</h3>
                  <p>Sign in with the admin account registered in Supabase Auth and admin_users.</p>
                </div>
              </div>

              <form onSubmit={signInAdmin} className="admin-form">
                <label>
                  Email
                  <input type="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder="admin@rentora.com" required disabled={!isSupabaseReady} />
                </label>
                <label>
                  Password
                  <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder="Enter your password" required disabled={!isSupabaseReady} />
                </label>

                {authError && <p className="admin-notice" role="alert">{authError}</p>}
                <p className="admin-notice" role="status">{authStatus}</p>

                <button type="submit" className="gold-button admin-save" disabled={!isSupabaseReady}><Save size={18} /> Sign In</button>
              </form>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="site admin-page">
      <header className="header">
        <div className="container nav-container admin-nav">
          <button className="back-button" onClick={onBackHome}><ArrowLeft size={16} /> Back to Website</button>
          <button className="logo" onClick={onBackHome}><span className="logo-mark">R</span><span>RENT<span>ORA</span></span></button>
          <div className="admin-user-actions">
            <span className="admin-label">{sessionUserEmail || "ADMIN"}</span>
            <button className="gold-button admin-mobile-add" onClick={signOutAdmin}><X size={16} /> Sign Out</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="container">
          <div className="admin-heading">
            <div><span className="section-label">RENTORA MANAGEMENT</span><h1>Website CMS</h1><p>Manage your listings and the content visitors see across RENTORA.</p></div>
            {isRecordSection && <button className="gold-button" onClick={startNewRecord}><Plus size={18} /> Add {labels[activeSection]}</button>}
          </div>

          <div className="admin-shell">
            <aside className="admin-sidebar" aria-label="CMS sections">
              <span className="admin-sidebar-label">MANAGE WEBSITE</span>
              {sections.map(({ id, label, icon: Icon }) => (
                <button key={id} className={`admin-nav-item ${activeSection === id ? "active" : ""}`} onClick={() => selectSection(id)}>
                  <Icon size={18} /><span>{label}</span>{id in content && Array.isArray(content[id]) && <small>{content[id].length}</small>}
                </button>
              ))}
              <div className="admin-sidebar-note"><ShieldCheck size={17} /><span>Changes are saved in this browser.</span></div>
            </aside>

            <section className="admin-workspace">
              <div className="admin-workspace-heading">
                <div><span className="section-label">CONTENT</span><h2>{activeMeta.label}</h2><p>{isRecordSection ? `${sectionItems.length} ${pluralLabels[activeSection]} in your library` : "Edit the information shown on your website."}</p></div>
                {isRecordSection && <button className="gold-button admin-mobile-add" onClick={startNewRecord}><Plus size={17} /> Add</button>}
              </div>

              {notice && <p className="admin-notice" role="status">{notice}</p>}
              {activeSection === "properties" && <p className="admin-notice" role="status">{adminWriteStatus}</p>}

              {isRecordSection ? (
                <div className="admin-content-grid">
                  <section className="admin-form-card">
                    <div className="admin-card-heading">
                      <div><h3>{editingId ? `Edit ${labels[activeSection]}` : `Add ${labels[activeSection]}`}</h3><p>{editingId ? "Update this entry and save your changes." : "Add a new entry to your website."}</p></div>
                      {editingId && <button className="icon-button" onClick={startNewRecord} aria-label="Cancel edit"><X size={18} /></button>}
                    </div>
                    <form onSubmit={saveRecord} className="admin-form">
                      <div className="admin-fields-grid">{renderFields(fields)}</div>
                      <div className="admin-upload-field">
                        <span className="admin-upload-label">{activeSection === "team" ? "Profile Photo" : activeSection === "articles" ? "Article Image" : activeSection === "locations" ? "Location Image" : "Property Image"}</span>
                        <input ref={imageInputRef} className="admin-file-input" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={handleImageUpload} aria-label="Upload image" />
                        <button type="button" className="gold-button admin-upload-button" onClick={() => imageInputRef.current?.click()}><ImagePlus size={18} /> Upload Image</button>
                        <span className="admin-upload-hint">JPG, JPEG, PNG or WEBP, up to 5 MB</span>
                        {imageError && <span className="admin-image-error" role="alert">{imageError}</span>}
                      </div>
                      {imagePreview && <div className="admin-image-preview"><img src={imagePreview} alt="Selected image preview" /><div className="admin-image-details"><span><ImagePlus size={16} /> {imageName || "Current image"}</span><button type="button" className="admin-remove-image" onClick={() => { updateForm("image", ""); setImageName(""); setImageError(""); }}>Remove Image</button></div></div>}
                      <label className="admin-publish-toggle"><input type="checkbox" checked={Boolean(form.published)} onChange={(event) => updateForm("published", event.target.checked)} /><span>Published on website</span></label>
                      <button type="submit" className="gold-button admin-save" disabled={!isAdminAuthenticated && activeSection === "properties"} aria-disabled={!isAdminAuthenticated && activeSection === "properties"}><Save size={18} /> {editingId ? "Save Changes" : `Add ${labels[activeSection]}`}</button>
                    </form>
                  </section>

                  <section className="admin-list-card">
                    <div className="admin-card-heading"><div><h3>All {activeMeta.label}</h3><p>Choose an entry to update it or change its visibility.</p></div></div>
                    <div className="admin-record-list">
                      {sectionItems.length === 0 && <p className="admin-empty">No entries yet. Add your first {labels[activeSection]} to get started.</p>}
                      {sectionItems.map((record) => {
                        const recordTitle = record.title || record.name;
                        return <article className="admin-record-row" key={record.id}>
                          {record.image ? <img src={record.image} alt="" /> : <span className="admin-record-placeholder"><activeMeta.icon size={19} /></span>}
                          <div className="admin-record-info"><strong>{recordTitle}</strong><span>{record.location || record.role || record.shortDescription || record.price || record.author || "RENTORA content"}</span><small className={record.published ? "published" : "unpublished"}>{record.published ? "Published" : "Unpublished"}</small></div>
                          <div className="admin-record-actions"><button className="admin-text-action" onClick={() => togglePublished(record)} disabled={!isAdminAuthenticated && activeSection === "properties"} aria-disabled={!isAdminAuthenticated && activeSection === "properties"}>{record.published ? "Unpublish" : "Publish"}</button><button className="icon-button" onClick={() => editRecord(record)} aria-label={`Edit ${recordTitle}`}><Settings2 size={17} /></button><button className="icon-button danger" onClick={() => deleteRecord(record.id)} aria-label={`Delete ${recordTitle}`} disabled={!isAdminAuthenticated && activeSection === "properties"} aria-disabled={!isAdminAuthenticated && activeSection === "properties"}><Trash2 size={17} /></button></div>
                        </article>;
                      })}
                    </div>
                  </section>
                </div>
              ) : (
                <section className="admin-settings-card">
                  <div className="admin-card-heading"><div><h3>{activeMeta.label}</h3><p>These values are used throughout the public website.</p></div></div>
                  <form className="admin-form" onSubmit={saveSettings}>
                    <div className="admin-fields-grid">{renderFields(activeSection === "contact" ? contactFields : websiteFields)}</div>
                    <button className="gold-button admin-save" type="submit"><Save size={18} /> Save {activeMeta.label}</button>
                  </form>
                </section>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
/*
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Edit3, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";

const emptyProperty = {
  title: "",
  location: "",
  type: "Apartment",
  beds: 1,
  baths: 1,
  area: "",
  price: "",
  purpose: "For Rent",
  image: "",
};

function AdminPage({ properties, editingProperty, onEdit, onDelete, onSave, onBackHome }) {
  const [form, setForm] = useState(editingProperty || emptyProperty);
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const imageInputRef = useRef(null);
  const isEditing = Boolean(editingProperty?.id);

  useEffect(() => {
    setForm(editingProperty || emptyProperty);
    setImageName("");
    setImageError("");
  }, [editingProperty]);

  const imagePreview = useMemo(() => form.image?.trim(), [form.image]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setImageError("This image could not be read. Please try another file.");
        return;
      }
      update("image", reader.result);
      setImageName(file.name);
      setImageError("");
    };
    reader.onerror = () => setImageError("This image could not be read. Please try another file.");
    reader.readAsDataURL(file);
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.price.trim()) return;
    if (!form.image) {
      setImageError("Please upload a property image before publishing.");
      return;
    }
    onSave({
      ...form,
      id: form.id || `property-${Date.now()}`,
      title: form.title.trim(),
      location: form.location.trim(),
      price: form.price.trim(),
      area: form.area.trim(),
      image: form.image,
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
    });
    setForm(emptyProperty);
    setImageName("");
    setImageError("");
  };

  return (
    <div className="site admin-page">
      <header className="header">
        <div className="container nav-container admin-nav">
          <button className="back-button" onClick={onBackHome}>
            <ArrowLeft size={16} /> Back to Website
          </button>
          <button className="logo" onClick={onBackHome}>
            <span className="logo-mark">R</span>
            <span>RENT<span>ORA</span></span>
          </button>
          <span className="admin-label">ADMIN PANEL</span>
        </div>
      </header>

      <main className="admin-main">
        <div className="container">
          <div className="admin-heading">
            <div>
              <span className="section-label">RENTORA MANAGEMENT</span>
              <h1>Property Dashboard</h1>
              <p>Add, edit or remove property listings. Changes are saved in this browser for now.</p>
            </div>
            <button className="gold-button" onClick={() => setForm(emptyProperty)}>
              <Plus size={18} /> Add Property
            </button>
          </div>

          <div className="admin-grid">
            <section className="admin-form-card">
              <div className="admin-card-heading">
                <div>
                  <h2>{isEditing ? "Edit Property" : "Add Property"}</h2>
                  <p>{isEditing ? "Update the listing details." : "Create a new listing for RENTORA."}</p>
                </div>
                {isEditing && <button className="icon-button" onClick={() => onEdit(null)} aria-label="Cancel edit"><X size={18} /></button>}
              </div>

              <form onSubmit={submit} className="admin-form">
                <label>Property Title<input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Luxury Modern Apartment" required /></label>
                <label>Location<input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="DHA Lahore" required /></label>
                <div className="admin-form-row">
                  <label>Type<select value={form.type} onChange={(e) => update("type", e.target.value)}><option>Apartment</option><option>House</option><option>Plot</option><option>Commercial</option></select></label>
                  <label>Purpose<select value={form.purpose} onChange={(e) => update("purpose", e.target.value)}><option>For Rent</option><option>For Sale</option></select></label>
                </div>
                <div className="admin-form-row three">
                  <label>Bedrooms<input type="number" min="0" value={form.beds} onChange={(e) => update("beds", e.target.value)} /></label>
                  <label>Bathrooms<input type="number" min="0" value={form.baths} onChange={(e) => update("baths", e.target.value)} /></label>
                  <label>Area<input value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="1,250 sq ft" /></label>
                </div>
                <label>Price<input value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="Rs. 85,000" required /></label>
                <div className="admin-upload-field">
                  <span className="admin-upload-label">Property Image</span>
                  <input
                    ref={imageInputRef}
                    className="admin-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={handleImageUpload}
                    aria-label="Upload property image"
                  />
                  <button type="button" className="gold-button admin-upload-button" onClick={() => imageInputRef.current?.click()}>
                    <ImagePlus size={18} /> Upload Property Image
                  </button>
                  <span className="admin-upload-hint">JPG, JPEG, PNG or WEBP, up to 5 MB</span>
                  {imageError && <span className="admin-image-error" role="alert">{imageError}</span>}
                </div>
                {imagePreview && (
                  <div className="admin-image-preview">
                    <img src={imagePreview} alt="Selected property preview" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <div className="admin-image-details">
                      <span><ImagePlus size={16} /> {imageName || "Current property image"}</span>
                      <button type="button" className="admin-remove-image" onClick={() => { update("image", ""); setImageName(""); setImageError(""); }}>Remove Image</button>
                    </div>
                  </div>
                )}
                <button type="submit" className="gold-button admin-save"><Save size={18} /> {isEditing ? "Update Property" : "Publish Property"}</button>
              </form>
            </section>

            <section className="admin-list-card">
              <div className="admin-card-heading">
                <div><h2>Properties</h2><p>{properties.length} listing{properties.length === 1 ? "" : "s"} in the current catalog.</p></div>
              </div>
              <div className="admin-property-list">
                {properties.map((property) => (
                  <article className="admin-property-row" key={property.id || property.title}>
                    <img src={property.image} alt="" />
                    <div className="admin-property-info"><strong>{property.title}</strong><span>{property.location} · {property.price}</span><small>{property.type} · {property.purpose}</small></div>
                    <div className="admin-property-actions">
                      <button className="icon-button" onClick={() => onEdit(property)} aria-label={`Edit ${property.title}`}><Edit3 size={17} /></button>
                      <button className="icon-button danger" onClick={() => onDelete(property.id)} aria-label={`Delete ${property.title}`}><Trash2 size={17} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
*/
