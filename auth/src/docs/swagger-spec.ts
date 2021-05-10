import swaggerJsDoc from 'swagger-jsdoc';

const cssOptions = {
  customCss: `
  .topbar-wrapper img {content:url(https://pbs.twimg.com/profile_images/1009813562615885824/KGqox_2W_400x400.jpg); width:50px; height:auto; border-radius: 100%;}
  .swagger-ui .topbar { background-color: #000000; border-bottom: 20px solid #00ab4f; }`,
  customSiteTitle: 'Auth Microservice API Docs',
};

const swaggerSpec = swaggerJsDoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Mejor En Bici - Auth Microservice Documentation',
      version: '1.0.0',
      description:
        '`NOTE: This is for documentation purposes only, Cookie Authentication is not supported at the time for this tool.`',
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        bearerFormat: 'express:sess',
      },
    },
  },
  swagger: '2.0',
  apis: ['./**/*.yaml'],
});

export { swaggerSpec, cssOptions };
