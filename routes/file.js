const express = require('express')
const router = express.Router()
const File = require('../model/File')
const User = require('../model/User')
const fs = require('fs')
const {ensureAuthenticated} = require('../middleware/auth')

router.get('/all', ensureAuthenticated, async function (req, res, next) {
    try {
        var data = await File.find({'uploadedBy.userId': req.user._id}).exec()
    } catch (err) {

        err.stack;
    }
    res.send(data)
})

router.post("/upload", ensureAuthenticated, async function (req, res, next) {
    let filedata = req.file;
    checkedValue = req.body['isPrivate'];

    user = await User.findOne({_id: req.user._id}).exec()
    username = user['username'].split(' ').join('')
    if (!filedata)
        res.send("Error occured");
    else {
        const newFile = new File({
            originalname: filedata['originalname'],
            destination: filedata['destination'],
            mimetype: filedata['mimetype'],
            uploadedBy: {userId: req.user._id, username},
            isPrivate: checkedValue == undefined ? false : true,
            accessibleTo: [{userId: req.user._id, username: username}]
        });
        newFile.save()
        res.redirect("/repository/private");
    }

});

router.post('/addUser/:id/', ensureAuthenticated, async function (req, res, next) {
        const fileId = req.params['id']
        const addUser = req.body[fileId];

        try {
            file = await File.findOne({_id: fileId}).exec()
            userToAdd = await User.findOne({username: addUser}).exec()
        } catch (e) {
            // todo send to client "user not found" message
            console.log(e)
        }


        currentAccesibleTo = file.accessibleTo

        // if user didnt create this file
        if (file.uploadedBy['userId'] != req.user._id.toString() && req.user.isAdmin == false) {
            res.redirect('/repository')
            return
        }

        currentAccesibleTo.push({
            userId: userToAdd['_id'],
            username: addUser
        })

        await File.updateOne({_id: fileId}, {accessibleTo: currentAccesibleTo})

        res.redirect('/repository/private')
    }
)

router.post('/deleteUser/:id', ensureAuthenticated, async function (req, res, next) {
        const fileId = req.params['id']
        const userToDeleteUsername = req.body[fileId];

        try {
            file = await File.findOne({_id: fileId}).exec()
        } catch (e) {
            console.log(e)
        }

        currentAccesibleTo = file.accessibleTo
        if (!currentAccesibleTo.some(obj => obj.username == userToDeleteUsername)) {
            // todo send message to client not log
            console.log("There is no such user")
            return
        }

        // if user didnt create this file
        if (file.uploadedBy['userId'] != req.user._id.toString() && req.user.isAdmin == false) {
            res.redirect('/repository')
            return
        }

        // get index of object with username
        removeIndex = currentAccesibleTo.map(obj => {
            return obj.username;
        }).indexOf(userToDeleteUsername);

        currentAccesibleTo.splice(removeIndex, 1)

        await File.updateOne({_id: fileId}, {accessibleTo: currentAccesibleTo})

        res.redirect('/repository/private')
    }
)

router.get('/download/:id', async function (req, res) {
        const project_dir = process.cwd()
        const fileIdToDownload = req.params['id']


        try {
            var file = await File.findOne({_id: fileIdToDownload}).exec()
        } catch (e) {

        }

        // if user in not logged in but it's public repo
        if (req.user == undefined && file.isPrivate == true) {
            res.redirect('/')
            return
        } else if (file.isPrivate == true &&
            file.uploadedBy['userId'] != req.user._id.toString() &&
            req.user.isAdmin == false &&
            !file.accessibleTo.some(obj => obj.userId == req.user._id.toString())) {
            res.redirect('/')
            return
        }

        const originalname = file.originalname
        const filepath = `${project_dir}/uploads/${originalname}`;
        res.download(filepath);
    }
);

router.post('/delete/:id', ensureAuthenticated, async function (req, res) {
    project_dir = process.cwd()

    fileIdToDelete = req.params['id']
    try {
        var fileToDelete = await File.findOne({_id: fileIdToDelete}).exec()
    } catch (e) {
        console.log("NO SUCH FILE")
    }

    const originalname = fileToDelete.originalname


    // if user didnt create this file
    if (fileToDelete.uploadedBy['userId'] != req.user._id.toString() && req.user.isAdmin == false) {
        res.redirect('/repository')
        return
    }

    File.deleteOne({_id: fileIdToDelete}).catch(err => {
        console.log(err)
    })

    const filepath = `${project_dir}/uploads/${originalname}`;

    try {
        fs.unlinkSync(filepath)
        console.log("Successfully deleted the file.")
    } catch (err) {
        throw err
    }
    res.redirect('/repository/private')
});

module.exports = router