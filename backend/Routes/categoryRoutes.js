const express = require('express');
const router = express.Router();
const {getRootCategories,getChildrenCategories,getCategoryTree} = require('../Controller/categoryController');

router.get('/root', getRootCategories);
router.get('/:parentId/children', getChildrenCategories );
// Optionally, expose full tree endpoint:
router.get('/tree',  getCategoryTree);

module.exports = router;
