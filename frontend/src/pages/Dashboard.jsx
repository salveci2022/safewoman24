import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "../App";
import { toast } from "sonner";
import { AlertCircle, Users, Settings, LogOut, UserPlus, Trash2, Mail, Phone, AlertTriangle } from "lucide-react";
import { SafeHavenLogoCompact } from "@/components/SafeHavenLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    loadUser();
    loadContacts();
    loadAlerts();
  }, []);

  const loadUser = async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      toast.error("Erro ao carregar dados do usuário");
    }
  };

  const loadContacts = async () => {
    try {
      const response = await axiosInstance.get("/contacts");
      setContacts(response.data);
    } catch (error) {
      toast.error("Erro ao carregar contatos");
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await axiosInstance.get("/alerts");
      setAlerts(response.data);
    } catch (error) {
      console.error("Erro ao carregar alertas");
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/contacts", newContact);
      toast.success("Contato adicionado com sucesso!");
      setNewContact({ name: "", email: "", phone: "" });
      setIsDialogOpen(false);
      loadContacts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao adicionar contato");
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await axiosInstance.delete(`/contacts/${contactId}`);
      toast.success("Contato removido");
      loadContacts();
    } catch (error) {
      toast.error("Erro ao remover contato");
    }
  };

  const handleSendAlert = async () => {
    if (contacts.length === 0) {
      toast.error("Adicione pelo menos um contato de confiança antes de enviar alertas");
      return;
    }

    setIsSendingAlert(true);
    try {
      // Try to get location
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = `${position.coords.latitude}, ${position.coords.longitude}`;
        } catch (error) {
          console.log("Location not available");
        }
      }

      await axiosInstance.post("/alerts/send", { location });
      toast.success("Alerta enviado para seus contatos de confiança!", {
        description: "Eles receberão um email de emergência.",
        duration: 5000,
      });
      loadAlerts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao enviar alerta");
    } finally {
      setIsSendingAlert(false);
    }
  };

  const handleClearData = async () => {
    try {
      await axiosInstance.delete("/user/clear");
      toast.success("Todos os dados foram removidos");
      onLogout();
    } catch (error) {
      toast.error("Erro ao remover dados");
    }
  };

  const handleLogout = () => {
    toast.info("Você saiu com segurança");
    onLogout();
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50" data-testid="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Prof-Safe 24" 
                className="h-10 w-auto sm:h-12"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
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
        {/* Emergency Alert Button */}
        <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-red-50 to-rose-50 overflow-hidden" data-testid="alert-card">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Botão de Emergência</h2>
                <p className="text-gray-600 max-w-md">
                  Pressione este botão para enviar um alerta silencioso para seus contatos de confiança
                </p>
              </div>
              <Button
                onClick={handleSendAlert}
                disabled={isSendingAlert}
                className="alert-button bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-lg px-12 py-8 rounded-2xl shadow-xl"
                data-testid="send-alert-button"
              >
                {isSendingAlert ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enviando Alerta...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-6 h-6" />
                    Enviar Alerta de Emergência
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl" data-testid="dashboard-tabs">
            <TabsTrigger value="contacts" className="rounded-lg" data-testid="contacts-tab">
              <Users className="w-4 h-4 mr-2" />
              Contatos
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg" data-testid="settings-tab">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Contatos de Confiança</h3>
                <p className="text-sm text-gray-500">Pessoas que receberão seus alertas de emergência</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl" data-testid="add-contact-button">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Contato
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md" data-testid="add-contact-dialog">
                  <DialogHeader>
                    <DialogTitle>Adicionar Contato de Confiança</DialogTitle>
                    <DialogDescription>
                      Esta pessoa receberá alertas quando você precisar de ajuda
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddContact} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Nome</Label>
                      <Input
                        id="contact-name"
                        placeholder="Nome completo"
                        data-testid="contact-name-input"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="email@exemplo.com"
                        data-testid="contact-email-input"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Telefone (opcional)</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        data-testid="contact-phone-input"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl" data-testid="submit-contact-button">
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {contacts.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-sm border-dashed" data-testid="no-contacts-message">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Você ainda não possui contatos de confiança</p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Adicionar Primeiro Contato
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4" data-testid="contacts-list">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="card-hover bg-white/80 backdrop-blur-sm border-0 shadow-md" data-testid={`contact-card-${contact.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-lg">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold text-gray-800 text-lg">{contact.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{contact.email}</span>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg" data-testid={`delete-contact-${contact.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Contato</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover {contact.name} da sua lista de contatos de confiança?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteContact(contact.id)}
                                className="bg-red-600 hover:bg-red-700 rounded-xl"
                                data-testid={`confirm-delete-contact-${contact.id}`}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md" data-testid="settings-card">
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>Seus dados pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Nome</Label>
                  <p className="text-base font-medium text-gray-800" data-testid="user-name">{user?.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-base font-medium text-gray-800" data-testid="user-email">{user?.email}</p>
                </div>
                {user?.phone && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                    <p className="text-base font-medium text-gray-800" data-testid="user-phone">{user.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md" data-testid="alerts-history-card">
              <CardHeader>
                <CardTitle>Histórico de Alertas</CardTitle>
                <CardDescription>Últimos alertas enviados</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4" data-testid="no-alerts-message">Nenhum alerta enviado ainda</p>
                ) : (
                  <div className="space-y-3" data-testid="alerts-list">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`alert-item-${alert.id}`}>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Alerta enviado para {alert.sent_to.length} contato(s)
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200" data-testid="danger-zone-card">
              <CardHeader>
                <CardTitle className="text-red-700">Zona de Perigo</CardTitle>
                <CardDescription className="text-red-600">Ações irreversíveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Limpar Todos os Dados</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Remove permanentemente sua conta, contatos e histórico de alertas
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
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso removerá permanentemente sua conta e todos os dados
                          associados, incluindo contatos de confiança e histórico de alertas.
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
