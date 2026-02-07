import Entry from "../models/entry.model.js";
import Student from "../models/student.model.js";
import { sendAttendanceReminderEmail } from "../services/email.service.js";

// Create or Update Entry (Scan logic)
export const scanEntry = async (req, res) => {
    try {
        const { rollNo } = req.body;

        // Find Student in this Org
        const student = await Student.findOne({
            roll_no: rollNo,
            organization: req.organization._id
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found in this organization" });
        }

        // Check for active "Out" entry
        const activeEntry = await Entry.findOne({
            student: student._id,
            organization: req.organization._id,
            status: "Out"
        });

        if (activeEntry) {
            // Student is returning -> Mark as In
            activeEntry.arrivalTime = new Date();
            activeEntry.status = "In";
            await activeEntry.save();

            return res.status(200).json({
                message: `Welcome back, ${student.name}!`,
                type: "In",
                entry: activeEntry,
                student
            });
        } else {
            // Student is leaving -> Create new Out entry
            const newEntry = await Entry.create({
                student: student._id,
                organization: req.organization._id,
                status: "Out"
            });

            return res.status(201).json({
                message: `Goodbye, ${student.name}!`,
                type: "Out",
                entry: newEntry,
                student
            });
        }

    } catch (error) {
        console.error("Scan Error:", error);
        res.status(500).json({ message: "Error processing scan" });
    }
};

export const getEntries = async (req, res) => {
    try {
        const { date, startDate, endDate, search, limit } = req.query;  // search can be name or rollno
        const orgId = req.organization._id;

        const pipeline = [
            // 1. Initial Match: Organization
            { $match: { organization: orgId } }
        ];

        // 2. Date Filtering (optimize by placing early)
        if (date === 'today') {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            pipeline.push({
                $match: { leavingTime: { $gte: start, $lte: end } }
            });
        } else if (startDate || endDate) {
            const dateFilter = {};
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            pipeline.push({
                $match: { leavingTime: dateFilter }
            });
        }

        // 3. Lookup Student Details
        pipeline.push({
            $lookup: {
                from: "students",
                localField: "student",
                foreignField: "_id",
                as: "student"
            }
        });

        // 4. Unwind Student (preserve nulls just in case, though shouldn't happen)
        pipeline.push({
            $unwind: { path: "$student", preserveNullAndEmptyArrays: true }
        });

        // 5. Search Filter (Name or Roll No)
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            pipeline.push({
                $match: {
                    $or: [
                        { "student.name": searchRegex },
                        { "student.roll_no": { $regex: search, $options: 'i' } } // roll_no might be number in DB?
                        // If roll_no is Number in schema, regex won't work directly on it in some mongo versions without conversion.
                        // However, let's assume it works or add conversion if needed. 
                        // To be safe, let's convert to string for search if needed?
                        // Actually, Schema defines roll_no as Number. 
                        // Aggregation regex on numbers is tricky. 
                        // Let's add a calculated field for string rollNo first.
                    ]
                }
            });

            // Fix for Number searching: Add a string field for roll_no match
            pipeline.splice(4, 0, {
                $addFields: {
                    "student.rollNoStr": { $toString: "$student.roll_no" }
                }
            });

            // Update match to use rollNoStr
            pipeline[5].$match.$or[1] = { "student.rollNoStr": searchRegex };
        }

        // 6. Sort and Limit
        pipeline.push({ $sort: { leavingTime: -1 } });
        pipeline.push({ $limit: parseInt(limit) || 100 });

        const entries = await Entry.aggregate(pipeline);

        res.status(200).json(entries);

    } catch (error) {
        console.error("Get Entries Error:", error);
        res.status(500).json({ message: "Error fetching entries" });
    }
};

export const sendReminders = async (req, res) => {
    try {
        const orgId = req.organization._id;
        const organizationName = req.organization.name;

        // Get today's entries with status "Out" (haven't returned)
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const unreturnedEntries = await Entry.find({
            organization: orgId,
            status: "Out",
            leavingTime: { $gte: start, $lte: end }
        }).populate('student');

        if (unreturnedEntries.length === 0) {
            return res.status(200).json({
                message: "No unreturned students found for today.",
                count: 0
            });
        }

        // Send emails in parallel
        const emailPromises = unreturnedEntries.map(entry =>
            sendAttendanceReminderEmail(
                entry.student.email,
                entry.student.name,
                organizationName,
                entry.leavingTime
            ).catch(err => {
                console.error(`Failed to send email to ${entry.student.email}:`, err);
                return { error: true, student: entry.student.name };
            })
        );

        const results = await Promise.allSettled(emailPromises);

        const successCount = results.filter(r => r.status === 'fulfilled' && !r.value?.error).length;
        const failCount = results.length - successCount;

        res.status(200).json({
            message: `Reminders sent successfully to ${successCount} student(s).`,
            total: unreturnedEntries.length,
            success: successCount,
            failed: failCount,
            students: unreturnedEntries.map(e => ({
                name: e.student.name,
                rollNo: e.student.roll_no,
                email: e.student.email
            }))
        });

    } catch (error) {
        console.error("Send Reminders Error:", error);
        res.status(500).json({ message: "Error sending reminders" });
    }
};
