import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ReloadButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function ReloadButton({onClick, isLoading = false} : ReloadButtonProps) {
  return (
    <Button 
      className="cursor-pointer"
      onClick={onClick}
      disabled={isLoading}
    >
      <RefreshCw className={`${isLoading ? "animate-spin" : ""}`}/>
    </Button>
  );
}