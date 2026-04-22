const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/db");

const startServer = async () => {
  try {
    const connection = await connectDatabase();
    console.log(`MongoDB connected: ${connection.name}`);

    app.listen(env.port, () => {
      console.log(
        `Alpha Queue API listening on port ${env.port} in ${env.nodeEnv} mode`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
