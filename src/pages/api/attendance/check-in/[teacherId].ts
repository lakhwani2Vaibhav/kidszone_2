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
    const { location, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    const { db } = await connectToDatabase();
    const attendanceCollection = db.collection('attendance');
    const teachersCollection = db.collection('teachers');

    // Check if teacher already checked in today
    const existingAttendance = await attendanceCollection.findOne({
      teacherId: new ObjectId(teacherId as string),
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Teacher already checked in today' });
    }

    // Get teacher info
    const teacher = await teachersCollection.findOne({ _id: new ObjectId(teacherId as string) });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Determine status based on check-in time
    const checkInTime = new Date(`2000-01-01T${currentTime}`);
    const standardTime = new Date(`2000-01-01T09:00:00`); // 9:00 AM
    const status = checkInTime > standardTime ? 'late' : 'present';

    const attendanceData = {
      teacherId: new ObjectId(teacherId as string),
      date: today,
      checkInTime: currentTime,
      checkOutTime: null,
      status,
      workingHours: 0,
      notes: notes || null,
      location: location || 'School Campus',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await attendanceCollection.insertOne(attendanceData);
    
    // Return with teacher info
    const responseData = {
      ...attendanceData,
      id: result.insertedId.toString(),
      teacher: { ...teacher, id: teacher._id.toString() }
    };
    delete responseData._id;
    delete responseData.teacherId;
    delete responseData.teacher._id;

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}