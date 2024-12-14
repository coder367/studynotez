import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  university: string;
  created_at: string;
  file_type?: string;
  file_url?: string;
}

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", searchQuery, selectedSubject, selectedUniversity],
    queryFn: async () => {
      let query = supabase.from("notes").select("*");

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }
      if (selectedSubject) {
        query = query.eq("subject", selectedSubject);
      }
      if (selectedUniversity) {
        query = query.eq("university", selectedUniversity);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("subject")
        .not("subject", "is", null);
      return [...new Set(data?.map(note => note.subject))];
    },
  });

  const { data: universities = [] } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("university")
        .not("university", "is", null);
      return [...new Set(data?.map(note => note.university))];
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select university" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All universities</SelectItem>
            {universities.map((university) => (
              <SelectItem key={university} value={university}>
                {university}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">{note.title}</h3>
                  {note.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {note.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {note.subject && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {note.subject}
                      </span>
                    )}
                    {note.university && (
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                        {note.university}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                  {note.file_url && (
                    <a
                      href={note.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      View Note
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          No notes found. Try adjusting your filters or search query.
        </div>
      )}
    </div>
  );
};

export default Notes;