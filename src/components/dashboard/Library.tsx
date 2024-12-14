import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Note {
  id: string;
  title: string;
  created_at: string;
  file_type?: string;
}

const Library = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, created_at, file_type")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotes(data);
      }
    };

    fetchNotes();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Library</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{note.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Your library is empty</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Library;