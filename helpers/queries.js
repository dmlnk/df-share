const File = require('../model/File')

module.exports = {
	findSharedFiles: async function (user_id, fileName = '') {
		try {
			var data = await File.find({
				originalname: {
					$regex: fileName,
					$options: "i"
				},
				isPrivate: true,
				'uploadedBy.userId': {$ne: user_id},
				'accessibleTo.userId': user_id
			}).exec()
		} catch (err) {
			err.stack;
		}
		return data
	},
	findPrivateFiles: async function (user_id, fileName = '') {
		try {
			var data = await File.find({
					originalname: {
						$regex: fileName,
						$options: "i"
					},
					'uploadedBy.userId': user_id,
				}
			).exec()
		} catch (err) {
			var data = []
		}
		return data
	},
	findPublicFiles: async function (fileName = '') {
		try {
			var data = await File.find({
					originalname: {
						$regex: fileName,
						$options: "i"
					},
					isPrivate: false
				}
			).exec()
		} catch (err) {
			var data = []
		}
		return data
	},
	findAdminFiles: async function (fileName = '') {
		try {
			var data = await File.find({
					originalname: {
						$regex: fileName,
						$options: "i"
					}
				}
			).exec()
		} catch (err) {
			var data = []
		}
		return data
	}
};

