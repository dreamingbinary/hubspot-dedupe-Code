const axios = require('axios')

const main = async (object, token, dupeProperty, checkProp, collection) => {
  
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  let loop = true
  let after = ''
  console.log(checkProp)
  let propString = checkProp.join(',')

  while(loop === true){
    

    try {
        console.log('pinging endpoint')
        await wait(500)
        const res = await axios({
            method: 'get',
            url: `https://api.hubapi.com/crm/v3/objects/${object}?limit=100&archived=false${after}&properties=${dupeProperty.join(',')},${propString}`,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })

        for(let instance of res.data.results){
          console.log(`pushing ${object} instance: ${instance.id}`)
          await collection.create(instance)
        }

        if(res.data.paging !== undefined){
            after = '&after=' + res.data.paging.next.after
        }
        else{
            loop = false
        }
        //console.log(count, loop, res.data.paging.next.after)
    } catch (error) {
        console.log(error)
        loop = false
    }

  }

}

module.exports = main


