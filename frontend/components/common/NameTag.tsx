import { cn } from "@/lib/utils";

interface NameTagProps {
  name: string;
  email: string;
  onClick?: () => void;
}

export function NameTag({ name, email, onClick}: NameTagProps) {
  return (
    <div 
      className={cn(
        "h-10 flex flex-col justify-center gap-0.5",
        onClick && "cursor-pointer group"
        )}
      onClick={onClick}  
    >
      <div className="leading-tight">{name}</div>
      <small className="leading-tight" style={{ color: "#777"}}>{email}</small>
    </div>
  )
}