import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const RecentNotes = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {/* This will be populated with actual notes data later */}
            <p className="text-muted-foreground">No recent notes</p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentNotes;