import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const { db } = await connectToDatabase();
    const adminCollection = db.collection('admin');

    const admin = await adminCollection.findOne({ _id: new ObjectId(decoded.id) });
    if (!admin) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = {
      id: admin._id.toString(),
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}