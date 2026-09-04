"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Loader2 } from "lucide-react";

export default function NewLessonPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !topic) return;

    setLoading(true);

    try {
      if (file) {
        // Handle File Upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        if (data.success) {
          router.push(`/lesson/demo`); // Redirecting to demo for MVP
        }
      } else if (topic) {
        // Handle just topic
        router.push(`/lesson/demo`); // Redirecting to demo for MVP
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create a New Lesson</CardTitle>
          <CardDescription>Upload a textbook, PDF, or enter a topic to learn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 border-2 border-dashed border-zinc-800 rounded-lg p-12 text-center hover:bg-zinc-900/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".pdf,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <UploadCloud className="w-10 h-10 mx-auto text-zinc-500 mb-4" />
              {file ? (
                <p className="text-sm font-medium text-blue-500">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-zinc-500">PDF, TXT up to 10MB</p>
                </>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-2 text-zinc-500">Or learn a topic</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input 
                id="topic" 
                placeholder="e.g. Advanced Quantum Mechanics" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || (!file && !topic)}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? "Generating Lesson..." : "Start Learning"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
