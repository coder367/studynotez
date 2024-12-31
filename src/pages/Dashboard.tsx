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
import { DashboardPricing } from "@/components/dashboard/DashboardPricing";

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="note-upload"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <Button
                    size="lg"
                    className="px-6"
                    onClick={() => document.getElementById('note-upload')?.click()}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Notes
                  </Button>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Recent Notes</h2>
                  <RecentNotes />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">My Library</h2>
                  <Library />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Subscription</h2>
                  <DashboardPricing />
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