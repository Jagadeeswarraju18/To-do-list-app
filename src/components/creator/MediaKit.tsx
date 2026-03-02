"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Image as ImageIcon, Trash2, Loader2, Plus, TrendingUp, Users, Target, Zap } from "lucide-react";

export default function MediaKit({ userId }: { userId: string }) {
  const [images, setImages] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchMedia();
    fetchPlatforms();
  }, [userId]);

  const fetchPlatforms = async () => {
    const { data } = await supabase
      .from("creator_platforms")
      .select("*")
      .eq("creator_id", userId);
    if (data) setPlatforms(data);
  };

  const fetchMedia = async () => {
    const { data, error } = await supabase
      .from("creator_profiles")
      .select("media_kit")
      .eq("id", userId)
      .single();

    if (data?.media_kit) {
      setImages(data.media_kit);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('creator_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('creator_assets')
        .getPublicUrl(filePath);

      // 3. Update Profile
      const newImage = {
        id: Date.now().toString(),
        url: publicUrl,
        type: "image",
        caption: "Screenshot"
      };

      const newImages = [...images, newImage];

      const { error: updateError } = await supabase
        .from("creator_profiles")
        .update({ media_kit: newImages })
        .eq("id", userId);

      if (updateError) throw updateError;

      setImages(newImages);

    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Make sure the 'creator_assets' bucket exists and is public.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    const newImages = images.filter(img => img.id !== imageId);
    setImages(newImages);

    await supabase
      .from("creator_profiles")
      .update({ media_kit: newImages })
      .eq("id", userId);
  };

  if (loading) return <div>Loading media kit...</div>;

  const totalFollowers = platforms.reduce((acc, p) => acc + (p.follower_count || 0), 0);
  const expectedReach = Math.floor(totalFollowers * 0.1); // Estimate 10% reach

  return (
    <div className="space-y-8">
      {/* ROI Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Reach</span>
          </div>
          <div className="text-2xl font-black text-white italic">{totalFollowers.toLocaleString()}</div>
          <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Across all platforms</p>
        </div>

        <div className="glass-card p-5 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Exp. Impressions</span>
          </div>
          <div className="text-2xl font-black text-white italic">{expectedReach.toLocaleString()}+</div>
          <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Per campaign post</p>
        </div>

        <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lead Quality</span>
          </div>
          <div className="text-2xl font-black text-white italic">High-Intent</div>
          <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Niche-specific audience</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Media Kit</h2>
            <p className="text-sm text-muted-foreground">Showcase your best stats and past collaborations.</p>
          </div>
          <label className="cursor-pointer flex items-center gap-2 text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30 transition-all border border-primary/20">
            {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}
            <span>Upload Image</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/10">
              <img src={img.url} alt="Media Kit Asset" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-full border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground bg-white/5">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <p>No images uploaded yet.</p>
              <p className="text-xs">Upload screenshots of your analytics or past tweets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
