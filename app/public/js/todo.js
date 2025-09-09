const taskId = window.location.pathname.split('/').pop()
let lastQueriedUrl;
window.onload = async() => {

    const res = await fetch(`/api/todo/${taskId}`, {
        method: 'GET'
    })

    if(!res.ok) {
        throw new Error('could not fetched a task from api')
    }

    const data = await res.json()
    const {task} = data.data;

    lastQueriedUrl = data.data.lastQueriedUrl

    const {title, description, completed, _id} = task

    const titleContainer = document.getElementById('title')
    const descriptionContainer = document.getElementById('description')
    const completedContainer = document.getElementById('completed')

    titleContainer.textContent = title
    titleContainer.id = _id
    descriptionContainer.textContent = description
    completedContainer.checked = !!completed // bu kullanım çok modern

}

const buttonContainer = document.getElementById('button-container')
buttonContainer.addEventListener("click", async(e) => {

    if(e.target.id == "updateBtn"){

        const titleVal = document.getElementById('title').value || document.getElementById('title').textContent
        const descVal = document.getElementById('description').value || document.getElementById('description').textContent
        const completedVal = document.getElementById('completed').value

        if(!titleVal && !descVal){
            alert('there are empty boxes trying to save it is impossible')
            window.location.href = `/todo/${taskId}`
            throw new Error('there is no infos')
        }

        const payload = {
            title: titleVal,
            description: descriptionVal,
            completed: completedVal
        }

        const res = await fetch(`/api/todo/${taskId}`,{
            method:"PATCH",
            headers: {'Content-Type': "application/json"},
            body: JSON.stringify(payload)
        })

        if(!res.ok) throw new Error('server cant update the task');

        alert('updating done, page is refreshing')
        window.location.href = `/todo/${taskId}`

    }else if(e.target.id == "deleteBtn"){
        const res = await fetch(`/api/todo/${taskId}`,{
            method: 'DELETE'
        })

        if(!res.ok) throw new Error('server cant update the task');

        alert('deleting successfully done')

        window.location.href = lastQueriedUrl

    }else if(e.target.id == "tasksBtn"){
        window.location.href = lastQueriedUrl || "/todos"
    }
})

buttonContainer.addEventListener('dblclick', (e) => {

    if(["title", "description"].includes(e.target.id)){
        createInputEntryEl(e.target,e.target.tagName)
    }

    function createInputEntryEl(el,name){

        const inputEl = document.createElement('input')
        inputEl.value = el.textContent
        inputEl.name = name.toLowerCase()

        inputEl.addEventListener('blur', () => {
            el.textContent = inputEl.value
            inputEl.replaceWith(el)
        })

        el.replaceWith(inputEl)
        inputEl.focus()
    }
})
