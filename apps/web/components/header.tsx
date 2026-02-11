import { Button } from "@repo/ui/src/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-primary/80">
      <div className="flex items-center justify-between max-w-285 mx-auto h-16">
        <div className="font-bold text-xl">Autovendo</div>
        <div className="flex items-center gap-3">
          <Select defaultValue="english">
            <SelectTrigger className="w-32 bg-white">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="german">Deutsch</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="italian">Italiano</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="secondary" className="bg-white">
            Post free ad
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
