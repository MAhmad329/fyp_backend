const Project = require('../models/project'); 

exports.getProjectStatusCounts = async (req, res) => {
    try {
        const statusCounts = await Project.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            }
        ]);

        // Optional: Transform the array into an object for easier use in front-end
        const statusMap = statusCounts.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: statusMap
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Server error: " + error.message
        });
    }
};
