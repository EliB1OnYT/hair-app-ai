import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const HairstyleCapture = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [hairstylePrompt, setHairstylePrompt] = useState("");
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

  const handleApplyHairstyle = async () => {
    if (!selectedImage || !hairstylePrompt.trim()) {
      toast.error("Please upload an image and describe the hairstyle");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("apply-hairstyle", {
        body: {
          imageUrl: selectedImage,
          hairstyleDescription: hairstylePrompt,
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
                    Describe the hairstyle you want
                  </label>
                  <Input
                    placeholder="e.g., short bob haircut, long wavy hair, buzz cut..."
                    value={hairstylePrompt}
                    onChange={(e) => setHairstylePrompt(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleApplyHairstyle}
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
                    }}
                    variant="outline"
                    className="h-12"
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
