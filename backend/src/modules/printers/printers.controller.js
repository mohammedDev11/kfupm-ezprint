const { getAdminPrintersData } = require("./printers.service");

const getAdminPrinters = async (req, res, next) => {
  try {
    const printers = await getAdminPrintersData();

    return res.status(200).json({
      success: true,
      data: {
        printers,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminPrinters,
};
