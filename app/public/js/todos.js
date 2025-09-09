window.onload = async() => {
    const queryString = window.location.search

    const params = new URLSearchParams(queryString)

    const paramspage = parseInt(params.get('page')) || 1;
    const paramslimit = parseInt(params.get('limit')) || 10;
    const paramssort = params.get('sort') || 'a-z';
    
    const res = await fetch(`/api/todos?page=${paramspage}&limit=${paramslimit}&sortBy=${paramssort}`,{
        method: 'GET'
    })

    if(!res.ok) throw new Error('error occured on fetching all tasks');

    const {page, limit, sortBy, totalTaskCount, totalPageCount, data} = await res.json()

    const limitSelect = document.getElementById('limit-selections')
    limitSelect.value = limit

    limitSelect.addEventListener('change', (e) => {
        const targetLimit = parseInt(e.target.value)
        window.location.href = `/todos?page=1&limit=${targetLimit}&sortBy=${sortBy}`
    })

    /**
     * 
     * creating pages nav container bar logic
     */
    function havingPagesNavLogic(){
        const tableEl = document.getElementById('pages-navigation')
        let tdEl = document.createElement('td')

        tdEl.textContent = 1
        tableEl.appendChild(tdEl)
        
        if(page <= 3){
            createTdEl(2,Math.min(9,totalPageCount -1))
        }else if((totalPageCount - 6) > page){
            createTdEl((page-1),(page+7))
        }else if((totalPageCount - 6) < page){
            createTdEl((totalPageCount - 8), totalPageCount)
        }

        function createTdEl(start,end){
            for(let i = start; i < end; i++){
                const tdEl = document.createElement('td')
                tdEl.textContent = i;
                tableEl.appendChild(tdEl)
            }
        }

        tdEl = document.createElement('td')
        tdEl.textContent = totalPageCount;
        tableEl.appendChild(tdEl)

        const allTdEls = tableEl.querySelectorAll('td')
        allTdEls.forEach(td => {
            td.addEventListener("click", (e) => {
                const pageNumber = parseInt(e.target.textContent)
                if(pageNumber){
                    window.location.href = `/todos?page=${pageNumber}&limit=${limit}&sortBy=${sortBy}`
                }
            })
        })
    }

    havingPagesNavLogic()

      // adding task count info to page

      const taskCountContainer = document.getElementById('task-count-container')
      const pEl = document.createElement('p')
      pEl.textContent = totalTaskCount
      taskCountContainer.appendChild(pEl)

     /**
     * 
     */
    
    /**
     * 
     * creating tasks by page container
     */

    // visualizating tasks

    const sortingSelectEl = document.getElementById('sorting-select')
    sortingSelectEl.value = sortBy

    sortingSelectEl.addEventListener('change',(e) => {
        const sortingValue = e.target.value
        window.location.href = `/todos?page=${page}&limit=${limit}&sortBy=${sortingValue}`
    })

    data.forEach(task => {
        const divEl = document.createElement('div')
        divEl.className = "task-element";

        const h2El = document.createElement('h2')
        h2El.className= "task-title"
        h2El.textContent = task.title

        h2El.addEventListener('click', (e) => {
            window.location.href = `/todo/${task._id}`
        })

        const labelEl = document.createElement('label')
        labelEl.setAttribute('for',"completed")
        labelEl.textContent = "completed"

        const inputEl = document.createElement('input')
        inputEl.type = "checkbox"
        inputEl.name = "completed"
        
        inputEl.checked = task.completed ? true : false

        divEl.appendChild(h2El)
        divEl.appendChild(labelEl)
        divEl.appendChild(inputEl)

        document.getElementById('tasks-container').appendChild(divEl)
    })


    /**
     * 
     * 
     */
}


