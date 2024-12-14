import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface RecentNote {
  notes: {
    id: string;
    title: string;
  };
  created_at: string;
}

const RecentNotes = () => {
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);

  useEffect(() => {
    const fetchRecentNotes = async () => {
      const { data, error } = await supabase
        .from("note_activities")
        .select(`
          created_at,
          notes:note_id (
            id,
            title
          )
        `)
        .eq("activity_type", "view")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentNotes(data);
      }
    };

    fetchRecentNotes();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {recentNotes.length > 0 ? (
              recentNotes.map((activity) => (
                <div
                  key={`${activity.notes.id}-${activity.created_at}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium">{activity.notes.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Viewed {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent notes</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentNotes;