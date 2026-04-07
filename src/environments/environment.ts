// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  /** IANA: debe coincidir con `date_default_timezone_set` en PHP y preferiblemente con MySQL/session. */
  appTimeZone: 'America/Lima',
  // API en localhost:8080 (Docker o php -S). CORS y rutas en index.php + db_connection.php
  baseUrl: "http://192.168.100.11:8080",
  /** Origen donde se sirve la SPA (assets estáticos); sin barra final. */
  publicAppUrl: "http://192.168.100.11:4200",
  // API token para RENIEC (obtener de variable de entorno en producción)
  reniecApiToken: "e9cc47e67d492cdee675bfb2b365cvcs93611b5141144aa0da34cab5429bb5e8",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
