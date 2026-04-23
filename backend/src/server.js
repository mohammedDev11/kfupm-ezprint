const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/db");
const { ensureDefaultPrinterSetup } = require("./modules/printers/printer.provision.service");

const startServer = async () => {
  try {
    const connection = await connectDatabase();
    console.log(`MongoDB connected: ${connection.name}`);
    await ensureDefaultPrinterSetup();

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
