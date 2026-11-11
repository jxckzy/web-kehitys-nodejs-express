import multer from 'multer';
import sharp from 'sharp';
import path from 'node:path';

const createThumbnail = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }
  console.log(req.file.path);
  try {
    const thumbnailFilename = `${req.file.filename}_thumb.png`;
    const thumbnailPath = path.join(req.file.destination, thumbnailFilename);

    await sharp(req.file.path).resize(160, 160).png().toFile(thumbnailPath);

    req.file.thumbnailFilename = thumbnailFilename;
    next();
  } catch (error) {
    next(error);
  }
};

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // max 10 MB
  },
  fileFilter: (req, file, cb) => {
    // only allow images and videos
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      const error = new Error('Only images and videos are allowed!');
      error.status = 400;
      cb(error, false);
    }
  },
});

export {createThumbnail, upload};
