import React, { useMemo, useRef, useState } from "react";

// @ts-ignore: no declaration file for AuthContext.jsx
import { useAuthContext } from '../context/AuthContext.jsx';
import toast from "react-hot-toast";
import api from '../config/api.jsx';
import { useNavigate } from "react-router-dom";

type AspectRatio = "16:9" | "1:1" | "9:16";
type ThumbnailStyle = "Minimalist" | "Bold" | "Modern" | "Neon" | "Cinematic";
type ModelTier = "Premium" | "Standard";

type ColorScheme = {
  id: string;
  name: string;
  // Tailwind classes for the swatch (just for UI)
  a: string;
  b: string;
  c: string;
};

const COLOR_SCHEMES: ColorScheme[] = [
  { id: "coral-teal", name: "Coral / Teal", a: "bg-rose-500", b: "bg-cyan-400", c: "bg-amber-300" },
  { id: "orange-magenta", name: "Orange / Magenta", a: "bg-orange-500", b: "bg-fuchsia-500", c: "bg-red-500" },
  { id: "blue-ice", name: "Blue / Ice", a: "bg-sky-500", b: "bg-cyan-300", c: "bg-blue-700" },
  { id: "green-mint", name: "Green / Mint", a: "bg-emerald-600", b: "bg-lime-300", c: "bg-teal-400" },
  { id: "purple-pink", name: "Purple / Pink", a: "bg-violet-600", b: "bg-purple-400", c: "bg-pink-400" },
  { id: "mono", name: "Mono", a: "bg-zinc-800", b: "bg-zinc-500", c: "bg-zinc-300" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function aspectClass(ar: AspectRatio) {
  // Tailwind aspect-ratio plugin recommended; fallback uses inline style below.
  if (ar === "16:9") return "aspect-video";
  if (ar === "1:1") return "aspect-square";
  return "aspect-[9/16]";
}

export default function Generate() {
  const [title, setTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [thumbStyle, setThumbStyle] = useState<ThumbnailStyle>("Minimalist");
  const [schemeId, setSchemeId] = useState(COLOR_SCHEMES[0].id);
  const [model, setModel] = useState<ModelTier>("Premium");
  const [additionalPrompts, setAdditionalPrompts] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading,setIsLoading] = useState(false)
  const [isGenerated,setIsGenerated]=useState(false)

  const {isLoggedIn} = useAuthContext()
  const navigate= useNavigate()

  const fileRef = useRef<HTMLInputElement | null>(null);

  const selectedScheme = useMemo(
    () => COLOR_SCHEMES.find((s) => s.id === schemeId) ?? COLOR_SCHEMES[0],
    [schemeId]
  );

  function onPickPhoto() {
    fileRef.current?.click();
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }

    async function downloadThumbnail() {
        if (!photoUrl) {
          toast.error("No thumbnail to download");
          return;
        }

        try {
          const response = await fetch(photoUrl, { mode: "cors" });
          const blob = await response.blob();

          const blobUrl = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = blobUrl;

          const safeTitle = (title || "thumbnail")
            .replace(/[^\w\-]+/g, "_")
            .slice(0, 60);

          a.download = `${safeTitle}_${aspectRatio}.png`;

          document.body.appendChild(a);
          a.click();
          a.remove();

          URL.revokeObjectURL(blobUrl);
          toast.success("Downloaded successfully");
          setIsGenerated(false);
        } catch (err) {
          console.error(err);
          toast.error("Download failed (CORS restriction)");
        }
      }



   async function onGenerate() {
    if(!isLoggedIn) return toast.error('please login to generate thumbnail');
    // Frontend-only placeholder (hook this to your API later)
    const payload = {
      title,
      aspectRatio,
      style: thumbStyle,
      colorScheme: schemeId,
      userPrompt: additionalPrompts,
      description: ""
    };

    try {
      setIsLoading(true);
      const { data } = await api.post('/api/thumbnail/generate', payload);
      setIsGenerated(true);
      setPhotoUrl(data?.thumbnail?.imageUrl ?? null);
      toast.success(data?.message ?? "Generated");
    }catch (e) {
      console.error(e);
      // toast.error(e.message)
      // toast.error("failed");
      toast.error("failed")
    } finally {
      setIsLoading(false);
      
    }

    // eslint-disable-next-line no-console
    // console.log("Generate thumbnail payload:", payload);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute top-48 left-24 h-[420px] w-[420px] rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute top-64 right-24 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/75 to-black" />
      </div>

      {/* Top nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <span className="text-lg font-bold">△</span>
          </div>
          <div className="text-xl font-semibold tracking-tight">
            Thumbnail<span className="text-fuchsia-400">go</span>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a className="hover:text-white" href="#">
            Home
          </a>
          <button className="inline-flex items-center gap-2 hover:text-white">
            Generate <span className="text-white/40">▾</span>
          </button>
          <a className="hover:text-white" href="#">
            My Generations
          </a>
          <a className="hover:text-white" href="#">
            Community
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="hidden rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10 md:inline-flex"
            type="button"
          >
            Sign in
          </button>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/10">
            <span className="text-sm font-semibold">L</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-10 md:grid-cols-2">
        {/* Left panel */}
        <section className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
          <h1 className="text-2xl font-semibold">Create Your Thumbnail</h1>
          <p className="mt-1 text-sm text-white/60">
            Describe your vision and let AI bring it to life
          </p>

          {/* Title */}
          <div className="mt-6">
            <label className="text-sm font-medium text-white/85">Title or Topic</label>
            <div className="mt-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                placeholder="e.g., 10 Tips for Better Sleep"
                className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
              />
              <div className="mt-1 flex justify-end text-xs text-white/40">
                {title.length}/100
              </div>
            </div>
          </div>

          {/* Aspect ratio */}
          <div className="mt-5">
            <label className="text-sm font-medium text-white/85">Aspect Ratio</label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {(["16:9", "1:1", "9:16"] as AspectRatio[]).map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setAspectRatio(ar)}
                  className={cn(
                    "rounded-2xl bg-black/30 px-4 py-3 text-sm ring-1 ring-white/10 transition",
                    aspectRatio === ar
                      ? "bg-white/10 ring-2 ring-fuchsia-400/50"
                      : "hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={cn(
                        "inline-block rounded-md bg-white/10 ring-1 ring-white/10",
                        ar === "16:9" && "h-4 w-7",
                        ar === "1:1" && "h-5 w-5",
                        ar === "9:16" && "h-6 w-4"
                      )}
                    />
                    <span className="font-medium">{ar}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="mt-5">
            <label className="text-sm font-medium text-white/85">Thumbnail Style</label>
            <div className="mt-2">
              <select
                value={thumbStyle}
                onChange={(e) => setThumbStyle(e.target.value as ThumbnailStyle)}
                className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
              >
                {(["Minimalist", "Bold", "Modern", "Neon", "Cinematic"] as ThumbnailStyle[]).map(
                  (s) => (
                    <option key={s} value={s} className="bg-zinc-900">
                      {s}
                    </option>
                  )
                )}
              </select>
              <p className="mt-2 text-xs text-white/45">
                {thumbStyle === "Minimalist" && "Clean, simple, lots of white space"}
                {thumbStyle === "Bold" && "High contrast, big text, strong accents"}
                {thumbStyle === "Modern" && "Fresh gradients, geometric shapes"}
                {thumbStyle === "Neon" && "Glowy edges, vibrant neon palette"}
                {thumbStyle === "Cinematic" && "Dramatic lighting and mood"}
              </p>
            </div>
          </div>

          {/* Color scheme */}
          <div className="mt-5">
            <label className="text-sm font-medium text-white/85">Color Scheme</label>
            <div className="mt-3 flex flex-wrap gap-3">
              {COLOR_SCHEMES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSchemeId(s.id)}
                  className={cn(
                    "relative rounded-2xl p-[3px] ring-1 ring-white/10 transition hover:bg-white/5",
                    schemeId === s.id && "ring-2 ring-fuchsia-400/50"
                  )}
                  aria-label={s.name}
                  title={s.name}
                >
                  <div className="flex h-12 w-16 overflow-hidden rounded-xl bg-black/30">
                    <div className={cn("w-1/3", s.a)} />
                    <div className={cn("w-1/3", s.b)} />
                    <div className={cn("w-1/3", s.c)} />
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/45">
              Selected: <span className="text-white/70">{selectedScheme.name}</span>
            </p>
          </div>

          {/* Model */}
          <div className="mt-5">
            <label className="text-sm font-medium text-white/85">Model</label>
            <div className="mt-2">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as ModelTier)}
                className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
              >
                <option value="Premium" className="bg-zinc-900">
                  Premium (10 credits)
                </option>
                <option value="Standard" className="bg-zinc-900">
                  Standard (5 credits)
                </option>
              </select>
            </div>
          </div>

          {/* User photo */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/85">User Photo</label>
              <span className="text-xs text-white/40">(optional)</span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                {photoUrl ? (
                  // preview circle
                  <img
                    src={photoUrl}
                    alt="User"
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-white/60">👤</span>
                )}
              </div>

              <button
                type="button"
                onClick={onPickPhoto}
                className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white ring-1 ring-white/10 hover:bg-white/15"
              >
                Upload Photo
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPhotoChange}
              />

              {photoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(photoUrl);
                    setPhotoUrl(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="ml-auto text-xs text-white/50 hover:text-white"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Additional prompts */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/85">Additional Prompts</label>
              <span className="text-xs text-white/40">(optional)</span>
            </div>
            <textarea
              value={additionalPrompts}
              onChange={(e) => setAdditionalPrompts(e.target.value)}
              placeholder="Add any specific elements, mood, or style preferences..."
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
            />
          </div>

          {/* Generate button */}

          
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:opacity-95 active:opacity-90"
          >

          {isLoading?"Generating..." : "Generate Thumbnail" }

          </button>
        </section>

        {/* Right panel / preview */}
        <section className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
          <h2 className="text-xl font-semibold">Preview</h2>

          <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4">
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10",
                aspectClass(aspectRatio)
              )}
              // If you don't have Tailwind aspect-ratio plugin, uncomment the style below and remove aspectClass usage.
              // style={aspectRatio === "16:9" ? { aspectRatio: "16 / 9" } : aspectRatio === "1:1" ? { aspectRatio: "1 / 1" } : { aspectRatio: "9 / 16" }}
            >
              {/* simple fake thumbnail preview UI */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 opacity-40">
                  <div className={cn("absolute -left-10 top-6 h-40 w-40 rounded-full blur-3xl", selectedScheme.a)} />
                  <div className={cn("absolute right-4 top-10 h-44 w-44 rounded-full blur-3xl", selectedScheme.b)} />
                  <div className={cn("absolute left-20 bottom-6 h-44 w-44 rounded-full blur-3xl", selectedScheme.c)} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/70" />
              </div>

              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="User"
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
              ) : null}



             {isGenerated ? <div></div> : <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <span className="text-2xl"></span>
                </div>
                <p className="mt-4 text-sm font-medium text-white/85">
                  {title.trim() ? title.trim() : "Generate your first thumbnail"}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Fill out the form and click Generate
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/55">
                  <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                    {model}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                    {aspectRatio}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                    {thumbStyle}
                  </span>
                </div>
              </div>
              } 
            
            </div>



            {/* Small helper line under preview */}
            {/* <div className="mt-3 text-xs text-white/45">
              Here is your mindo blowing thumbnail, download to use it 
            </div> */}

            <button
                type="button"
                onClick={downloadThumbnail}
                disabled={!photoUrl}
                className={cn(
                  "mt-4 w-full rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/10",
                  photoUrl ? "hover:bg-white/15" : "opacity-40 cursor-not-allowed"
                )}
              >
                Download Your Thumbnail
              </button>

          </div>
        </section>
      </main>
    </div>
  );
}
