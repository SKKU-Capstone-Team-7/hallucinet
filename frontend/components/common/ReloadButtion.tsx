import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function ReloadButton() {

  const handleReload = () => {
    window.location.reload();
  }
  return (
    <Button onClick={handleReload}>
      <RefreshCw />
    </Button>
  );
}