const randomizeTask = () => {
    return {
        title: randomTitle(),
        description: randomDescription(),
        completed: randomBool(),
        createdAt: new Date(),
        _id: randomId()
    }
}

function randomTitle(){
    const word1 = wordRandomizer(4)
    const word2 = wordRandomizer(5)
    return `${word1} ${word2}`
}
function randomDescription(){
    return wordRandomizer(35)
}

function randomBool(){
    return Math.random() < 0.5
}

function randomId(){
    const numbers = "0123456789"
    let result =""

    for(let i = 0; i < 12; i++){
        const randomIndex = Math.floor(Math.random() * numbers.length)
        result += numbers[randomIndex]
    }

    return parseInt(result)
}

function wordRandomizer(num){
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result="";

    for(let i =0 ; i< num; i++){
        const randomIndex = Math.floor(Math.random() * chars.length)

        result+= chars[randomIndex]
    }
    return result

}



module.exports = {
    randomizeTask,
    randomId
}