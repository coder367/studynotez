const Footer = () => {
  return (
    <footer className="bg-background/50 border-t border-border">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-muted-foreground">&copy; 2024 StudyNotes. All rights reserved.</p>
          <div className="mt-4">
            <span className="inline-block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-semibold text-lg animate-pulse">
              Created by - Deepanshu and Pratham
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;