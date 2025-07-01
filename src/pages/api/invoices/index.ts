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
    const invoicesCollection = db.collection('invoices');

    if (req.method === 'GET') {
      const invoices = await invoicesCollection.find({}).toArray();
      res.json(serializeDocs(invoices));
    } else if (req.method === 'POST') {
      const data = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await invoicesCollection.insertOne(data);
      data.id = result.insertedId.toString();
      delete data._id;
      
      res.status(201).json(data);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Invoices API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}