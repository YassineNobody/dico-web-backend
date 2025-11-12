export default {
  HOST: process.env.HOST ?? "localhost",
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  JWT_SECRET: process.env.JWT_SECRET,
};
