const express = require('express')
const router = express.Router()
const url = require('url')
const { join } = require('path')
const fs = require('fs-extra')
const jwt = require('jsonwebtoken')
const thumbnail = require('image-thumbnail')

const secret = ':))'
const dir = process.cwd()

const app = express()
router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  req.query = url.parse(req.url, true).query
  next()
})

console.log('DIRECTORY : ', dir + '\\public')

const isFile = source => fs.lstatSync(source).isFile()
const isDirectory = source => fs.lstatSync(source).isDirectory()
const getFilesFolders = source => fs.readdirSync(source).map(name => join(source, name))
const getFolders = source => getFilesFolders(source).filter(isDirectory).sort(new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare).map(item => item.replace(source, '').replace('\\', '\/'))
const getFiles = source => getFilesFolders(source).filter(isFile).sort(new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare).map(item => item.replace(source, '').replace('\\', '\/'))
const hasDirectory = source => getFolders(source).length !== 0
const getStats = source => {
  const stats = fs.statSync(source)
  return {
    timestamp: Math.round(stats.mtimeMs / 1000),
    size: stats.size
  }
}
// const deleteFolder = source => {
//   if (fs.existsSync(source)) {
//     fs.readdirSync(source).forEach((file, index) => {
//       const curPath = join(source, file)
//       if (fs.lstatSync(curPath).isDirectory())
//         deleteFolder(curPath)
//       else
//         fs.unlinkSync(curPath)
//    })
//    fs.rmdirSync(source)
//   }
// }

// router.use(express.static(dir + '/front'))

function auth (req, res, next) {
  const authorizationHeaader = req.headers.authorization
  if (authorizationHeaader) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      req.decoded = jwt.verify(token, secret, { expiresIn: '2d' })
      next()
    } catch (err) { res.status(500).send({ error: 'Wrong', status: 500 }) }
  }
  else res.status(401).send({ error: `Auth error`, status: 401 })
}

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username == 'FNiX.iR' && password == 'FNiX.iR') {
    const token = jwt.sign({ username }, secret, { expiresIn: '2d' })
    res.json({ jwtToken: token })
  }
  else res.status(401).json({ error: `User Pass error`, status: 401 })
})

router.get('/stream-file', (req, res) => {
  const { disk, path } = req.query
  const stats = getStats(join(dir, disk, path))
  const extension = path.split('.').pop().toLowerCase()
  let mime = ''
  switch (extension) {
    case 'mp4': mime = 'video/' + extension; break
    case 'mp3': mime = 'audio/mpeg'
  }
  res.set({
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache, private',
    'Content-Disposition': `inline; filename="${ path.split('/').pop() }"`,
    'Content-Length': stats.size,
    'Content-Type': mime
  })
  const readStream = fs.createReadStream(join(dir, disk, path))
  readStream.on('open', () => readStream.pipe(res))
  readStream.on('error', err => res.end(err))
})

router.use(auth)

router.get('/initialize', (req, res) => {
  res.json({
    result: {
      status: 'success',
      message: null
    },
    config: {
      disks: {
        public: {
          'driver': 'local',
          'root': 'PUBLIC_PATH/images',
          'url': 'APP_URL/images',
        },
        // public: {
        //   'driver': 'local',
        //   'root': storage_path('app/public'),
        //   'url': env('APP_URL').'/storage',
        //   'visibility': 'public',
        // },
        // 'dd-wrt': {
        //   'driver'  : 'ftp',
        //   'host'    : 'ftp.dd-wrt.com',
        //   'username': 'anonymous',
        //   'passive' : true,
        //   'timeout' : 30,
        // }
      },
      leftDisk: 'public',
      rightDisk: null,
      leftPath: '',
      rightPath: null,
      windowsConfig: 2,
      hiddenFiles: true
    }
  })
})

router.get('/tree', (req, res) => {
  let { disk, path } = req.query
  path = path || ''
  res.json({
    result: { status: 'success', message: null },
    directories: getFolders(join(dir, disk, path)).map(item => {
      const basename = item.split('/').pop()
      return {
        type: 'dir',
        path: path + item,
        ...getStats(join(dir, disk, path, item)),
        dirname: path,
        basename,
        props: { hasSubdirectories: hasDirectory(join(dir, disk, path, item)) }
      }
    })
  })
})

router.get('/content', (req, res) => {
  let { disk, path } = req.query
  path = path || ''
  res.json({
    result: { status: 'success', message: null },
    directories: getFolders(join(dir, disk, path)).map(item => ({
      type: 'dir',
      path: (path + item).replace(/^\//, ''),
      ...getStats(join(dir, disk, path, item)),
      dirname: path,
      basename: item.split('/').pop()
    })),
    files: getFiles(join(dir, disk, path)).map(item => {
      let basename = item.split('/').pop()
      let name = basename.split('.')
      return {
        type: 'file',
        path: (path + item).replace(/^\//, ''),
        ...getStats(join(dir, disk, path, item)),
        dirname: path,
        basename,
        extension: name.pop(),
        filename: name.pop()
      }
    })
  })
})

router.post('/create-file', (req, res) => {
  let { disk, path, name } = req.body
  path = path || ''
  if (fs.existsSync(join(disk, path, name)))
    return res.json({ result: { status: 'warning', message: 'fileExist' } })
  fs.writeFileSync(join(dir, disk, path, name), '')
  res.json({
    result: { status: 'success', message: 'fileCreated' },
    file: {
      ...getStats(join(dir, disk, path)),
      basename: name,
      dirname: join(dir, disk, path),
      extension: name.split('.').pop(),
      filename: name.split('.')[0]
    }
  })
})

router.post('/delete', (req, res) => {
  const { disk, items } = req.body
  items.forEach(item => fs.removeSync(join(dir, disk, item.path)))
  res.json({ result: { status: 'success', message: 'deleted' } })
})

router.post('/paste', (req, res) => {
  // TODO : overwrite
  let { disk, path, clipboard } = req.body
  path = path || ''
  const mode = clipboard.type == 'copy' ? 'copy' : 'move'
  let items = [...clipboard.directories, ...clipboard.files]
  items.forEach(item => fs[mode](join(dir, clipboard.disk, item), join(dir, disk, path, item.split('/').pop()), { overwrite: true }))
  res.json({ result: { status: 'success', message: 'copied' } })
})

router.post('/rename', (req, res) => {
  const { disk, oldName, newName } = req.body
  fs.rename(join(dir, disk, oldName), join(dir, disk, newName))
  res.json({ result: { status: 'success', message: 'renamed' } })
})

router.post('/create-directory', (req, res) => {
  let { disk, path, name } = req.body
  path = path || ''
  if (fs.existsSync(join(disk, path, name)))
    return res.json({ result: { status: 'warning', message: 'dirExist' } })
  fs.mkdirSync(join(disk, path, name))
  const properties = {
    type: 'dir',
    path: path + '/' + name,
    ...getStats(join(dir, disk, path, name)),
    dirname: path,
    basename: name.split('/').pop()
  }
  res.json({
    result: { status: 'success', message: 'dirCreated' },
    directory: properties,
    tree: { ...properties, props: { hasSubdirectories: false } }
  })
})

router.post('/upload', (req, res) => {
  let { disk, path, overwrite } = req.body
  let count = 0
  let files = req.files['files[]']
  if (!(files instanceof Array)) files = [files]
  files.forEach(file => file.mv(join(dir, disk, path, file.name), err => {
    if (err) res.json({ result: { status: 'error', message: 'notAllUploaded' } })
    count ++
    if (count === files.length) res.json({ result: { status: 'success', message: 'uploaded' } })
  }))
})

router.get('/download', (req, res) => {
  let { disk, path } = req.query
  res.download(join(dir, disk, path))
})

router.post('/update-file', (req, res) => {
  let { disk, path } = req.body
  const { file } = req.files
  path = path || ''
  fs.writeFileSync(join(dir, disk, path, file.name), file.data)
  res.json({
    result: { status: 'success', message: 'fileUpdated' },
    file: {
      ...getStats(join(dir, disk, path, file.name)),
      basename: file.name,
      dirname: path,
      path: (path + '/' + file.name).replace(/^\//, ''),
      extension: file.name.split('.').pop(),
      filename: file.name.split('.')[0]
    }
  })
})

router.get('/url', (req, res) => {
  const { disk, path } = req.query
  // req.originalUrl req.baseUrl req.path
  // process.env.HOST
  const base = req.baseUrl
  res.json({ result: { status: 'success', message: null }, url: base + '/' + disk + '/' + path })
})

router.get('/preview', (req, res) => {
  const { disk, path, v } = req.query
  const stats = getStats(join(dir, disk, path))
  let extension = path.split('.').pop().toLowerCase()
  if (extension == 'jpg') extension = 'jpeg'
  res.set({
    'Content-Length': stats.size,
    'Content-Type': 'image/' + extension
  })
  res.sendFile(join(dir, disk, path))
})

router.get('/thumbnails', (req, res) => {
  const { disk, path } = req.query
  res.type('jpeg')
  thumbnail(join(dir, disk, path))
    .then(thumbnail => { res.send(thumbnail) })
    .catch(err => console.error(err))
})

export default {
  path: '/api',
  handler: router
}
