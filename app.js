import express from "express"
import cors from "cors"
import { addUser, deleteUser, getUsers, loginAdmin, updateUserPass } from "./models/user.js"
import { loginUser } from "./models/user.js"
import { addMachine, getMachines, getMachineData, updateMachineData, getAllMachines, addAuditTrail, getAuditTrailData, getOperator, addOEE, getOEE, getSpeedHistory, getOEEHistory, getBatch } from "./models/machine.js"
import { addCompany, getAllCompany, getCompanies, toggleCompanyStatus, updateCompany } from "./models/companies.js"
import bcrypt from "bcrypt"
import { v4 } from "uuid"

const app = express()
const port = 3000

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.send('PACMAC IOT')
})

app.post('/signup/', async (req, res) => {
  let { username, password, name, email, company_id, status, role } = req.body

  if (username == "" || password == "" || name == "" || email == "" || company_id == "" || status == "" || role == "") {
    return res.json({ status: 405, message: "missing field" })
  }
  bcrypt.hash(password, 10, async function (err, hash) {
    if (err) {
      return res.status(500).json({ status: 500, message: "Error hashing password" });
    }
    try {
      const result = await addUser(username, hash, name, email, company_id, status, role);
      return res.json(result); // Add response here
    } catch (error) {
      res.json({ status: 400, message: "server error" });
    }
  });
})

app.post('/login/', async (req, res) => {
  const { username, password } = req.body
  if (username == '' || password == "") {
    return res.json({ status: 405, message: "missing field" })
  }

  let result = await loginUser(username, password)

  res.json(result)
})

app.post('/adminLogin/', async (req, res) => {
  const { username, password } = req.body
  if (username == '' || password == "") {
    return res.json({ status: 405, message: "missing field" })
  }
  let result = await loginAdmin(username, password)
  res.json(result)
})




app.get('/allusers/:cid', async (req, res) => {
  const cid = req.params.cid
  let result = await getUsers(cid)
  res.json(result)
})



app.post('/updateUserPassword/', async (req, res) => {
  const { username, password} = req.body

  if (username == "" || password == "" ) {
    return res.json({ status: 405, message: "missing field" })
  }

  const result = await updateUserPass(username, password)

  console.log(result);
  

  if (result) {
    res.json({ status: 200, message: "ok" })
  } else {
    res.json({ status: 400, message: "server error" })
  }
})



app.post('/deleteUser/', async (req, res) => {
  const { username} = req.body

  if (username == ""  ) {
    return res.json({ status: 405, message: "missing field" })
  }

  const result = await deleteUser(username)

  if (result) {
    res.json({ status: 200, message: "ok" })
  } else {
    res.json({ status: 400, message: "failed to delete user check if its admin" })
  }
})

app.get('/getAllUsers/:cid', async (req, res) => {

  let cid = req.params.cid
  if (cid=="") {
    return res.json({ status: 405, message: "missing field" })
  }

  let result = await getUsers(cid)

  res.json(result)
})



app.post('/addcompany/', async (req, res) => {
  const {name,address, unit } = req.body

  const createdAt = Date.now()

  const cid = v4()

  if (await addCompany(cid, name,address,unit, createdAt)) {
    res.json({ status: true })
  } else {
    res.json({ status: false })
  }
})

app.get("/changeCompanyStatus/:cid",async (req,res)=>{
  const cid = req.params.cid
  try {
    console.log("dekhte hai");
    
    const status=await toggleCompanyStatus(cid)
     res.json(status) 
  } catch (error) {
    res.json({status:500,msg:"server failed"})
  }
})


app.get('/getcompany/:cid', async (req, res) => {
  const cid = req.params.cid
  res.json(await getCompanies(cid))
})

app.get('/getAllCompany/',async (req, res) => {
      res.json(await getAllCompany())
})

app.post('/updatecompany/', async (req, res) => {
  const { company_id, name } = req.body
  if (await updateCompany(company_id, name)) {
    res.json({ status: true })
  } else {
    res.json({ status: false })
  }
})


app.post('/addMachine/', async (req, res) => {
  const { company_id, serial_number, model, lineNo } = req.body
  if (await addMachine(company_id, serial_number, model, lineNo)) {
    res.json({ status: true })
  } else {
    res.json({ status: false })
  }
})

app.get('/getMachine/:cid', async (req, res) => {
  const cid = req.params.cid
  res.json(await getMachines(cid))
})


app.get('/getAllMachine/', async (req, res) => {
  res.json(await getAllMachines())
})

app.post('/addUpMachineData/:sid', async (req, res) => {
  const sid = req.params.sid
  if (await updateMachineData(sid, req.body)) {
    res.json({ status: true })
  } else {
    res.json({ status: false })
  }
})

app.post('/addUpMachineAuditTrail/:sid', async (req, res) => {
  const sid = req.params.sid
  if (await addAuditTrail(sid, req.body)) {
    res.json({ status: true })
  } else {
    res.json({ status: false })
  }
})

app.post('/addoee/:sid', async (req, res) => {
  const sid = req.params.sid
  if (await addOEE(sid, req.body)) {
    res.json({ status: true })
  } else {
    res.json({ status: false })
  }
})


app.post('/addbatch/:sid', async (req, res) => {
  const sid = req.params.sid
  if (await addOEE(sid, req.body)) {
    res.json({ status: true })
  } else {
    res.json({ status: false })
  }
})

app.get('/getAuditTraildata/:sid', async (req, res) => {
  const sid = req.params.sid
  res.json(await getAuditTrailData(sid))
})


app.post('/getoee/:sid', async (req, res) => {
  const sid = req.params.sid  
  const {date,RunningShift} = req.body 
  res.json(await getOEE(sid,date,RunningShift))
})


app.post('/getbatch/:sid', async (req, res) => {
  const sid = req.params.sid  
  const {date} = req.body 
  res.json(await getBatch(sid,date))
})


app.get('/getOperator/:sid', async (req, res) => {
  const sid = req.params.sid
  res.json(await getOperator(sid))
})


app.get('/getSpeedHistory/:sid', async (req, res) => {
  const {date} = req.query
  const sid = req.params.sid  
  res.json(await getSpeedHistory(sid,date))
})

app.get('/getOeeHistory/:sid', async (req, res) => {
  const {date} = req.query
  const sid = req.params.sid  
  res.json(await getOEEHistory(sid,date))
})

app.get('/getMachineData/:sid', async (req, res) => {
  const sid = req.params.sid
  res.json(await getMachineData(sid))
})


try {
  app.listen(port, () => {
    console.log(`server listening on port ${port}`)
  })
} catch (error) {
  app.listen(3300, () => {
    console.log(`server listening on port ${port}`)
  })
}