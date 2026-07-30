// Database configuration
// Import Prisma client and initialize connection here

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
