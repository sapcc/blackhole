module.exports = {
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: 'BLACKHOLE API',
      version: process.env.npm_package_version,
      description: `
Detailed description of BLACKHOLE API.
# Introduction
This API is documented in **OpenAPI format**`
    }
  },
  apis: ['./src/**/*.js']
}
