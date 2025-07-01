import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { teacherId } = req.query;
    const { notes } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    const { db } = await connectToDatabase();
    const attendanceCollection = db.collection('attendance');
    const teachersCollection = db.collection('teachers');

    // Find today's attendance record
    const attendance = await attendanceCollection.findOne({
      teacherId: new ObjectId(teacherId as string),
      date: today
    });

    if (!attendance) {
      return res.status(400).json({ error: 'No check-in record found for today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ error: 'Teacher already checked out today' });
    }

    // Calculate working hours
    const checkInTime = new Date(`2000-01-01T${attendance.checkInTime}`);
    const checkOutTime = new Date(`2000-01-01T${currentTime}`);
    const workingHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    const updateData = {
      checkOutTime: currentTime,
      workingHours: Math.round(workingHours * 100) / 100,
      notes: notes || attendance.notes,
      updatedAt: new Date()
    };

    await attendanceCollection.updateOne(
      { _id: attendance._id },
      { $set: updateData }
    );

    // Get teacher info and return updated record
    const teacher = await teachersCollection.findOne({ _id: new ObjectId(teacherId as string) });
    const updatedAttendance = await attendanceCollection.findOne({ _id: attendance._id });

    const responseData = {
      ...updatedAttendance,
      id: updatedAttendance?._id.toString(),
      teacher: { ...teacher, id: teacher?._id.toString() }
    };
    delete responseData._id;
    delete responseData.teacherId;
    delete responseData.teacher._id;

    res.json(responseData);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}