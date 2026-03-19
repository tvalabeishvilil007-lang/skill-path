import { useAuth } from "@/contexts/AuthContext";
import { useTier } from "@/contexts/TierContext";
import AccessRestricted from "@/components/AccessRestricted";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { useCourses, useCategories } from "@/hooks/useCourses";
import { mockCourses, categories as mockCategories } from "@/data/mockCourses";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORY_REQUIRED_TIER, canAccess, TIER_CONFIG } from "@/lib/tiers";

const Catalog = () => {
  const { user, loading } = useAuth();
  const { tier } = useTier();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все");
  const { data: dbCourses, isLoading } = useCourses();
  const { data: dbCategories } = useCategories();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <AccessRestricted />;

  const categories = dbCategories ? ["Все", ...dbCategories.map((c) => c.name)] : mockCategories;

  const courses = dbCourses && dbCourses.length > 0
    ? dbCourses.map((c) => ({
        id: c.id, title: c.title, slug: c.slug,
        shortDescription: c.short_description || "",
        category: (c.categories as any)?.name || "",
        price: Number(c.price), oldPrice: c.old_price ? Number(c.old_price) : null,
        duration: c.duration || "", lessonsCount: 0, modulesCount: 0,
        level: c.level || "", coverUrl: c.cover_url || "", isFeatured: c.is_featured,
      }))
    : mockCourses;

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "Все" || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="hero-gradient py-12">
          <div className="container space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Библиотека материалов</h1>
            <p className="text-muted-foreground">
              Доступно {tier.categoriesOpen} из {tier.totalCategories} категорий на тарифе{" "}
              <Badge className={TIER_CONFIG[tier.level].badgeCls + " text-xs"}>{tier.name}</Badge>
            </p>
          </div>
        </section>

        <div className="container py-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Поиск материалов..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => {
                const catTier = CATEGORY_REQUIRED_TIER[cat];
                const catLocked = catTier && !canAccess(tier.level, catTier);
                return (
                  <Badge
                    key={cat}
                    variant={activeCategory === cat ? "default" : "secondary"}
                    className={`cursor-pointer ${catLocked ? "opacity-60" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {catLocked && <Lock className="h-3 w-3 mr-1" />}
                    {cat}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Upsell banner */}
          {tier.level !== "premium" && (
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="font-medium text-sm">Откройте больше материалов</p>
                  <p className="text-xs text-muted-foreground">Улучшите тариф, чтобы получить доступ ко всем категориям и программам</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/pricing" className="gap-1.5 shrink-0">Улучшить тариф <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Материалы не найдены</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course as any} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
