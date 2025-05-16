const nodemailer = require('nodemailer');
const Contact = require('../models/contact.model');
const User = require('../models/User.model');
const moment = require('moment-timezone');

const KUWAIT_TIMEZONE = 'Asia/Kuwait';

exports.sendContactForm = async (req, res) => {
  const userId = req.params.id
  const { name, email, phoneNumber, subject, message } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    // Create contact with Kuwait timezone
    const contact = new Contact({
      name,
      email,
      phoneNumber,
      subject,
      message,
      user: existingUser ? existingUser._id : undefined,
      createdAt: moment.tz(KUWAIT_TIMEZONE).toDate() // Set creation time in Kuwait timezone
    });

    await contact.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: `New Message from ${name} - ${subject}`,
      text: `You have received a new message from ${name} (${email}):\n\n${message}\n\nPhone: ${phoneNumber}\nTime: ${moment.tz(KUWAIT_TIMEZONE).format('YYYY-MM-DD HH:mm:ss')}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent and saved successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message or saving to database.' });
  }
};

exports.getContactData = async (req, res) => {
  try {
    let contacts = await Contact.find().sort({ createdAt: -1 });

    // Convert UTC dates to Kuwait timezone
    contacts = contacts.map(contact => {
      const contactObj = contact.toObject();
      contactObj.createdAt = moment.utc(contact.createdAt)
        .tz(KUWAIT_TIMEZONE)
        .format();
      return contactObj;
    });

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contacts', error });
  }
}