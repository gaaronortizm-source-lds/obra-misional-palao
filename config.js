// Configuración pública. Estos datos NO son secretos:
// la clave "publishable" está hecha para ir en la app; el acceso real lo protegen
// las reglas de la base de datos (cada barrio ve solo lo suyo).
window.APP_CONFIG = {
  URL: 'https://djwewviqcwuxzsmccoai.supabase.co',
  KEY: 'sb_publishable_e44Q1kBTToFqRhr81Z7zYw_KefsMHcJ',
  DIAS_INACTIVIDAD: 14,   // pasados estos días sin usar la app, vuelve a pedir la clave larga
  BARRIOS: [
    { id: 'habich',    nombre: 'Barrio Habich',        email: 'habish@estacapalao.com' },
    { id: 'cayetano',  nombre: 'Barrio Cayetano',      email: 'cayetano@estacapalao.com' },
    { id: 'palao',     nombre: 'Barrio Palao',         email: 'palao@estacapalao.com' },
    { id: 'belen',     nombre: 'Barrio Belén',         email: 'belen@estacapalao.com' },
    { id: 'pedregal',  nombre: 'Barrio Pedregal',      email: 'pedregal@estacapalao.com' },
    { id: 'estaca',    nombre: 'Presidencia de Estaca', email: 'presidencia@estacapalao.com' }
  ]
};
