import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { hashPassword } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Initialize default admin user
    const adminCollection = db.collection('admin');
    const existingAdmin = await adminCollection.findOne({ username: 'Shubham' });
    
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('$Shubh@912513');
      await adminCollection.insertOne({
        username: 'Shubham',
        password: hashedPassword,
        name: 'Shubham Kumar',
        email: 'admin@kidszoneacademy.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Check if fee items already exist
    const feeItemsCollection = db.collection('fee_items');
    const feeItemsCount = await feeItemsCollection.countDocuments({});
    
    if (feeItemsCount === 0) {
      const defaultFeeItems = [
        {
          name: 'Tuition Fee',
          amount: 500,
          type: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Transportation',
          amount: 150,
          type: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Activity Fee',
          amount: 100,
          type: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Admission Fee',
          amount: 1000,
          type: 'one-time',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      await feeItemsCollection.insertMany(defaultFeeItems);
    }

    // Initialize academy data if it doesn't exist
    const academyDataCollection = db.collection('academy_data');
    const academyDataCount = await academyDataCollection.countDocuments({});
    
    if (academyDataCount === 0) {
      const defaultAcademyData = {
        name: "Kid's Zone Academy",
        address: "123 Education Street, Learning City, LC 12345",
        phone: "+1 (555) 123-4567",
        email: "info@kidszoneacademy.com",
        website: "www.kidszoneacademy.com",
        principal: "Dr. Sarah Johnson",
        establishedYear: 2010,
        motto: "Learning Through Play",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await academyDataCollection.insertOne(defaultAcademyData);
    }
    
    res.json({ message: 'Data initialized successfully' });
  } catch (error) {
    console.error('Initialize API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}