import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import RecentNotes from "@/components/dashboard/RecentNotes";
import Library from "@/components/dashboard/Library";
import UploadNoteModal from "@/components/dashboard/UploadNoteModal";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="note-upload"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <Button
                    size={isMobile ? "default" : "lg"}
                    className="w-full md:w-auto px-4 md:px-6"
                    onClick={() => document.getElementById('note-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Upload Notes
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold mb-4">Recent Notes</h2>
                  <RecentNotes />
                </div>

                <div>
                  <h2 className="text-lg md:text-xl font-semibold mb-4">My Library</h2>
                  <Library />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <UploadNoteModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        file={selectedFile}
      />
    </SidebarProvider>
  );
};

export default Dashboard;