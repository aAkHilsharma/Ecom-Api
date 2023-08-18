const router = require("express").Router();
const Category = require("../models/category");

// route - /api/categories
// method - get
// desc - get list of categories

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({}, "name");
    res
      .status(200)
      .json({
        success: true,
        message: "Categories fetched successfully",
        categories,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error retrieving categories",
        error: error.message,
      });
  }
});

// route - api/categories
//method - post
// desc - Create a new category

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  }

  try {
    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Category with the same name already exists",
        });
    }

    const category = new Category({ name });
    await category.save();
    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating category",
        error: error.message,
      });
  }
});

module.exports = router;
