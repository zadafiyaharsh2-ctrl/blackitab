const Institute = require('../models/Institute');

// GET /api/institute/verify/:code
exports.verifyCode = async (req, res) => {
    try {
        const { code } = req.params;
        const institute = await Institute.findOne({ instituteCode: code.toUpperCase() });

        if (!institute) {
            return res.status(404).json({ success: false, message: 'Institute not found' });
        }

        res.json({
            success: true,
            data: {
                id: institute._id,
                name: institute.name,
                code: institute.instituteCode
            }
        });
    } catch (error) {
        console.error('Verify Institute error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
