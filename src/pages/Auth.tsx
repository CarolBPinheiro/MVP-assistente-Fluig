import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Loader2 } from "lucide-react";
import { z } from "zod";
import loginBackground from "@/assets/login-background.png";

const authSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("user-assistentefluig@fortbras.com.br");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") newErrors.email = err.message;
          if (err.path[0] === "password") newErrors.password = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;

        toast({
          title: "Usuário criado!",
          description: data.session
            ? "Conta criada e acesso liberado."
            : "Conta criada. Se necessário, verifique o email para confirmar.",
        });

        // Se houver sessão (auto-confirmação), o onAuthStateChange vai redirecionar.
        // Caso não, voltamos para o login.
        if (!data.session) {
          setMode("login");
        }

        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
    } catch (error: any) {
      let message = "Ocorreu um erro. Tente novamente.";

      const raw = String(error?.message ?? "");

      if (raw.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos.";
      } else if (raw.includes("Email not confirmed")) {
        message = "Por favor, confirme seu email antes de entrar.";
      } else if (
        raw.toLowerCase().includes("user already registered") ||
        raw.toLowerCase().includes("already registered")
      ) {
        message = "Este email já possui cadastro. Use 'Acessar'.";
      }

      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl p-8 mx-4">
        {/* Logo Fortbras */}
        <div className="flex justify-center mb-8">
          <svg 
            viewBox="0 0 200 50" 
            className="h-10 w-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15 10L25 5L35 10L35 30L25 35L15 30Z" fill="#00A651"/>
            <path d="M25 5L35 10V30L25 35V15L15 10L25 5Z" fill="#FFD200"/>
            <path d="M15 10L25 15V35L15 30V10Z" fill="#0066B3"/>
            <text x="45" y="28" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="22" fill="#1a1a1a">
              Fortbras
            </text>
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Login Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Digite seu login"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 border-gray-200 focus:border-primary bg-white text-gray-700 placeholder:text-gray-400"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-12 border-gray-200 focus:border-primary bg-white text-gray-700 placeholder:text-gray-400"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === "signup" ? (
              "CRIAR USUÁRIO"
            ) : (
              "ACESSAR"
            )}
          </Button>
        </form>

        {/* Forgot Password + First Access */}
        <div className="mt-4 text-center space-y-3">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() =>
              toast({
                title: "Recuperação de senha",
                description: "Entre em contato com o administrador do sistema.",
              })
            }
          >
            Esqueceu sua senha?
          </button>

          <div>
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
              onClick={() => {
                setErrors({});
                setPassword("");
                setMode((m) => (m === "login" ? "signup" : "login"));
              }}
            >
              {mode === "login" ? "Primeiro acesso? Criar usuário" : "Já tem conta? Acessar"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-white/60">
          Todos os direitos reservados. TOTVS Fluig Plataforma 2026 - Crystal M12
        </p>
      </div>
    </div>
  );
};

export default Auth;
