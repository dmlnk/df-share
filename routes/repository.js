const express = require('express')
const router = express.Router()
const File = require('../model/File')
const fileRouter = require('../routes/file')
const {ensureAuthenticated, ensureAdmin} = require('../middleware/auth')
const {findSharedFiles, findAdminFiles, findPrivateFiles, findPublicFiles} = require('../helpers/queries')

// User panel
router.get('/', ensureAuthenticated, async function (req, res) {
	res.render('userpanel', {
		isAdmin: req.user.isAdmin
	})
});

// Private repository
router.get('/private', ensureAuthenticated, async function (req, res) {
	if (req.session.localVar != undefined) {
		data = req.session.localVar

		req.session.localVar = undefined

		res.render('repository', {
			files: data,
			publicOrShared: false,
			privatePublicShared: 1
		})
		return
	}

	data = await findPrivateFiles(req.user._id)

	res.render('repository', {
		files: data,
		publicOrShared: false,
		privatePublicShared: 1
	})
});

// Admin repository
router.get('/admin', ensureAuthenticated, ensureAdmin, async function (req, res) {
	if (req.session.localVar != undefined) {
		data = req.session.localVar

		req.session.localVar = undefined

		res.render('repository', {
			files: data,
			publicOrShared: false,
			privatePublicShared: 0
		})
		return
	}

	data = await findAdminFiles()

	res.render('repository', {
		files: data,
		publicOrShared: false,
		privatePublicShared: 0
	})
});

// Public repository
router.get('/public', async function (req, res) {
	if (req.session.localVar != undefined) {
		data = req.session.localVar

		req.session.localVar = undefined

		res.render('repository', {
			files: data,
			publicOrShared: true,
			privatePublicShared: 2
		})
		return
	}

	data = await findPublicFiles()

	res.render('repository', {
		files: data,
		publicOrShared: true,
		privatePublicShared: 2
	})
});

// Shared repository
router.get('/shared', ensureAuthenticated, async function (req, res) {
	if (req.session.localVar != undefined) {
		data = req.session.localVar

		req.session.localVar = undefined

		res.render('repository', {
			files: data,
			publicOrShared: true,
			privatePublicShared: 3
		})
		return
	}

	data = await findSharedFiles(req.user._id)

	res.render('repository', {
		files: data,
		publicOrShared: true,
		privatePublicShared: 3
	})
});

router.post('/findPublic', async function (req, res, next) {
	var fileName = req.body.fileName

	data = await findPublicFiles(fileName)

	req.session.localVar = data;
	res.redirect('/repository/public')
})

router.post('/findPrivate', async function (req, res, next) {
	var fileName = req.body.fileName

	data = await findPrivateFiles(req.user._id, fileName)

	req.session.localVar = data;
	res.redirect('/repository/private')
})

router.post('/findShared', async function (req, res, next) {
	var fileName = req.body.fileName

	data = await findSharedFiles(req.user._id, fileName)

	req.session.localVar = data
	res.redirect('/repository/shared')
})

router.post('/findAdmin', ensureAdmin, async function (req, res, next) {
	var fileName = req.body.fileName

	data = await findAdminFiles(fileName)

	req.session.localVar = data;
	res.redirect('/repository/admin')
})

router.use('/file', fileRouter)

module.exports = router;