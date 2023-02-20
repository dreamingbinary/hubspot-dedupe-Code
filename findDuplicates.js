const main = async (instance, object, objMap, dupeProperty, collection, dupeData, checkProp) => {

    const dupeMap = {
        original: '',
        duplicate: ''
    }
    let validContact = true
    for(let prop of dupeProperty){
        if(!instance.properties[prop]){
            validContact = false
        }
    }
    let duplicate = 'none'
    if(validContact){
        console.log(`looking for duplicates of: ${instance.properties.id}`)

        const searchObj = {}

        for(let prop of dupeProperty){
            const searchKey = `properties.${prop}`
        
            searchObj[searchKey] = instance.properties[prop]
        
        }
        console.log(searchObj)
    
    
        const res = await collection.find(searchObj)
        if(res.length === 2){
            console.log(res)
            dupeData.push(res)
            for(let dupe of res){
                if(dupe.id !== instance.id){
                    await objMap[object].deleteOne({id: dupe.id})
                }
            }
            // for(let record of res){
                // if((record.properties[checkProp[2]] > 0 || record.properties[checkProp[3]] > 0) && record.properties[checkProp[1]]){
                //     dupeMap.original = record.id
                // }
                // if((record.properties[checkProp[2]] === 0 && !record.properties[checkProp[3]]) && !record.properties[checkProp[1]]){
                //     dupeData.duplicate = record.id
                // }
            //     if(record.properties[checkProp[2]] > 0 || record.properties[checkProp[3]]){
            //         dupeData.original = record.id
            //     }
            //     else{
            //         dupeData.duplicate = record.id
            //     }
            // }
            
    
            
            // for(let record of res){
            //     if(record.properties[checkProp]){
            //         dupeMap.original = record.id
            //     }
            //     else{
            //         dupeMap.duplicate = record.id
            //     }
            // }
            // if(dupeMap.original !== '' && dupeMap.duplicate !== ''){
            //     console.log('dupes found:')
            //     console.log(dupeMap)
            //     // dupeData.push(res)
            //     duplicate = [dupeMap.original, dupeMap.duplicate]
            // }
        }
    }
    return duplicate
    
}

module.exports = main
