const axios = require('axios')
const fs = require('fs')
const dupeData = require('./contacts_dupes.json')
console.log(dupeData.length)

const token = 'pat-na1-0abbcaf6-fd17-4fa5-95bd-f62de0649e2d'

let dateCount = 0
let saCount = 0
let dealCount = 0
let recordCount = 0
let noMergeCount = 0

const dateFileData = []
const saFileData = []
const dealsFileData = []

const main = async () => {
    for(let pair of dupeData){
        const orderedPair = []
    
        let parsedDeal1 = pair[0].properties['num_associated_deals']
        let parsedDeal2 = pair[1].properties['num_associated_deals']
        let parsedNote1 = pair[0].properties['num_notes']
        let parsedNote2 = pair[1].properties['num_notes']
        if(!parsedDeal1 || parsedDeal1 === ''){
            pair[0].properties['num_associated_deals'] = "0"
        }
        if(!parsedDeal2 || parsedDeal2 === ''){
            pair[1].properties['num_associated_deals'] = "0"
        }
        if(!parsedNote1 || parsedNote1 === ''){
            pair[0].properties['num_notes'] = "0"
        }
        if(!parsedNote2 || parsedNote2 === ''){
            pair[1].properties['num_notes'] = "0"
        }

       

    
        if(pair[0].properties['num_associated_deals'] === pair[1].properties['num_associated_deals']){

            if(pair[0].properties['num_notes'] === pair[1].properties['num_notes']){
                // console.log(pair[0].properties['num_notes'==='0'] +' notes on A |'+ pair[1].properties['num_notes'==='0'] +' notes on B ||'+ pair[0].properties['num_associated_deals'==='0'] +' deals on A |'+ pair[1].properties['num_associated_deals'==='0' + 'deals on B '])
                if(pair[0].properties['num_notes'] ==='0' && pair[1].properties['num_notes']==='0' && pair[0].properties['num_associated_deals']==='0' && pair[1].properties['num_associated_deals']==='0'){
                    console.log("DATE DETERMINED")
                    const pointer = compareCreateDates(pair[0].properties['createdate'], pair[1].properties['createdate'])
                    orderedPair[0] = pair[pointer]
                    pair.splice(pointer, 1)
                    orderedPair.push(pair[0])
                    dateFileData.push(orderedPair)
                    await merge(orderedPair)
                }
                else{
                    noMergeCount++
                }
            }
            else{
                const pointer = compareSA(pair[0].properties['num_notes'], pair[1].properties['num_notes'])
                orderedPair[0] = pair[pointer]
                pair.splice(pointer, 1)
                orderedPair.push(pair[0])
                saFileData.push(orderedPair)
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
    fs.writeFileSync(`date.json`, JSON.stringify(dateFileData), "utf-8", (err) => {
        if(err){
            console.log(err)
        }
    })
    fs.writeFileSync(`sa.json`, JSON.stringify(saFileData), "utf-8", (err) => {
        if(err){
            console.log(err)
        }
    })
    fs.writeFileSync(`deals.json`, JSON.stringify(dealsFileData), "utf-8", (err) => {
        if(err){
            console.log(err)
        }
    })

    
    console.log(`date determined: ${dateCount}, notes determined: ${saCount}, deal determined: ${dealCount}`)
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

function compareSA(sa1, sa2){
    saCount++
   if(sa1 > sa2){
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
            url: `https://api.hubapi.com/crm/v3/objects/contacts/merge`,
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
        console.log(error.response.data)

        // throw error.response.data
    }
    await wait(500)
}



