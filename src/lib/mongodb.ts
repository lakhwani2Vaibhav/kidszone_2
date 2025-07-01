import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://shubham12342019:mwIwfoB7ZQBFFXdx@cluster0.3edzqll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  const db = client.db('kids_zone_academy');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

export function serializeDoc(doc: any) {
  if (doc) {
    doc.id = doc._id.toString();
    delete doc._id;
  }
  return doc;
}

export function serializeDocs(docs: any[]) {
  return docs.map(doc => serializeDoc(doc));
}