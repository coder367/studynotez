import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSubject: string | undefined;
  onSubjectChange: (value: string) => void;
  selectedUniversity: string | undefined;
  onUniversityChange: (value: string) => void;
  subjects: string[];
  universities: string[];
}

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  selectedUniversity,
  onUniversityChange,
  subjects,
  universities,
}: SearchFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={selectedSubject} onValueChange={onSubjectChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Select subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All subjects</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject} value={subject || "undefined"}>
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedUniversity} onValueChange={onUniversityChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Select university" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All universities</SelectItem>
          {universities.map((university) => (
            <SelectItem key={university} value={university || "undefined"}>
              {university}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchFilters;