// apps/frontend-new/src/data/categoriesData.ts
import { Kategorie } from "@/components/categories/KategorieTabelle";
import { Zone } from "@/components/zones/ZonenTabelle";

// Kategorien-Daten
export const kategorien: Kategorie[] = [
  {
    id: '1',
    name: 'Trading Zone Alpha',
    description: 'Hauptzone für Trading-Aktivitäten',
    zones: 8,
    activeZones: 6,
    users: 24,
    activeUsers: 18,
    visible: true,
    tracking: true,
    setup: true,
    roles: 'Admin, Moderator',
    lastAccess: 'Heute, 14:32',
    lastUser: 'Max Mustermann',
    totalTime: '128h 45m'
  },
  {
    id: '2',
    name: 'Farming Beta',
    description: 'Landwirtschaftliche Produktionszone',
    zones: 12,
    activeZones: 10,
    users: 18,
    activeUsers: 15,
    visible: true,
    tracking: true,
    setup: false,
    roles: 'Admin, User',
    lastAccess: 'Gestern, 09:15',
    lastUser: 'Erika Musterfrau',
    totalTime: '96h 20m'
  },
  {
    id: '3',
    name: 'PvP Arena',
    zones: 4,
    users: 32,
    visible: false,
    tracking: true,
    setup: true,
    roles: 'Admin, Moderator, User',
    lastAccess: 'Vor 3 Tagen',
    totalTime: '64h 10m'
  },
  {
    id: '4',
    name: 'Crafting Workshop',
    zones: 6,
    users: 15,
    visible: true,
    tracking: false,
    setup: true,
    roles: 'Admin, User',
    lastAccess: 'Heute, 11:20',
    totalTime: '42h 30m'
  },
  {
    id: '5',
    name: 'Mining Complex',
    zones: 10,
    users: 28,
    visible: true,
    tracking: true,
    setup: true,
    roles: 'Admin, Moderator',
    lastAccess: 'Gestern, 16:45',
    totalTime: '156h 15m'
  }
];

// Zonen-Daten pro Kategorie
export const zonenProKategorie: Record<string, Zone[]> = {
  // Trading Zone Alpha
  '1': [
    {
      id: '101',
      name: 'Haupthandelsplatz',
      key: 'TRADE-001',
      points: 1250,
      minutes: 45,
      lastAccess: 'Heute, 14:32',
      usageTime: '128h 45m'
    },
    {
      id: '102',
      name: 'Währungsbörse',
      key: 'TRADE-002',
      points: 980,
      minutes: 30,
      lastAccess: 'Gestern, 09:15',
      usageTime: '96h 20m'
    },
    {
      id: '103',
      name: 'Auktionshaus',
      key: 'TRADE-003',
      points: 2450,
      minutes: 120,
      lastAccess: 'Vor 3 Tagen',
      usageTime: '64h 10m'
    },
    {
      id: '104',
      name: 'Händlerviertel',
      key: 'TRADE-004',
      points: 750,
      minutes: 25,
      lastAccess: 'Vor 1 Woche',
      usageTime: '42h 30m'
    },
    {
      id: '105',
      name: 'Schwarzmarkt',
      key: 'TRADE-005',
      points: 1800,
      minutes: 60,
      lastAccess: 'Heute, 10:45',
      usageTime: '156h 15m'
    }
  ],
  
  // Farming Beta
  '2': [
    {
      id: '201',
      name: 'Getreidefelder',
      key: 'FARM-001',
      points: 3200,
      minutes: 90,
      lastAccess: 'Gestern, 18:20',
      usageTime: '210h 40m'
    },
    {
      id: '202',
      name: 'Viehzucht',
      key: 'FARM-002',
      points: 520,
      minutes: 15,
      lastAccess: 'Heute, 16:05',
      usageTime: '320h 55m'
    },
    {
      id: '203',
      name: 'Obstgärten',
      key: 'FARM-003',
      points: 4500,
      minutes: 180,
      lastAccess: 'Vor 2 Wochen',
      usageTime: '48h 30m'
    },
    {
      id: '204',
      name: 'Fischteiche',
      key: 'FARM-004',
      points: 2800,
      minutes: 75,
      lastAccess: 'Gestern, 22:10',
      usageTime: '175h 20m'
    }
  ],
  
  // PvP Arena
  '3': [
    {
      id: '301',
      name: 'Kampfarena',
      key: 'PVP-001',
      points: 1650,
      minutes: 55,
      lastAccess: 'Heute, 09:30',
      usageTime: '280h 15m'
    },
    {
      id: '302',
      name: 'Duellzone',
      key: 'PVP-002',
      points: 950,
      minutes: 30,
      lastAccess: 'Vor 5 Tagen',
      usageTime: '45h 20m'
    },
    {
      id: '303',
      name: 'Schlachtfeld',
      key: 'PVP-003',
      points: 1200,
      minutes: 40,
      lastAccess: 'Gestern, 11:45',
      usageTime: '78h 30m'
    }
  ],
  
  // Crafting Workshop
  '4': [
    {
      id: '401',
      name: 'Schmiedewerkstatt',
      key: 'CRAFT-001',
      points: 3800,
      minutes: 120,
      lastAccess: 'Heute, 08:15',
      usageTime: '245h 10m'
    },
    {
      id: '402',
      name: 'Alchemielabor',
      key: 'CRAFT-002',
      points: 750,
      minutes: 25,
      lastAccess: 'Vor 2 Tagen',
      usageTime: '36h 45m'
    },
    {
      id: '403',
      name: 'Schneiderei',
      key: 'CRAFT-003',
      points: 2100,
      minutes: 70,
      lastAccess: 'Heute, 13:20',
      usageTime: '124h 50m'
    },
    {
      id: '404',
      name: 'Juwelierswerkstatt',
      key: 'CRAFT-004',
      points: 1350,
      minutes: 45,
      lastAccess: 'Gestern, 14:30',
      usageTime: '92h 15m'
    },
    {
      id: '405',
      name: 'Ingenieurswerkstatt',
      key: 'CRAFT-005',
      points: 2900,
      minutes: 95,
      lastAccess: 'Vor 3 Tagen',
      usageTime: '187h 40m'
    }
  ],
  
  // Mining Complex
  '5': [
    {
      id: '501',
      name: 'Eisenmine',
      key: 'MINE-001',
      points: 1750,
      minutes: 60,
      lastAccess: 'Heute, 11:25',
      usageTime: '145h 30m'
    },
    {
      id: '502',
      name: 'Goldmine',
      key: 'MINE-002',
      points: 3200,
      minutes: 105,
      lastAccess: 'Gestern, 15:40',
      usageTime: '210h 15m'
    },
    {
      id: '503',
      name: 'Edelsteinmine',
      key: 'MINE-003',
      points: 4800,
      minutes: 160,
      lastAccess: 'Vor 4 Tagen',
      usageTime: '320h 45m'
    },
    {
      id: '504',
      name: 'Kohlemine',
      key: 'MINE-004',
      points: 950,
      minutes: 30,
      lastAccess: 'Heute, 09:10',
      usageTime: '65h 20m'
    },
    {
      id: '505',
      name: 'Kupfermine',
      key: 'MINE-005',
      points: 1200,
      minutes: 40,
      lastAccess: 'Gestern, 12:35',
      usageTime: '98h 50m'
    },
    {
      id: '506',
      name: 'Silbermine',
      key: 'MINE-006',
      points: 2400,
      minutes: 80,
      lastAccess: 'Vor 2 Tagen',
      usageTime: '175h 10m'
    }
  ]
};
