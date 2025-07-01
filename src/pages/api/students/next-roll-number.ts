import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';

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

    const { db } = await connectToDatabase();
    const studentsCollection = db.collection('students');

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
    
    const nextRollNumber = `${yearPrefix}${nextNumber.toString().padStart(3, '0')}`;
    
    res.json({ rollNumber: nextRollNumber });
  } catch (error) {
    console.error('Next roll number API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}