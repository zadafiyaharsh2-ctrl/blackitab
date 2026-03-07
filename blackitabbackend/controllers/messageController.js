const Message = require('../models/Message');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const axios = require('axios');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let resource_type = 'auto';
        let format = undefined;

        if (file.mimetype === 'application/pdf') {
            resource_type = 'raw';
            format = 'pdf';
        } else if (file.mimetype === 'image/jpeg') {
            format = 'jpg';
        } else if (file.mimetype === 'image/png') {
            format = 'png';
        }

        return {
            folder: 'blackitab_messages',
            resource_type,
            format,
            use_filename: true,
            unique_filename: true,
        };
    },
});

const upload = multer({ storage: storage });
exports.uploadMiddleware = upload.single('media');

// POST /api/messages/send
exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, content, postId, type } = req.body;
        const senderId = req.user._id;

        if (!recipientId) {
            return res.status(400).json({ success: false, message: 'Recipient is required' });
        }

        // Privacy check — can't message private accounts unless following
        const recipientUser = await User.findById(recipientId);
        if (recipientUser && recipientUser.isPrivate) {
            const isFollowing = await require('../models/Connection').exists({
                sourceUserId: senderId,
                targetUserId: recipientId,
                connectionType: 'follow'
            });

            if (!isFollowing && senderId.toString() !== recipientId.toString()) {
                return res.status(403).json({ success: false, message: 'You cannot message this private account until you follow them.' });
            }
        }

        let finalType = type || 'text';
        let mediaUrl = '';
        let mediaType = '';
        let publicId = '';
        let fileName = '';

        if (req.file) {
            mediaUrl = req.file.path;
            publicId = req.file.filename;
            fileName = req.file.originalname;

            if (req.file.mimetype.startsWith('image/')) {
                finalType = 'image';
                mediaType = 'image';
            } else if (req.file.mimetype.startsWith('video/')) {
                finalType = 'video';
                mediaType = 'video';
            } else {
                finalType = 'file';
                mediaType = 'file';
            }
        }

        const messageData = {
            sender: senderId,
            recipient: recipientId,
            content: content || (finalType === 'post' ? 'Shared a post' : (finalType === 'text' ? '' : (fileName || 'Attachment'))),
            type: finalType,
            mediaUrl,
            mediaType,
            fileName,
            publicId
        };

        if (postId && finalType === 'post') {
            messageData.post = postId;
        }

        const newMessage = await Message.create(messageData);
        const populatedMessage = await newMessage.populate('sender', 'name profileImage');

        if (req.io) {
            req.io.emit('new_message', { message: populatedMessage });
        }

        res.status(201).json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/messages/:userId — messages between current user and target
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name profileImage')
            .populate('recipient', 'name profileImage')
            .populate('post');

        res.json({ success: true, messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/messages/conversations — list of users chatted with
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const sentTo = await Message.find({ sender: currentUserId }).distinct('recipient');
        const receivedFrom = await Message.find({ recipient: currentUserId }).distinct('sender');

        const uniqueUserIds = [...new Set([...sentTo.map(id => id.toString()), ...receivedFrom.map(id => id.toString())])];

        const users = await User.find({ _id: { $in: uniqueUserIds } })
            .select('name profileImage email bio');

        res.json({ success: true, conversations: users });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/messages/download/:messageId — proxy download (bypasses CORS)
exports.downloadMessageMedia = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

        // Only sender or recipient can download
        if (message.sender.toString() !== userId.toString() && message.recipient.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (!message.mediaUrl) {
            return res.status(400).json({ success: false, message: 'No media in this message' });
        }

        const filename = message.fileName || `download.${message.mediaType === 'pdf' ? 'pdf' : 'file'}`;

        const response = await axios({ method: 'get', url: message.mediaUrl, responseType: 'stream' });

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        if (response.headers['content-type']) res.setHeader('Content-Type', response.headers['content-type']);
        if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);

        response.data.pipe(res);
    } catch (error) {
        console.error('Download media error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
