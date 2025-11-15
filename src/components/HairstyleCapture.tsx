import { useState, useRef } from "react";
import { Camera, Upload, Loader2, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PRESET_HAIRSTYLES = [
  "short bob haircut",
  "long wavy hair",
  "pixie cut",
  "shoulder-length layers",
  "buzz cut",
  "afro",
  "sleek ponytail",
  "messy bun",
];

const HAIR_COLORS = [
  { name: "Blonde", value: "blonde" },
  { name: "Brunette", value: "brunette" },
  { name: "Black", value: "black" },
  { name: "Red", value: "red" },
  { name: "Auburn", value: "auburn" },
  { name: "Platinum", value: "platinum blonde" },
  { name: "Pink", value: "pink" },
  { name: "Blue", value: "blue" },
];

export const HairstyleCapture = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [hairstylePrompt, setHairstylePrompt] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyHairstyle = async (customPrompt?: string) => {
    const prompt = customPrompt || hairstylePrompt;
    if (!selectedImage || !prompt.trim()) {
      toast.error("Please upload an image and describe the hairstyle");
      return;
    }

    setIsProcessing(true);
    try {
      const fullPrompt = selectedColor 
        ? `${prompt} with ${selectedColor} hair color`
        : prompt;
      
      const { data, error } = await supabase.functions.invoke("apply-hairstyle", {
        body: {
          imageUrl: selectedImage,
          hairstyleDescription: fullPrompt,
        },
      });

      if (error) throw error;

      if (data?.image) {
        setProcessedImage(data.image);
        toast.success("Hairstyle applied!");
      }
    } catch (error: any) {
      console.error("Error applying hairstyle:", error);
      toast.error(error.message || "Failed to apply hairstyle");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetClick = (preset: string) => {
    setHairstylePrompt(preset);
    handleApplyHairstyle(preset);
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `hairstyle-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const handleShare = async (platform: string) => {
    if (!processedImage) return;

    const shareData = {
      title: "My New Hairstyle",
      text: "Check out my new hairstyle from AI Hairstyle Try-On!",
    };

    if (platform === "native" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      const text = encodeURIComponent(shareData.text);
      let url = "";
      
      switch (platform) {
        case "twitter":
          url = `https://twitter.com/intent/tweet?text=${text}`;
          break;
        case "facebook":
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
          break;
        case "whatsapp":
          url = `https://wa.me/?text=${text}`;
          break;
      }
      
      if (url) window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
            AI Hairstyle Try-On
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your photo and try different hairstyles with AI
          </p>
        </div>

        {!selectedImage ? (
          <Card className="p-8 shadow-medium">
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-w-sm space-y-4">
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full h-14 text-lg"
                  size="lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Take Photo
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-14 text-lg"
                  size="lg"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Photo
                </Button>
              </div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 shadow-medium">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Original</h3>
                  <img
                    src={selectedImage}
                    alt="Original"
                    className="w-full rounded-lg border-2 border-border"
                  />
                </div>
                {processedImage && (
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">With New Hairstyle</h3>
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-full rounded-lg border-2 border-primary shadow-soft"
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 shadow-medium">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Quick Presets
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_HAIRSTYLES.map((preset) => (
                      <Badge
                        key={preset}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
                        onClick={() => handlePresetClick(preset)}
                      >
                        {preset}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Hair Color (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((color) => (
                      <Badge
                        key={color.value}
                        variant={selectedColor === color.value ? "default" : "outline"}
                        className="cursor-pointer transition-colors px-3 py-1"
                        onClick={() => setSelectedColor(selectedColor === color.value ? "" : color.value)}
                      >
                        {color.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Custom Description
                  </label>
                  <Input
                    placeholder="e.g., shoulder-length with bangs..."
                    value={hairstylePrompt}
                    onChange={(e) => setHairstylePrompt(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApplyHairstyle()}
                    disabled={isProcessing}
                    className="flex-1 h-12"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      "Apply Hairstyle"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedImage(null);
                      setProcessedImage(null);
                      setHairstylePrompt("");
                      setSelectedColor("");
                    }}
                    variant="outline"
                    className="h-12"
                  >
                    Start Over
                  </Button>
                </div>

                {processedImage && (
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full h-12"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Image
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleShare("native")}
                        variant="outline"
                        className="flex-1 h-10"
                        size="sm"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                      <Button
                        onClick={() => handleShare("twitter")}
                        variant="outline"
                        className="flex-1 h-10"
                        size="sm"
                      >
                        Twitter
                      </Button>
                      <Button
                        onClick={() => handleShare("facebook")}
                        variant="outline"
                        className="flex-1 h-10"
                        size="sm"
                      >
                        Facebook
                      </Button>
                      <Button
                        onClick={() => handleShare("whatsapp")}
                        variant="outline"
                        className="flex-1 h-10"
                        size="sm"
                      >
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
