import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { teacherId } = req.query;
    const { db } = await connectToDatabase();
    const attendanceCollection = db.collection('attendance');

    const attendance = await attendanceCollection.aggregate([
      {
        $match: { teacherId: new ObjectId(teacherId as string) }
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $unwind: '$teacher'
      },
      {
        $sort: { date: -1 }
      }
    ]).toArray();
    
    const serializedAttendance = attendance.map(record => {
      record.teacher = { ...record.teacher, id: record.teacher._id.toString() };
      delete record.teacher._id;
      record.id = record._id.toString();
      delete record._id;
      return record;
    });
    
    res.json(serializedAttendance);
  } catch (error) {
    console.error('Teacher attendance API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}