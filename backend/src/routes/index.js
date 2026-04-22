const express = require("express");
const healthRoutes = require("../modules/health/health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/users.routes");
const userAdminRoutes = require("../modules/users/users.admin.routes");
const jobRoutes = require("../modules/jobs/jobs.routes");
const printerRoutes = require("../modules/printers/printers.routes");
const queueRoutes = require("../modules/queues/queues.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Alpha Queue API v1",
  });
});

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/user/jobs", jobRoutes);
router.use("/admin/users", userAdminRoutes);
router.use("/admin/printers", printerRoutes);
router.use("/admin/queues", queueRoutes);

module.exports = router;
