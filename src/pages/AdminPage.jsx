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
