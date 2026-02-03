export const environment = {
  production: true,
  baseUrl: "http://52.5.47.64/VC/Ingreso",
  // API token para RENIEC (definir en variable de entorno en producción)
  reniecApiToken: process.env['RENIEC_API_TOKEN'] || '',
};
