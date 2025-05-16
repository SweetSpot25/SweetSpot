const Event = require('../models/Event.model');
const { uploadUserCoverImage, uploadToCloudinary } = require('../middleware/multerConfig');
const moment = require('moment-timezone');

const KUWAIT_TIMEZONE = 'Asia/Kuwait';

exports.createEvent = async (req, res) => {
  uploadUserCoverImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      let imageUrl = null;

      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'eventsImage');
        imageUrl = uploadResult.secure_url;
      }

      // Convert local Kuwait time to UTC before saving
      const utcDate = moment.tz(req.body.date, KUWAIT_TIMEZONE).utc().toDate();

      const newEvent = new Event({
        title: req.body.title,
        description: req.body.description,
        date: utcDate, // Save as UTC
        location: req.body.location,
        price: req.body.price,
        capacity: req.body.capacity,
        availableTickets: req.body.capacity,
        coverImage: imageUrl,
      });

      await newEvent.save();
      res.status(201).json({ message: `Event ${req.body.title} Created Successfully` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

exports.getCountEvents = async (req, res) => {
  try {
    const filter = req.params.filter;
    let count;
    if (filter === 'open') {
      count = await Event.countDocuments({ availableTickets: { $gt: 0 } });
    } else if (filter === 'closed') {
      count = await Event.countDocuments({ availableTickets: 0 });
    } else {
      count = await Event.countDocuments();
    }

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while counting events' });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;
    const filter = req.params.filter || 'all';

    let query = {};

    if (filter === 'open') {
      query.availableTickets = { $gt: 0 };
    } else if (filter === 'closed') {
      query.availableTickets = 0;
    }

    let events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Convert UTC dates back to Kuwait timezone
    events = events.map(event => {
      const eventObj = event.toObject();
      eventObj.date = moment.utc(event.date)
        .tz(KUWAIT_TIMEZONE)
        .format();
      return eventObj;
    });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClosestEvent = async (req, res) => {
  try {
    const nowInKuwait = moment.tz(KUWAIT_TIMEZONE);
    const nowUTC = nowInKuwait.utc().toDate();

    const closestEvent = await Event.findOne({ date: { $gt: nowUTC } })
      .sort({ date: 1 });

    if (!closestEvent) {
      return res.status(200).json({ message: 'There are no future events.' });
    }

    // Convert UTC date back to Kuwait timezone
    const eventObj = closestEvent.toObject();
    eventObj.date = moment.utc(closestEvent.date)
      .tz(KUWAIT_TIMEZONE)
      .format();

    res.status(200).json(eventObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEventById = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: `Event ${event.title} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEventById = async (req, res) => {
  uploadUserCoverImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      let imageUrl = null;

      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'eventsImage');
        imageUrl = uploadResult.secure_url;
      }

      // Convert local Kuwait time to UTC before saving
      const utcDate = moment.tz(req.body.date, KUWAIT_TIMEZONE).utc().toDate();

      const updateData = {
        title: req.body.title,
        description: req.body.description,
        date: utcDate, // Save as UTC
        location: req.body.location,
        price: req.body.price,
        capacity: req.body.capacity,
        availableTickets: req.body.availableTickets,
      };

      if (imageUrl) {
        updateData.coverImage = imageUrl;
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Convert UTC date back to Kuwait timezone
      const eventObj = updatedEvent.toObject();
      eventObj.date = moment.utc(updatedEvent.date)
        .tz(KUWAIT_TIMEZONE)
        .format();

      res.status(200).json({
        message: `Event ${updatedEvent.title} updated successfully`,
        updatedEvent: eventObj,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

exports.getAllEventsForScanner = async (req, res) => {
  try {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    let query = { date: { $gte: yesterday } };

    const events = await Event.find(query).sort({ date: 1 }).select('_id title');

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

