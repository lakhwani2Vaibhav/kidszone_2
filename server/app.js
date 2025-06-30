import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = "mongodb+srv://shubham12342019:mwIwfoB7ZQBFFXdx@cluster0.3edzqll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(MONGO_URI);

let db;
let studentsCollection;
let teachersCollection;
let invoicesCollection;
let feeItemsCollection;
let academyDataCollection;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db('kids_zone_academy');
    studentsCollection = db.collection('students');
    teachersCollection = db.collection('teachers');
    invoicesCollection = db.collection('invoices');
    feeItemsCollection = db.collection('fee_items');
    academyDataCollection = db.collection('academy_data');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

function serializeDoc(doc) {
  if (doc) {
    doc.id = doc._id.toString();
    delete doc._id;
  }
  return doc;
}

function serializeDocs(docs) {
  return docs.map(doc => serializeDoc(doc));
}

// Academy Data API
app.get('/api/academy-data', async (req, res) => {
  try {
    const academyData = await academyDataCollection.find({}).toArray();
    res.json(serializeDocs(academyData));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/academy-data', async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await academyDataCollection.insertOne(data);
    data.id = result.insertedId.toString();
    delete data._id;
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/academy-data/:id', async (req, res) => {
  try {
    const data = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await academyDataCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: data }
    );
    
    if (result.matchedCount) {
      const academyData = await academyDataCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.json(serializeDoc(academyData));
    } else {
      res.status(404).json({ error: 'Academy data not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/academy-data/:id', async (req, res) => {
  try {
    const result = await academyDataCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount) {
      res.json({ message: 'Academy data deleted successfully' });
    } else {
      res.status(404).json({ error: 'Academy data not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Students API
app.get('/api/students', async (req, res) => {
  try {
    const students = await studentsCollection.find({}).toArray();
    res.json(serializeDocs(students));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:studentId', async (req, res) => {
  try {
    const student = await studentsCollection.findOne({ _id: new ObjectId(req.params.studentId) });
    if (student) {
      res.json(serializeDoc(student));
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/next-roll-number', async (req, res) => {
  try {
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
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
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
      name: req.body.name,
      grade: req.body.grade,
      rollNumber: rollNumber,
      dateOfBirth: req.body.dateOfBirth,
      admissionDate: req.body.admissionDate,
      age: req.body.age,
      parentName: req.body.parentName,
      parentVerificationCard: req.body.parentVerificationCard,
      parentEmail: req.body.parentEmail,
      fatherMobile: req.body.fatherMobile,
      motherMobile: req.body.motherMobile,
      fatherPhone: req.body.fatherPhone,
      motherPhone: req.body.motherPhone,
      emergencyNumber: req.body.emergencyNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await studentsCollection.insertOne(studentData);
    studentData.id = result.insertedId.toString();
    delete studentData._id;
    
    res.status(201).json(studentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/students/:studentId', async (req, res) => {
  try {
    const data = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(req.params.studentId) },
      { $set: data }
    );
    
    if (result.matchedCount) {
      const student = await studentsCollection.findOne({ _id: new ObjectId(req.params.studentId) });
      res.json(serializeDoc(student));
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/students/:studentId', async (req, res) => {
  try {
    // Delete associated invoices first
    await invoicesCollection.deleteMany({ studentId: req.params.studentId });
    
    // Delete student
    const result = await studentsCollection.deleteOne({ _id: new ObjectId(req.params.studentId) });
    
    if (result.deletedCount) {
      res.json({ message: 'Student deleted successfully' });
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teachers API
app.get('/api/teachers', async (req, res) => {
  try {
    const teachers = await teachersCollection.find({}).toArray();
    res.json(serializeDocs(teachers));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/teachers/:teacherId', async (req, res) => {
  try {
    const teacher = await teachersCollection.findOne({ _id: new ObjectId(req.params.teacherId) });
    if (teacher) {
      res.json(serializeDoc(teacher));
    } else {
      res.status(404).json({ error: 'Teacher not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    const teacherData = {
      name: req.body.name,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth,
      dateOfJoining: req.body.dateOfJoining,
      fatherName: req.body.fatherName,
      age: req.body.age,
      verificationCard: req.body.verificationCard,
      mobileNumber: req.body.mobileNumber,
      emergencyNumber: req.body.emergencyNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await teachersCollection.insertOne(teacherData);
    teacherData.id = result.insertedId.toString();
    delete teacherData._id;
    
    res.status(201).json(teacherData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/teachers/:teacherId', async (req, res) => {
  try {
    const data = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await teachersCollection.updateOne(
      { _id: new ObjectId(req.params.teacherId) },
      { $set: data }
    );
    
    if (result.matchedCount) {
      const teacher = await teachersCollection.findOne({ _id: new ObjectId(req.params.teacherId) });
      res.json(serializeDoc(teacher));
    } else {
      res.status(404).json({ error: 'Teacher not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/teachers/:teacherId', async (req, res) => {
  try {
    const result = await teachersCollection.deleteOne({ _id: new ObjectId(req.params.teacherId) });
    
    if (result.deletedCount) {
      res.json({ message: 'Teacher deleted successfully' });
    } else {
      res.status(404).json({ error: 'Teacher not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices API
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await invoicesCollection.find({}).toArray();
    res.json(serializeDocs(invoices));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await invoicesCollection.insertOne(data);
    data.id = result.insertedId.toString();
    delete data._id;
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/invoices/:invoiceId', async (req, res) => {
  try {
    const data = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await invoicesCollection.updateOne(
      { _id: new ObjectId(req.params.invoiceId) },
      { $set: data }
    );
    
    if (result.matchedCount) {
      const invoice = await invoicesCollection.findOne({ _id: new ObjectId(req.params.invoiceId) });
      res.json(serializeDoc(invoice));
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/invoices/:invoiceId', async (req, res) => {
  try {
    const result = await invoicesCollection.deleteOne({ _id: new ObjectId(req.params.invoiceId) });
    
    if (result.deletedCount) {
      res.json({ message: 'Invoice deleted successfully' });
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fee Items API
app.get('/api/fee-items', async (req, res) => {
  try {
    const feeItems = await feeItemsCollection.find({}).toArray();
    res.json(serializeDocs(feeItems));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fee-items', async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await feeItemsCollection.insertOne(data);
    data.id = result.insertedId.toString();
    delete data._id;
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/fee-items/:feeItemId', async (req, res) => {
  try {
    const data = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await feeItemsCollection.updateOne(
      { _id: new ObjectId(req.params.feeItemId) },
      { $set: data }
    );
    
    if (result.matchedCount) {
      const feeItem = await feeItemsCollection.findOne({ _id: new ObjectId(req.params.feeItemId) });
      res.json(serializeDoc(feeItem));
    } else {
      res.status(404).json({ error: 'Fee item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/fee-items/:feeItemId', async (req, res) => {
  try {
    const result = await feeItemsCollection.deleteOne({ _id: new ObjectId(req.params.feeItemId) });
    
    if (result.deletedCount) {
      res.json({ message: 'Fee item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Fee item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize default data
app.post('/api/initialize', async (req, res) => {
  try {
    // Check if fee items already exist
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
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});