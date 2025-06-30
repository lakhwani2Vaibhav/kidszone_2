import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = "mongodb+srv://shubham12342019:mwIwfoB7ZQBFFXdx@cluster0.3edzqll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(MONGO_URI);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

let db;
let studentsCollection;
let teachersCollection;
let invoicesCollection;
let feeItemsCollection;
let academyDataCollection;
let adminCollection;
let attendanceCollection;

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
    adminCollection = db.collection('admin');
    attendanceCollection = db.collection('attendance');
    console.log('Connected to MongoDB');
    
    // Initialize default admin user
    await initializeDefaultAdmin();
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Initialize default admin user
async function initializeDefaultAdmin() {
  try {
    const existingAdmin = await adminCollection.findOne({ username: 'Shubham' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('$Shubh@912513', 10);
      await adminCollection.insertOne({
        username: 'Shubham',
        password: hashedPassword,
        name: 'Shubham Kumar',
        email: 'admin@kidszoneacademy.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

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

// Auth API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await adminCollection.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: admin._id.toString(), 
        username: admin.username, 
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const user = {
      id: admin._id.toString(),
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const admin = await adminCollection.findOne({ _id: new ObjectId(req.user.id) });
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
});

// Admin API
app.get('/api/admin', authenticateToken, async (req, res) => {
  try {
    const admins = await adminCollection.find({}).toArray();
    const sanitizedAdmins = admins.map(admin => {
      const { password, ...adminWithoutPassword } = admin;
      return serializeDoc(adminWithoutPassword);
    });
    res.json(sanitizedAdmins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin', authenticateToken, async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;
    
    const existingAdmin = await adminCollection.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const adminData = {
      username,
      password: hashedPassword,
      name,
      email,
      role: role || 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await adminCollection.insertOne(adminData);
    const { password: _, ...adminWithoutPassword } = adminData;
    adminWithoutPassword.id = result.insertedId.toString();
    delete adminWithoutPassword._id;
    
    res.status(201).json(adminWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Attendance API
app.get('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const attendance = await attendanceCollection.aggregate([
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $unwind: '$teacher'
      }
    ]).toArray();
    
    const serializedAttendance = attendance.map(record => {
      record.teacher = serializeDoc(record.teacher);
      return serializeDoc(record);
    });
    
    res.json(serializedAttendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attendance/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const attendance = await attendanceCollection.aggregate([
      {
        $match: { teacherId: new ObjectId(req.params.teacherId) }
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $unwind: '$teacher'
      },
      {
        $sort: { date: -1 }
      }
    ]).toArray();
    
    const serializedAttendance = attendance.map(record => {
      record.teacher = serializeDoc(record.teacher);
      return serializeDoc(record);
    });
    
    res.json(serializedAttendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attendance/date/:date', authenticateToken, async (req, res) => {
  try {
    const attendance = await attendanceCollection.aggregate([
      {
        $match: { date: req.params.date }
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $unwind: '$teacher'
      }
    ]).toArray();
    
    const serializedAttendance = attendance.map(record => {
      record.teacher = serializeDoc(record.teacher);
      return serializeDoc(record);
    });
    
    res.json(serializedAttendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance/check-in/:teacherId', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { location, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    // Check if teacher already checked in today
    const existingAttendance = await attendanceCollection.findOne({
      teacherId: new ObjectId(teacherId),
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Teacher already checked in today' });
    }

    // Get teacher info
    const teacher = await teachersCollection.findOne({ _id: new ObjectId(teacherId) });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Determine status based on check-in time
    const checkInTime = new Date(`2000-01-01T${currentTime}`);
    const standardTime = new Date(`2000-01-01T09:00:00`); // 9:00 AM
    const status = checkInTime > standardTime ? 'late' : 'present';

    const attendanceData = {
      teacherId: new ObjectId(teacherId),
      date: today,
      checkInTime: currentTime,
      checkOutTime: null,
      status,
      workingHours: 0,
      notes: notes || null,
      location: location || 'School Campus',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await attendanceCollection.insertOne(attendanceData);
    
    // Return with teacher info
    const responseData = {
      ...attendanceData,
      id: result.insertedId.toString(),
      teacher: serializeDoc(teacher)
    };
    delete responseData._id;
    delete responseData.teacherId;

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance/check-out/:teacherId', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { notes } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    // Find today's attendance record
    const attendance = await attendanceCollection.findOne({
      teacherId: new ObjectId(teacherId),
      date: today
    });

    if (!attendance) {
      return res.status(400).json({ error: 'No check-in record found for today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ error: 'Teacher already checked out today' });
    }

    // Calculate working hours
    const checkInTime = new Date(`2000-01-01T${attendance.checkInTime}`);
    const checkOutTime = new Date(`2000-01-01T${currentTime}`);
    const workingHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    const updateData = {
      checkOutTime: currentTime,
      workingHours: Math.round(workingHours * 100) / 100,
      notes: notes || attendance.notes,
      updatedAt: new Date()
    };

    await attendanceCollection.updateOne(
      { _id: attendance._id },
      { $set: updateData }
    );

    // Get teacher info and return updated record
    const teacher = await teachersCollection.findOne({ _id: new ObjectId(teacherId) });
    const updatedAttendance = await attendanceCollection.findOne({ _id: attendance._id });

    const responseData = {
      ...updatedAttendance,
      id: updatedAttendance._id.toString(),
      teacher: serializeDoc(teacher)
    };
    delete responseData._id;
    delete responseData.teacherId;

    res.json(responseData);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      teacherId: new ObjectId(req.body.teacherId),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await attendanceCollection.insertOne(data);
    
    // Get teacher info
    const teacher = await teachersCollection.findOne({ _id: data.teacherId });
    
    const responseData = {
      ...data,
      id: result.insertedId.toString(),
      teacher: serializeDoc(teacher)
    };
    delete responseData._id;
    delete responseData.teacherId;
    
    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/attendance/:id', authenticateToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      updatedAt: new Date()
    };
    
    if (req.body.teacherId) {
      data.teacherId = new ObjectId(req.body.teacherId);
    }
    
    const result = await attendanceCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: data }
    );
    
    if (result.matchedCount) {
      const attendance = await attendanceCollection.findOne({ _id: new ObjectId(req.params.id) });
      const teacher = await teachersCollection.findOne({ _id: attendance.teacherId });
      
      const responseData = {
        ...attendance,
        id: attendance._id.toString(),
        teacher: serializeDoc(teacher)
      };
      delete responseData._id;
      delete responseData.teacherId;
      
      res.json(responseData);
    } else {
      res.status(404).json({ error: 'Attendance record not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/attendance/:id', authenticateToken, async (req, res) => {
  try {
    const result = await attendanceCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount) {
      res.json({ message: 'Attendance record deleted successfully' });
    } else {
      res.status(404).json({ error: 'Attendance record not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Academy Data API
app.get('/api/academy-data', authenticateToken, async (req, res) => {
  try {
    const academyData = await academyDataCollection.find({}).toArray();
    res.json(serializeDocs(academyData));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/academy-data', authenticateToken, async (req, res) => {
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

app.put('/api/academy-data/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/academy-data/:id', authenticateToken, async (req, res) => {
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
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const students = await studentsCollection.find({}).toArray();
    res.json(serializeDocs(students));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:studentId', authenticateToken, async (req, res) => {
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

app.get('/api/students/next-roll-number', authenticateToken, async (req, res) => {
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

app.post('/api/students', authenticateToken, async (req, res) => {
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

app.put('/api/students/:studentId', authenticateToken, async (req, res) => {
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

app.delete('/api/students/:studentId', authenticateToken, async (req, res) => {
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
app.get('/api/teachers', authenticateToken, async (req, res) => {
  try {
    const teachers = await teachersCollection.find({}).toArray();
    res.json(serializeDocs(teachers));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/teachers/:teacherId', authenticateToken, async (req, res) => {
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

app.post('/api/teachers', authenticateToken, async (req, res) => {
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

app.put('/api/teachers/:teacherId', authenticateToken, async (req, res) => {
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

app.delete('/api/teachers/:teacherId', authenticateToken, async (req, res) => {
  try {
    // Delete associated attendance records
    await attendanceCollection.deleteMany({ teacherId: new ObjectId(req.params.teacherId) });
    
    // Delete teacher
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
app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const invoices = await invoicesCollection.find({}).toArray();
    res.json(serializeDocs(invoices));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', authenticateToken, async (req, res) => {
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

app.put('/api/invoices/:invoiceId', authenticateToken, async (req, res) => {
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

app.delete('/api/invoices/:invoiceId', authenticateToken, async (req, res) => {
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
app.get('/api/fee-items', authenticateToken, async (req, res) => {
  try {
    const feeItems = await feeItemsCollection.find({}).toArray();
    res.json(serializeDocs(feeItems));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fee-items', authenticateToken, async (req, res) => {
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

app.put('/api/fee-items/:feeItemId', authenticateToken, async (req, res) => {
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

app.delete('/api/fee-items/:feeItemId', authenticateToken, async (req, res) => {
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