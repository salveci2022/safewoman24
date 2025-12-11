import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "../App";
import { toast } from "sonner";
import { AlertTriangle, LogOut, Trash2, MapPin, Phone, RefreshCw, User, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SafeHavenLogoCompact } from "@/components/SafeHavenLogo";

export default function ContactDashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const audioRef = useRef(null);
  const previousAlertCount = useRef(0);

  useEffect(() => {
    loadUser();
    loadAlerts();
    
    // Poll for new alerts every 10 seconds
    const interval = setInterval(() => {
      loadAlerts(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    }
  };

  const loadAlerts = async (silent = false) => {
    try {
      const response = await axiosInstance.get("/contacts/alerts");
      const newAlerts = response.data;
      
      // Check if there are new alerts
      if (previousAlertCount.current > 0 && newAlerts.length > previousAlertCount.current) {
        setHasNewAlert(true);
        playAlertSound();
        if (!silent) {
          toast.error("🚨 NOVO ALERTA DE EMERGÊNCIA!", {
            duration: 10000,
            description: "Uma pessoa precisa de ajuda!"
          });
        }
      }
      
      previousAlertCount.current = newAlerts.length;
      setAlerts(newAlerts);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar alertas", error);
      setLoading(false);
    }
  };

  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await axiosInstance.post(`/contacts/alerts/${alertId}/acknowledge`);
      toast.success("Alerta confirmado");
      loadAlerts();
    } catch (error) {
      toast.error("Erro ao confirmar alerta");
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadAlerts();
    toast.info("Atualizando alertas...");
  };

  const handleClearData = async () => {
    try {
      await axiosInstance.delete("/contacts/clear");
      toast.success("Dados removidos");
      onLogout();
    } catch (error) {
      toast.error("Erro ao remover dados");
    }
  };

  const handleLogout = () => {
    toast.info("Você saiu com segurança");
    onLogout();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      {/* Audio element for alert sound */}
      <audio ref={audioRef} src="/siren.mp3" preload="auto" />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-red-200 sticky top-0 z-50" data-testid="contact-dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SafeHavenLogoCompact className="w-12 h-12" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Painel de Alertas
                </h1>
                <p className="text-xs text-gray-500">Contato de Confiança</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className="rounded-xl"
                data-testid="refresh-button"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="rounded-xl"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="contact-info-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Suas Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Nome:</span>
              <p className="text-base font-medium text-gray-800" data-testid="contact-name">{user?.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Email:</span>
              <p className="text-base font-medium text-gray-800" data-testid="contact-email">{user?.email}</p>
            </div>
            {user?.phone && (
              <div>
                <span className="text-sm font-medium text-gray-600">Telefone:</span>
                <p className="text-base font-medium text-gray-800" data-testid="contact-phone">{user.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Alertas de Emergência
              </h2>
              <p className="text-sm text-gray-500">
                {alerts.length === 0 ? "Nenhum alerta recebido" : `${alerts.length} alerta(s) recebido(s)`}
              </p>
            </div>
          </div>

          {loading ? (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando alertas...</p>
              </CardContent>
            </Card>
          ) : alerts.length === 0 ? (
            <Card className="bg-white/60 backdrop-blur-sm border-dashed" data-testid="no-alerts-message">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum alerta de emergência recebido</p>
                <p className="text-sm text-gray-400">Você será notificado quando alguém precisar de ajuda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4" data-testid="alerts-list">
              {alerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`border-2 ${hasNewAlert ? 'border-red-500 animate-pulse' : 'border-red-200'} bg-white shadow-lg`}
                  data-testid={`alert-card-${alert.id}`}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Alert Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-7 h-7 text-red-600" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-red-700">🚨 ALERTA DE EMERGÊNCIA</h3>
                            <p className="text-base font-semibold text-gray-800">
                              {alert.user_name || "Pessoa protegida"}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(alert.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Alert Details */}
                      <div className="bg-red-50 rounded-lg p-4 space-y-2">
                        {alert.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Localização:</p>
                              <p className="text-sm text-gray-600">{alert.location}</p>
                              <a
                                href={`https://www.google.com/maps?q=${alert.location}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Abrir no Google Maps
                              </a>
                            </div>
                          </div>
                        )}
                        {alert.user_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-red-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Telefone:</p>
                              <a href={`tel:${alert.user_phone}`} className="text-sm text-blue-600 hover:underline">
                                {alert.user_phone}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                          disabled={alert.acknowledged}
                          data-testid={`acknowledge-alert-${alert.id}`}
                        >
                          {alert.acknowledged ? "✓ Confirmado" : "Confirmar Recebimento"}
                        </Button>
                        {alert.user_phone && (
                          <Button
                            onClick={() => window.location.href = `tel:${alert.user_phone}`}
                            variant="outline"
                            className="rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Ligar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <Card className="mt-8 bg-red-50 border-red-200" data-testid="danger-zone-card">
          <CardHeader>
            <CardTitle className="text-red-700">Zona de Perigo</CardTitle>
            <CardDescription className="text-red-600">Ações irreversíveis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Limpar Dados</h4>
              <p className="text-sm text-gray-600 mb-4">
                Remove sua conta de contato e todos os alertas recebidos
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="rounded-xl" data-testid="clear-data-button">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Todos os Dados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação removerá permanentemente seus dados de contato e histórico de alertas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearData}
                      className="bg-red-600 hover:bg-red-700 rounded-xl"
                      data-testid="confirm-clear-data"
                    >
                      Sim, remover tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
