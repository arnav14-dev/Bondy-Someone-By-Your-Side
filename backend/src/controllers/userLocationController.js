import UserLocation from '../models/userLocation.model.js';

// Get all locations for a user
export const getUserLocations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let userLocation = await UserLocation.findOne({ userId });
    
    if (!userLocation) {
      return res.json({
        success: true,
        data: {
          locations: [],
          canAddMore: true
        }
      });
    }

    // Sort by lastUsed (most recent first)
    const sortedLocations = userLocation.locations.sort((a, b) => 
      new Date(b.lastUsed) - new Date(a.lastUsed)
    );

    res.json({
      success: true,
      data: {
        locations: sortedLocations,
        canAddMore: userLocation.locations.length < 3
      }
    });

  } catch (error) {
    console.error('Error getting user locations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add a new location
export const addUserLocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const locationData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'address', 'area', 'city', 'state', 'pincode', 'coordinates'];
    for (const field of requiredFields) {
      if (!locationData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Check if coordinates are valid
    if (!locationData.coordinates.latitude || !locationData.coordinates.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Valid coordinates are required'
      });
    }

    let userLocation = await UserLocation.findOne({ userId });

    if (!userLocation) {
      // Create new user location document
      userLocation = new UserLocation({
        userId,
        locations: []
      });
    }

    // Check if user already has 3 locations
    if (userLocation.locations.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 locations allowed per user'
      });
    }

    // If this is the first location, set it as default
    if (userLocation.locations.length === 0) {
      locationData.isDefault = true;
    }

    // Add the new location
    userLocation.locations.push({
      ...locationData,
      lastUsed: new Date(),
      createdAt: new Date()
    });

    await userLocation.save();

    res.status(201).json({
      success: true,
      message: 'Location added successfully',
      data: userLocation.locations[userLocation.locations.length - 1]
    });

  } catch (error) {
    console.error('Error adding user location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update an existing location
export const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { locationId } = req.params;
    const updateData = req.body;

    const userLocation = await UserLocation.findOne({ userId });
    
    if (!userLocation) {
      return res.status(404).json({
        success: false,
        message: 'No locations found for user'
      });
    }

    const locationIndex = userLocation.locations.findIndex(
      loc => loc._id.toString() === locationId
    );

    if (locationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Update the location
    userLocation.locations[locationIndex] = {
      ...userLocation.locations[locationIndex].toObject(),
      ...updateData,
      lastUsed: new Date()
    };

    await userLocation.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: userLocation.locations[locationIndex]
    });

  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete a location
export const deleteUserLocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { locationId } = req.params;

    const userLocation = await UserLocation.findOne({ userId });
    
    if (!userLocation) {
      return res.status(404).json({
        success: false,
        message: 'No locations found for user'
      });
    }

    const locationIndex = userLocation.locations.findIndex(
      loc => loc._id.toString() === locationId
    );

    if (locationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    const wasDefault = userLocation.locations[locationIndex].isDefault;
    
    // Remove the location
    userLocation.locations.splice(locationIndex, 1);

    // If we deleted the default location and there are other locations, set the first one as default
    if (wasDefault && userLocation.locations.length > 0) {
      userLocation.locations[0].isDefault = true;
    }

    await userLocation.save();

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Set default location
export const setDefaultLocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { locationId } = req.params;

    const userLocation = await UserLocation.findOne({ userId });
    
    if (!userLocation) {
      return res.status(404).json({
        success: false,
        message: 'No locations found for user'
      });
    }

    const locationIndex = userLocation.locations.findIndex(
      loc => loc._id.toString() === locationId
    );

    if (locationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Remove default from all locations
    userLocation.locations.forEach(loc => {
      loc.isDefault = false;
    });

    // Set the selected location as default
    userLocation.locations[locationIndex].isDefault = true;
    userLocation.locations[locationIndex].lastUsed = new Date();

    await userLocation.save();

    res.json({
      success: true,
      message: 'Default location updated successfully',
      data: userLocation.locations[locationIndex]
    });

  } catch (error) {
    console.error('Error setting default location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get most recent location
export const getRecentLocation = async (req, res) => {
  try {
    const userId = req.user._id;

    const userLocation = await UserLocation.findOne({ userId });
    
    if (!userLocation || userLocation.locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No locations found for user'
      });
    }

    // Get the most recently used location
    const recentLocation = userLocation.locations.reduce((mostRecent, current) => {
      return new Date(current.lastUsed) > new Date(mostRecent.lastUsed) ? current : mostRecent;
    });

    res.json({
      success: true,
      data: recentLocation
    });

  } catch (error) {
    console.error('Error getting recent location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
