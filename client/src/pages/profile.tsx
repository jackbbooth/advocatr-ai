import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressBar from "@/components/progress-bar";
import { ArrowLeft, Trophy, Clock, Target } from "lucide-react";
import { useLocation } from "wouter";

interface Exercise {
  id: number;
  title: string;
  order: number;
}

interface Progress {
  exerciseId: number;
  completed: boolean;
  updatedAt: string;
}

export default function Profile() {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
    enabled: !!user,
  });

  const { data: progress } = useQuery<Progress[]>({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

  if (!user || !exercises || !progress) return null;

  const completedExercises = progress.filter((p) => p.completed);
  const completionPercentage = Math.round(
    (completedExercises.length / exercises.length) * 100
  );

  const stats = [
    {
      icon: Trophy,
      label: "Completed Exercises",
      value: `${completedExercises.length}/${exercises.length}`,
    },
    {
      icon: Target,
      label: "Overall Progress",
      value: `${completionPercentage}%`,
    },
    {
      icon: Clock,
      label: "Member Since",
      value: new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Username
                </label>
                <p className="text-lg">{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {stats.map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Icon className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="text-2xl font-semibold">{value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressBar value={completionPercentage} />
            
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold">Completed Exercises</h3>
              {completedExercises.length > 0 ? (
                <div className="space-y-2">
                  {completedExercises.map((p) => {
                    const exercise = exercises.find((e) => e.id === p.exerciseId);
                    return (
                      <div
                        key={p.exerciseId}
                        className="flex justify-between items-center p-4 bg-white rounded-lg border"
                      >
                        <span>{exercise?.title}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No exercises completed yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
