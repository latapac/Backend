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

export async function addMachine(_company_id, _serial_number, _model, _lineNo,) {
    try {
        await connectToDatabase(); 

        const collection = db.collection('machines');
        const result = await collection.insertOne({company_id: _company_id, serial_number: _serial_number, model: _model, lineNo: _lineNo, status: true });
        
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

export async function updateLineMachine(_sid,_line) {
    try {
        await connectToDatabase();

        const collection = db.collection('machines');
        const query = { serial_number: _sid };
        
        const machine = await collection.updateOne(query,{$set:{lineNo:_line}})
        if (machine.modifiedCount!=0) {
            return { status: 200, msg: "updated machine" };
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
        const collectionSpeed = db.collection('history'+_sid);
        await collectionSpeed.insertOne({speed:_data.d.current_speed[0],ts:_data.ts,type:"speed"});
        await collectionSpeed.insertOne({oee:_data.d.current_OEE[0],ts:_data.ts,type:"oee"});
        const result = await collection.updateOne({serial_number:_sid},{$set:{..._data}},{upsert:true})
        return result.acknowledged; 
    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    }
}

export async function deleteMachine(_sid) {
    try {
        await connectToDatabase(); 
        const collection = db.collection('machines');
        const query = {serial_number:_sid}
        const result = await collection.deleteOne(query)
        console.log(result);
        
        return result.deletedCount!=0; 
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
            const query = {
                'd.trigger_time':data.d.trigger_time,
                'd.message':data.d.message
            }
            data.user = user
            const result = await collection.updateOne(query,{$set:{...data}},{upsert:true})
            return result.acknowledged; 
         }
         const query = {
            d:{...data.d},
            ts:data.ts
         }
        const result = await collection.updateOne(query,{$set:{...data}},{upsert:true})
        return result.acknowledged; 
    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    }
}
export async function getSpeedHistory(_sid,date) {
    try {
        await connectToDatabase();
        const collection = db.collection('history' + _sid);

        
        // Ensure date is parsed as UTC and matches the expected format
        const baseDate = new Date(date + "T00:00:00.000Z"); // Force UTC if date is YYYY-MM-DD
        const startOfDay = new Date(baseDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(baseDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Match the exact format of ts (no Z, millisecond precision)
        const startOfDayISO = startOfDay.toISOString().replace('Z', '');
        const endOfDayISO = endOfDay.toISOString().replace('Z', '');

        const query = {
            type:"speed",
            "ts": {
                $gte: startOfDayISO,
                $lt: endOfDayISO
            }
        }

        const speedData = await collection.find(query).toArray();

        return speedData.length > 0 
            ? { status: 200, data: speedData } 
            : { status: 404, msg: "NO DATA" };
    } catch (error) {
        console.error('Error reading data:', error);
        return { status: 500, msg: "Server error" };
    }
}


export async function getOEEHistory(_sid,date) {
    try {
        await connectToDatabase();
        const collection = db.collection('history' + _sid);

          // Ensure date is parsed as UTC and matches the expected format
          const baseDate = new Date(date + "T00:00:00.000Z"); // Force UTC if date is YYYY-MM-DD
          const startOfDay = new Date(baseDate);
          startOfDay.setUTCHours(0, 0, 0, 0);
  
          const endOfDay = new Date(baseDate);
          endOfDay.setUTCHours(23, 59, 59, 999);
  
          // Match the exact format of ts (no Z, millisecond precision)
          const startOfDayISO = startOfDay.toISOString().replace('Z', '');
          const endOfDayISO = endOfDay.toISOString().replace('Z', '');
  
          const query = {
              type:"oee",
              "ts": {
                  $gte: startOfDayISO,
                  $lt: endOfDayISO
              }
          }

        const speedData = await collection.find(query).toArray();

        return speedData.length > 0 
            ? { status: 200, data: speedData } 
            : { status: 404, msg: "NO DATA" };
    } catch (error) {
        console.error('Error reading data:', error);
        return { status: 500, msg: "Server error" };
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


export async function addBatch(sid,data) {
    try {
        await connectToDatabase(); 
        const collection = db.collection('batch'+sid);
        const result = await collection.insertOne(data)
        return result.acknowledged; 
    } catch (error) {
        console.error('Error inserting data:', error);
        return false;
    }
}

export async function getBatch(_sid,date) {
    try {
        await connectToDatabase();
        const collection = db.collection('batch' + _sid);

          // Ensure date is parsed as UTC and matches the expected format
          const baseDate = new Date(date + "T00:00:00.000Z"); // Force UTC if date is YYYY-MM-DD
          const startOfDay = new Date(baseDate);
          startOfDay.setUTCHours(0, 0, 0, 0);
  
          const endOfDay = new Date(baseDate);
          endOfDay.setUTCHours(23, 59, 59, 999);
  
          // Match the exact format of ts (no Z, millisecond precision)
          const startOfDayISO = startOfDay.toISOString().replace('Z', '');
          const endOfDayISO = endOfDay.toISOString().replace('Z', '');
  
          const query = {
              "ts": {
                  $gte: startOfDayISO,
                  $lt: endOfDayISO
              }
          }

        const speedData = await collection.find(query).toArray();

        return speedData.length > 0 
            ? { status: 200, data: speedData } 
            : { status: 404, msg: "NO DATA" };
    } catch (error) {
        console.error('Error reading data:', error);
        return { status: 500, msg: "Server error" };
    }
}


export async function getAuditTrailData(_sid) {
    try {
        await connectToDatabase(); 

        const collection = db.collection('AuditTrail'+_sid);
       
        const machineData = await collection.find({$or:[{topic:"parameter_change"},{topic:"alarm"},{topic:"control"}]}).sort({_id:-1}).toArray();

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

export async function getOEE(_sid, date, RunningShift) {
    try {
        await connectToDatabase(); 
        const collection = db.collection('OEE' + _sid);

        // Ensure date is parsed as UTC and matches the expected format
        const baseDate = new Date(date + "T00:00:00.000Z"); // Force UTC if date is YYYY-MM-DD
        const startOfDay = new Date(baseDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(baseDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Match the exact format of ts (no Z, millisecond precision)
        const startOfDayISO = startOfDay.toISOString().replace('Z', '');
        const endOfDayISO = endOfDay.toISOString().replace('Z', '');

        let query;

        if (RunningShift) {
            query = {
                'd.RunningShift': RunningShift,
                "ts": {
                    $gte: startOfDayISO,
                    $lt: endOfDayISO
                }
            };
        }else{
            query = {
                "ts": {
                    $gte: startOfDayISO,
                    $lt: endOfDayISO
                }
            };
        }

        const data = await collection.find(query).toArray();
        console.log("Found data:", data);

        if (data.length > 0) {
            return { status: 200, data };
        } else {
            return { status: 404, msg: "NO DATA" };
        }
    } catch (error) {
        console.error('Error reading data:', error);
        return { status: 500, msg: "Internal server error" };
    }
}
export async function closeConnection() {
    await client.close();
    console.log('DATA TRANSACTION DONE');
}

