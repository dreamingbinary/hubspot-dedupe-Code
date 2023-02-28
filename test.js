// const csvFilePath='./mergeLog.csv'
// const csv=require('csvtojson')
// const fs = require('fs')
// csv()
// .fromFile(csvFilePath)
// .then((jsonObj)=>{
//     console.log(jsonObj);
//     fs.writeFileSync(`mergeLog.json`, JSON.stringify(jsonObj), "utf-8", (err) => {
//         if(err){
//             console.log(err)
//         }
//     })
//     /**
//      * [
//      * 	{a:"1", b:"2", c:"3"},
//      * 	{a:"4", b:"5". c:"6"}
//      * ]
//      */ 
// })

const axios = require('axios')

main()

async function main(){
    try {
        const removeAssocRes = axios({
            method:'delete',
            url: `https://api.hubapi.com/crm/v4/objects/contacts/1351/associations/companies/8344861213`,
            headers: {
                "Authorization": "Bearer pat-na1-703f92b7-b847-4e46-a85f-a4063ca56411"    
            }
        })
        console.log(Object.keys(removeAssocRes))
    } catch (error) {
        console.log(error)
    }
}
