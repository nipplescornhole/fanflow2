import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Users, Star, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Music className="text-primary-foreground text-xl" />
            </div>
            <span className="text-4xl font-bold gradient-text">FanFlow</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            La Piattaforma Musicale
            <br />
            <span className="gradient-text">Sociale del Futuro</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Condividi la tua musica, scopri nuovi talenti e connettiti con una community 
            di appassionati, creatori ed esperti musicali.
          </p>
          
          <Button
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="text-lg px-8 py-6 rounded-xl"
            data-testid="button-login"
          >
            Inizia Ora
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Caratteristiche Principali
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle>3 Tipi di Utenti</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Creatori, Esperti Musicali e Ascoltatori. Ogni ruolo ha funzionalità 
                  specifiche per una migliore esperienza.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Music className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Contenuti Multimediali</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Carica file audio e video con player integrato, copertine personalizzate 
                  e controlli di riproduzione avanzati.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Star className="w-12 h-12 text-accent mb-4" />
                <CardTitle>Sistema Badge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Badge verificato e status di Esperto Musicale con sistema di validazione 
                  amministrativa per garantire qualità.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Scegli il Tuo Ruolo
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background border-border">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-foreground" />
                </div>
                <CardTitle>Creatore</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Carica i tuoi contenuti musicali e video, costruisci il tuo pubblico 
                  e ricevi feedback dalla community.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Upload audio e video</li>
                  <li>• Copertine personalizzate</li>
                  <li>• Analisi engagement</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-background border-border ring-2 ring-accent">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-accent">Esperto Musicale</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Badge speciale per professionisti del settore con studi musicali 
                  verificati e credibilità riconosciuta.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Badge verificato</li>
                  <li>• Upload contenuti</li>
                  <li>• Status privilegiato</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-foreground" />
                </div>
                <CardTitle>Ascoltatore</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Scopri nuova musica, interagisci con i contenuti e supporta 
                  i tuoi artisti preferiti.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Like e commenti</li>
                  <li>• Playlist personali</li>
                  <li>• Feed personalizzato</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto a Entrare nella Community?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Unisciti a migliaia di appassionati di musica e inizia a condividere 
            la tua passione oggi stesso.
          </p>
          <Button
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="text-lg px-8 py-6 rounded-xl"
            data-testid="button-join"
          >
            Entra in FanFlow
          </Button>
        </div>
      </section>
    </div>
  );
}
