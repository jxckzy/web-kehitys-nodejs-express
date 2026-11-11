import sharp from 'sharp';
import path from 'node:path';

const createThumbnail = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }
  console.log(req.file.path);
  // TODO: use file path to create 160x160 png thumbnail with sharp
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

export {createThumbnail};
