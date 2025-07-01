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
    const studentsCollection = db.collection('students');

    if (req.method === 'GET') {
      const students = await studentsCollection.find({}).toArray();
      res.json(serializeDocs(students));
    } else if (req.method === 'POST') {
      const currentYear = new Date().getFullYear();
      const yearPrefix = currentYear.toString();
      
      const students = await studentsCollection.find(
        { rollNumber: { $regex: `^${yearPrefix}` } },
        { projection: { rollNumber: 1 } }
      ).sort({ rollNumber: -1 }).limit(1).toArray();
      
      let nextNumber;
      if (students.length > 0) {
        const lastRoll = students[0].rollNumber;
        const lastNumber = parseInt(lastRoll.substring(4));
        nextNumber = lastNumber + 1;
      } else {
        nextNumber = 1;
      }
      
      const rollNumber = `${yearPrefix}${nextNumber.toString().padStart(3, '0')}`;
      
      const studentData = {
        ...req.body,
        rollNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await studentsCollection.insertOne(studentData);
      studentData.id = result.insertedId.toString();
      delete studentData._id;
      
      res.status(201).json(studentData);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Students API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}