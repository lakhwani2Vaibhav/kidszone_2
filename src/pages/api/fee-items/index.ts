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
    const feeItemsCollection = db.collection('fee_items');

    if (req.method === 'GET') {
      const feeItems = await feeItemsCollection.find({}).toArray();
      res.json(serializeDocs(feeItems));
    } else if (req.method === 'POST') {
      const data = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await feeItemsCollection.insertOne(data);
      data.id = result.insertedId.toString();
      delete data._id;
      
      res.status(201).json(data);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Fee items API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}