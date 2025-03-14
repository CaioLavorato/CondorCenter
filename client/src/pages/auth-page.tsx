import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft } from "lucide-react";

type AuthMode = "login" | "register";

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "Digite sua senha"),
});

const registerSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Digite um e-mail válido"),
  phone: z.string().min(10, "Digite um número de telefone válido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  building: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os termos e condições",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Formulário simplificado sem react-hook-form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBuilding, setRegBuilding] = useState("");
  const [regTerms, setRegTerms] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateLoginForm = () => {
    const errors: Record<string, string> = {};
    if (!loginEmail) {
      errors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      errors.email = "Digite um e-mail válido";
    }
    
    if (!loginPassword) {
      errors.password = "Senha é obrigatória";
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateRegisterForm = () => {
    const errors: Record<string, string> = {};
    
    if (!regFullName) {
      errors.fullName = "Nome é obrigatório";
    } else if (regFullName.length < 3) {
      errors.fullName = "Nome deve ter pelo menos 3 caracteres";
    }
    
    if (!regPhone) {
      errors.phone = "Telefone é obrigatório";
    } else if (regPhone.length < 10) {
      errors.phone = "Digite um número de telefone válido";
    }
    
    if (!regEmail) {
      errors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(regEmail)) {
      errors.email = "Digite um e-mail válido";
    }
    
    if (!regPassword) {
      errors.password = "Senha é obrigatória";
    } else if (regPassword.length < 6) {
      errors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    if (!regTerms) {
      errors.terms = "Você deve aceitar os termos e condições";
    }
    
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLoginForm()) {
      loginMutation.mutate({
        email: loginEmail,
        password: loginPassword
      });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateRegisterForm()) {
      registerMutation.mutate({
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        building: regBuilding
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      {mode === "login" ? (
        <>
          {/* Login Header */}
          <div className="mb-10 mt-8 text-center">
            <div className="w-24 h-24 mx-auto rounded-full shadow-md bg-primary flex items-center justify-center">
              <span className="text-white text-3xl font-bold">CC</span>
            </div>
            <h1 className="text-2xl font-bold text-primary mt-4">Condor Center</h1>
            <p className="text-gray-600 mt-2">Sua compra mais inteligente</p>
          </div>

          {/* Login Form - Versão simplificada */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail ou CPF
              </label>
              <Input
                id="email"
                type="text"
                placeholder="Seu e-mail ou CPF"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              {loginErrors.email && (
                <p className="text-sm font-medium text-red-500">{loginErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              {loginErrors.password && (
                <p className="text-sm font-medium text-red-500">{loginErrors.password}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <LoadingSpinner size="small" className="mr-2" /> : null}
              Entrar
            </Button>
            
            <p className="text-center text-sm">
              <a href="#" className="text-primary hover:text-primary-dark">
                Esqueci minha senha
              </a>
            </p>
            
            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary-light hover:text-white"
                onClick={() => setMode("register")}
              >
                Criar uma conta
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          {/* Register Header */}
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMode("login")}
              className="p-2"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </Button>
            <h1 className="text-xl font-bold text-center flex-1 pr-8">Criar uma conta</h1>
          </div>

          {/* Register Form - Versão simplificada */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Nome completo
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
              />
              {regErrors.fullName && (
                <p className="text-sm font-medium text-red-500">{regErrors.fullName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </label>
              <Input
                id="phone"
                type="text"
                placeholder="(00) 00000-0000"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
              {regErrors.phone && (
                <p className="text-sm font-medium text-red-500">{regErrors.phone}</p>
              )}
              <p className="text-xs text-gray-600">
                Você receberá um código de verificação via SMS
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="regEmail" className="text-sm font-medium">
                E-mail
              </label>
              <Input
                id="regEmail"
                type="email"
                placeholder="seu@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              {regErrors.email && (
                <p className="text-sm font-medium text-red-500">{regErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="regPassword" className="text-sm font-medium">
                Crie uma senha
              </label>
              <Input
                id="regPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              {regErrors.password && (
                <p className="text-sm font-medium text-red-500">{regErrors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="building" className="text-sm font-medium">
                Prédio/Condomínio (opcional)
              </label>
              <Input
                id="building"
                type="text"
                placeholder="Nome do seu prédio ou condomínio"
                value={regBuilding}
                onChange={(e) => setRegBuilding(e.target.value)}
              />
            </div>
            
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox 
                id="terms"
                checked={regTerms}
                onCheckedChange={(checked) => setRegTerms(checked === true)}
                className="mt-1 h-4 w-4 text-primary"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Concordo com os <a href="#" className="text-primary">Termos de Uso</a> e{" "}
                <a href="#" className="text-primary">Política de Privacidade</a>
              </label>
            </div>
            {regErrors.terms && (
              <p className="text-sm font-medium text-red-500">{regErrors.terms}</p>
            )}
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? <LoadingSpinner size="small" className="mr-2" /> : null}
                Cadastrar
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
