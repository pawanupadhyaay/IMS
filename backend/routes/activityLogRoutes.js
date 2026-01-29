const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  createActivityLog,
  getActivityLogs,
  getAdmins,
} = require('../controllers/activityLogController')

// All routes require authentication
router.use(protect)

router.post('/', createActivityLog)
router.get('/', getActivityLogs)
router.get('/admins', getAdmins)

module.exports = router

