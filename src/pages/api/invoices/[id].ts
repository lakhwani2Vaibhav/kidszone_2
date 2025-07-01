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
    const invoicesCollection = db.collection('invoices');

    if (req.method === 'PUT') {
      const data = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const result = await invoicesCollection.updateOne(
        { _id: new ObjectId(id as string) },
        { $set: data }
      );
      
      if (result.matchedCount) {
        const invoice = await invoicesCollection.findOne({ _id: new ObjectId(id as string) });
        res.json(serializeDoc(invoice));
      } else {
        res.status(404).json({ error: 'Invoice not found' });
      }
    } else if (req.method === 'DELETE') {
      const result = await invoicesCollection.deleteOne({ _id: new ObjectId(id as string) });
      
      if (result.deletedCount) {
        res.json({ message: 'Invoice deleted successfully' });
      } else {
        res.status(404).json({ error: 'Invoice not found' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Invoice API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}