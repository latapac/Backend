import { MongoClient } from "mongodb";
const url = 'mongodb://localhost:27017/';

const client = new MongoClient(url);
const dbName = "pacmac";


let db = null;

async function connectToDatabase() {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
    }
}

export async function addMachine(_company_id, _serial_number, _purchase_date, _activation_date, _status) {
    try {
        await connectToDatabase(); 

        const collection = db.collection('machines');
        const result = await collection.insertOne({company_id: _company_id, serial_number: _serial_number, purchase_date: _purchase_date, activation_date: _activation_date, status: _status });
        
        return result.acknowledged;
    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    }
}

export async function getMachines(_cid) {
    try {
        await connectToDatabase();

        const collection = db.collection('machines');
        const query = { company_id: _cid };

        const machines = await collection.find(query).toArray();
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
        await connectToDatabase();

        const collection = db.collection('machines');

        const machines = await collection.find().toArray();

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
        await connectToDatabase(); 

        const collection = db.collection('machinesMetrics');
        const result = await collection.updateOne({serial_number:_sid},{$set:{..._data}},{upsert:true})
        return result.acknowledged; 
    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    }
}

export async function addAuditTrail(sid,data) {
    try {
        await connectToDatabase(); 
        const collection = db.collection('AuditTrail'+sid);
         if (data.topic=="alarm") {
            const user = await getOperator(sid)
            console.log(user);
            
            data.user = user
            const result = await collection.insertOne(data)
            return result.acknowledged; 
         }
        const result = await collection.insertOne(data)
        return result.acknowledged; 
    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    }
}

export async function getMachineData(_sid) {
    try {
        await connectToDatabase(); 

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


export async function getAuditTrailData(_sid) {
    try {
        await connectToDatabase(); 

        const collection = db.collection('AuditTrail'+_sid);
       
        const machineData = await collection.find({$or:[{topic:"parameter_change"},{topic:"alarm"}]}).sort({_id:-1}).toArray();

        if (machineData) {
            return { status: 200, data: machineData };
        } else {
            return { status: 404, msg: "NO DATA" };
        }
    } catch (error) {
        console.error('Error reading data:', error);
    }
}


export async function getOperator(_sid) {
    try {
        await connectToDatabase(); 
 
        const collection = db.collection('AuditTrail'+_sid);
        

        const query = {topic:"operator_login"}

        const opertor = await collection.find(query).sort({ $natural: -1 }).limit(1).toArray()
                
        if (opertor) {
            return { status: 200, user: opertor[0]?.d?.user_name[0]};
        } else {
            return { status: 404, msg: "NO DATA" };
        }
    } catch (error) {
        console.error('Error reading data:', error);
    }
}


export async function addOEE(sid,data) {
    try {
        await connectToDatabase(); 
        const collection = db.collection('OEE'+sid);

        const result = await collection.insertOne(data)
        return result.acknowledged; 
    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    }
}

export async function getOEE(_sid,date,shifttime) {
    try {
        await connectToDatabase(); 
 
        const collection = db.collection('OEE'+_sid);

        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0); // Start of the day in UTC
    
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        
        const startOfDayISO = startOfDay.toISOString().replace('Z', '');
        const endOfDayISO = endOfDay.toISOString().replace('Z', '');
        console.log(startOfDayISO,endOfDayISO);
        
        let query = {
            'd.shifttime': shifttime, // Match shifttime
            "ts": {
              $gte: startOfDayISO, // Greater than or equal to start of the day
              $lt: endOfDayISO // Less than end of the day
            }
        }

        const data = await collection.find(query).toArray()
                
        if (data) {
            return { status: 200, data};
        } else {
            return { status: 404, msg: "NO DATA" };
        }
    } catch (error) {
        console.error('Error reading data:', error);
    }
}

export async function closeConnection() {
    await client.close();
    console.log('DATA TRANSACTION DONE');
}

