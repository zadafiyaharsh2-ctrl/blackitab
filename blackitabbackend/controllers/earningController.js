const Earning = require('../models/Earning');

// GET /api/earnings — Get user's earnings summary + recent transactions
exports.getEarnings = async (req, res) => {
    try {
        const userId = req.user._id;

        // Summary aggregation
        const [summary] = await Earning.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalEarned: {
                        $sum: { $cond: [{ $ne: ['$type', 'withdrawal'] }, '$amount', 0] }
                    },
                    totalWithdrawn: {
                        $sum: { $cond: [{ $eq: ['$type', 'withdrawal'] }, { $abs: '$amount' }, 0] }
                    },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        const stats = summary || { totalEarned: 0, totalWithdrawn: 0, totalTransactions: 0 };
        stats.availableBalance = stats.totalEarned - stats.totalWithdrawn;

        // Monthly breakdown (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyBreakdown = await Earning.aggregate([
            { $match: { userId, createdAt: { $gte: sixMonthsAgo }, type: { $ne: 'withdrawal' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                stats,
                monthlyBreakdown
            }
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/earnings/transactions?page=1&limit=20&type=content_view
exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20, type } = req.query;
        const filter = { userId };
        if (type) filter.type = type;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [transactions, total] = await Promise.all([
            Earning.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            Earning.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/earnings/withdraw — Request withdrawal
exports.requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
        }

        // Check balance
        const [summary] = await Earning.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalEarned: { $sum: { $cond: [{ $ne: ['$type', 'withdrawal'] }, '$amount', 0] } },
                    totalWithdrawn: { $sum: { $cond: [{ $eq: ['$type', 'withdrawal'] }, { $abs: '$amount' }, 0] } }
                }
            }
        ]);

        const available = (summary?.totalEarned || 0) - (summary?.totalWithdrawn || 0);
        if (amount > available) {
            return res.status(400).json({ success: false, message: `Insufficient balance. Available: ₹${available}` });
        }

        const withdrawal = await Earning.create({
            userId,
            type: 'withdrawal',
            amount: -Math.abs(amount),
            status: 'pending',
            description: 'Withdrawal request'
        });

        res.json({ success: true, message: 'Withdrawal request submitted', data: withdrawal });
    } catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/earnings/export — Export CSV
exports.exportCSV = async (req, res) => {
    try {
        const userId = req.user._id;
        const transactions = await Earning.find({ userId }).sort({ createdAt: -1 }).limit(500);

        // Build CSV
        let csv = 'Date,Type,Amount,Status,Description\n';
        transactions.forEach(t => {
            const date = new Date(t.createdAt).toISOString().split('T')[0];
            csv += `${date},${t.type},${t.amount},${t.status},"${t.description}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=blackitab_earnings.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
