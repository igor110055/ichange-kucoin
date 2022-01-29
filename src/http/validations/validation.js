const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
class validation {
  async fildesValidate(req, res, next) {
    let result = await validationResult(req);
    let errors = [];
    if (!result.isEmpty()) {
      result.array().forEach((error) => {
        errors.push(error.msg);
      });
      if (req.files) {
        // req.files
      } 
      if (req.file) {
        fs.unlinkSync(
          path.resolve(req.file.destination + "/" + req.file.filename)
        );
      }

      res.status(403);
      return res.json({
        success: false,
        message: "validation error",
        errors,
      });
    } else {
      next();
    }
  }
}

module.exports = new validation();
