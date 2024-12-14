import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const Library = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Library</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {/* This will be populated with actual library data later */}
            <p className="text-muted-foreground">Your library is empty</p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Library;