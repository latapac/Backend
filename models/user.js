// Import MongoDB client
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt"
const url = 'mongodb://localhost:27017/';


const client = new MongoClient(url);

const dbName = "pacmac"


// Function to insert data
export async function addUser(_username, _password, _name, _email, _company_id, _status, _role) {
  if (!_username || !_password || !_name || !_email || !_company_id || !_status || !_role) {
    return { status: 405, message: "missing field" }
  }
  try {

    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');

    const query = { username: _username }

    const user = await collection.findOne(query)



    if (user) {
      return { status: 402, message: "user already exist" }
    } else {
      const result = await collection.insertOne({ username: _username, password: _password, name: _name, email: _email, c_id: _company_id, status: _status, role: _role });
      if (result) {
        return { status: 200, message: "ok" }
      } else {
        return { status: 400, message: "server error" }
      }
    }


  } catch (error) {
    console.error('Error inserting data:', error);
    return { status: 400, message: "server error" };
  } finally {
    // Close the connection
    await client.close();
    console.log('DATA TRANSACTION DONE');
  }
}

export async function loginUser(_username, _password) {
  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');

    const query = { username: _username };
    const user = await collection.findOne(query);

    if (user) {
      // Use await instead of the callback
      const result = await bcrypt.compare(_password, user.password);

      if (result) {
        if (user.status) {
          return { status: 200, ...user };
        } else {
          return { status: 403, msg: "USER NOT ALLOWED TO LOGIN CONTACT ADMIN" };
        }
      } else {
        return { status: 400, msg: "INCORRECT PASSWORD" };
      }
    } else {
      return { status: 404, msg: "NO USER FOUND" };
    }

  } catch (error) {
    console.error('Error reading data:', error);
    return { status: 500, msg: "Internal server error" };
  } finally {
    // Close the connection
    await client.close();
    console.log('DATA TRANSACTION DONE');
  }
}


export async function loginAdmin(_username, _password) {
  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('admin');

    const query = { username: _username };
    const user = await collection.findOne(query);

    if (user) {
      if (_password == user.password) {
          return { status: 200, ...user };
      } else {
        return { status: 400, msg: "INCORRECT PASSWORD" };
      }
    } else {
      return { status: 404, msg: "NO USER FOUND" };
    }

  } catch (error) {
    console.error('Error reading data:', error);
    return { status: 500, msg: "Internal server error" };
  } finally {
    // Close the connection
    await client.close();
    console.log('DATA TRANSACTION DONE');
  }
}


export async function updateUserPass(_username, _password) {

  try {

    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');

    const filter = { username: _username }

    const hash = await bcrypt.hash(_password, 10);

    const updatedDoc = {
      $set: {
        password: hash,
      }
    }

    const result = await collection.updateOne(filter, updatedDoc)
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
    console.log('DATA TRANSACTION DONE');
  }
}


export async function deleteUser(_username) {

  try {

    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users');

    const filter = { username: _username }
    
    const user = await collection.findOne(filter)
    if (user) {
      return false
    } else {
        const result = await collection.deleteOne(filter)
        return result 
    }

  } catch (error) {
    console.error('Error inserting data:', error);
    return false;
  } finally {
    // Close the connection
    await client.close();
    console.log('DATA TRANSACTION DONE');
  }
}

export async function getUsers(_cid) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users');

    const query = { c_id: _cid };
    const users = await collection.find(query).toArray()

    

    if (users) {
          return { status: 200, data:users};
    } else {
      return { status: 404, msg: "NO USERS FOUND" };
    }

  } catch (error) {
    console.error('Error reading data:', error);
    return { status: 500, msg: "Internal server error" };
  } finally {
    // Close the connectiony
    await client.close();
    console.log('DATA TRANSACTION DONE');
  }
}


