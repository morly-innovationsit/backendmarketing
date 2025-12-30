const express = require('express')

const loginController = require('../controllers/loginController')
const AddNewController = require('../controllers/AddNewControlller')
const router = new express.Router()

router.post('/login', loginController.login);
router.post('/save', AddNewController.createEntry);
router.get('/entries', AddNewController.getAllEntries);
router.post('/getbyname', AddNewController.getEntryByName)
module.exports = router