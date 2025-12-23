import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Globe, MessageSquareText, Loader2 } from "lucide-react";
import { CreateTaskInput } from "@/app/types/Tasks";

interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => void;
  isSubmitting?: boolean;
}

export function TaskForm({ onSubmit, isSubmitting = false }: TaskFormProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!websiteUrl.trim() || !question.trim()) return;

    // Add https:// if not present
    let url = websiteUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    onSubmit({ websiteUrl: url, question: question.trim() });
    setWebsiteUrl("");
    setQuestion("");
  };

  return (
    <Card className="border-gray-800/50 bg-gray-900/30 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-white">
          <Globe className="h-5 w-5 text-teal-400" />
          New Analysis Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm text-gray-400">
              Website URL
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="url"
                type="text"
                placeholder="example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="pl-10 bg-black/30 border-gray-800/50 text-white placeholder:text-gray-600 focus:border-teal-500/50 focus:ring-teal-500/20"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm text-gray-400">
              Your Question
            </Label>
            <div className="relative">
              <MessageSquareText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Textarea
                id="question"
                placeholder="What would you like to know about this website?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="pl-10 min-h-[100px] bg-black/30 border-gray-800/50 text-white placeholder:text-gray-600 resize-none focus:border-teal-500/50 focus:ring-teal-500/20"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="cursor-pointer w-full bg-teal-500 hover:bg-teal-600 text-black font-medium shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all"
            disabled={isSubmitting || !websiteUrl.trim() || !question.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Queueing...
              </>
            ) : (
              "Analyze Website"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
