const postForm = document.getElementById("post-task-form")

postForm.addEventListener('submit', async(e) => {
    e.preventDefault()
    const fd = new FormData(postForm)

    const payload = {
        title: fd.get('title'),
        description: fd.get('description'),
        completed: fd.get('completed')
    }

    const res = await fetch('/api/todo',{
        method: 'POST',
        headers: {'Content-Type': "application/json"},
        body: JSON.stringify(payload)
    })

    if(!res.ok) throw new Error('cant posting')

    const data = await res.json()
    if(data.success){
        alert('ekleme başarılı')
    }

    postForm.reset()
})

document.getElementById('all-tasks-button').onclick = () => {
}