const fse = require('fs-extra')
const formidable = require('formidable')
const path = require('path')

function moveTrash(req, res) {
    var fileIndex = fse.readJSONSync('./users/admin/recycleRecord.json')

    const form = formidable()
    form.parse(req)

    form.on('field', (name, value) => {
        // fileIndex[path.basename(value)] = { 'src': value, 'dest': `./users/admin/recycle/${path.basename(value)}` }
        fileIndex.record.push({ 'name': path.basename(value), 'src': value, 'dest': `./users/admin/recycle/${path.basename(value)}` })
        fse.writeJSONSync('./users/admin/recycleRecord.json', fileIndex, { spaces: 2 })
        fse.moveSync(value, `./users/admin/recycle/${path.basename(value)}`)
    })

    form.on('end', () => {
        res.end('success')
    })
}

function recover(req, res) {
    var fileIndex = fse.readJSONSync('./users/admin/recycleRecord.json')

    const form = formidable()
    form.parse(req)

    form.on('field', (name, value) => {
        for (let i = 0; i < fileIndex.record.length; i++) {
            if (value === fileIndex.record[i].name) {
                fse.moveSync(fileIndex.record[i].dest, fileIndex.record[i].src)
                fileIndex.record.splice(i, 1)
                fse.writeJSONSync('./users/admin/recycleRecord.json', fileIndex, { spaces: 2 })
            }
        }
    })

    form.on('end', () => {
        res.end('success')
    })

}

function crush(req, res) {
    var fileIndex = fse.readJSONSync('./users/admin/recycleRecord.json')

    const form = formidable()
    form.parse(req)

    form.on('field', (name, value) => {
        for (let i = 0; i < fileIndex.record.length; i++) {
            if (value === fileIndex.record[i].name) {
                fse.removeSync(fileIndex.record[i].dest)
                fileIndex.record.splice(i, 1)
                fse.writeJSONSync('./users/admin/recycleRecord.json', fileIndex, { spaces: 2 })
            }
        }
    })

    form.on('end', () => {
        res.end('success')
    })
}

module.exports = {
    moveTrash, recover, crush
}