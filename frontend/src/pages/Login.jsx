import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { axiosInstance } from "../App";
import { toast } from "sonner";
import { Shield, Heart, Lock, ShieldHeart } from "lucide-react";
import { SafeHavenLogo, SafeHavenLogoCompact } from "@/components/SafeHavenLogo";

export default function Login({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", loginData);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Login realizado com sucesso!");
      onLogin();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/auth/register", registerData);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Conta criada com sucesso!");
      onLogin();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-6xl flex items-center gap-12">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-1 flex-col justify-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <SafeHavenLogo className="w-32 h-32 logo-pulse" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                SafeHaven
              </h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Um lugar seguro para você. Alerte pessoas de confiança de forma rápida, discreta e silenciosa.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Alerta Silencioso</h3>
                <p className="text-sm text-gray-600">Envie alertas de emergência sem chamar atenção</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Contatos de Confiança</h3>
                <p className="text-sm text-gray-600">Cadastre pessoas que podem te ajudar</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Privacidade Total</h3>
                <p className="text-sm text-gray-600">Seus dados são protegidos e criptografados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex-1 max-w-md w-full">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm" data-testid="auth-card">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center lg:hidden mb-4">
                <img 
                  src="/logo.png" 
                  alt="Prof-Safe 24" 
                  className="w-48 h-auto"
                />
              </div>
              <CardDescription className="text-base">
                Entre ou crie sua conta para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="login-tab">Entrar</TabsTrigger>
                  <TabsTrigger value="register" data-testid="register-tab">Criar Conta</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        data-testid="login-email-input"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        data-testid="login-password-input"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6 rounded-xl"
                      disabled={isLoading}
                      data-testid="login-submit-button"
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nome Completo</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Seu nome"
                        data-testid="register-name-input"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        data-testid="register-email-input"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Telefone (opcional)</Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        data-testid="register-phone-input"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        data-testid="register-password-input"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6 rounded-xl"
                      disabled={isLoading}
                      data-testid="register-submit-button"
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
