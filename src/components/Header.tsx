import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, LogOut, User, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  userEmail?: string;
}

const Header = ({ userEmail }: HeaderProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Até logo!",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível fazer logout. Tente novamente.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">Assistente Fluig</h1>
            <p className="text-xs text-muted-foreground">Suporte inteligente</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-10">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
              <span className="hidden sm:inline-block text-sm font-medium max-w-[150px] truncate">
                {userEmail}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{userEmail}</p>
              <p className="text-xs text-muted-foreground">Key User</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
