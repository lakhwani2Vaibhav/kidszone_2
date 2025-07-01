import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, serializeDoc } from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    const { db } = await connectToDatabase();
    const teachersCollection = db.collection('teachers');

    if (req.method === 'GET') {
      const teacher = await teachersCollection.findOne({ _id: new ObjectId(id as string) });
      if (teacher) {
        res.json(serializeDoc(teacher));
      } else {
        res.status(404).json({ error: 'Teacher not found' });
      }
    } else if (req.method === 'PUT') {
      const data = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const result = await teachersCollection.updateOne(
        { _id: new ObjectId(id as string) },
        { $set: data }
      );
      
      if (result.matchedCount) {
        const teacher = await teachersCollection.findOne({ _id: new ObjectId(id as string) });
        res.json(serializeDoc(teacher));
      } else {
        res.status(404).json({ error: 'Teacher not found' });
      }
    } else if (req.method === 'DELETE') {
      const attendanceCollection = db.collection('attendance');
      await attendanceCollection.deleteMany({ teacherId: new ObjectId(id as string) });
      
      const result = await teachersCollection.deleteOne({ _id: new ObjectId(id as string) });
      
      if (result.deletedCount) {
        res.json({ message: 'Teacher deleted successfully' });
      } else {
        res.status(404).json({ error: 'Teacher not found' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Teacher API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}