import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import VideoPlayer from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Check } from "lucide-react";

interface Exercise {
  id: number;
  title: string;
  description: string;
  demoVideoUrl: string;
}

interface Progress {
  videoUrl: string | null;
  completed: boolean;
}

export default function Exercise() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: exercise } = useQuery<Exercise>({
    queryKey: [`/api/exercises/${id}`],
  });

  const { data: progress } = useQuery<Progress>({
    queryKey: [`/api/progress/${id}`],
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // In a real app, implement video upload to a service like S3
      const videoUrl = "https://example.com/video.mp4";
      const response = await fetch(`/api/progress/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, completed: true }),
      });
      if (!response.ok) throw new Error("Failed to update progress");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Progress updated successfully" });
    },
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append("video", e.target.files[0]);
    mutation.mutate(formData);
  };

  if (!exercise) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-6">{exercise.title}</h1>
        <p className="text-gray-600 mb-8">{exercise.description}</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Expert Demonstration</h2>
            <VideoPlayer url={exercise.demoVideoUrl} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Your Submission</h2>
            {progress?.videoUrl ? (
              <VideoPlayer url={progress.videoUrl} />
            ) : (
              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                  onChange={handleUpload}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer block"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload your video
                  </p>
                </label>
              </div>
            )}
          </div>
        </div>

        {progress?.completed && (
          <div className="mt-8 flex items-center text-green-600">
            <Check className="mr-2 h-5 w-5" />
            Exercise completed
          </div>
        )}
      </div>
    </div>
  );
}
