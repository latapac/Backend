// Import MongoDB client
import { MongoClient } from "mongodb";
const url = 'mongodb://localhost:27017/';

const client = new MongoClient(url);
const dbName = "pacmac";

// Global variable to hold the database connection
let db = null;

async function connectToDatabase() {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
    }
}

export async function addMachine(_company_id, _serial_number, _purchase_date, _activation_date, _status) {
    try {
        await connectToDatabase(); // Reuse the connection

        const collection = db.collection('machines');
        const result = await collection.insertOne({company_id: _company_id, serial_number: _serial_number, purchase_date: _purchase_date, activation_date: _activation_date, status: _status });
        
        return result.acknowledged; // If the insert was successful, it returns true; else false
    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    }
}

export async function getMachines(_cid) {
    try {
        await connectToDatabase(); // Reuse the connection

        const collection = db.collection('machines');
        const query = { company_id: _cid };

        const machines = await collection.find(query).toArray(); // Use .toArray() to get actual data

        if (machines.length > 0) {
            return { status: 200, data: machines };
        } else {
            return { status: 404, msg: "NO MACHINE FOUND" };
        }
    } catch (error) {
        console.error('Error reading data:', error);
    }
}


export async function getAllMachines() {
    try {
        await connectToDatabase(); // Reuse the connection

        const collection = db.collection('machines');

        const machines = await collection.find().toArray(); // Use .toArray() to get actual data

        if (machines) {
            return { status: 200, data: machines };
        } else {
            return { status: 404, msg: "NO MACHINE FOUND" };
        }
    } catch (error) {
        console.error('Error reading data:', error);
    }
}



export async function updateMachineData(_sid, _data) {
    try {
        await connectToDatabase(); // Reuse the connection

        const collection = db.collection('machinesMetrics');
        const result = await collection.updateOne({serial_number:_sid},{$set:{..._data}},{upsert:true})
        return result.acknowledged; // Return true if the insert was successful, else false
    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    }
}

export async function getMachineData(_sid) {
    try {
        await connectToDatabase(); // Reuse the connection

        const collection = db.collection('machinesMetrics');
        const query = { serial_number: _sid };

        const machineData = await collection.findOne(query);

        if (machineData) {
            return { status: 200, data: machineData };
        } else {
            return { status: 404, msg: "NO MACHINE FOUND" };
        }
    } catch (error) {
        console.error('Error reading data:', error);
    }
}

// Call this function to close the connection when the app shuts down
export async function closeConnection() {
    await client.close();
    console.log('DATA TRANSACTION DONE');
}
