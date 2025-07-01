import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, serializeDocs } from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { db } = await connectToDatabase();
    const teachersCollection = db.collection('teachers');

    if (req.method === 'GET') {
      const teachers = await teachersCollection.find({}).toArray();
      res.json(serializeDocs(teachers));
    } else if (req.method === 'POST') {
      const teacherData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await teachersCollection.insertOne(teacherData);
      teacherData.id = result.insertedId.toString();
      delete teacherData._id;
      
      res.status(201).json(teacherData);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Teachers API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}