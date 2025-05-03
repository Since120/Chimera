# **PROJECT CHIMERA \- MASTER-KONTEXTDOKUMENT**

**Status:** Phase 2 abgeschlossen, Implementierung der Frontend-Komponenten, Übergang zu Phase 3 in Vorbereitung  
 **Letzte Aktualisierung:** 20.04.2025 (v1.2)

## **1\. PROJEKTÜBERSICHT & VISION**

### **1.1 Projektziel**

"Project Chimera" ist die Realisierung eines fortschrittlichen, modularen Discord-Bot-Ökosystems mit Web-Dashboard. Es zielt darauf ab, weit über Standard-Bot-Funktionalitäten hinauszugehen und tiefgreifende, miteinander verzahnte Werkzeuge für folgende Bereiche zu bieten:

* **Intelligentes Community-Management:** Automatisierung, Strukturierung, Berechtigungsverwaltung  
* **Benutzerengagement & Gamification:** Belohnung von Aktivität durch ein flexibles Punktesystem, basierend auf konfigurierbarem Voice-Channel-Tracking  
* **Dynamische Infrastruktur:** Bedarfsgerechte Erstellung und Verwaltung von Voice-Kanälen durch Benutzer, gesteuert durch einen konfigurierbaren Setup-Prozess  
* **Integrierte Community-Ökonomie:** Ein spielübergreifender Marktplatz für virtuelle Güter mit verschiedenen Handelsmechanismen und Währungen

Dieses Ökosystem soll nicht nur Funktionen hinzufügen, sondern die Art und Weise, wie Communities auf Discord interagieren und verwaltet werden, grundlegend verbessern, indem es Daten (Aktivität, Handel) sichtbar macht und darauf basierende Automatisierungen und Anreize schafft.

### **1.2 Kernphilosophie & Leitprinzipien**

#### **Strukturierte Komplexitätsbewältigung (Hauptanliegen)**

**Kontext:** Der Entwickler hat signifikante Vorerfahrung mit dem Projektkonzept, stieß aber wiederholt (10 Neuansätze) an Grenzen der selbstverwalteten Komplexität, insbesondere bei der Datenstrukturierung, API-Designs und der Aufrechterhaltung des Überblicks in einer wachsenden Codebasis.

**Strategie:**

* Einsatz von **meinungsstarken (opinionated) Frameworks** (Nest.js)  
* Nutzung **verwalteter Dienste** (Supabase)  
* **Strikte Modularisierung**, um dem Entwickler ein Gerüst zu geben und "Best Practices" zu fördern  
* **Iterativer MVP-Ansatz** \- nicht nur eine Empfehlung, sondern eine Notwendigkeit, um erneute Überlastung zu verhindern  
* Jede Phase muss klar definiert und abgeschlossen werden, bevor die nächste signifikante Erweiterung beginnt

#### **Modularität & Erweiterbarkeit**

**Umsetzung:**

* Klare Trennung in core-Module (systemweit), levels-Module (Kontext) und plugins-Module (Features)  
* Plugins sollten idealerweise unabhängig voneinander funktionieren  
* Interaktion nur über definierte Schnittstellen mit dem Core oder anderen Plugins (primär über Service-Injections)  
* Neue Plugins erfordern die Definition ihrer permissions im RBAC-System

#### **Anpassbarkeit & Flexibilität**

**Technische Abbildung:**

* Die Level-Architektur (Allianz, Guild, Gruppe) wird über eine polymorphe Beziehung mittels der resource\_scopes-Tabelle realisiert  
* Jede Ressource (z.B. categories, listings) verweist auf einen resource\_scope, der wiederum den Typ (guild, alliance, group) und die ID des jeweiligen Scopes enthält  
* Dies ermöglicht flexible Abfragen und die Anwendung von Regeln auf unterschiedlichen Ebenen

#### **Robuste & Wartbare Codebasis**

**Maßnahmen:**

* Konsequentes TypeScript (strict-Mode)  
* ESLint/Prettier für Code-Qualität  
* Geplante Implementierung von Tests (Unit-Tests für Services mit komplexer Logik, Integrationstests für API-Endpunkte und DB-Interaktionen, E2E-Tests für kritische User-Flows)  
* Saubere Fehlerbehandlung mit spezifischen Exceptions  
* Ausführliches Logging

#### **Intuitive User Experience**

**Dashboard:** Fokus auf Klarheit trotz vieler Optionen, visuelle Hilfen, sinnvolle Gruppierung von Einstellungen.

**Bot:** Nutzung von Discord UI-Elementen (Buttons, Selects, Modals, Ephemeral Messages) für geführte Interaktionen, klare Fehlermeldungen und Nutzerführung.

#### **Datenkonsistenz (Zwei-Wege-Synchronisation)**

**Notwendigkeit:** Discord-Admins haben immer die Möglichkeit, Kanäle/Rollen direkt in Discord zu ändern. Eine reine Top-Down-Synchronisation (Dashboard → Discord) ist unzureichend.

**Herausforderungen der "Selbstheilung":**

* **Race Conditions:** Was passiert, wenn der Bot versucht, einen Kanal wiederherzustellen, während der Admin ihn gerade erneut löscht?  
* **Rate Limits:** Zu viele Korrekturaktionen könnten Discord API Limits auslösen  
* **Fehlerfortpflanzung:** Ein Fehler im Sync-Service könnte unerwünschte Änderungen verursachen  
* **Intention des Admins unklar:** War das Löschen Absicht oder ein Fehler? Automatische Korrektur könnte frustrieren

**MVP-Entscheidung:** Daher **keine automatische Selbstheilung in V1**. Der TwoWaySyncService lauscht auf Events, **aktualisiert aber nur den DB-Status** (z.B. discord\_channel\_id \= null bei Delete, Namensupdate bei channelUpdate). Das Dashboard muss diese Inkonsistenzen anzeigen (z.B. "Kanal in Discord gelöscht") und dem Admin Werkzeuge zur manuellen Re-Synchronisation oder Bereinigung bieten. Langfristig kann die Selbstheilung schrittweise für ungefährliche Fälle eingeführt werden.

#### **Monetarisierung**

**Technische Vorbereitung:** Feature-Flags (FeatureFlagsService, der z.B. guilds.selected\_plan\_tier prüft) müssen von Anfang an in die Plugin-Services integriert werden, um Funktionen je nach Plan freizuschalten/zu limitieren.

### **1.3 Zielgruppe**

Administratoren und Manager von (primär Gaming-) Discord-Servern und \-Allianzen, die nach einer "All-in-One"-Lösung suchen, um ihre Community professionell zu verwalten, Engagement zu fördern und einzigartige, integrierte Systeme (wie Tracking und Handel) anzubieten. Sie sind bereit, für ein leistungsstarkes und zuverlässiges Tool zu bezahlen.

## **2\. KERNKONZEPTE & ARCHITEKTUR**

### **2.1 Guild-Zentrierung**

Jede Ressource (Kategorie, Zone, Listing etc.) und jede Aktion ist immer einem eindeutigen Scope zugeordnet, der letztlich auf einer oder mehreren Guild IDs basiert. Das Dashboard ermöglicht den Wechsel des Guild-Kontexts.

**Technische Implikation:** Konsequente Verwendung von guild\_id oder resource\_scope\_id in DB-Abfragen, API-Routen und Service-Logik.

**Beispiel-Szenario:** User Bob ist in Guild A und Allianz B (die Guild C und D umfasst). Im Dashboard wählt Bob Guild A aus → Er sieht nur Kategorien/Zonen/Punkte/Handelsangebote, die für Guild A (Scope 'guild', ID A) oder Gruppen in Guild A (Scope 'group', ID G-in-A) erstellt wurden. Wechselt er zu Allianz B → Er sieht nur Ressourcen mit Scope 'alliance', ID B. Seine Punkte werden aber evtl. aus beiden Scopes aggregiert, je nach Währung/Regel.

### **2.2 Technologie-Stack**

#### **Frontend: React / Next.js (mit App Router)**

**Begründung:** Gute Developer Experience, Komponentenmodell für komplexe UIs, großes Ökosystem, SSR/Performance-Optionen durch Next.js. Entwickler hat Vorerfahrung.

**UI-Bibliothek:** Chakra UI v3 (@chakra-ui/react) \- Gewählt wegen robustem Komponentensystem, integriertem Theming (stark anpassbar via Tokens/Recipes), Fokus auf Performance (CSS Variablen) und guter DX (Style Props). Benötigt `@emotion/react`.

**UI-Bibliothek (Chakra UI v3):** Ergänzen oder präzisieren: Die Implementierung nutzt intensiv die v3-API von Chakra UI, einschließlich der Komponentenstruktur mit Namespaces (z.B. Menu.Root, Menu.Trigger für Dropdowns, wie in der offiziellen v3-Dokumentation beschrieben). Das Styling erfolgt primär über Style Props und das zentrale Theme mit Tokens und Semantic Tokens. Für komplexe CSS-Anweisungen, die nicht direkt über Style Props abgebildet werden können (wie CSS-Variablen-Definitionen oder clip-path), wird das css-Prop oder das style-Prop (als Fallback für dynamische JS-Anwendungen) verwendet.

**Styling-Ansatz:** Primär über Chakra UI Style Props und `css`\-Prop. Zentrales, hochgradig angepasstes Theme (in `apps/frontend-new/src/theme/` und `apps/frontend-new/src/components/ui/theme.ts`) mit Basis-Tokens, Semantic Tokens und Recipes/Slot Recipes zur Nachbildung des gewünschten Designs (Salesforce-inspiriert, Dark Mode).

**CLI-Tooling:** `@chakra-ui/cli` ist essenziell für Snippet-Generierung (Provider, Color Mode) und Typgenerierung (`typegen`).

**State Management:** React Context API für globale Zustände (Auth, Guild), `useState`/`useReducer` für lokalen State. Bei Bedarf Zustand/Jotai.

**Daten-Fetching:** Supabase Client für direkte DB-Interaktion/Auth; `axios`/`fetch` für Backend-API-Calls; React Query (TanStack Query) oder SWR empfohlen für Caching/Server-State.

**Animationen:** Chakra UI integrierte Animationen \+ gezielter Einsatz von Framer Motion für komplexe Layout-Animationen (Sidebar, TopNav).

**Animationen:** Präzisieren: Standard-Animationen werden über Chakra UI (animation, animationStyle) realisiert. Für das Layout (SideNav, TopNav) kommt Framer Motion zum Einsatz. Eine spezielle Komponente (NotchedBox) verwendet JavaScript (useEffect, ResizeObserver) zur dynamischen Berechnung und Anwendung eines SVG-basierten clip-path, um einen präzisen "Nasen"-Ausschnitt zu erzeugen.

**Formulare:** React Hook Form empfohlen.

**Icons:** Externe Bibliotheken (`lucide-react` / `react-icons`).

**Frontend-Entwicklung:** Die gesamte Frontend-Entwicklung bezieht sich auf das neue Projekt unter apps/frontend-new. Das Theme-Setup (Provider, Theme-Struktur) wurde gemäß den Chakra UI v3-Konventionen in components/ui/ und theme/ eingerichtet. Framer Motion wurde für komplexe Layout-Animationen implementiert, insbesondere für die Sidebar und TopNav.

**Layout & Navigation:**

* **SideNav:** Visueller "Keller"-Effekt mit dunklerer Hintergrundfarbe (\#0c111b), Gradient und subtiler Schattierung. Breiten-Animation (64px \<-\> 240px) mit Framer Motion. Icon-Animation und Text-Animation beim Ausklappen. Zustands-Toggle wurde nach DashboardLayout verschoben.  
* **TopNav:** Implementierung eines SideNav-Toggles mit LuPanelLeftOpen/Close-Icons. Dynamisches Icon in SubNav, das den aktiven Hauptbereich anzeigt. Kontextuelle Sub-Navigation, die sich dem aktiven Hauptbereich anpasst.  
* **Responsivität:** Hybrid-Ansatz mit automatischem Einklappen der SideNav unter 1100px, vollständigem Ausblenden unter 768px und Aktivierung des MobileDrawers unter 768px.

**Authentifizierung:** Der gesamte Auth-Flow wurde implementiert, orientiert an der Logik des alten Dashboards, aber angepasst an den neuen Stack. Probleme mit PKCE beim Login wurden durch Korrekturen in der Middleware, API Interceptor und Supabase Client-Konfiguration behoben.

**Login-Seite Design:** Nach mehreren Iterationen wurde ein finales Design basierend auf einem "Bot Manager"-Beispiel implementiert, mit zentrierter Karte, Logo mit Ringen, Bot-Preview-Pane, Akzent-Button, subtilen Hintergrund-Elementen und 3D-Tilt-Effekt.

#### **Backend: Nest.js**

**Ausführliche Begründung:** **DIE** strategische Wahl zur Bekämpfung der Komplexität. Bietet durch seine *starke Strukturierung* (Module, Controller, Services) und *Dependency Injection* den Rahmen, der in früheren Versuchen fehlte. Erzwingt sauberen, modularen Code. TypeScript-Integration ist erstklassig. Fördert Testbarkeit (Unit, Integration, E2E). Das Ökosystem deckt viele Backend-Anforderungen ab. Es ist lernintensiver als Skripting, aber die Investition zahlt sich durch Wartbarkeit und Struktur aus.

**Konkrete Vorteile genutzt:** Decorators für @Controller, @Get, @Post etc. vereinfachen Routing. @UseGuards für Auth/Permissions. @Body, @Param, @Query für Request-Datenextraktion. ValidationPipe mit class-validator/class-transformer für automatische DTO-Validierung. @nestjs/schedule für geplante Tasks (z.B. Item-Updates, Auktionsenden). @nestjs/event-emitter als *Option* für interne Entkopplung (aktuell direkte Service-Calls bevorzugt für Einfachheit).

**Verworfene Alternative: n8n/Low-Code:** Ungeeignet wegen Echtzeit-Bot-Anforderungen (persistente WebSocket-Verbindung, sofortige Event-Reaktion), komplexer, zustandsbehafteter Logik (Tracking-Timer, Setup-Flow-Status, dynamische Rollen), mangelnder Testbarkeit und Skalierbarkeitsgrenzen bei hochfrequenten Events. Visuelle Einfachheit würde bei dieser Komplexität zum Nachteil.

**Ergänzung zu Backend (Nest.js):**

Der globale JwtAuthGuard wird jetzt über den APP\_GUARD-Provider im AuthModule registriert (statt in main.ts). Dies bietet eine zentralere und sauberere Konfiguration der Authentifizierung.

Bei bestimmten Modulimporten ist die Verwendung von forwardRef() notwendig, um zirkuläre Abhängigkeiten aufzulösen. Diese Technik wird gezielt eingesetzt, obwohl einige dieser forwardRef()-Aufrufe nach erfolgreicher Entkopplung von Services möglicherweise entfernt werden könnten.

#### **Bot-Integration: Initial in Nest.js**

**Ausführliche Begründung:** Die Features (Tracking, Setup, dynamische Rollen, Zwei-Wege-Sync) erfordern eine **extrem enge und häufige Interaktion** zwischen Bot-Events und Backend-Logik. Eine separate Bot-Anwendung würde *sofort* eine robuste Inter-Service-Kommunikation (REST API, gRPC oder Message Queue) erfordern, was die **initiale Komplexität signifikant erhöht**. Durch die Integration kann der BotGateway Business-Services direkt via DI aufrufen (performant, typsicher, einfach).

**Technische Umsetzung:** BotGatewayService initialisiert discord.js Client. Lauscht auf Events via client.on(). Ruft Methoden anderer Services auf, die via DI injiziert wurden. DiscordApiService kapselt discord.js-Methoden (z.B. guild.channels.create, channel.setName, member.roles.add) oder direkte REST-Calls via @nestjs/axios (für Fälle, wo die Lib nicht ausreicht).

**Plan für Skalierung:** Die Architektur trennt die reine Discord-Interaktion (BotGateway, DiscordApiService) klar von der Business-Logik. Wenn Skalierung (tausende Server) eine Trennung erfordert, können diese Interaktions-Layer in einen eigenen Service verschoben und die direkten Aufrufe durch API-Calls ersetzt werden. Dies ist eine **bewusste Entscheidung für einen einfacheren Start (MVP)** mit geplanter zukünftiger Skalierbarkeit.

**Spätere Trennung:** Der separate Bot-Service würde ebenfalls Nest.js nutzen und die BotGateway / DiscordApi-Logik enthalten. Die Kommunikation würde dann über eine interne REST-API (oder gRPC/Message Queue) erfolgen, die das Haupt-Backend bereitstellt bzw. vom Bot konsumiert wird.

#### **Datenbank/BaaS: Supabase**

**Ausführliche Begründung:** Nimmt dem Entwickler die Last der DB-Administration (Setup, Wartung, Backups, Skalierung von PostgreSQL) und der Implementierung eines eigenen Auth-Systems ab. Die integrierte Discord OAuth2-Funktion ist ein großer Vorteil. Die automatische Typgenerierung für TypeScript ist essenziell für die Code-Qualität. Ermöglicht dem Entwickler, sich auf die *einzigartige Geschäftslogik* zu konzentrieren.

**Konkrete Nutzung:** Auth für Discord OAuth. PostgreSQL für relationale Daten. supabase-js SDK im Frontend für einfache Reads/Auth. supabase-js (Server-Variante) im Backend (DatabaseService) mit *Admin Key* für privilegierte Operationen (adminClient) und *Anon Key* für Standardoperationen (client, derzeit weniger genutzt). Supabase Migrations via CLI für Schema-Management. Supabase Typ-Generierung für shared-types.

**Verworfene Alternative: Reines Eigenbau-Backend:** Führte in der Vergangenheit zur Überforderung durch die zusätzliche Komplexität von DB-Management, Auth-Implementierung und API-Design für *alle* Daten. Der hybride Ansatz teilt die Verantwortlichkeiten klar auf: Supabase für Daten/Auth/Basis-API, Nest.js für komplexe Logik/Bot/Aktions-API.

**Verzicht auf Supabase Features:** Edge Functions (zu limitiert für komplexe Logik), Realtime wird für Dashboard-Updates genutzt. RLS wird konfiguriert, aber Backend agiert oft mit adminClient.

**Abgrenzung:** Supabase Edge Functions wurden als Alternative für einfache Logik betrachtet, aber für die *komplexe, zustandsbehaftete Business-Logik* (Tracking, Setup-Flow, Rollenmanagement) als unzureichend bewertet. Supabase dient primär als Daten- und Auth-Layer. Der Supabase adminClient (mit Service Role Key) wird im Backend für Operationen verwendet, die RLS umgehen müssen oder Admin-Rechte erfordern (z.B. getUserById, alle Bot-initiierten DB-Schreibvorgänge), während der normale client (mit Anon Key \+ User JWT) theoretisch für RLS-geschützte Abfragen verwendet werden könnte (wird aber aktuell weniger genutzt, da das Backend meist mit Admin-Rechten agiert).

#### **Backend API: REST**

**Ausführliche Begründung:** Obwohl GraphQL mächtig ist, dient die API vom Dashboard zum Nest.js-Backend primär dem *Auslösen von Aktionen mit komplexer Nebenlogik* (z.B. Kategorie erstellen → DB-Eintrag \+ Discord-Kanal \+ Permissions). REST passt hier semantisch gut (POST /categories). Die Implementierung in Nest.js ist deutlich schlanker als GraphQL (keine Resolver, Type Definitions, Schema Stitching etc.). Dies *reduziert die Komplexität im selbstgeschriebenen Backend-Code*. Flexible Datenabfragen können oft direkt vom Frontend an die Supabase-APIs (REST oder GraphQL) gestellt werden.

**Begründung vs. GraphQL vertieft:** GraphQL würde im Nest.js-Backend Resolver für jede Query/Mutation erfordern, Schema-Definitionen (Code-First oder Schema-First), DataLoaders zur Vermeidung von N+1-Problemen. Für die primär aktionsbasierten Aufrufe vom Dashboard (z.B. "Speichere diese Kategorie") ist der Aufwand für eine volle GraphQL-API unverhältnismäßig. REST mit klar definierten DTOs ist hier pragmatischer und reduziert die Komplexität im *selbst zu bauenden* Teil.

#### **Queueing: BullMQ**

Für robuste asynchrone Job-Verarbeitung und Retries, insbesondere für Discord API Calls mit Rate Limits.

**Ergänzung zu Queueing (BullMQ):**

BullMQ verwendet aktuell die lokale Redis-Instanz, die über die Umgebungsvariablen REDIS\_HOST und REDIS\_PORT konfiguriert wird. Diese lokale Instanz dient als Backend für die Queue-Verarbeitung.

#### **Caching/State/RateLimit-Backend: Redis**

Wird sowohl von BullMQ genutzt als auch für den Debouncing-State (pending\_channel\_names) und als Backend für @upstash/ratelimit. Betrieb via Docker lokal oder Upstash Cloud.

**Ergänzung zu Caching/State/RateLimit-Backend (Redis):**

Upstash Redis (konfiguriert über UPSTASH\_REDIS\_URL und UPSTASH\_REDIS\_TOKEN) wird parallel zur lokalen Redis-Instanz verwendet. Die Upstash-Instanz wird spezifisch für den @upstash/ratelimit-Check sowie für die Verwaltung des pending\_channel\_names-State im ChannelRenameProcessor genutzt.

#### **Rate Limiting Library: @upstash/ratelimit**

Spezialisierte Bibliothek zur effizienten Prüfung von Rate Limits *vor* API-Calls, genutzt mit @upstash/redis.

#### **Redis Client (für App): @upstash/redis**

Der für @upstash/ratelimit optimierte Client, wird im Backend bereitgestellt und injiziert.

#### **HTTP Client: @nestjs/axios**

Für direkte Discord API Calls im DiscordApiService, um discord.js-interne Queues zu umgehen.

#### **Typisierung: TypeScript**

**Begründung:** Obligatorisch für Robustheit, Refactoring-Sicherheit und verbesserte Developer Experience (Intellisense, Compile-Time-Checks). Essentiell im Zusammenspiel mit Chakra UI v3 für typsichere Style Props und Theme-Tokens (via `npx @chakra-ui/cli typegen`).

**Konfiguration:** Strikte Typ-Checks, ESLint-Regeln (z.B. no-explicit-any wo möglich), konsistente Nutzung von Interfaces und Typen (insbesondere aus shared-types).

#### **Projektstruktur: Monorepo (pnpm workspaces)**

**Begründung:** Beste Wahl für dieses Setup, um Frontend, Backend und shared-types effizient zu verwalten und Konsistenz sicherzustellen.

#### **Konfiguration (.env, Joi)**

**Ergänzung zu Konfiguration:**

Die Joi-Validierung wurde um SUPABASE\_JWT\_SECRET erweitert, was für die korrekte Validierung der Supabase-JWTs im Backend entscheidend ist.

Die redundante Variable JWT\_SECRET wurde aus der Konfiguration entfernt, da sie nicht mehr benötigt wird. Die Variable JWT\_EXPIRATION wird vorläufig beibehalten, könnte aber in Zukunft ebenfalls entfernt werden.

### **2.3 Authentifizierung**

Discord OAuth2 via Supabase. Nach Callback wird im Backend (GET /api/v1/auth/session) das von Supabase validierte JWT (HS256, validiert mit SUPABASE\_JWT\_SECRET via JwtStrategy) genutzt, um den user\_profiles-Eintrag zu holen/erstellen und die guild\_members-Einträge zu prüfen (Bot muss in mind. einer Guild des Users sein). Nur relevante Guilds werden ans Frontend zurückgegeben.

**Wichtig:** Das vom Frontend gesendete Token ist das *Supabase Access Token*. Das Backend *validiert* dieses Token (via JwtStrategy mit dem SUPABASE\_JWT\_SECRET) und extrahiert daraus die supabaseUserId. Es stellt *keinen* eigenen, separaten Backend-Session-Token aus. Der `/api/v1/auth/session`\-Endpunkt ruft dann den `AccessControlService` auf, um für jede relevante Guild des Benutzers die **effektive Liste seiner Berechtigungs-Keys** (basierend auf direkten User-Permissions und den Permissions seiner Discord-Rollen) zu ermitteln. Diese Liste wird als Teil der `GuildSelectionInfoDto` (im `availableGuilds`\-Array) an das Frontend zurückgegeben. `req.user` in den Controllern enthält das von der `validate`\-Methode der Strategie zurückgegebene Objekt (typischerweise mit `supabaseUserId` und ggf. den geladenen Profildaten).

**Auth Flow Verfeinerung:** Der Authentifizierungsfluss wurde erfolgreich implementiert und debugged. Es wurde bestätigt, dass Supabase Auth JWTs mit **HS256** unter Verwendung des SUPABASE\_JWT\_SECRET signiert werden (da der JWKS-Endpunkt leer war). Die Nest.js JwtStrategy wurde entsprechend angepasst und validiert die Tokens nun korrekt. Der AuthController (getSession) kann den Supabase User (sub-Claim) erfolgreich extrahieren, das zugehörige user\_profiles (via auth\_id FK) finden oder neu erstellen und die Liste der relevanten guild\_members (via user\_id FK) abrufen.

**Auth-Implementierung:** Die Authentifizierung wurde vollständig implementiert, basierend auf der Logik des alten Dashboards, aber angepasst an den neuen Stack. Erhebliche Probleme beim Login, die sich durch den Fehler "invalid request: both auth code and code verifier should be non-empty" im Callback äußerten, wurden gelöst durch:

* Umstellung von createClientComponentClient auf createMiddlewareClient in lib/auth.ts und korrekte Übergabe von req/res  
* Umstellung von localStorage auf supabase.auth.getSession() zum Holen des Tokens in services/api.ts  
* Korrekte Verwendung der verschiedenen Supabase-Client-Varianten (createClientComponentClient im Frontend, createRouteHandlerClient im Backend-Callback)  
* Sicherstellung korrekter Site URL und Redirect URL Konfiguration

Der Authentifizierungsfluss funktioniert nun erfolgreich. Nutzer können sich via Discord einloggen, die Session wird clientseitig erkannt, der Backend-Call zur /auth/session funktioniert, und der AuthGuard schützt die Dashboard-Routen.

### **2.4 Kontext-Level (Mandantenfähigkeit)**

Die resource\_scopes-Tabelle ist der zentrale polymorphe Ankerpunkt, um Ressourcen sauber einem Level zuzuordnen. Jede Ressource (z.B. categories, listings) hat einen resource\_scope\_id FK. Das vereinfacht Abfragen, die über alle Level gehen könnten, und hält die Ressourcentabellen sauberer (keine scope\_type, guild\_id, alliance\_id, group\_id Spalten in jeder Tabelle).

Die resource\_scopes-Tabelle muss sicherstellen (DB-Constraint), dass immer nur *einer* der FKs (guild\_id, alliance\_id, group\_id) gesetzt ist, passend zum scope\_type.

#### **Guild (Standard)**

Standard-Scope, alles auf einen Server bezogen.

#### **Allianz**

Multi-Guild-Verbund (Master/Slave). DB-Tabellen: alliances, alliance\_memberships. Ressourcen wie categories werden über resource\_scopes mit der Allianz verknüpft. Bot-Aktionen (z.B. Kategorie erstellen) müssen auf *allen* Slave-Guilds ausgeführt werden. Punkte (points\_balances) können Allianz-bezogen sein.

#### **Gruppe**

Sub-Scope innerhalb einer Guild. DB-Tabellen: groups, group\_members (Verknüpfung zu Discord-Rollen/Usern). Ressourcen über resource\_scopes mit der Gruppe verknüpft. Ermöglicht spezifische Regeln/Punkte pro Gruppe.

### **2.5 Frontend Design & UX Philosophie**

**Ziel:** Ein modernes, intuitives und visuell einzigartiges Dashboard (Referenz: Salesforce Screenshot), das sich durch Klarheit, Responsivität und einen "WOW"-Effekt mittels flüssiger Animationen auszeichnet.

**Layout:** Fixierte, einklappbare Sidebar (mit "Keller"-Animation), eine Top-Bar mit globalen Elementen und kontextabhängiger, morphingfähiger Sekundärnavigation sowie ein Hauptinhaltsbereich mit kartenbasierter Darstellung.

**Responsivität:** Dynamische Anpassung an Bildschirmgrößen durch gezieltes Ausblenden, Umstrukturieren und Zusammenfassen von Navigationselementen (z.B. Aktions-Icons zu Dropdown, Verlagerung von Funktionen in Menüs). Verwendung fester Breakpoints als Fallback, aber dynamische Breitenmessung wird für bestimmte Elemente angestrebt.

**Farbschema:** Primär Dark Mode mit differenzierten dunklen Grau-/Blautönen und einer leuchtenden Akzentfarbe (Grün).

**Layout-Details:**

* **SideNav-Styling:** Implementierung des "Keller"-Effekts mit dunklerem Hintergrund (\#0c111b), Gradient, ohne äußeren Schatten, mit subtilem inneren Schatten auf dem Hauptinhalt (wenn ausgeklappt). Breiten-Animation mit Framer Motion zwischen 64px und 240px. Icon-Animation (leichtes Absinken) und Text-Animation (Fade/Slide) beim Ausklappen.  
* **TopNav-Styling:** SideNav-Toggle in der Mitte (links von SubNav) mit Icons für geöffneten/geschlossenen Zustand. Dynamisches Icon in der SubNav, basierend auf dem aktiven Hauptbereich. Kontextuelle Sub-Navigation, die sich dem aktiven Bereich anpasst.  
* **Responsivität-Details:** Breakpoints für das Ausblenden/Zusammenfassen von Elementen:  
  * Action Icons \-\> Menü: \< 1536px (2xl)  
  * Settings Icon: \< 1280px (xl)  
  * Nav Icon (SubNav): \< 1280px (xl)  
  * Bell Icon: \< 1150px  
  * Logo: \< 375px  
  * SideNav klappt unter 1100px automatisch ein  
  * SideNav wird unter 768px komplett ausgeblendet  
  * MobileDrawer wird unter 768px aktiviert

**Login-Seite Design:** Nach mehreren Iterationen wurde ein finales Design implementiert, das auf einem "Bot Manager"-Vorbild basiert, mit zentrierter Karte, Logo mit Ringen, Bot-Preview-Pane, Akzent-Button, subtilen Hintergrund-Elementen und 3D-Tilt-Effekt.

**Ergänzen:** Ein Schlüsselelement des Designs ist die NotchedBox-Komponente, ein weißer Inhaltscontainer mit einem charakteristischen, konfigurierbaren "Nasen"-Ausschnitt am oberen Rand. Dieser Ausschnitt ermöglicht das Platzieren von kontextuellen Steuerelementen (wie Tabs oder Aktionsbuttons) direkt über dem Hauptinhalt, wodurch eine visuell integrierte und platzsparende UI entsteht. Die Realisierung erfolgt durch einen dynamisch via JavaScript generierten clip-path.

## **3\. BERECHTIGUNGS- & ADMINISTRATIONSKONZEPT**

### **3.1 Discord Admin Funktionen**

Dashboard-Bereich zur Konfiguration der Guild-spezifischen Bot-Einstellungen. Beinhaltet auch die Zuweisung von Dashboard-Zugriffsrechten. Muss Zugriff auf das interne RBAC-System haben, um Dashboard-Rollen zuzuweisen.

### **3.2 Internes Rollen Management (RBAC)**

**Konzept:** Entkoppelt von Discord-Rollen, aber verknüpfbar. Dient der feingranularen Steuerung von Backend-Aktionen und Dashboard-UI.

**DB-Tabellen:**

* dashboard\_roles (interne Rollen)  
* permissions (atomare Aktionen)  
* dashboard\_role\_permissions (Rolle → Perms)  
* guild\_user\_dashboard\_roles (User → Rolle pro Guild)  
* guild\_discord\_role\_dashboard\_roles (Discord Rolle → Rolle pro Guild)

**Funktionsweise:** Guard (PermissionGuard) im Backend prüft anhand von permissionKey, ob der anfragende User (direkt oder via Discord-Rolle) eine Dashboard-Rolle besitzt, die diese Permission gewährt.

Muss flexibel genug sein, um auch komplexe Berechtigungen abzubilden (z.B. "darf nur eigene Listings löschen" vs. "darf alle Listings in der Guild löschen"). Die permissionKey-Strings sollten einer klaren Nomenklatur folgen (z.B. resource:action:scope, wie zone:update:points). Der AccessControlService muss die Hierarchie (User-Zuweisung \> Discord-Rollen-Zuweisung) korrekt berücksichtigen.

**Implementierungsdetail:** Der AccessControlService sollte gecachte Ergebnisse liefern können (z.B. via Redis oder In-Memory-Cache mit kurzer TTL), um nicht bei jeder Anfrage die komplexen Berechnungen (User-Rollen \+ Discord-Rollen → Dashboard-Rollen → Permissions) durchführen zu müssen. Cache-Invalidierung bei Zuweisungsänderungen ist wichtig.

### **3.3 Super Admin Rolle**

Voller Systemzugriff, 2FA erforderlich. Muss klar von normalen Guild-Admins getrennt sein. Zugriff auf alle Daten bedeutet explizite Umgehung von Scope-Filtern in Service-Methoden, wenn der aufrufende User is\_super\_admin.

## **3\. BERECHTIGUNGS- & ADMINISTRATIONSKONZEPT (Überarbeitet)**

**3.1. Philosophie: Discord-Rollen-zentriert mit Flexibilität** Das Berechtigungssystem zielt darauf ab, für Server-Administratoren intuitiv zu sein, indem es primär auf der bekannten Struktur von **Discord-Rollen** aufbaut. Gleichzeitig bietet es Flexibilität für individuelle Rechtevergabe.

**3.2. Kernkomponenten:**

* **Permissions (Atomare Aktionen):** Eine zentral definierte Liste aller möglichen Aktionen im System (z.B. `category:create`, `zone:delete`, `trading:listing:create`). Gespeichert in der Tabelle `permissions`.  
* **Direkte Zuweisung an Discord-Rollen:** Admins können im Dashboard spezifische `permissions` direkt den auf ihrem Server existierenden **Discord-Rollen** zuweisen. Diese Zuweisungen werden in der Tabelle `guild_discord_role_permissions` gespeichert. Dies ist der **Hauptweg** zur Rechteverwaltung.  
* **Direkte Zuweisung an User:** Für Ausnahmefälle können Admins `permissions` auch direkt einzelnen **Usern** zuweisen, unabhängig von deren Discord-Rollen. Gespeichert in `guild_user_permissions`.  
* **(Optional / Aufgeschoben) Permission Sets / Interne Rollen:** Das Konzept, interne Rollen (`dashboard_roles`) zur Bündelung von Permissions zu erstellen und diese dann Usern/Rollen zuzuweisen, wird **vorerst nicht implementiert**, kann aber später zur Vereinfachung hinzugefügt werden.

**3.3. Ermittlung Effektiver Rechte:** Wenn eine Aktion ausgeführt wird, prüft der `AccessControlService` im Backend für den User und die aktuelle Guild:

1. Hat der User die benötigte Permission direkt (`guild_user_permissions`)?  
2. **ODER:** Hat mindestens eine der Discord-Rollen des Users (aus `guild_members`) die benötigte Permission zugewiesen (`guild_discord_role_permissions`)? Die Kombination dieser Rechte ergibt die effektiven Berechtigungen des Users.

**3.4. Backend-Implementierung:**

* Der `AccessControlService` kapselt die Logik zur Rechteprüfung und \-verwaltung (Zuweisung/Entfernung).  
* Ein `PermissionGuard` schützt API-Routen basierend auf den benötigten `permissionKeys`.  
* Der `/api/v1/auth/session`\-Endpunkt liefert die effektiven `permissionKeys` pro Guild an das Frontend.

**3.5. Frontend-Implementierung:**

* Ein Hook (z.B. `useHasPermission(permissionKey: string)`) prüft clientseitig, ob der eingeloggte User die benötigte Berechtigung für die aktuell ausgewählte Guild besitzt (basierend auf den vom Backend gelieferten Daten).  
* UI-Elemente (Buttons, Formularfelder etc.) werden basierend auf dem Ergebnis dieses Hooks konditional gerendert oder deaktiviert.

**3.6. Discord Admin Funktionen (Dashboard-Bereich):** Der dedizierte Bereich für Guild-Admins im Dashboard wird eine Oberfläche bieten, um:

* Verfügbare `permissions` einzusehen.  
* `permissions` den **Discord-Rollen** der Guild zuzuweisen oder zu entziehen.  
* Optional: `permissions` einzelnen **Usern** zuzuweisen oder zu entziehen.  
* (Später optional: "Permission Sets" zu verwalten).

**3.7. Super Admin Rolle:** (Dieser Abschnitt kann weitgehend unverändert bleiben, da die Rolle weiterhin globalen Zugriff hat, unabhängig vom implementierten RBAC-Modell für Guilds).

## **4\. PLUGIN-BESCHREIBUNGEN**

### **4.1 Plugin: Dynamic Voices & Tracking**

#### **4.1.1 Modul: Kategorie und Zonen**

**Zweck:** Grundbausteine für organisierte Voice-Aktivität mit Tracking/Gamification.

**Entität categories:** Definiert einen logischen Container. Enthält name, resource\_scope\_id (Wo gehört sie hin?), discord\_category\_id (Verknüpfung zu Discord, NULL wenn extern gelöscht oder Setup=ON ohne Erstellung), is\_visible\_default (Basis-Sichtbarkeit für @everyone), default\_tracking\_enabled (Master-Schalter für Tracking in dieser Kat.), setup\_flow\_enabled (Schaltet dynamisches Verhalten an/aus), warteraum\_channel\_id, setup\_channel\_id (IDs der speziellen Kanäle bei Setup=ON).

**Entität zones:** Definiert eine "Art" von Voice Channel innerhalb einer Kategorie. Enthält category\_id (FK), name ("Besprechung 1"), zone\_key ("BSP", für Präfix), points\_per\_interval, interval\_minutes, discord\_channel\_id (Verknüpfung zum fixen Voice Channel, *nur* wenn categories.setup\_flow\_enabled=false).

**Entität category\_discord\_role\_permissions:** N:M-Tabelle. Verknüpft categories.id mit discord\_role\_id (String). Speichert can\_view, can\_connect Booleans für spezifische Discord-Rollen in dieser Kategorie (überschreibt is\_visible\_default).

**Szenario:** Admin erstellt Kategorie "Team-Talks" (Guild-Level, Sichtbar=AN, Tracking=AUS, Setup=AUS) und weist Discord-Rolle "Teammitglied" zu. Bot erstellt Discord-Kategorie "Team-Talks", setzt Permissions (View für @everyone, Connect nur für "Teammitglied" und Bot). Admin erstellt Zone "Besprechung 1" → Bot erstellt Voice Channel "\[BSP\] Besprechung 1" in der Kategorie.

**Datenbank Schema Bestätigung:** Die Existenz der Tabellen categories, zones und der N:M-Tabelle category\_discord\_role\_permissions wurde bestätigt. Die korrekten Fremdschlüssel (user\_profiles.auth\_id → auth.users.id, guild\_members.user\_id → user\_profiles.id, zones.category\_id → categories.id, category\_discord\_role\_permissions.category\_id → categories.id) sind entscheidend.

#### **4.1.2 Herausforderung: Zwei-Wege-Synchronisation**

**Ziel:** Hohe Konsistenz DB ↔ Discord.

**MVP-Ansatz:** Dashboard → Discord Änderungen werden umgesetzt. Discord → DB nur einfache Updates (Namen, Löschungen markieren/entfernen). Keine automatische "Selbstheilung" bei unerlaubten Discord-Aktionen in V1.

**Der MVP-Ansatz wurde erfolgreich umgesetzt: Der TwoWaySyncService reagiert auf channelUpdate (aktualisiert Namen/Key in DB) und channelDelete (setzt discord\_category\_id / discord\_channel\_id auf null in DB). Es findet keine automatische Neuerstellung oder Zurückverschiebung statt.**

**Szenario:** Admin löscht Zone "Besprechung 1" manuell in Discord. BotGateway empfängt channelDelete. TwoWaySyncService wird benachrichtigt, findet den Zone-Eintrag via discord\_channel\_id. **MVP:** Setzt discord\_channel\_id in DB auf null, loggt Warnung. **Post-MVP (Selbstheilung):** TwoWaySyncService ruft DiscordApiService.createVoiceChannel mit den Daten aus der DB auf, um Kanal neu zu erstellen, sendet PN an Admin. *Risiko hierbei: Was, wenn der Admin den Kanal absichtlich (temporär) gelöscht hat?* Alternative: Nur im Dashboard als "in Discord gelöscht" markieren, Admin muss neu erstellen/synchronisieren.

**Langfristig:** Robuste Listener für channelUpdate/Delete, roleUpdate etc. mit Logik zur Validierung und ggf. Korrektur/Benachrichtigung.

#### **4.1.3 User Story: Kategorie-Erstellung (Sehr detailliert)**

**Frontend (Dashboard):** Admin navigiert zu /dashboard/categories. Klickt "Neue Kategorie". Ein Modal (CategoryForm) öffnet sich.

**Frontend:** Admin gibt Namen "Heroische Raids" ein. Wählt Scope "Guild" (aus currentGuild). Wählt aus dem Rollen-Dropdown (geladen via GET /guilds/:guildId/roles) die Discord-Rollen "Raider" und "Raid Lead" aus. Setzt "Sichtbar"=OFF (nur für Rollen). Setzt "Tracking"=ON. Lässt "Setup"=OFF.

**Frontend:** Klickt "Speichern". Der useCategories-Hook ruft die saveCategory-Funktion auf, die categoriesService.createCategory aufruft, welches einen POST-Request an /api/v1/categories mit folgendem CreateCategoryDto sendet: { scope: { scopeType: 'guild', scopeId: 'GUILD\_UUID' }, name: 'Heroische Raids', discordRoleIds: \['ROLE\_ID\_RAIDER', 'ROLE\_ID\_RAIDLEAD'\], isVisibleDefault: false, defaultTrackingEnabled: true, setupFlowEnabled: false }.

**Backend (CategoriesController):** Empfängt Request. JwtAuthGuard validiert Token. PermissionGuard (später) prüft category:create. Ruft CategoriesService.createCategory mit DTO und userId auf.

**Backend (CategoriesService):** a. Erstellt resource\_scopes-Eintrag (scope\_type='guild', guild\_id='GUILD\_UUID'). Holt resource\_scope\_id. b. Erstellt category\_discord\_role\_permissions-Einträge für "Raider" und "Raid Lead" mit can\_view=true, can\_connect=true. c. Ruft DiscordApiService.createCategoryChannel auf mit name='Heroische Raids', guildId (aus Scope) und Permissions: @everyone → ViewChannel=DENY, Bot → View/Manage/Roles=ALLOW, Raider → View/Connect=ALLOW, Raid Lead → View/Connect=ALLOW. d. DiscordApiService führt Discord API Call aus, gibt Discord Kategorie-ID zurück (DISCORD\_CAT\_ID). e. CategoriesService erstellt categories-Eintrag in DB mit name, resource\_scope\_id, discord\_category\_id='DISCORD\_CAT\_ID', isVisibleDefault=false, defaultTrackingEnabled=true, setupFlowEnabled=false. f. Gibt CategoryDto zurück an Controller.

**Backend (CategoriesController):** Sendet 201 Created mit CategoryDto zurück an Frontend.

**Frontend:** categoriesService.createCategory Promise wird resolved. useCategories Hook ruft fetchCategories neu auf, um Liste zu aktualisieren. Zeigt Erfolgs-Toast an. Modal schließt sich.

**Detail Rollen-Dropdown:** Frontend ruft API-Endpunkt (GET /guilds/:guildId/roles) auf, um aktuelle Rollenliste (ID, Name, Farbe) zu holen. Zeigt diese visuell an. Beim Speichern werden nur die *IDs* der ausgewählten Rollen im CreateCategoryDto.discordRoleIds an das Backend gesendet.

**Problem erkannt und gelöst:** Die Funktionalität, Discord-Rollen bei der Kategorie-Erstellung/-Bearbeitung im Dashboard auszuwählen und diese zur Berechtigungssteuerung (Switch "Sichtbar") zu nutzen, wurde zwar im Frontend UI (Rollen-Dropdown) und in den Backend DTOs (discordRoleIds) berücksichtigt, aber die **Speicherung dieser Zuordnungen in der Datenbank (category\_discord\_role\_permissions) funktionierte initial nicht.** Der Fehler lag nicht am fehlenden DB-Schema, sondern an der **Fehlerbehandlung im CategoriesService**. Das .insert() für die category\_discord\_role\_permissions war zwar vorhanden, aber ein eventueller Fehler (permissionsError) wurde nur geloggt und **nicht weitergeworfen**. Dadurch lief die createCategory/updateCategory-Methode erfolgreich durch, obwohl die Rollen nicht gespeichert wurden. Die Fehlerbehandlung wurde verschärft, sodass ein Fehler beim Speichern der Rollenberechtigungen jetzt eine HttpException auslöst und die gesamte Operation fehlschlägt.

#### **4.1.4 Modul: Switches**

**isVisibleDefault:** Steuert die @everyone Permissions in Discord. **defaultTrackingEnabled:** Wird vom TrackingService gelesen. **setupFlowEnabled:** Ändert das Verhalten von CategoriesService.create/update und ZonesService.create/update fundamental.

#### **4.1.5 Modul: Setup**

**Zweck:** Ermöglicht User-generierte, temporäre Kanäle nach Zwangs-Interaktion (Tracking-Wahl).

**Komponenten:** Warteraum \+ Setup-Kanal werden initial erstellt. Bot postet Embed mit Button.

**Flow:** Klick → Ephemeral(Tracking) → Klick → Ephemeral(Zone) → Modal(Name) → Kanalerstellung \+ Verschieben.

**Zugriff:** Nur mit dynamischer Standard-Setup-Rolle (dynamic\_setup\_roles), die nach Flow-Abschluss vergeben und bei Inaktivität der Kategorie gelöscht wird.

**Szenario:** User joint Warteraum. Klickt Button im \#setup. Sieht Ephemeral "Tracking aktivieren?". Klickt "Ja". Sieht Ephemeral "Zone wählen" (Dropdown: "\[CZ\] Contested Zone", "\[PVE\] Peaceful Area"). Wählt "\[CZ\]". Sieht Modal "Kanalname?". Gibt "Mein Squad" ein. Klickt "Erstellen". SetupService empfängt Interaktionen, prüft Zustand, erstellt Discord Voice Channel "CZ \- Mein Squad" via DiscordApiService, erstellt Eintrag in dynamic\_channels, erstellt dynamic\_setup\_roles (falls noch nicht da), weist User diese Rolle via DiscordApiService zu, verschiebt User via DiscordApiService.

**DB Tabellen:** dynamic\_channels (speichert aktive Kanäle, ihren Ersteller, Zone etc.), dynamic\_setup\_roles (speichert die Discord Role ID der *Standard*\-Zugangsrolle pro Kategorie).

**Ephemeral Messages:** Wichtig, damit die Interaktionen nur für den auslösenden User sichtbar sind und den Setup-Kanal nicht überfluten.

**State Management:** Der SetupService muss sich potenziell den aktuellen Schritt eines Users im Setup-Flow merken (z.B. in einer In-Memory-Map oder Redis), falls der Flow komplexer wird oder über mehrere Interaktionen geht.

**Rollen-Logik (Standard):** Bei Kanalerstellung: SetupService prüft, ob dynamic\_setup\_roles für die categoryId existiert. Wenn nein → DiscordApiService.createRole (Name z.B. "Zugang \[KategorieName\]"), speichert ID in dynamic\_setup\_roles. Weist Rolle dem *User* via DiscordApiService.addMemberRole zu. Setzt Kanal-Permissions via DiscordApiService.editChannelPermissions (erlaubt Connect für diese Rolle). Bei letztem User-Leave: SetupService prüft, ob *keine* dynamic\_channels mehr für die Kategorie existieren → Löscht Discord-Rolle via DiscordApiService.deleteRole, löscht Eintrag aus dynamic\_setup\_roles.

#### **4.1.6 Modul: Zone**

Definiert Name, Key (für Kanal-Präfix), Punkte & Zeitintervall. Erbt Scope/Permissions von Kategorie.

#### **4.1.7 Modul: Punkte**

**Struktur:** Robustes System (points\_balances, points\_transactions) mit Scope-Unterstützung (Allianz/Guild/Gruppe) und Währungs-Flexibilität. Transaktionen als Audit Log.

**Datenmodell-Überlegung:** points\_balances speichert den *aktuellen* Stand. points\_transactions ist das *Logbuch*. Bei einer Punktevergabe (Tracking) oder einem Abzug (Handel) wird *zuerst* ein Eintrag in points\_transactions erstellt und *dann* der Saldo in points\_balances **atomar** aktualisiert (z.B. mit UPDATE points\_balances SET balance \= balance \+ ? WHERE ...). Dies stellt Nachvollziehbarkeit sicher. Die Struktur muss user\_profile\_id, resource\_scope\_id und currency\_id kombinieren, um verschiedene Konten abzubilden.

**Währungen:** Tabelle currencies definieren (id, key, name, is\_internal). points\_balances und points\_transactions haben currency\_id FK. Ermöglicht spätere Erweiterung (aUEC etc.).

#### **4.1.8 Modul: Tracking**

**Funktion:** Kernlogik in TrackingService. Lauscht auf voiceStateUpdate. Akkumuliert Zeit in user\_tracking\_state. Berücksichtigt User-Einwilligung (global & Setup). Löst PointsService.awardPoints aus.

**Detail Zeitakkumulation:** Wenn User Kanal betritt, liest TrackingService den accrued\_minutes-Wert aus user\_tracking\_state für diese User/Zone/Guild-Kombination. Startet Timer. Wenn User verlässt (oder Intervall voll ist): Berechnet vergangene Zeit seit last\_tracked\_at, addiert sie zu accrued\_minutes. Wenn accrued\_minutes \>= interval\_minutes: Löst PointsService.awardPoints aus, zieht interval\_minutes von accrued\_minutes ab. Speichert neuen accrued\_minutes-Wert und aktuellen Timestamp in user\_tracking\_state. Wenn User nicht tracken will, wird kein State gelesen/geschrieben.

**Präzision:** Zeitmessung sollte serverseitig erfolgen, um Manipulation zu verhindern. user\_tracking\_state speichert accrued\_minutes und last\_tracked\_at. Bei voiceStateUpdate (Join): last\_tracked\_at \= now(). Bei Leave: delta \= now() \- last\_tracked\_at, new\_accrued \= accrued\_minutes \+ delta\_minutes. Punkte berechnen, accrued\_minutes aktualisieren, last\_tracked\_at aktualisieren.

### **4.2 Plugin: Voice Kanal Manager**

**Funktion:** User-Kontrolle über dynamische Kanäle. Konflikt "User zulassen" vs. Setup-Zwang.

**Szenario "User Zulassen":** User A erstellt dynamischen Kanal "Squad Alpha". User A nutzt Button "/manage allow @UserB". VoiceManagerService empfängt Interaktion. Da Setup aktiv: Erstellt *neue* temporäre Discord Rolle "Kanal-Squad-Alpha-Zugang" via DiscordApiService, speichert ID in dynamic\_channel\_access\_roles zusammen mit User B's ID. Ändert Kanal-Permissions via DiscordApiService: Entfernt Standard-Setup-Rolle, fügt neue "Kanal-Squad-Alpha-Zugang"-Rolle hinzu. User B startet Setup-Flow für die Kategorie. Nach Abschluss erhält User B die *Standard*\-Setup-Rolle UND die *spezifische* "Kanal-Squad-Alpha-Zugang"-Rolle. User B kann jetzt "Squad Alpha" betreten. Wenn Kanal später gelöscht wird, werden *beide* temporären Rollen (Standard \+ Spezifisch) vom Bot gelöscht.

**Rollenlimit-Risiko-Mitigation (Idee):** Anstatt *immer* eine neue Rolle für "User Zulassen" zu erstellen, könnte man prüfen, ob bereits eine Rolle für eine *identische* Gruppe von zugelassenen Usern in dieser Kategorie existiert und diese wiederverwenden. Oder: Rollen nur erstellen, wenn die Anzahl aktiver dynamischer Kanäle/Rollen unter einem Schwellenwert liegt. Oder: Feature im MVP weglassen.

### **4.3 Plugin: Warenwirtschaft / Handel**

**Konzept:** Integrierter Marktplatz für In-Game Items (Start: SC, erweiterbar). Handel auf allen Levels. Fixpreis (MVP), Auktion/Preisvorschlag (später). Währungen (Punkte, In-Game).

**Item-Daten:** Externe APIs (z.B. uexcorp) via ItemService mit Caching (Redis) \+ selektive DB-Speicherung (listed\_items). Periodische Updates der gespeicherten Daten.

**Item-Daten Caching:** Wenn User im Dashboard nach SC-Schiffen sucht, ruft Frontend Backend-Endpunkt /trading/items/search auf. ItemService prüft Redis-Cache. Wenn nicht vorhanden: Ruft uexcorp API auf, speichert Ergebnis in Redis (z.B. für 1 Tag), gibt Daten zurück. *DB-Speicherung:* Wenn User ein Item aus der Suche auswählt und listet (POST /trading/listings), liest ListingService die vollständigen Daten (ggf. erneut aus API/Cache) und speichert sie in listed\_items, bevor das listings-Objekt erstellt wird.

**Sonderfall Entität verkauft:** Punkte werden vernichtet, Entität erhält MwSt. auf Verwaltungskonto (entity\_balances).

**Externe APIs:** ItemService braucht eine flexible Struktur, um verschiedene API-Clients (uexcorp, evtl. EVE ESI, WoW Armory etc.) zu integrieren. Ein Interface/Adapter-Pattern wäre sinnvoll.

**Caching:** Redis mit TTL (z.B. 1 Tag) für API-Responses, um Rate Limits und Latenz zu reduzieren.

**DB listed\_items.attributes (JSONB):** Muss flexibel genug sein, um unterschiedliche Attribute verschiedener Spiele/Items aufzunehmen. Eine Normalisierung wäre zu komplex. Frontend muss lernen, diese variablen Attribute darzustellen.

### **4.4 Plugin: Verwaltung**

Ermöglicht Entitäten (Guild/Allianz/Gruppe) die Verwaltung ihrer "Konten" (entity\_balances) und Teilnahme am Handel.

entity\_balances sollte wahrscheinlich pro Währung sein (Tabelle entity\_currency\_balances mit resource\_scope\_id, currency\_id, balance).

### **4.5 Zukünftiges Plugin: Rechtsform / Abstimmungen**

Vision für Governance-Features. Corporate Governance, Rollen, Abstimmungssysteme.

## **5\. TECHNISCHE IMPLEMENTIERUNGSDETAILS**

### **5.1 Datenbank Schema**

**Fokus:** Korrekte Beziehungen und Schlüssel (auth\_id in user\_profiles, user\_id in guild\_members). Nutzung von resource\_scopes. Anpassung der RBAC-Tabellen gemäß überarbeitetem Konzept (siehe Abschnitt 3), primär `permissions`, `guild_discord_role_permissions`, `guild_user_permissions`. Indizes auf allen Fremdschlüsseln und häufig verwendeten Filterspalten (discord\_id, auth\_id, discord\_category\_id, discord\_channel\_id, zone\_key, currency\_key, listing.status). Verwendung von ON DELETE CASCADE bei Fremdschlüsseln, wo sinnvoll (z.B. zones löschen, wenn categories gelöscht wird; guild\_members löschen, wenn user\_profiles oder guilds gelöscht wird). points\_balances.balance und points\_transactions.amount als NUMERIC für Präzision.

**Zusätzliche Indizes:** Auf created\_at/timestamp in Transaktionstabellen. Ggf. auf name-Spalten für Suche.

### **5.2 Backend Architektur (Nest.js)**

**Struktur:** Strikte Einhaltung der modularen Nest.js-Struktur. Klare Service-Verantwortlichkeiten. Nutzung von adminClient im DatabaseService für privilegierte Operationen.

Das `PermissionsModule` und seine Services (`PermissionsService`, `AccessControlService`, optionaler `RolesService`) wurden gemäß der überarbeiteten Struktur angepasst (siehe aktualisierter Abschnitt 3).

**Ergänzungen zu Backend Architektur:**

Der `AccessControlService` wurde vom `GuildsService` entkoppelt, was die Modularität verbessert und zirkuläre Abhängigkeiten reduziert. Der Service holt nun Rollen direkt aus der Datenbank statt sie über den GuildsService zu beziehen.

Der globale `JwtAuthGuard` wird jetzt über den `APP_GUARD`\-Provider im `AuthModule` registriert, was eine zentralere und sauberere Konfiguration der Authentifizierung ermöglicht.

**core/queue/queue.module.ts:** Konfiguriert BullMQ (forRootAsync, registerQueue mit Standard-Backoff), stellt den **@upstash/redis-Client** als Provider ('UPSTASH\_REDIS\_CLIENT') bereit und registriert den ChannelRenameProcessor.

**jobs/channel-rename.processor.ts:** Der Worker, der die 'channel-rename'-Queue verarbeitet. Injiziert DiscordApiService und den @upstash/redis-Client. Initialisiert @upstash/ratelimit. Holt letzten Namen aus Redis, prüft Rate Limit mit Upstash. Wenn Limit aktiv → wirft Fehler (→ BullMQ Retry mit Standard-Backoff). Wenn Limit frei → ruft DiscordApiService auf. Bei Erfolg/404/403 → löscht Namen aus Redis

* **DiscordApiService:** Führt Namensänderung via **direktem axios PATCH-Call** an Discord API durch, wirft spezifische HttpException bei Fehlern (inkl. 404, 403, selten 429\)  
* **BullMQ Queue:** Verwaltet die Trigger-Jobs persistent, führt Retries bei Fehlern (außer dem vom Rate Limiter verursachten) mit Standard-Backoff durch

**Explizite Nutzung:** Async/await in Services. Fehlerbehandlung mit spezifischen Nest.js Exceptions (NotFoundException, BadRequestException, ForbiddenException). Konsequente Nutzung des Logger-Service. DI nutzen, um lose Kopplung zu gewährleisten.

**Testing:** Einsatz von Jest. Unit-Tests für Services (Logik mocken), Integrationstests (mit Test-DB oder gemockter DB-Schicht) für Controller/Service-Zusammenspiel, E2E-Tests für kritische API-Flows (z.B. mit Supertest).

### **5.3 API Design (REST)**

**DTOs:** Klare DTOs mit class-validator-Dekoratoren für automatische Payload-Validierung via ValidationPipe (global oder pro Endpunkt). Konsistente Fehlerantworten.

**OpenAPI/Swagger:** Nest.js kann automatisch eine Spezifikation generieren (@nestjs/swagger), die für Frontend-Entwicklung und API-Dokumentation genutzt werden kann.

**Ergänzungen zu API Design:**

Die Berechtigungs-Endpunkte wurden angepasst, um direkt mit *Permissions* statt mit Dashboard-Rollen zu arbeiten (gemäß dem überarbeiteten Berechtigungskonzept in Abschnitt 3).

Der `/api/v1/auth/session`\-Endpunkt wurde angepasst, um die effektive Liste der `permissionKeys` pro Guild zurückzugeben. Diese Liste basiert auf den direkten User-Permissions und den Permissions der Discord-Rollen des Users und wird durch den `AccessControlService` berechnet.

**Endpunkt-Beispiele:**

* GET /api/v1/auth/session: Holt User-Profil & verfügbare Guilds nach Login  
* GET /guilds/:guildId/roles: Holt Discord-Rollen für eine Guild (Frontend Ergänzung)  
* POST /categories: Erstellt Kategorie (DB \+ Discord). Body: CreateCategoryDto  
* GET /categories?scopeType=...\&scopeId=...: Listet Kategorien für Scope  
* PUT /categories/:id: Aktualisiert Kategorie. Body: UpdateCategoryDto  
* DELETE /categories/:id: Löscht Kategorie (wenn keine Zonen)  
* POST /categories/:catId/zones: Erstellt Zone. Body: CreateZoneDto  
* GET /categories/:catId/zones: Listet Zonen einer Kategorie  
* PUT /zones/:id: Aktualisiert Zone. Body: UpdateZoneDto  
* DELETE /zones/:id: Löscht Zone

### **5.4 Bot Integration & Event Handling**

**Struktur:** BotGateway als Dispatcher. DiscordApiService für ausgehende Calls. Services implementieren die Reaktion auf Events.

**Wichtigste Events:**

* ready: Initialisierung, registerAllGuilds  
* guildCreate/Delete: GuildsService (DB Update), registerGuildMember (bei Create)  
* guildMemberAdd/Remove/Update: GuildMemberService (DB Update)  
* interactionCreate: Routing an zuständige Services (SetupService, VoiceManagerService, Plugin-Commands)  
* voiceStateUpdate: TrackingService (Zeitmessung, Punkte), SetupService (Kanal-Cleanup, Rollen-Cleanup)  
* channelUpdate/Delete: TwoWaySyncService (DB-Update für Namen/Löschung \- MVP)  
* roleUpdate/Delete: RolesCacheService (optional), TwoWaySyncService (Bereinigungen)

**Der BotGatewayService wurde angepasst, um diese Events zu empfangen und die relevanten Daten (channelId, newChannel) an die Methoden handleChannelUpdate/handleChannelDelete des TwoWaySyncService weiterzuleiten.**

**Rate Limit Handling:** DiscordApiService muss Logik enthalten, um auf 429-Fehler von Discord zu reagieren (z.B. mit exponentiellem Backoff und Retry).

### **5.5 Shared Types**

**Inhalt:** DTOs (z.B. CategoryDto, CreateZoneDto, SessionDto), Enums (ScopeType) und Kern-Interfaces, die von Backend und Frontend genutzt werden.

**Frontend Handling:** Frontend definiert eigene Enhanced\*-Typen (View Models), die von Shared Types *ableiten* oder diese *transformieren*. Klare Mapping-Funktionen. Input-Typen für Formulare.

**Ergänzungen zu Shared Types:**

Die Permissions-DTOs wurden im shared-types-Paket definiert, um eine konsistente Typstruktur zwischen Backend und Frontend zu gewährleisten.

Das `GuildSelectionInfoDto` wurde um das Feld `permissions` erweitert, das die Liste der effektiven Berechtigungen des Users für die jeweilige Guild enthält. Dies ermöglicht dem Frontend, die Benutzeroberfläche basierend auf den tatsächlichen Berechtigungen des Users anzupassen.

### **5.6 Rate Limit Handling (Kanalnamen)**

**Problem:** Discord erlaubt nur 2 Namensänderungen/10min pro Kanal. Einfache Retries oder Warten im Worker sind ineffizient oder blockierend. Gleichzeitige Änderungen für denselben Kanal müssen gedebounced werden (nur letzte Änderung zählt).

**Diskutierte Ansätze:**

* In-Memory Debounce (Verlust bei Neustart, nicht skalierbar)  
* Nur BullMQ (kein Debouncing, ungenauer Backoff)  
* BullMQ \+ Warte-im-Processor (blockierend, kein Debouncing)  
* Supabase Tabelle \+ Worker (kein Redis nötig, aber Polling, DB-Last, Worker-Komplexität bei Skalierung/Locking)  
* BullMQ \+ Redis State \+ Custom BullMQ Backoff (Probleme mit @nestjs/bullmq-Integration)

**Gewählte Lösung (Ansatz 4): BullMQ \+ Redis State \+ @upstash/ratelimit Check**

**Komponenten:**

* **CategoriesService/ZonesService:** Aktualisieren DB, speichern **letzten Namen** im Redis Hash pending\_channel\_names, fügen **Trigger-Job** (nur channelId) zur BullMQ Queue 'channel-rename' hinzu (nur wenn kein aktiver Job für die ID existiert)  
* **Redis:** Hält den letzten gewünschten Namen pro Kanal (pending\_channel\_names) und den Rate-Limit-Status (intern durch @upstash/ratelimit)  
* **@upstash/ratelimit (im Processor):** Prüft *vor* dem API-Call, ob das Limit für den channelId aktiv ist  
* **ChannelRenameProcessor:** Holt Job, holt letzten Namen aus Redis, prüft Rate Limit mit Upstash. Wenn Limit aktiv → wirft Fehler (→ BullMQ Retry mit Standard-Backoff). Wenn Limit frei → ruft DiscordApiService auf. Bei Erfolg/404/403 → löscht Namen aus Redis  
* **DiscordApiService:** Führt Namensänderung via **direktem axios PATCH-Call** an Discord API durch, wirft spezifische HttpException bei Fehlern (inkl. 404, 403, selten 429\)  
* **BullMQ Queue:** Verwaltet die Trigger-Jobs persistent, führt Retries bei Fehlern (außer dem vom Rate Limiter verursachten) mit Standard-Backoff durch

**Vorteile:** Erfüllt alle Anforderungen (Rate Limit, Konkurrenz, Debouncing, Zuverlässigkeit, Flexibilität), nicht-blockierend, nutzt spezialisierte Bibliotheken, skalierbar.

**Status:** Code wurde entsprechend dieser Logik implementiert und erfolgreich getestet (Rate Limit wird erkannt, Worker blockiert nicht, Retries funktionieren, Debouncing über Redis State).

**Verifiziert:** Die Architektur (BullMQ Queue 'channel-rename', Redis Hash pending\_channel\_names, initialer @upstash/ratelimit-Check im ChannelRenameProcessor, Fehlerbehandlung für 429 von DiscordApiService, korrekte BullMQ Backoff-Strategie) wurde in verschiedenen Szenarien erfolgreich getestet. Das System stellt sicher, dass nur die letzte gewünschte Namensänderung pro Kanal ausgeführt wird. Es überbrückt korrekt das 10-Minuten-Rate-Limit und funktioniert für mehrere Kanäle gleichzeitig.

**Upstash Command-Nutzung Analyse:** Die tatsächliche Command-Nutzung der Kernanwendung für die Rate-Limit-Logik wurde analysiert und als im Rahmen des Upstash Free Tiers für erwartbaren normalen Gebrauch eingeschätzt. Bei Bedarf kann auf eine selbst gehostete Redis-Instanz (Docker) gewechselt werden (minimale Code-Änderung).

### **5.7 Frontend UI Komponenten**

**Core UI Komponenten:** Zur Verbesserung der Modularität und Konsistenz wurden mehrere wiederverwendbare Core-UI-Komponenten entwickelt:

**ContentBox:** Ein Basis-Container mit vordefiniertem Styling (Radius, Schatten) und Breitensteuerung über eine size-Prop (xs-full, 1/7-Schritte), um Hauptinhaltsblöcke flexibel anzuordnen. Verwendet Theme-Tokens für Hintergründe (hell/dunkel).

**FilterDropdown:** Kapselt einen einzelnen Filter-Button (Pillenform mit Icon-Kreis) und das zugehörige Dropdown-Menü (implementiert mit Menu.Root etc.). Nimmt Label, Optionen und Handler als Props. Styling basiert auf Theme-Tokens (button.filter.\*).

**FilterBar:** Rendert eine horizontale Leiste mit mehreren FilterDropdowns basierend auf einem Konfigurations-Array.

**NotchedBox:** Stellt den weißen Haupt-Inhaltscontainer mit dem charakteristischen "Nasen"-Ausschnitt dar.

**Implementierung:** Verwendet JavaScript (useEffect, ResizeObserver, useState, useRef), um dynamisch einen SVG-Pfad für einen clip-path zu berechnen. Dieser Ansatz ermöglicht präzise, abgerundete Ecken für die Nase und ist responsiv.

**Konfigurierbarkeit:** Breite, Höhe und Radius der Nase können über Props (notchWidth, notchHeight, notchRadius) gesteuert werden. notchWidth akzeptiert responsive Werte (z.B. { base: '60%', md: '340px' }).

**Integrierte Buttons:** Die Komponente kann nun optional ein Array von Button-Konfigurationen (buttons-Prop: { label, isActive, href?, onClick?, count? }) entgegennehmen und rendert diese Buttons direkt im ausgeschnittenen Bereich der Nase. Das Styling der Buttons (aktiv/inaktiv, Farben, Badges) ist ebenfalls über Props konfigurierbar und nutzt Theme-Tokens (button.notch.\*).

**Performance-Hinweis:** Die aktuelle JS-basierte Implementierung zeigt Performance-Schwächen (Flackern/Stocken bei Resize). Eine Optimierung mittels Debouncing/Throttling der calculatePath-Funktion ist als nächster Schritt geplant.

**Verwendung:** Wird auf der Dashboard-Übersichtsseite (dashboard/page.tsx) und der Kategorieseite (dashboard/categories/page.tsx) eingesetzt.

## **6\. MVP DEFINITION & IMPLEMENTIERUNGSPLAN**

### **MVP Scope**

Core Auth/Guilds; Dynamic Voices (Kat/Zone CRUD, Setup Basis, Tracking Basis, Punkte Basis \- alles Guild-Level); Basis-WaWi (Fixpreis, SC, Punkte \- Guild-Level); Zwei-Wege-Sync (Namen/Löschung).

### **Implementierungsplan**

1. **Phase 0: Setup** (Abgeschlossen)  
2. **Phase 1: Auth & Guild Kontext** (Abgeschlossen)  
3. **Phase 2: Kategorien & Zonen Basis:**  
   * Backend CRUD API: ✅ Implementiert  
   * Backend DB-Interaktion (Rollen): ✅ Implementiert  
   * Backend Rate Limiting (Kanalnamen): ✅ Implementiert & Getestet (Ansatz 4\)  
   * Backend Discord-Interaktion (Kategorie/Kanal Erstellen/Löschen): ✅ Funktioniert (bestätigt)  
   * Frontend Realtime UI Updates: ✅ Funktioniert (nach RLS-Fix und Handler-Korrektur)  
   * Frontend UI Komponenten: ✅ Implementiert und getestet  
4. **Phase 3: Tracking & Punkte Basis** (Nächste Phase)  
5. **Phase 4: Setup Flow Implementierung**  
6. **Phase 5: Warenwirtschaft MVP**  
7. **Phase 6: Testing & Release**

## **7\. SCHLÜSSELHERAUSFORDERUNGEN & RISIKEN**

### **Hauptrisiko: Komplexitätsbewältigung**

**Mitigation:** Strikte Einhaltung der modularen Nest.js-Struktur, iterativer MVP-Ansatz, dieses Dokument als Leitfaden.

### **Weitere Risiken**

* **Zwei-Wege-Sync:** Technische Herausforderung. Pragmatischer MVP-Start (Erkennung statt Selbstheilung)  
* **Dynamisches Rollenmanagement:** Logikkomplexität und Discord-Rollenlimit (250)  
* **Skalierbarkeit (Langfristig):** DB-Last, API-Limits, Bot-Sharding. Mitigation: Effiziente Implementierung, spätere Optimierung bei Bedarf  
* **Externe Abhängigkeiten (WaWi):** Zuverlässigkeit der Item-APIs  
* **Testabdeckung:** Umfassendes Testen ist nötig, aber durch Nest.js gut unterstützt

## **8\. ZUKUNFTSVISION & WEITERENTWICKLUNG**

* Volle Level-Implementierung (Allianz/Gruppen)  
* Erweitertes RBAC  
* Perfekte Zwei-Wege-Synchronisation  
* Voller Voice Channel Manager  
* Erweiterte Warenwirtschaft (Auktionen, Währungen, Spiele)  
* Verwaltungs-Plugin  
* Rechtsform/Abstimmungs-Plugin

## **9\. AKTUELLER STAND & FOKUS (v1.2)**

### **Phase 1 (Auth & Guild-Kontext)**

✅ Abgeschlossen und funktionsfähig

### **Phase 2 (Kategorien & Zonen Basis)**

**Backend:** ✅ ABGESCHLOSSEN & VERIFIZIERT

* CRUD API für Kategorien/Zonen implementiert  
* DB-Interaktionen (inkl. Rollenberechtigungen) implementiert  
* Discord-Interaktionen (Erstellen, Löschen, Permissions) funktionieren  
* Rate-Limit-Handling & Debouncing für Namensänderungen robust implementiert und getestet

**Frontend:** ✅ ABGESCHLOSSEN

* Datenlogik (Hooks, Services) implementiert  
* Realtime UI Updates (via Supabase) funktionieren  
* UI Komponenten implementiert und getestet  
* Dashboard-Layout (SideNav, TopNav) implementiert mit Chakra UI v3:  
  * Grundstruktur mit Flexbox implementiert  
  * Theme mit Dark Mode und spezifischen Navigationsfarben erstellt  
  * TopNav visuell nahe an Vorlage angepasst  
  * Responsivität der TopNav implementiert  
  * SideNav mit "Keller"-Effekt und Animationen implementiert  
  * Dynamische Inhalte in der TopNav basierend auf aktivem Bereich

**Authentifizierung:** ✅ ABGESCHLOSSEN

* Kompletter Auth-Flow implementiert und debugged  
* PKCE-Probleme gelöst durch Anpassungen in Middleware, API Interceptor und Supabase Client  
* Login-Seite mit modernem Design implementiert

**Berechtigungssystem:** ✅ ÜBERARBEITUNG ABGESCHLOSSEN

* Komplette Überarbeitung des Berechtigungskonzepts  
* Umstellung von Dashboard-Rollen auf direkte Permissions-Zuweisung  
* Intuitiveres Modell durch Discord-Rollen-Zentrierung  
* Anpassung der Datenbank-Tabellen und Backend-Services

**Frontend:**

✅ Core UI Komponenten erstellt: ContentBox, FilterBar, FilterDropdown, NotchedBox (mit JS/Clip-Path und Button-Integration) sind implementiert. ✅ Seiten refaktorisiert: dashboard/page.tsx und dashboard/categories/page.tsx verwenden die neuen Core-Komponenten. ✅ Styling vereinheitlicht: Umfangreiches Refactoring zur Verwendung von Chakra UI Theme Tokens für Farben und Schatten in fast allen Komponenten abgeschlossen. Theme (theme.ts) wurde entsprechend erweitert. Typgenerierung durchgeführt. ⚠️ NotchedBox Performance: Die JS-basierte NotchedBox zeigt Performance-Probleme (Flackern/Stocken) bei Größenänderungen. 🚧 Fehlende Logik: Button-Handler in NotchedBox, Filter-Logik und Datenanbindung für die Kategorieseite fehlen noch.

### **Backend-Status (v1.2):**

✅ Das Backend startet nun **stabil und fehlerfrei**. Die Probleme mit den zirkulären Abhängigkeiten und der Guard-Registrierung wurden durch die Entkopplung des AccessControlService und die korrekte globale Registrierung des JwtAuthGuard (als Provider im AuthModule, geholt via app.get() in main.ts) **gelöst**.

### **RBAC-Basis (Backend) (v1.2):**

✅ Das Backend ist bereit, Berechtigungen zu verwalten und die effektiven Permissions pro User/Guild im /auth/session-Endpunkt zu liefern.

### **Frontend-Vorbereitung (v1.2):**

* ✅ TanStack Query ist eingerichtet.  
* ✅ Die Typen (GuildSelectionInfoDto mit permissions) sind korrekt.  
* ⚠️ Die *theoretische* Grundlage zum Speichern der Permissions im Context ist gegeben.  
* ⚠️ Der *theoretische* Plan für den useHasPermission-Hook steht.

### **Frontend-UI (/categories) (v1.2):**

⚠️ Wir hatten einen **fehlerhaften Versuch**, das Layout für die Kategorien-Seite zu erstellen. Der aktuelle Code in categories/page.tsx entspricht **nicht** dem gewünschten Layout und muss **neu aufgebaut** werden, wobei der Fokus auf der korrekten Container-Struktur und dem Styling der Filter-Elemente liegt.

### **Nächster Fokus**

1. **(PRIO 1\) RBAC-Frontend-Integration**

   * Anpassung des GuildContext zum Speichern der Permissions  
   * Erstellung des useHasPermission-Hooks  
   * UI-Integration der Auth-Daten (UserMenu mit Avatar, Name und Logout-Funktion)  
   * GuildSelector implementieren (Dropdown/Menu)  
   * TopNav SubNav Animation für Wechsel der SubNav-Items entwickeln  
2. **(PRIO 2\) Frontend-Layout für /categories**

   * Neuaufbau des **statischen Layouts** für die /dashboard/categories-Seite mit korrekt gestylten Containern und Filter-Elementen (basierend auf Salesforce-Vorlage)  
   * Fokus auf Container-Struktur und Styling der Filter-Elemente  
   * Vorerst ohne Animationen oder dynamische Logik  
3. **(PRIO 3\) Beginn Phase 3: Tracking & Punkte Basis**

   * Planung und Implementierung der DB-Tabellen (user\_tracking\_state, points\_balances, points\_transactions, currencies)  
   * Implementierung des TrackingService (Logik für voiceStateUpdate)  
   * Implementierung des PointsService (Punktevergabe, Kontostand-Management)  
   * Entwicklung der UI für Punktedarstellung

### **Nächster Fokus (Frontend \- Prioritäten neu ordnen):**

(PRIO 1\) Performance-Optimierung der NotchedBox: Implementierung von Debouncing/Throttling für die clip-path-Berechnung. (PRIO 2\) Implementierung der Button-Funktionalität in NotchedBox (Handler/Links, evtl. State-Management für aktiven Tab). (PRIO 3\) Implementierung der Filter-Logik (FilterBar/FilterDropdown, State, Datenabfragen). (PRIO 4\) Datenanbindung der Tabelle auf categories/page.tsx. (PRIO 5\) Weiterer Styling-Feinschliff und Detailarbeiten.

## **10\. ZUKÜNFTIGE OPTIMIERUNGEN & REFACTORING**

Basierend auf den KI-Analysen wurden folgende Punkte identifiziert, die nicht sofort umgesetzt, aber für zukünftige Optimierungen vorgemerkt wurden:

* **Redis Konsolidierung:** Umstellung von BullMQ auf die Verwendung der Upstash Redis-Instanz, um die lokale Redis-Instanz überflüssig zu machen.

* **Repository Pattern:** Einführung einer Repository-Schicht zur Kapselung von Datenbankzugriffen (aktuell erfolgen sie direkt in den Services).

* **Datenbank-Transaktionen:** Implementierung von Transaktionen für komplexe Operationen (z.B. Kategorie-Erstellung mit mehreren DB-Schritten).

* **Performance-Optimierung (N+1):** Optimierung der Abfrage im AuthController.getSession / AccessControlService.calculateEffectivePermissions, um nicht für jede Guild einzeln Permissions abzufragen (z.B. durch eine einzelne, komplexere Abfrage).

* **Einheitliche Fehlerbehandlung:** Implementierung eines globalen NestJS Exception Filters.

* **Testabdeckung erhöhen:** Hinzufügen von Unit-, Integrations- und E2E-Tests.

* **req.user-Objekt weiter optimieren:** Sicherstellen, dass alle relevanten User-Daten (ggf. das gesamte UserProfileDto) bereits in der JwtStrategy geladen und in req.user bereitgestellt werden, um Lookups in Controllern/Services weiter zu reduzieren.

* **Sicherheits-Härtung:** Überprüfung der Nutzung von adminClient vs. client mit RLS; Input-Validierung mit class-validator konsequent anwenden.

* **forwardRef() reduzieren:** Nach weiterer Stabilisierung prüfen, ob einige forwardRef-Aufrufe durch Modul-Umstrukturierung vermieden werden können.

* **Redis Key Cleanup:** Mechanismus für das Aufräumen von pending\_channel\_names bei endgültig fehlgeschlagenen Jobs implementieren.

* **Health Check Endpoint:** Einen dedizierten /health-Endpunkt ohne Authentifizierung hinzufügen.

## **11\. VERSIONSHISTORIE**

### **v0.1-v0.4**

Initiale Konzepterstellung, Architekturentscheidungen, grundlegende Datenbankschema-Entwicklung

### **v0.5 (Starker Fokus auf Begründungen der Architekturentscheidungen)**

* Vertiefte Begründung für die Wahl von Nest.js und Supabase  
* Klarere Abgrenzung der Bot-Integration-Strategie und der API-Design-Entscheidungen  
* Ausführlichere User Stories und Prozessabläufe

### **v0.6-v0.7 (Frontend Realtime Problem)**

* Implementierung der RLS-Policies für Supabase Realtime  
* Probleme mit der Realtime-Integration im Frontend identifiziert  
* Stabilisierungsarbeiten an React-Hooks und Kontexten

### **v0.8-v0.9 (Rate Limit & Backend Abschluss Phase 2\)**

* Erfolgreiche Implementierung des Rate-Limit-Handlings mit BullMQ, Redis und @upstash/ratelimit  
* Verifizierung der Backend-Implementierung für Phase 2  
* Fokus auf Frontend-UI-Finalisierung und Vorbereitung von Phase 3

### **v0.9-v1.0 (Frontend-Optimierung & Abschluss Phase 2\)**

* Umstellung auf Neues Frontend unter apps/frontend-new mit Chakra UI v3  
* Implementierung detaillierter Layout-Komponenten (SideNav, TopNav, MobileDrawer) mit Framer Motion-Animationen  
* Vollständige Lösung der Auth-Probleme und Implementierung des kompletten Auth-Flows  
* Entwicklung eines neuen Login-Seiten-Designs  
* Vereinheitlichung des Icon-Renderings für Konsistenz  
* Abschluss der Frontend-Komponenten für Phase 2  
* Festlegung der nächsten Prioritäten: UI-Integration der Auth-Daten, Phase 3 (Tracking & Punkte)

### **v1.0-v1.1 (19.04.2025 \- Überarbeitung des Berechtigungssystems)**

* Umstellung des Berechtigungssystems von Dashboard-Rollen auf direkte Permissions-Zuweisung an Discord-Rollen  
* Vereinfachung des Rechtekonzepts für intuitivere Handhabung durch Guild-Administratoren  
* Anpassung der Datenbank-Tabellen: Neue Tabellen `permissions`, `guild_discord_role_permissions`, `guild_user_permissions`  
* Aktualisierung des `AccessControlService` zur Unterstützung der neuen Rechteermittlung  
* Frontend-Implementierung eines `useHasPermission`\-Hooks für einfachere Berechtigungsprüfungen  
* Integration der neuen Berechtigungslogik in den Auth-Session-Endpunkt

  ### **v1.1-v1.2 (20.04.2025 \- Technische Optimierungen & Erweiterungen)**

* Ergänzung der Backend-Konfiguration: JwtAuthGuard über APP\_GUARD-Provider, forwardRef() für Modulimporte  
* Klärung der Redis-Nutzung: Lokale Instanz für BullMQ, Upstash für Ratenlimits und Channel-Namens-State  
* Anpassung der Konfigurationsvalidierung: SUPABASE\_JWT\_SECRET hinzugefügt, JWT\_SECRET entfernt  
* Dokumentation der Entkopplung des AccessControlService vom GuildsService  
* Erweiterung der Shared Types: Permissions-DTOs und Erweiterung des GuildSelectionInfoDto  
* Hinzufügung eines neuen Abschnitts: "Zukünftige Optimierungen & Refactoring" mit konkreten TODO-Punkten

  ### **v1.2-v1.3 (20.04.2025 \- Backend-Stabilisierung & Frontend-RBAC)**

* Bestätigung des fehlerfreien Backend-Starts nach Lösung zirkulärer Abhängigkeiten  
* Erfolgreiche Implementierung der RBAC-Basis im Backend  
* Dokumentation der Frontend-Vorbereitungen für die Berechtigungsverwaltung  
* Identifikation des fehlerhaften Layouts für die /categories-Seite  
* Aktualisierung des Fokus mit detaillierten nächsten Schritten für:  
  * RBAC-Frontend-Integration (GuildContext, useHasPermission-Hook)  
  * Neuaufbau des /categories-Layouts  
  * Vorbereitungen für Phase 3 (Tracking & Punkte)

  ### **v1.3-v1.4 (21.04.2025 \- Frontend UI Komponenten & NotchedBox)**

* Entwicklung neuer Core UI Komponenten: ContentBox, FilterBar, FilterDropdown, NotchedBox  
* Integration der NotchedBox-Komponente mit dynamischem JavaScript-basiertem clip-path  
* Refaktorisierung der Seiten dashboard/page.tsx und dashboard/categories/page.tsx zur Verwendung der neuen Komponenten  
* Vereinheitlichung des Stylings durch konsequente Nutzung von Chakra UI Theme Tokens  
* Identifikation von Performance-Problemen bei der NotchedBox-Komponente  
* Neupriorisierung der nächsten Frontend-Aufgaben mit Fokus auf:  
  * Performance-Optimierung der NotchedBox  
  * Implementierung der Button-Funktionalität  
  * Filter-Logik und Datenanbindung  
* 

