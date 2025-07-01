import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, serializeDocs } from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { db } = await connectToDatabase();
    const attendanceCollection = db.collection('attendance');

    if (req.method === 'GET') {
      const attendance = await attendanceCollection.aggregate([
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
    } else if (req.method === 'POST') {
      const data = {
        ...req.body,
        teacherId: new ObjectId(req.body.teacherId),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await attendanceCollection.insertOne(data);
      
      const teachersCollection = db.collection('teachers');
      const teacher = await teachersCollection.findOne({ _id: data.teacherId });
      
      const responseData = {
        ...data,
        id: result.insertedId.toString(),
        teacher: { ...teacher, id: teacher?._id.toString() }
      };
      delete responseData._id;
      delete responseData.teacherId;
      delete responseData.teacher?._id;
      
      res.status(201).json(responseData);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Attendance API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}