import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import HomePage from "./pages/HomePage";
import { ColorDetailPage, ColorsPage, ProductDetailPage, ProductsPage } from "./pages/CatalogPages";
import { AboutPage, CalculatorPage, ContactPage, PolicyPage } from "./pages/UtilityPages";
import AdminPage from "./pages/AdminPage";
import { Seo } from "./components/SiteLayout";
import { Button } from "./components/UI";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return <main className="not-found container"><Seo title="Page not found" description="The page you were looking for could not be found." /><span className="eyebrow">A LITTLE OFF THE MAP</span><h1>Looks like this color hasn’t been mixed yet.</h1><p>The page may have moved. Let’s take you back to a good place.</p><Button to="/">Back to home</Button></main>;
}

export default function App() {
  return <BrowserRouter><ScrollToTop /><Routes><Route element={<SiteLayout />}>
    <Route index element={<HomePage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="products/:id" element={<ProductDetailPage />} />
    <Route path="colors" element={<ColorsPage />} />
    <Route path="colors/:id" element={<ColorDetailPage />} />
    <Route path="calculator" element={<CalculatorPage />} />
    <Route path="about" element={<AboutPage />} />
    <Route path="contact" element={<ContactPage />} />
    <Route path="admin" element={<AdminPage />} />
    <Route path="privacy-policy" element={<PolicyPage />} />
    <Route path="terms" element={<PolicyPage terms />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes></BrowserRouter>;
}
