import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      building: "",
      terms: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { terms, ...userData } = data;
    registerMutation.mutate(userData);
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

          {/* Login Form */}
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail ou CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu e-mail ou CPF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </Form>
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

          {/* Register Form */}
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-600 mt-1">
                      Você receberá um código de verificação via SMS
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crie uma senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prédio/Condomínio (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do seu prédio ou condomínio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 pt-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="terms"
                        className="mt-1 h-4 w-4 text-primary"
                      />
                    </FormControl>
                    <FormLabel htmlFor="terms" className="text-sm text-gray-600">
                      Concordo com os <a href="#" className="text-primary">Termos de Uso</a> e{" "}
                      <a href="#" className="text-primary">Política de Privacidade</a>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </Form>
        </>
      )}
    </div>
  );
}
