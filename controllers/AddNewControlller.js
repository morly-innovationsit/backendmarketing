const AddNew = require('../model/AddNew');
const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
}).array('image', 10);

// Image compression configuration
const IMAGE_CONFIG = {
  boardpic: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80
  },
  regular: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85
  }
};

// Helper function to compress and convert image
const compressImage = async (base64Data, config = IMAGE_CONFIG.regular) => {
  try {
    let imageData = base64Data;
    let contentType = 'image/jpeg';
    
    // Extract content type and base64 data from data URL
    if (base64Data.includes('data:')) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        contentType = matches[1];
        imageData = matches[2];
      }
    }
    
    // Convert base64 to Buffer
    const inputBuffer = Buffer.from(imageData, 'base64');
    
    // Compress image using Sharp
    const compressedBuffer = await sharp(inputBuffer)
      .resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: config.quality, mozjpeg: true })
      .toBuffer();
    
    console.log(`Image compressed: ${inputBuffer.length} bytes -> ${compressedBuffer.length} bytes (${Math.round((1 - compressedBuffer.length / inputBuffer.length) * 100)}% reduction)`);
    
    return {
      buffer: compressedBuffer,
      contentType: 'image/jpeg'
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

// Helper function to convert image to base64
const convertImageToBase64 = (imageObj) => {
  if (!imageObj || !imageObj.data) return null;
  
  const base64 = imageObj.data.toString('base64');
  return {
    data: `data:${imageObj.contentType};base64,${base64}`,
    contentType: imageObj.contentType,
    type: imageObj.type,
    filename: imageObj.filename
  };
};

// Create new entry with compressed images
exports.createEntry = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const entryData = {
      company: req.body.company,
      software: req.body.software,
      softwarename: req.body.softwarename,
      satisfied: req.body.satisfied,
      plansfornew: req.body.plansfornew,
      comments: req.body.comments,
      fleetstrength: req.body.fleetstrength,
      website: req.body.website,
      email: req.body.email,
      contact1name: req.body.contact1name,
      designation1: req.body.designation1,
      GSM1: req.body.GSM1,
      email1: req.body.email1,
      contact2name: req.body.contact2name,
      designation2: req.body.designation2,
      GSM2: req.body.GSM2,
      email2: req.body.email2,
      socialmedia1: req.body.socialmedia1,
      socialmedia2: req.body.socialmedia2,
      socialmedia3: req.body.socialmedia3,
      socialmedia4: req.body.socialmedia4,
      notes: req.body.notes,
      lat: req.body.lat,
      long: req.body.long,
    };

    // Handle boardpic with compression
    if (req.body.boardpic) {
      try {
        const compressed = await compressImage(req.body.boardpic, IMAGE_CONFIG.boardpic);
        
        entryData.boardpic = {
          data: compressed.buffer,
          contentType: compressed.contentType,
          filename: `boardpic_${Date.now()}.jpg`
        };
        
        console.log('Boardpic compressed successfully');
      } catch (error) {
        console.error("Error processing boardpic:", error);
      }
    }

    // Handle image array with compression
    if (req.body.image && Array.isArray(req.body.image)) {
      console.log("Processing image array, count:", req.body.image.length);
      
      entryData.image = [];
      
      for (let i = 0; i < req.body.image.length; i++) {
        const img = req.body.image[i];
        
        try {
          const compressed = await compressImage(img.data, IMAGE_CONFIG.regular);
          
          entryData.image.push({
            data: compressed.buffer,
            contentType: compressed.contentType,
            type: img.type, // "one", "two", etc.
            filename: `image_${img.type}_${Date.now()}_${i}.jpg`
          });
          
          console.log(`Successfully processed and compressed image type: ${img.type}`);
        } catch (error) {
          console.error(`Error processing image ${i} (type: ${img.type}):`, error);
        }
      }
      
      console.log(`Successfully processed ${entryData.image.length} images`);
    }

    // Create the entry in database
    const newEntry = await AddNew.create(entryData);

    res.status(201).json({
      success: true,
      message: 'Entry created successfully',
      data: {
        _id: newEntry._id,
        company: newEntry.company,
        imageCount: newEntry.image ? newEntry.image.length : 0
      }
    });
  } catch (error) {
    console.error("Error creating entry:", error);
    res.status(500).json({
      success: false,
      message: 'Error creating entry',
      error: error.message
    });
  }
};

// Get all entries WITH images
exports.getAllEntries = async (req, res) => {
  try {
    const entries = await AddNew.find();
    
    // Convert images to base64 for each entry
    const entriesWithImages = entries.map(entry => {
      const entryObj = entry.toObject();
      
      // Convert boardpic to base64
      if (entryObj.boardpic && entryObj.boardpic.data) {
        entryObj.boardpic = convertImageToBase64(entryObj.boardpic);
      }
      
      // Convert image array to base64
      if (entryObj.image && Array.isArray(entryObj.image)) {
        entryObj.image = entryObj.image.map(img => convertImageToBase64(img));
      }
      
      return entryObj;
    });
    
    res.status(200).json({
      success: true,
      count: entriesWithImages.length,
      data: entriesWithImages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching entries',
      error: error.message
    });
  }
};

// Get all entries WITHOUT images (lightweight)
exports.getAllEntriesLight = async (req, res) => {
  try {
    const entries = await AddNew.find().select('-boardpic.data -image.data');
    
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching entries',
      error: error.message
    });
  }
};

// Get single entry by ID WITH images
exports.getEntryByName = async (req, res) => {
  try {
    const { company } = req.body; // Get company name from request body
    
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    // Find by company name instead of ID
    const entry = await AddNew.findOne({ company: company });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    const entryObj = entry.toObject();
    
    // Convert boardpic to base64
    if (entryObj.boardpic && entryObj.boardpic.data) {
      entryObj.boardpic = convertImageToBase64(entryObj.boardpic);
    }
    
    // Convert image array to base64
    if (entryObj.image && Array.isArray(entryObj.image)) {
      entryObj.image = entryObj.image.map(img => convertImageToBase64(img));
    }

    res.status(200).json({
      success: true,
      data: entryObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching entry',
      error: error.message
    });
  }
};
// Get entries by company name (search) WITH images
exports.getEntriesByCompany = async (req, res) => {
  try {
    const { company } = req.query;
    
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    const entries = await AddNew.find({
      company: { $regex: company, $options: 'i' }
    });

    // Convert images to base64 for each entry
    const entriesWithImages = entries.map(entry => {
      const entryObj = entry.toObject();
      
      if (entryObj.boardpic && entryObj.boardpic.data) {
        entryObj.boardpic = convertImageToBase64(entryObj.boardpic);
      }
      
      if (entryObj.image && Array.isArray(entryObj.image)) {
        entryObj.image = entryObj.image.map(img => convertImageToBase64(img));
      }
      
      return entryObj;
    });

    res.status(200).json({
      success: true,
      count: entriesWithImages.length,
      data: entriesWithImages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching entries',
      error: error.message
    });
  }
};