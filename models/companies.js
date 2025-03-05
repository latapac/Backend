// Import MongoDB client
import { MongoClient } from "mongodb";
const url = 'mongodb://localhost:27017/';


const client = new MongoClient(url);

const dbName = "pacmac"

// Function to insert data
export async function addCompany(_c_id, _name, _status, _createdAt) {
    try {

        await client.connect();


        const db = client.db(dbName);
        const collection = db.collection('companies');

        const query = { company_id: _cid }

        const company = await collection.findOne(query)

        if (company) {
            return false
        }

        const result = await collection.insertOne({ company_id: _c_id, name: _name, status: _status, createdAt: _createdAt });
        if (result) {
            return true
        } else {
            return false
        }

    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    } finally {
        // Close the connection
        await client.close();
        console.log('Connection closed');
    }
}


export async function getCompanies(_cid) {
    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection('companies');

        const query = { company_id: _cid }

        const company = await collection.findOne(query)

        if (company) {
            return company

        } else {
            return { status: 404, msg: "NO COMPANY FOUND" }
        }

    } catch (error) {
        console.error('Error reading data:', error);
    } finally {
        // Close the connection
        await client.close();
        console.log('Connection closed');
    }

}

export async function toggleCompanyStatus(_cid) {
    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection('companies');

        const query = { company_id: _cid }

        const company = await collection.findOne(query)

        if (company) {
            const updateCompany = await collection.updateOne(query,{$set:{status:(!company.status)}})
            return {status:200,data:updateCompany}

        } else {
            return { status: 404, msg: "NO COMPANY FOUND" }
        }

    } catch (error) {
        console.error('Error reading data:', error);
    } finally {
        // Close the connection
        await client.close();
        console.log('Connection closed');
    }

}


export async function updateCompany(_cid, _cname) {

    try {

        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection('companies');

        const query = { company_id: _cid }

        const newData = {
            $set: {
                name: _cname
            }
        }

        const company = await collection.updateOne(query, newData)

        if (company) {
            return company

        } else {
            return { status: 404, msg: "NO COMPANY FOUND" }
        }

    } catch (error) {
        console.error('Error reading data:', error);
    } finally {
        // Close the connection
        await client.close();
        console.log('Connection closed');
    }

}

export async function getAllCompany(_username) {
    try {

        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection('companies');


        const company = await collection.find().toArray()

        if (company) {
            return { status: "ok", data: company }

        } else {
            return { status: 404, msg: "NO COMPANY FOUND" }
        }

    } catch (error) {
        console.error('Error reading data:', error);
    } finally {
        // Close the connection
        await client.close();
        console.log('Connection closed');
    }

}