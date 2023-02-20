const axios = require('axios')
const fs = require('fs')
const dupeData = require('./companies_dupes.json')
console.log(dupeData.length)

const token = 'pat-na1-0abbcaf6-fd17-4fa5-95bd-f62de0649e2d'

let dateCount = 0
let contactCount = 0
let dealCount = 0
let recordCount = 0

const dateFileData = []
const contactsFileData = []
const dealsFileData = []
const main = async () => {
    for(let pair of dupeData){
        const orderedPair = []
    
        let parsed1 = pair[0].properties['num_associated_deals']
        let parsed2 = pair[1].properties['num_associated_deals']
        if(!parsed1 || parsed1 === ''){
            pair[0].properties['num_associated_deals'] = "0"
        }
        if(!parsed2 || parsed2 === ''){
            pair[1].properties['num_associated_deals'] = "0"
        }
       
        if(pair[0].properties['num_associated_deals'] === pair[1].properties['num_associated_deals']){
    
            if(pair[0].properties['num_associated_contacts'] === pair[1].properties['num_associated_contacts']){
                const pointer = compareCreateDates(pair[0].properties['createdate'], pair[1].properties['createdate'])
                orderedPair[0] = pair[pointer]
                pair.splice(pointer, 1)
                orderedPair.push(pair[0])
                dateFileData.push(orderedPair)
                await merge(orderedPair)
            }else{
                const pointer = compareContacts(pair[0].properties['num_associated_contacts'], pair[1].properties['num_associated_contacts'])
                orderedPair[0] = pair[pointer]
                pair.splice(pointer, 1)
                orderedPair.push(pair[0])
                contactsFileData.push(orderedPair)
                await merge(orderedPair)
            }
    
        }else{
            const pointer = compareDeals(pair[0].properties['num_associated_deals'], pair[1].properties['num_associated_deals'])
            orderedPair[0] = pair[pointer]
            pair.splice(pointer, 1)
            orderedPair.push(pair[0])
            dealsFileData.push(orderedPair)
            await merge(orderedPair)
        }
        recordCount++
        console.log(recordCount)
    }
    fs.writeFileSync(`dates_dupes.json`, JSON.stringify(dateFileData), "utf-8", (err) => {
        if(err){
            console.log(err)
        }
    })
    fs.writeFileSync(`contacts_dupes.json`, JSON.stringify(contactsFileData), "utf-8", (err) => {
        if(err){
            console.log(err)
        }
    })
    fs.writeFileSync(`deals_dupes.json`, JSON.stringify(dealsFileData), "utf-8", (err) => {
        if(err){
            console.log(err)
        }
    })
    
    console.log(`date determined: ${dateCount}, contact determined: ${contactCount}, deal determined: ${dealCount}`)
}

main()



function compareCreateDates(date1, date2){ 
    dateCount++ 
    if(new Date(date1) > new Date(date2)){
        return 0
    }else{
        return 1
    }
}

function compareContacts(contacts1, contacts2){
    contactCount++
   if(contacts1 > contacts2){
       return 0
   }else{
       return 1
   }
}

function compareDeals(deals1, deals2){
   
    dealCount++

    if(deals1 > deals2){
        return 0
    }else{
        return 1
    }
}

async function merge(pair){
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    console.log(pair.map(el => el.id))
    try {
        const mergeStatus = await axios({
            method: 'POST',
            url: `https://api.hubapi.com/crm/v3/objects/companies/merge`,
            data: {
                "primaryObjectId": pair[0].id,
                "objectIdToMerge": pair[1].id
              },
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        if(mergeStatus.data.id){
            console.log(`merge successful into record: ${mergeStatus.data.id}`)
        }
    } catch (error) {
        console.log(error)
    }
    await wait(500)
}



