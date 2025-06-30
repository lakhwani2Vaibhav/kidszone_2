from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = "mongodb+srv://shubham12342019:mwIwfoB7ZQBFFXdx@cluster0.3edzqll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client.kids_zone_academy

# Collections
students_collection = db.students
invoices_collection = db.invoices
fee_items_collection = db.fee_items

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    return doc

def serialize_docs(docs):
    """Convert list of MongoDB documents to JSON serializable format"""
    return [serialize_doc(doc) for doc in docs]

# Students API
@app.route('/api/students', methods=['GET'])
def get_students():
    try:
        students = list(students_collection.find())
        return jsonify(serialize_docs(students))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    try:
        student = students_collection.find_one({'_id': ObjectId(student_id)})
        if student:
            return jsonify(serialize_doc(student))
        return jsonify({'error': 'Student not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/next-roll-number', methods=['GET'])
def get_next_roll_number():
    try:
        current_year = datetime.now().year
        year_prefix = str(current_year)
        
        # Find the highest roll number for the current year
        students = list(students_collection.find(
            {'rollNumber': {'$regex': f'^{year_prefix}'}},
            {'rollNumber': 1}
        ).sort('rollNumber', -1).limit(1))
        
        if students:
            last_roll = students[0]['rollNumber']
            # Extract the numeric part and increment
            last_number = int(last_roll[4:])  # Remove year prefix
            next_number = last_number + 1
        else:
            next_number = 1
        
        # Format with leading zeros (3 digits)
        next_roll_number = f"{year_prefix}{next_number:03d}"
        
        return jsonify({'rollNumber': next_roll_number})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students', methods=['POST'])
def create_student():
    try:
        data = request.json
        
        # Generate roll number
        current_year = datetime.now().year
        year_prefix = str(current_year)
        
        # Find the highest roll number for the current year
        students = list(students_collection.find(
            {'rollNumber': {'$regex': f'^{year_prefix}'}},
            {'rollNumber': 1}
        ).sort('rollNumber', -1).limit(1))
        
        if students:
            last_roll = students[0]['rollNumber']
            last_number = int(last_roll[4:])
            next_number = last_number + 1
        else:
            next_number = 1
        
        roll_number = f"{year_prefix}{next_number:03d}"
        
        # Create student document
        student_data = {
            'name': data['name'],
            'grade': data['grade'],
            'rollNumber': roll_number,
            'fatherName': data.get('fatherName'),
            'motherName': data.get('motherName'),
            'parentEmail': data['parentEmail'],
            'parentPhone': data['parentPhone'],
            'address': data['address'],
            'admissionDate': data['admissionDate'],
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = students_collection.insert_one(student_data)
        student_data['id'] = str(result.inserted_id)
        del student_data['_id']
        
        return jsonify(student_data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        data = request.json
        data['updatedAt'] = datetime.utcnow()
        
        result = students_collection.update_one(
            {'_id': ObjectId(student_id)},
            {'$set': data}
        )
        
        if result.matched_count:
            student = students_collection.find_one({'_id': ObjectId(student_id)})
            return jsonify(serialize_doc(student))
        return jsonify({'error': 'Student not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        # Delete associated invoices first
        invoices_collection.delete_many({'studentId': student_id})
        
        # Delete student
        result = students_collection.delete_one({'_id': ObjectId(student_id)})
        
        if result.deleted_count:
            return jsonify({'message': 'Student deleted successfully'})
        return jsonify({'error': 'Student not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Invoices API
@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    try:
        invoices = list(invoices_collection.find())
        return jsonify(serialize_docs(invoices))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    try:
        data = request.json
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        
        result = invoices_collection.insert_one(data)
        data['id'] = str(result.inserted_id)
        del data['_id']
        
        return jsonify(data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/invoices/<invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    try:
        data = request.json
        data['updatedAt'] = datetime.utcnow()
        
        result = invoices_collection.update_one(
            {'_id': ObjectId(invoice_id)},
            {'$set': data}
        )
        
        if result.matched_count:
            invoice = invoices_collection.find_one({'_id': ObjectId(invoice_id)})
            return jsonify(serialize_doc(invoice))
        return jsonify({'error': 'Invoice not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/invoices/<invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    try:
        result = invoices_collection.delete_one({'_id': ObjectId(invoice_id)})
        
        if result.deleted_count:
            return jsonify({'message': 'Invoice deleted successfully'})
        return jsonify({'error': 'Invoice not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Fee Items API
@app.route('/api/fee-items', methods=['GET'])
def get_fee_items():
    try:
        fee_items = list(fee_items_collection.find())
        return jsonify(serialize_docs(fee_items))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fee-items', methods=['POST'])
def create_fee_item():
    try:
        data = request.json
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        
        result = fee_items_collection.insert_one(data)
        data['id'] = str(result.inserted_id)
        del data['_id']
        
        return jsonify(data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fee-items/<fee_item_id>', methods=['PUT'])
def update_fee_item(fee_item_id):
    try:
        data = request.json
        data['updatedAt'] = datetime.utcnow()
        
        result = fee_items_collection.update_one(
            {'_id': ObjectId(fee_item_id)},
            {'$set': data}
        )
        
        if result.matched_count:
            fee_item = fee_items_collection.find_one({'_id': ObjectId(fee_item_id)})
            return jsonify(serialize_doc(fee_item))
        return jsonify({'error': 'Fee item not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fee-items/<fee_item_id>', methods=['DELETE'])
def delete_fee_item(fee_item_id):
    try:
        result = fee_items_collection.delete_one({'_id': ObjectId(fee_item_id)})
        
        if result.deleted_count:
            return jsonify({'message': 'Fee item deleted successfully'})
        return jsonify({'error': 'Fee item not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize default fee items
@app.route('/api/initialize', methods=['POST'])
def initialize_data():
    try:
        # Check if fee items already exist
        if fee_items_collection.count_documents({}) == 0:
            default_fee_items = [
                {
                    'name': 'Tuition Fee',
                    'amount': 500,
                    'type': 'monthly',
                    'createdAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                },
                {
                    'name': 'Transportation',
                    'amount': 150,
                    'type': 'monthly',
                    'createdAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                },
                {
                    'name': 'Activity Fee',
                    'amount': 100,
                    'type': 'monthly',
                    'createdAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                },
                {
                    'name': 'Admission Fee',
                    'amount': 1000,
                    'type': 'one-time',
                    'createdAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                }
            ]
            fee_items_collection.insert_many(default_fee_items)
        
        return jsonify({'message': 'Data initialized successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)