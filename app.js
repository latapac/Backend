import express from "express"
import cors from "cors"
import { addUser, getUsers, updateUser } from "./models/user.js"
import { loginUser } from "./models/user.js"
import { addMachine, getMachines, getMachineData, updateMachineData, getAllMachines, addAuditTrail, getAuditTrailData, getOperator } from "./models/machine.js"
import { addCompany, getAllCompany, getCompanies, toggleCompanyStatus, updateCompany } from "./models/companies.js"
import bcrypt from "bcrypt"

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



app.post('/updateUser/', async (req, res) => {
  const { username, password, name, email, status, role } = req.body

  if (username == "" || password == "" || name == "" || email == "" || status == "" || role == "") {
    return res.json({ status: 405, message: "missing field" })
  }

  if (await updateUser(username, password, name, email, status, role)) {
    res.json({ status: 200, message: "ok" })
  } else {
    res.json({ status: 400, message: "server error" })
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
  const { company_id, name,status, createdAt } = req.body
  if (await addCompany(company_id, name,status, createdAt)) {
    res.json({ status: true })
  } else {
    res.json({ status: false })
  }
})


app.get("/changeCompanyStatus/:cid",async (req,res)=>{
  const cid = req.params.cid
  try {
    return await toggleCompanyStatus(cid)
  } catch (error) {
    return {status:500,msg:"server failed"}
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
  const { company_id, serial_number, purchase_date, activation_date, status } = req.body
  if (await addMachine(company_id, serial_number, purchase_date, activation_date, status)) {
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

app.get('/getAuditTraildata/:sid', async (req, res) => {
  const sid = req.params.sid
  res.json(await getAuditTrailData(sid))
})


app.get('/getOperator/:sid', async (req, res) => {
  const sid = req.params.sid
  res.json(await getOperator(sid))
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