const findDuplicates = require('./findDuplicates')
const mergeDuplicate = require('./mergeDuplicate')
const addToDatabase = require('./addToDatabase')
const db = require('./config');
const axios = require('axios')
const inquirer = require('inquirer');
const fs = require('fs')
const Company = require('./Models/Company');
const Contact = require('./Models/Contacts')


//sanbox token: pat-na1-b26ed0a1-c03b-4381-82bc-25e8a353e684
//myhsapp token: pat-na1-703f92b7-b847-4e46-a85f-a4063ca56411
//production token: pat-na1-0abbcaf6-fd17-4fa5-95bd-f62de0649e2d


//select the object youd like to dedupe by writing either "contacts" or "compaobjec"
const object = "contacts"

//list properties you'd like to scan for duplicates on as a an array of strings. Here we are just looking for duplicate emails on contacts
const dupeProperty = ["email"]


const token = 'pat-na1-0abbcaf6-fd17-4fa5-95bd-f62de0649e2d'
const propMap = {
    'companies': ['email', 'hubspot_owner_id', 'num_associated_contacts', 'num_associated_deals'],
    'contacts': ['num_associated_deals', 'num_notes'] 
}
const objMap = {
    "companies": Company,
    "contacts": Contact
}
const checkProp = propMap[object]

db.once('open', async () => {
    const newDB = await updateDB()
    if(newDB.choice === 'Yes'){
        db.dropCollection(object, (err, result)=>{
            if(err){
                console.log(err)
            }
            else{
                console.log(result)
            }
        })
        console.log(`initializaing ${object} collection...`)
        await addToDatabase(object, token, dupeProperty, checkProp, objMap[object])
        console.log('collection synced')
    }
    const inputResponse = await proceed()
    if(inputResponse.choice === 'Yes'){
        await findAllDuplicates()
    }
});


async function findAllDuplicates(){

    let recordCount = 0
    let duplicateCount = 0
    const dupeData = []



    const cursor = objMap[object].find({}).cursor();

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {

        console.log(doc.id);

        const dupes = await findDuplicates(doc, object, objMap, dupeProperty, objMap[object], dupeData, checkProp)

        if(dupes !== 'none'){
            duplicateCount++
        }
        recordCount++
        console.log(`record count: ${recordCount}, found duplicates: ${duplicateCount}`)
    }

    console.log(duplicateCount)

    fs.writeFileSync(`${object}_dupes.json`, JSON.stringify(dupeData), "utf-8", (err) => {
        if(err){
            console.log(err)
        }
    })

}

async function proceed() {
    return inquirer.prompt(
        [
            {
                type: 'list',
                message: 'continue to find duplicates?',
                name: 'choice',
                choices: ['Yes', 'No']
            }
        ]

    )
}
async function updateDB() {
    return inquirer.prompt(
        [
            {
                type: 'list',
                message: 'Create new database?',
                name: 'choice',
                choices: ['Yes', 'No']
            }
        ]

    )
}